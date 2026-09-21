const sessionSearch = document.querySelector("#sessionSearch");
const roleFilter = document.querySelector("#roleFilter");
const statusFilter = document.querySelector("#statusFilter");
const riskFilter = document.querySelector("#riskFilter");

const sessionsTableBody = document.querySelector("#sessionsTableBody");
const emptyState = document.querySelector("#emptyState");

const totalSessions = document.querySelector("#totalSessions");
const activeSessions = document.querySelector("#activeSessions");
const idleSessions = document.querySelector("#idleSessions");
const riskySessions = document.querySelector("#riskySessions");

const healthySessions = document.querySelector("#healthySessions");
const reviewSessions = document.querySelector("#reviewSessions");
const revokedSessions = document.querySelector("#revokedSessions");

const refreshSessionsBtn = document.querySelector("#refreshSessionsBtn");

const confirmOverlay = document.querySelector("#confirmOverlay");
const confirmMessage = document.querySelector("#confirmMessage");
const cancelRevokeBtn = document.querySelector("#cancelRevokeBtn");
const confirmRevokeBtn = document.querySelector("#confirmRevokeBtn");

let sessions = [];
let pendingRevokeSession = null;

/*
  ========================================
  Backend Ready Settings
  ========================================

  When you add your backend later, change this:

  const USE_BACKEND = true;

  Then update API_BASE_URL to your real backend URL.

  Example:
  const API_BASE_URL = "https://your-backend.com/api";
*/

const USE_BACKEND = false;
const API_BASE_URL = "";

/*
  Expected backend routes later:

  GET    /sessions
  PATCH  /sessions/:id/revoke
  POST   /sessions
  PATCH  /sessions/:id/activity

  For now, this page uses localStorage only as a temporary frontend fallback.
*/

// ================================
// Backend / Local Storage Helpers
// ================================

async function fetchSessionsFromBackend() {
  const response = await fetch(`${API_BASE_URL}/sessions`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Failed to fetch sessions from backend.");
  }

  return await response.json();
}

async function revokeSessionFromBackend(sessionId) {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/revoke`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Failed to revoke session from backend.");
  }

  return await response.json();
}

function getSessionsFromLocalStorage() {
  return JSON.parse(localStorage.getItem("smsSessions")) || [];
}

function saveSessionsToLocalStorage() {
  localStorage.setItem("smsSessions", JSON.stringify(sessions));
}

async function loadSessions() {
  try {
    if (USE_BACKEND) {
      sessions = await fetchSessionsFromBackend();
    } else {
      sessions = getSessionsFromLocalStorage();
    }
  } catch (error) {
    console.error(error);
    sessions = [];
  }
}

// ================================
// Session Creation Helper
// ================================

/*
  Use this after a successful login.

  Important:
  This does NOT create fake IP/location data.

  Real IP address and real location should come from the backend.
  The frontend can safely send browser/device info, login time, role, org, etc.
*/

async function createUserSession(loggedInUser) {
  const newSession = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),

    userId: loggedInUser.id || loggedInUser.userId || null,
    userName: loggedInUser.name || loggedInUser.userName || "Unknown User",
    userEmail: loggedInUser.email || loggedInUser.userEmail || "",
    role: loggedInUser.role || "Unknown Role",

    organizationId: loggedInUser.organizationId || null,
    organizationName: loggedInUser.organizationName || "N/A",

    branchId: loggedInUser.branchId || null,
    branchName: loggedInUser.branchName || "No Branch",

    status: "active",
    riskLevel: "low",

    loginTime: new Date().toISOString(),
    lastActivity: new Date().toISOString(),

    device: getDeviceInfo(),

    /*
      Backend should fill these later.
      Do not fake them.
    */
    ipAddress: loggedInUser.ipAddress || "",
    location: loggedInUser.location || ""
  };

  if (USE_BACKEND) {
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(newSession)
    });

    if (!response.ok) {
      throw new Error("Failed to create session on backend.");
    }

    const savedSession = await response.json();
    localStorage.setItem("smsCurrentSession", JSON.stringify(savedSession));
    return savedSession;
  }

  const savedSessions = getSessionsFromLocalStorage();

  savedSessions.unshift(newSession);

  localStorage.setItem("smsSessions", JSON.stringify(savedSessions));
  localStorage.setItem("smsCurrentSession", JSON.stringify(newSession));

  return newSession;
}

function getDeviceInfo() {
  const userAgent = navigator.userAgent;

  let browser = "Unknown Browser";
  let device = "Unknown Device";

  if (userAgent.includes("Edg")) {
    browser = "Microsoft Edge";
  } else if (userAgent.includes("Chrome")) {
    browser = "Chrome";
  } else if (userAgent.includes("Firefox")) {
    browser = "Firefox";
  } else if (userAgent.includes("Safari")) {
    browser = "Safari";
  }

  if (/iPhone/i.test(userAgent)) {
    device = "iPhone";
  } else if (/iPad/i.test(userAgent)) {
    device = "iPad";
  } else if (/Android/i.test(userAgent)) {
    device = "Android Device";
  } else if (/Windows/i.test(userAgent)) {
    device = "Windows Computer";
  } else if (/Mac/i.test(userAgent)) {
    device = "Mac Computer";
  }

  return `${browser} on ${device}`;
}

// ================================
// Activity Tracking Helper
// ================================

async function updateCurrentSessionActivity() {
  const currentSession = JSON.parse(localStorage.getItem("smsCurrentSession"));

  if (!currentSession) {
    return;
  }

  const updatedLastActivity = new Date().toISOString();

  if (USE_BACKEND) {
    try {
      await fetch(`${API_BASE_URL}/sessions/${currentSession.id}/activity`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          lastActivity: updatedLastActivity
        })
      });
    } catch (error) {
      console.error("Failed to update session activity:", error);
    }

    return;
  }

  const savedSessions = getSessionsFromLocalStorage();

  const sessionIndex = savedSessions.findIndex((session) => {
    return session.id === currentSession.id;
  });

  if (sessionIndex === -1) {
    return;
  }

  savedSessions[sessionIndex].lastActivity = updatedLastActivity;

  localStorage.setItem("smsSessions", JSON.stringify(savedSessions));
  localStorage.setItem("smsCurrentSession", JSON.stringify(savedSessions[sessionIndex]));
}

// ================================
// Summary
// ================================

function updateSummaryCards() {
  const activeItems = sessions.filter((session) => {
    return session.status === "active";
  });

  const idleItems = sessions.filter((session) => {
    return session.status === "idle";
  });

  const riskyItems = sessions.filter((session) => {
    return session.riskLevel === "high";
  });

  const healthyItems = sessions.filter((session) => {
    return session.status === "active" && session.riskLevel === "low";
  });

  const reviewItems = sessions.filter((session) => {
    return session.status === "idle" || session.riskLevel === "medium";
  });

  const revokedItems = sessions.filter((session) => {
    return session.status === "revoked";
  });

  totalSessions.textContent = sessions.length;
  activeSessions.textContent = activeItems.length;
  idleSessions.textContent = idleItems.length;
  riskySessions.textContent = riskyItems.length;

  healthySessions.textContent = healthyItems.length;
  reviewSessions.textContent = reviewItems.length;
  revokedSessions.textContent = revokedItems.length;
}

// ================================
// Filters
// ================================

function getFilteredSessions() {
  const searchValue = sessionSearch.value.trim().toLowerCase();
  const roleValue = roleFilter.value;
  const statusValue = statusFilter.value;
  const riskValue = riskFilter.value;

  return sessions.filter((session) => {
    const searchableText = `
      ${session.userName || ""}
      ${session.userEmail || ""}
      ${session.role || ""}
      ${session.organizationId || ""}
      ${session.organizationName || ""}
      ${session.branchId || ""}
      ${session.branchName || ""}
      ${session.status || ""}
      ${session.riskLevel || ""}
      ${session.loginTime || ""}
      ${session.lastActivity || ""}
      ${session.device || ""}
      ${session.ipAddress || ""}
      ${session.location || ""}
    `.toLowerCase();

    const matchesSearch = searchableText.includes(searchValue);
    const matchesRole = roleValue === "all" || session.role === roleValue;
    const matchesStatus = statusValue === "all" || session.status === statusValue;
    const matchesRisk = riskValue === "all" || session.riskLevel === riskValue;

    return matchesSearch && matchesRole && matchesStatus && matchesRisk;
  });
}

// ================================
// Render
// ================================

async function renderSessions() {
  await loadSessions();

  const filteredSessions = getFilteredSessions();

  sessionsTableBody.innerHTML = "";

  if (filteredSessions.length === 0) {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
  }

  filteredSessions.forEach((session, index) => {
    const row = document.createElement("tr");

    row.className = getSessionRowClass(session.status);

    const revokeDisabled =
      session.status === "revoked" || session.status === "expired";

    row.innerHTML = `
      <td>
        <strong>${session.userName || "Unknown User"}</strong>
        <p class="table-subtext">${session.userEmail || "No email"}</p>
        <span class="role-pill">${session.role || "Unknown Role"}</span>
      </td>

      <td>
        <strong>${session.organizationName || "N/A"}</strong>
        <p class="table-subtext">Org ID: ${session.organizationId || "N/A"}</p>
        <p class="table-subtext">Branch: ${session.branchName || "No Branch"}</p>
      </td>

      <td>
        <span class="status-pill ${session.status || "active"}">
          ${capitalize(session.status || "active")}
        </span>
      </td>

      <td>
        <span class="risk-pill ${session.riskLevel || "low"}">
          ${capitalize(session.riskLevel || "low")}
        </span>
      </td>

      <td>
        <strong>${formatDateTime(session.loginTime)}</strong>
        <p class="table-subtext">${timeAgo(session.loginTime)}</p>
      </td>

      <td>
        <strong>${formatDateTime(session.lastActivity)}</strong>
        <p class="table-subtext">${timeAgo(session.lastActivity)}</p>
      </td>

      <td>
        <strong>${session.device || "Unknown Device"}</strong>
        <p class="table-subtext">IP: ${session.ipAddress || "Not available yet"}</p>
        <p class="table-subtext">${session.location || "Location not available yet"}</p>
      </td>

      <td class="actions-cell">
        <button
          class="table-btn view-session-btn"
          data-view-index="${index}"
          type="button">
          View
        </button>

        <button
          class="table-btn revoke-session-btn ${revokeDisabled ? "disabled" : ""}"
          data-revoke-index="${index}"
          type="button">
          Revoke
        </button>
      </td>
    `;

    sessionsTableBody.appendChild(row);
  });

  attachViewEvents();
  attachRevokeEvents();
  updateSummaryCards();
}

// ================================
// Helpers
// ================================

function getSessionRowClass(status) {
  if (status === "active") return "session-row-active";
  if (status === "idle") return "session-row-idle";
  if (status === "expired") return "session-row-expired";
  if (status === "revoked") return "session-row-revoked";
  return "";
}

function capitalize(value) {
  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDateTime(value) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function timeAgo(value) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

// ================================
// Table Events
// ================================

function attachViewEvents() {
  const viewButtons = document.querySelectorAll(".view-session-btn");

  viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filteredSessions = getFilteredSessions();
      const index = Number(button.dataset.viewIndex);
      const session = filteredSessions[index];

      if (!session) {
        return;
      }

      alert(
        `Session Details:\n\n` +
        `User: ${session.userName || "Unknown User"}\n` +
        `Email: ${session.userEmail || "No email"}\n` +
        `Role: ${session.role || "Unknown Role"}\n` +
        `Organization: ${session.organizationName || "N/A"}\n` +
        `Branch: ${session.branchName || "No Branch"}\n` +
        `Status: ${session.status || "active"}\n` +
        `Risk: ${session.riskLevel || "low"}\n` +
        `Device: ${session.device || "Unknown Device"}\n` +
        `IP Address: ${session.ipAddress || "Not available yet"}\n` +
        `Location: ${session.location || "Location not available yet"}`
      );

      logAuditEvent({
        action: "Viewed Session",
        category: "view",
        targetType: "Session",
        targetName: session.userName || "Unknown User",
        organizationId: session.organizationId || "N/A",
        organizationName: session.organizationName || "N/A",
        branchId: session.branchId || "N/A",
        branchName: session.branchName || "No Branch",
        riskLevel: "medium",
        details: `${getCurrentActorName()} viewed the session for ${session.userName || "Unknown User"}.`
      });
    });
  });
}

function attachRevokeEvents() {
  const revokeButtons = document.querySelectorAll(".revoke-session-btn");

  revokeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.classList.contains("disabled")) {
        return;
      }

      const filteredSessions = getFilteredSessions();
      const index = Number(button.dataset.revokeIndex);
      const session = filteredSessions[index];

      if (!session) {
        return;
      }

      openRevokeConfirm(session);
    });
  });
}

// ================================
// Revoke Confirm
// ================================

function openRevokeConfirm(session) {
  pendingRevokeSession = session;

  confirmMessage.innerHTML = `
    Are you sure you want to force logout 
    <strong>${session.userName || "this user"}</strong> from 
    <strong>${session.organizationName || "this organization"}</strong>?
  `;

  confirmOverlay.classList.remove("hidden");
}

function closeRevokeConfirm() {
  confirmOverlay.classList.add("hidden");
  pendingRevokeSession = null;
}

async function revokePendingSession() {
  if (!pendingRevokeSession) {
    return;
  }

  try {
    if (USE_BACKEND) {
      await revokeSessionFromBackend(pendingRevokeSession.id);
    } else {
      const realIndex = sessions.findIndex((session) => {
        return session.id === pendingRevokeSession.id;
      });

      if (realIndex !== -1) {
        sessions[realIndex].status = "revoked";
        sessions[realIndex].riskLevel = "high";
        sessions[realIndex].lastActivity = new Date().toISOString();

        saveSessionsToLocalStorage();
      }
    }

    logAuditEvent({
      action: "Revoked User Session",
      category: "security",
      targetType: "Session",
      targetName: pendingRevokeSession.userName || "Unknown User",
      organizationId: pendingRevokeSession.organizationId || "N/A",
      organizationName: pendingRevokeSession.organizationName || "N/A",
      branchId: pendingRevokeSession.branchId || "N/A",
      branchName: pendingRevokeSession.branchName || "No Branch",
      riskLevel: "high",
      details: `${getCurrentActorName()} revoked the session for ${pendingRevokeSession.userName || "Unknown User"}.`
    });

    closeRevokeConfirm();
    renderSessions();
  } catch (error) {
    console.error(error);
    alert("Could not revoke this session. Please try again.");
  }
}

// ================================
// Audit Helper
// ================================

function logAuditEvent(logData) {
  if (typeof SMSAudit !== "undefined") {
    SMSAudit.log(logData);
  }
}

function getCurrentActorName() {
  if (typeof SMSAudit !== "undefined") {
    return SMSAudit.getCurrentUser().name || "Current User";
  }

  const currentUser = JSON.parse(localStorage.getItem("smsCurrentUser"));

  if (currentUser && currentUser.name) {
    return currentUser.name;
  }

  return "Current User";
}

// ================================
// Event Listeners
// ================================

sessionSearch.addEventListener("input", renderSessions);
roleFilter.addEventListener("change", renderSessions);
statusFilter.addEventListener("change", renderSessions);
riskFilter.addEventListener("change", renderSessions);

refreshSessionsBtn.addEventListener("click", renderSessions);

cancelRevokeBtn.addEventListener("click", closeRevokeConfirm);
confirmRevokeBtn.addEventListener("click", revokePendingSession);

window.addEventListener("click", (event) => {
  if (event.target === confirmOverlay) {
    closeRevokeConfirm();
  }
});

// Optional activity tracking for current logged-in user
document.addEventListener("click", updateCurrentSessionActivity);
document.addEventListener("keydown", updateCurrentSessionActivity);

// ================================
// Initialize
// ================================

renderSessions();