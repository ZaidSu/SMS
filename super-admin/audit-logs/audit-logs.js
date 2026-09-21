const auditSearch = document.querySelector("#auditSearch");
const roleFilter = document.querySelector("#roleFilter");
const categoryFilter = document.querySelector("#categoryFilter");
const riskFilter = document.querySelector("#riskFilter");

const auditTableBody = document.querySelector("#auditTableBody");
const emptyState = document.querySelector("#emptyState");

const totalLogs = document.querySelector("#totalLogs");
const loginLogs = document.querySelector("#loginLogs");
const changeLogs = document.querySelector("#changeLogs");
const sensitiveLogs = document.querySelector("#sensitiveLogs");

const lowRiskLogs = document.querySelector("#lowRiskLogs");
const mediumRiskLogs = document.querySelector("#mediumRiskLogs");
const highRiskLogs = document.querySelector("#highRiskLogs");

const clearLogsBtn = document.querySelector("#clearLogsBtn");
const confirmOverlay = document.querySelector("#confirmOverlay");
const cancelClearBtn = document.querySelector("#cancelClearBtn");
const confirmClearBtn = document.querySelector("#confirmClearBtn");

let auditLogs = SMSAudit.getLogs();

// ================================
// Get / Save Logs
// ================================

function refreshAuditLogs() {
  auditLogs = SMSAudit.getLogs();
}

// ================================
// Summary
// ================================

function updateSummaryCards() {
  const loginItems = auditLogs.filter((log) => {
    return log.category === "login";
  });

  const changeItems = auditLogs.filter((log) => {
    return (
      log.category === "create" ||
      log.category === "edit" ||
      log.category === "delete" ||
      log.category === "permission"
    );
  });

  const sensitiveItems = auditLogs.filter((log) => {
    return (
      log.category === "view" ||
      log.action.toLowerCase().includes("social") ||
      log.action.toLowerCase().includes("sensitive")
    );
  });

  const lowRiskItems = auditLogs.filter((log) => {
    return log.riskLevel === "low";
  });

  const mediumRiskItems = auditLogs.filter((log) => {
    return log.riskLevel === "medium";
  });

  const highRiskItems = auditLogs.filter((log) => {
    return log.riskLevel === "high";
  });

  totalLogs.textContent = auditLogs.length;
  loginLogs.textContent = loginItems.length;
  changeLogs.textContent = changeItems.length;
  sensitiveLogs.textContent = sensitiveItems.length;

  lowRiskLogs.textContent = lowRiskItems.length;
  mediumRiskLogs.textContent = mediumRiskItems.length;
  highRiskLogs.textContent = highRiskItems.length;
}

// ================================
// Filters
// ================================

function getFilteredLogs() {
  const searchValue = auditSearch.value.trim().toLowerCase();
  const roleValue = roleFilter.value;
  const categoryValue = categoryFilter.value;
  const riskValue = riskFilter.value;

  return auditLogs.filter((log) => {
    const searchableText = `
      ${log.actorName}
      ${log.actorRole}
      ${log.actorEmail}
      ${log.organizationId}
      ${log.organizationName}
      ${log.branchId}
      ${log.branchName}
      ${log.action}
      ${log.category}
      ${log.targetType}
      ${log.targetName}
      ${log.riskLevel}
      ${log.details}
      ${log.timestamp}
    `.toLowerCase();

    const matchesSearch = searchableText.includes(searchValue);
    const matchesRole = roleValue === "all" || log.actorRole === roleValue;
    const matchesCategory =
      categoryValue === "all" || log.category === categoryValue;
    const matchesRisk = riskValue === "all" || log.riskLevel === riskValue;

    return matchesSearch && matchesRole && matchesCategory && matchesRisk;
  });
}

// ================================
// Render
// ================================

function renderAuditLogs() {
  refreshAuditLogs();

  const filteredLogs = getFilteredLogs();

  auditTableBody.innerHTML = "";

  if (filteredLogs.length === 0) {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
  }

  filteredLogs.forEach((log) => {
    const row = document.createElement("tr");

    row.className = getAuditRowClass(log.riskLevel);

    row.innerHTML = `
      <td>
        <strong>${formatDateTime(log.timestamp)}</strong>
        <p class="table-subtext">${timeAgo(log.timestamp)}</p>
      </td>

      <td>
        <strong>${log.actorName}</strong>
        <p class="table-subtext">${log.actorEmail}</p>
        <span class="role-pill">${log.actorRole}</span>
      </td>

      <td>
        <strong>${log.organizationName}</strong>
        <p class="table-subtext">Org ID: ${log.organizationId}</p>
        <p class="table-subtext">Branch: ${log.branchName}</p>
      </td>

      <td>
        <span class="action-pill">${log.action}</span>
        <br>
        <span class="category-pill">${capitalize(log.category)}</span>
      </td>

      <td>
        <strong>${log.targetName}</strong>
        <p class="table-subtext">${log.targetType}</p>
      </td>

      <td>
        <span class="risk-pill ${log.riskLevel}">
          ${capitalize(log.riskLevel)}
        </span>
      </td>

      <td>${log.details}</td>
    `;

    auditTableBody.appendChild(row);
  });

  updateSummaryCards();
}

// ================================
// Helpers
// ================================

function getAuditRowClass(riskLevel) {
  if (riskLevel === "low") return "audit-row-low";
  if (riskLevel === "medium") return "audit-row-medium";
  if (riskLevel === "high") return "audit-row-high";
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

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function timeAgo(value) {
  const date = new Date(value);
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
// Clear Logs Modal
// ================================

function openClearConfirm() {
  confirmOverlay.classList.remove("hidden");
}

function closeClearConfirm() {
  confirmOverlay.classList.add("hidden");
}

// ================================
// Event Listeners
// ================================

auditSearch.addEventListener("input", renderAuditLogs);
roleFilter.addEventListener("change", renderAuditLogs);
categoryFilter.addEventListener("change", renderAuditLogs);
riskFilter.addEventListener("change", renderAuditLogs);

clearLogsBtn.addEventListener("click", openClearConfirm);
cancelClearBtn.addEventListener("click", closeClearConfirm);

confirmClearBtn.addEventListener("click", () => {
  SMSAudit.clearLogs();
  closeClearConfirm();
  renderAuditLogs();
});

window.addEventListener("click", (event) => {
  if (event.target === confirmOverlay) {
    closeClearConfirm();
  }
});

// ================================
// Initialize
// ================================

renderAuditLogs();