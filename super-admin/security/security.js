const securitySearch = document.querySelector("#securitySearch");
const eventTypeFilter = document.querySelector("#eventTypeFilter");
const riskFilter = document.querySelector("#riskFilter");
const statusFilter = document.querySelector("#statusFilter");
const securityTableBody = document.querySelector("#securityTableBody");
const emptyState = document.querySelector("#emptyState");

const addSecurityBtn = document.querySelector("#addSecurityBtn");
const securityModal = document.querySelector("#securityModal");
const securityModalTitle = document.querySelector("#securityModalTitle");
const closeModalBtn = document.querySelector("#closeModalBtn");
const cancelModalBtn = document.querySelector("#cancelModalBtn");
const securityForm = document.querySelector("#securityForm");

const securityOrganization = document.querySelector("#securityOrganization");
const securityUser = document.querySelector("#securityUser");
const userRole = document.querySelector("#userRole");
const eventType = document.querySelector("#eventType");
const riskLevel = document.querySelector("#riskLevel");
const securityStatus = document.querySelector("#securityStatus");
const eventDateTime = document.querySelector("#eventDateTime");
const ipAddress = document.querySelector("#ipAddress");
const deviceInfo = document.querySelector("#deviceInfo");
const securityNotes = document.querySelector("#securityNotes");

const totalEvents = document.querySelector("#totalEvents");
const successfulLogins = document.querySelector("#successfulLogins");
const warningEvents = document.querySelector("#warningEvents");
const blockedAttempts = document.querySelector("#blockedAttempts");

const lowRiskCount = document.querySelector("#lowRiskCount");
const mediumRiskCount = document.querySelector("#mediumRiskCount");
const highRiskCount = document.querySelector("#highRiskCount");

const confirmOverlay = document.querySelector("#confirmOverlay");
const confirmMessage = document.querySelector("#confirmMessage");
const cancelDeleteBtn = document.querySelector("#cancelDeleteBtn");
const confirmDeleteBtn = document.querySelector("#confirmDeleteBtn");

let organizations = JSON.parse(localStorage.getItem("smsOrganizations")) || [];
let securityEvents = JSON.parse(localStorage.getItem("smsSecurityEvents")) || [];

let securityPendingEdit = null;
let securityPendingDelete = null;

// ================================
// Storage
// ================================

function saveSecurityEvents() {
  localStorage.setItem("smsSecurityEvents", JSON.stringify(securityEvents));
}

// ================================
// Organizations
// ================================

function populateOrganizations() {
  securityOrganization.innerHTML = `
    <option value="">Select organization</option>
  `;

  organizations.forEach((organization) => {
    const option = document.createElement("option");
    option.value = organization.orgId;
    option.textContent = `${organization.name} (${organization.orgId})`;
    securityOrganization.appendChild(option);
  });
}

function getSelectedOrganization() {
  return organizations.find((organization) => {
    return organization.orgId === securityOrganization.value;
  });
}

// ================================
// Summary
// ================================

function updateSummaryCards() {
  const loginEvents = securityEvents.filter((event) => {
    return event.eventType === "login";
  });

  const warningItems = securityEvents.filter((event) => {
    return event.riskLevel === "medium" || event.status === "review";
  });

  const blockedItems = securityEvents.filter((event) => {
    return event.eventType === "blocked-attempt" || event.status === "blocked";
  });

  const lowRiskItems = securityEvents.filter((event) => {
    return event.riskLevel === "low";
  });

  const mediumRiskItems = securityEvents.filter((event) => {
    return event.riskLevel === "medium";
  });

  const highRiskItems = securityEvents.filter((event) => {
    return event.riskLevel === "high";
  });

  totalEvents.textContent = securityEvents.length;
  successfulLogins.textContent = loginEvents.length;
  warningEvents.textContent = warningItems.length;
  blockedAttempts.textContent = blockedItems.length;

  lowRiskCount.textContent = lowRiskItems.length;
  mediumRiskCount.textContent = mediumRiskItems.length;
  highRiskCount.textContent = highRiskItems.length;
}

// ================================
// Filters
// ================================

function getFilteredSecurityEvents() {
  const searchValue = securitySearch.value.trim().toLowerCase();
  const eventTypeValue = eventTypeFilter.value;
  const riskValue = riskFilter.value;
  const statusValue = statusFilter.value;

  return securityEvents.filter((event) => {
    const searchableText = `
      ${event.organizationName}
      ${event.organizationId}
      ${event.user}
      ${event.role}
      ${event.eventType}
      ${event.riskLevel}
      ${event.status}
      ${event.dateTime}
      ${event.ipAddress}
      ${event.deviceInfo}
      ${event.notes}
    `.toLowerCase();

    const matchesSearch = searchableText.includes(searchValue);
    const matchesEventType =
      eventTypeValue === "all" || event.eventType === eventTypeValue;
    const matchesRisk = riskValue === "all" || event.riskLevel === riskValue;
    const matchesStatus = statusValue === "all" || event.status === statusValue;

    return matchesSearch && matchesEventType && matchesRisk && matchesStatus;
  });
}

// ================================
// Render
// ================================

function renderSecurityEvents() {
  const filteredEvents = getFilteredSecurityEvents();

  securityTableBody.innerHTML = "";

  if (filteredEvents.length === 0) {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
  }

  filteredEvents.forEach((event, index) => {
    const row = document.createElement("tr");

    row.className = getSecurityRowClass(event.riskLevel);

    row.innerHTML = `
      <td>
        <strong>${event.organizationName}</strong>
        <p class="table-subtext">${event.organizationId}</p>
      </td>

      <td>
        <strong>${event.user}</strong>
        <br>
        <span class="role-pill">${event.role}</span>
      </td>

      <td>
        <span class="event-pill">
          ${formatEventType(event.eventType)}
        </span>
      </td>

      <td>
        <span class="risk-pill ${event.riskLevel}">
          ${capitalize(event.riskLevel)}
        </span>
      </td>

      <td>
        <span class="status-pill ${event.status}">
          ${formatStatus(event.status)}
        </span>
      </td>

      <td>${formatDateTime(event.dateTime)}</td>

      <td>
        ${event.ipAddress || "N/A"}
        <p class="table-subtext">${event.deviceInfo || "No device info"}</p>
      </td>

      <td>${event.notes || "—"}</td>

      <td class="actions-cell">
        <button
          class="table-btn resolve-security-btn"
          data-resolve-index="${index}"
          type="button">
          Resolve
        </button>

        <button
          class="table-btn edit-security-btn"
          data-edit-index="${index}"
          type="button">
          Edit
        </button>

        <button
          class="table-btn delete-security-btn"
          data-delete-index="${index}"
          type="button">
          Delete
        </button>
      </td>
    `;

    securityTableBody.appendChild(row);
  });

  attachResolveEvents();
  attachEditEvents();
  attachDeleteEvents();
  updateSummaryCards();
}

// ================================
// Helpers
// ================================

function getSecurityRowClass(risk) {
  if (risk === "low") return "security-row-low";
  if (risk === "medium") return "security-row-medium";
  if (risk === "high") return "security-row-high";
  return "";
}

function formatEventType(value) {
  const eventNames = {
    "login": "Login",
    "failed-login": "Failed Login",
    "password-reset": "Password Reset",
    "permission-change": "Permission Change",
    "blocked-attempt": "Blocked Attempt",
    "data-access": "Data Access"
  };

  return eventNames[value] || value;
}

function formatStatus(value) {
  const statusNames = {
    "resolved": "Resolved",
    "review": "Needs Review",
    "blocked": "Blocked"
  };

  return statusNames[value] || value;
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

function getCurrentDateTimeLocal() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

// ================================
// Modal
// ================================

function openModal(mode = "add") {
  securityModal.classList.remove("hidden");

  if (securityModalTitle) {
    securityModalTitle.textContent =
      mode === "edit" ? "Edit Security Event" : "Add Security Event";
  }
}

function closeModal() {
  securityModal.classList.add("hidden");
  securityForm.reset();
  securityPendingEdit = null;

  if (securityModalTitle) {
    securityModalTitle.textContent = "Add Security Event";
  }
}

// ================================
// Delete Confirm
// ================================

function openDeleteConfirm(event) {
  securityPendingDelete = event;

  confirmMessage.innerHTML = `
    Are you sure you want to delete the security event for 
    <strong>${event.user}</strong> at 
    <strong>${event.organizationName}</strong>?
  `;

  confirmOverlay.classList.remove("hidden");
}

function closeDeleteConfirm() {
  confirmOverlay.classList.add("hidden");
  securityPendingDelete = null;
}

// ================================
// Table Events
// ================================

function attachResolveEvents() {
  const resolveButtons = document.querySelectorAll(".resolve-security-btn");

  resolveButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filteredEvents = getFilteredSecurityEvents();
      const index = Number(button.dataset.resolveIndex);
      const event = filteredEvents[index];

      if (!event) {
        return;
      }

      const realIndex = securityEvents.findIndex((item) => {
        return item.id === event.id;
      });

      if (realIndex !== -1) {
        securityEvents[realIndex].status = "resolved";
        securityEvents[realIndex].riskLevel = "low";
      }

      saveSecurityEvents();
      renderSecurityEvents();
    });
  });
}

function attachEditEvents() {
  const editButtons = document.querySelectorAll(".edit-security-btn");

  editButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filteredEvents = getFilteredSecurityEvents();
      const index = Number(button.dataset.editIndex);
      const event = filteredEvents[index];

      if (!event) {
        return;
      }

      securityPendingEdit = event;

      securityOrganization.value = event.organizationId;
      securityUser.value = event.user;
      userRole.value = event.role;
      eventType.value = event.eventType;
      riskLevel.value = event.riskLevel;
      securityStatus.value = event.status;
      eventDateTime.value = event.dateTime;
      ipAddress.value = event.ipAddress || "";
      deviceInfo.value = event.deviceInfo || "";
      securityNotes.value = event.notes || "";

      openModal("edit");
    });
  });
}

function attachDeleteEvents() {
  const deleteButtons = document.querySelectorAll(".delete-security-btn");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filteredEvents = getFilteredSecurityEvents();
      const index = Number(button.dataset.deleteIndex);
      const event = filteredEvents[index];

      if (!event) {
        return;
      }

      openDeleteConfirm(event);
    });
  });
}

// ================================
// Event Listeners
// ================================

addSecurityBtn.addEventListener("click", () => {
  securityPendingEdit = null;
  securityForm.reset();
  eventDateTime.value = getCurrentDateTimeLocal();
  openModal("add");
});

closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);

securitySearch.addEventListener("input", renderSecurityEvents);
eventTypeFilter.addEventListener("change", renderSecurityEvents);
riskFilter.addEventListener("change", renderSecurityEvents);
statusFilter.addEventListener("change", renderSecurityEvents);

securityForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const selectedOrganization = getSelectedOrganization();

  if (!selectedOrganization) {
    alert("Please select an organization.");
    return;
  }

  const newEvent = {
    id: securityPendingEdit ? securityPendingEdit.id : Date.now(),
    organizationId: selectedOrganization.orgId,
    organizationName: selectedOrganization.name,
    user: securityUser.value.trim(),
    role: userRole.value,
    eventType: eventType.value,
    riskLevel: riskLevel.value,
    status: securityStatus.value,
    dateTime: eventDateTime.value,
    ipAddress: ipAddress.value.trim(),
    deviceInfo: deviceInfo.value.trim(),
    notes: securityNotes.value.trim()
  };

  if (securityPendingEdit) {
    const index = securityEvents.findIndex((eventItem) => {
      return eventItem.id === securityPendingEdit.id;
    });

    if (index !== -1) {
      securityEvents[index] = newEvent;
    }

    securityPendingEdit = null;
  } else {
    securityEvents.push(newEvent);
  }

  saveSecurityEvents();
  renderSecurityEvents();
  closeModal();
});

cancelDeleteBtn.addEventListener("click", closeDeleteConfirm);

confirmDeleteBtn.addEventListener("click", () => {
  if (!securityPendingDelete) {
    return;
  }

  securityEvents = securityEvents.filter((event) => {
    return event.id !== securityPendingDelete.id;
  });

  saveSecurityEvents();
  renderSecurityEvents();
  closeDeleteConfirm();
});

window.addEventListener("click", (event) => {
  if (event.target === securityModal) {
    closeModal();
  }

  if (event.target === confirmOverlay) {
    closeDeleteConfirm();
  }
});

// ================================
// Initialize
// ================================

populateOrganizations();
renderSecurityEvents();