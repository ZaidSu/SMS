const complianceSearch = document.querySelector("#complianceSearch");
const requestTypeFilter = document.querySelector("#requestTypeFilter");
const statusFilter = document.querySelector("#statusFilter");
const priorityFilter = document.querySelector("#priorityFilter");

const complianceTableBody = document.querySelector("#complianceTableBody");
const emptyState = document.querySelector("#emptyState");

const totalRequests = document.querySelector("#totalRequests");
const pendingRequests = document.querySelector("#pendingRequests");
const completedRequests = document.querySelector("#completedRequests");
const highPriorityRequests = document.querySelector("#highPriorityRequests");

const policyCoverage = document.querySelector("#policyCoverage");
const privacyRequests = document.querySelector("#privacyRequests");
const sensitiveItems = document.querySelector("#sensitiveItems");

const addRequestBtn = document.querySelector("#addRequestBtn");
const requestModal = document.querySelector("#requestModal");
const requestModalTitle = document.querySelector("#requestModalTitle");
const closeModalBtn = document.querySelector("#closeModalBtn");
const cancelModalBtn = document.querySelector("#cancelModalBtn");
const requestForm = document.querySelector("#requestForm");

const requestOrganization = document.querySelector("#requestOrganization");
const requestType = document.querySelector("#requestType");
const requestStatus = document.querySelector("#requestStatus");
const requestPriority = document.querySelector("#requestPriority");
const requestedBy = document.querySelector("#requestedBy");
const createdDate = document.querySelector("#createdDate");
const dueDate = document.querySelector("#dueDate");
const targetRecord = document.querySelector("#targetRecord");
const requestNotes = document.querySelector("#requestNotes");

const confirmOverlay = document.querySelector("#confirmOverlay");
const confirmMessage = document.querySelector("#confirmMessage");
const cancelDeleteBtn = document.querySelector("#cancelDeleteBtn");
const confirmDeleteBtn = document.querySelector("#confirmDeleteBtn");

let organizations = JSON.parse(localStorage.getItem("smsOrganizations")) || [];
let complianceRequests = [];
let pendingEditRequest = null;
let pendingDeleteRequest = null;

/*
  ========================================
  Backend Ready Settings
  ========================================

  When you connect your backend later, change:

  const USE_BACKEND = true;

  Expected backend routes:

  GET    /compliance-requests
  POST   /compliance-requests
  PUT    /compliance-requests/:id
  PATCH  /compliance-requests/:id/complete
  DELETE /compliance-requests/:id

  GET    /organizations
*/

const USE_BACKEND = false;
const API_BASE_URL = "";

// ================================
// Backend / Local Storage
// ================================

async function fetchOrganizationsFromBackend() {
  const response = await fetch(`${API_BASE_URL}/organizations`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Failed to fetch organizations.");
  }

  return await response.json();
}

async function fetchComplianceRequestsFromBackend() {
  const response = await fetch(`${API_BASE_URL}/compliance-requests`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Failed to fetch compliance requests.");
  }

  return await response.json();
}

async function createComplianceRequestOnBackend(requestData) {
  const response = await fetch(`${API_BASE_URL}/compliance-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify(requestData)
  });

  if (!response.ok) {
    throw new Error("Failed to create compliance request.");
  }

  return await response.json();
}

async function updateComplianceRequestOnBackend(requestId, requestData) {
  const response = await fetch(`${API_BASE_URL}/compliance-requests/${requestId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify(requestData)
  });

  if (!response.ok) {
    throw new Error("Failed to update compliance request.");
  }

  return await response.json();
}

async function completeComplianceRequestOnBackend(requestId) {
  const response = await fetch(`${API_BASE_URL}/compliance-requests/${requestId}/complete`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Failed to complete compliance request.");
  }

  return await response.json();
}

async function deleteComplianceRequestFromBackend(requestId) {
  const response = await fetch(`${API_BASE_URL}/compliance-requests/${requestId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Failed to delete compliance request.");
  }

  return true;
}

function getComplianceRequestsFromLocalStorage() {
  return JSON.parse(localStorage.getItem("smsComplianceRequests")) || [];
}

function saveComplianceRequestsToLocalStorage() {
  localStorage.setItem("smsComplianceRequests", JSON.stringify(complianceRequests));
}

async function loadOrganizations() {
  try {
    if (USE_BACKEND) {
      organizations = await fetchOrganizationsFromBackend();
    } else {
      organizations = JSON.parse(localStorage.getItem("smsOrganizations")) || [];
    }
  } catch (error) {
    console.error(error);
    organizations = [];
  }
}

async function loadComplianceRequests() {
  try {
    if (USE_BACKEND) {
      complianceRequests = await fetchComplianceRequestsFromBackend();
    } else {
      complianceRequests = getComplianceRequestsFromLocalStorage();
    }
  } catch (error) {
    console.error(error);
    complianceRequests = [];
  }
}

// ================================
// Organizations
// ================================

function populateOrganizations() {
  requestOrganization.innerHTML = `
    <option value="">Select organization</option>
  `;

  organizations.forEach((organization) => {
    const option = document.createElement("option");

    option.value = organization.orgId || organization.id;
    option.textContent = `${organization.name} (${organization.orgId || organization.id})`;

    requestOrganization.appendChild(option);
  });
}

function getSelectedOrganization() {
  return organizations.find((organization) => {
    return (
      String(organization.orgId || organization.id) ===
      String(requestOrganization.value)
    );
  });
}

// ================================
// Summary
// ================================

function updateSummaryCards() {
  const pendingItems = complianceRequests.filter((request) => {
    return request.status === "pending" || request.status === "in-review";
  });

  const completedItems = complianceRequests.filter((request) => {
    return request.status === "completed";
  });

  const highPriorityItems = complianceRequests.filter((request) => {
    return request.priority === "high";
  });

  const privacyItems = complianceRequests.filter((request) => {
    return (
      request.type === "privacy-review" ||
      request.type === "data-export" ||
      request.type === "data-correction" ||
      request.type === "data-deletion"
    );
  });

  const sensitiveDataItems = complianceRequests.filter((request) => {
    return (
      request.type === "sensitive-access" ||
      String(request.targetRecord || "").toLowerCase().includes("sensitive") ||
      String(request.notes || "").toLowerCase().includes("sensitive")
    );
  });

  totalRequests.textContent = complianceRequests.length;
  pendingRequests.textContent = pendingItems.length;
  completedRequests.textContent = completedItems.length;
  highPriorityRequests.textContent = highPriorityItems.length;

  policyCoverage.textContent = 3;
  privacyRequests.textContent = privacyItems.length;
  sensitiveItems.textContent = sensitiveDataItems.length;
}

// ================================
// Filters
// ================================

function getFilteredComplianceRequests() {
  const searchValue = complianceSearch.value.trim().toLowerCase();
  const typeValue = requestTypeFilter.value;
  const statusValue = statusFilter.value;
  const priorityValue = priorityFilter.value;

  return complianceRequests.filter((request) => {
    const searchableText = `
      ${request.organizationId || ""}
      ${request.organizationName || ""}
      ${request.type || ""}
      ${request.status || ""}
      ${request.priority || ""}
      ${request.requestedBy || ""}
      ${request.createdDate || ""}
      ${request.dueDate || ""}
      ${request.targetRecord || ""}
      ${request.notes || ""}
    `.toLowerCase();

    const matchesSearch = searchableText.includes(searchValue);
    const matchesType = typeValue === "all" || request.type === typeValue;
    const matchesStatus = statusValue === "all" || request.status === statusValue;
    const matchesPriority =
      priorityValue === "all" || request.priority === priorityValue;

    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });
}

// ================================
// Render
// ================================

async function renderComplianceRequests() {
  await loadComplianceRequests();

  const filteredRequests = getFilteredComplianceRequests();

  complianceTableBody.innerHTML = "";

  if (filteredRequests.length === 0) {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
  }

  filteredRequests.forEach((request, index) => {
    const row = document.createElement("tr");

    row.className = getComplianceRowClass(request.priority);

    row.innerHTML = `
      <td>
        <strong>${request.organizationName || "N/A"}</strong>
        <p class="table-subtext">Org ID: ${request.organizationId || "N/A"}</p>
      </td>

      <td>
        <span class="type-pill">${formatRequestType(request.type)}</span>
        <p class="table-subtext">${request.targetRecord || "No target record"}</p>
      </td>

      <td>${request.requestedBy || "N/A"}</td>

      <td>
        <span class="status-pill ${request.status}">
          ${formatStatus(request.status)}
        </span>
      </td>

      <td>
        <span class="priority-pill ${request.priority}">
          ${capitalize(request.priority)}
        </span>
      </td>

      <td>${formatDate(request.createdDate)}</td>

      <td>${formatDate(request.dueDate)}</td>

      <td>${request.notes || "—"}</td>

      <td class="actions-cell">
        <button
          class="table-btn complete-request-btn"
          data-complete-index="${index}"
          type="button">
          Complete
        </button>

        <button
          class="table-btn edit-request-btn"
          data-edit-index="${index}"
          type="button">
          Edit
        </button>

        <button
          class="table-btn delete-request-btn"
          data-delete-index="${index}"
          type="button">
          Delete
        </button>
      </td>
    `;

    complianceTableBody.appendChild(row);
  });

  attachCompleteEvents();
  attachEditEvents();
  attachDeleteEvents();
  updateSummaryCards();
}

// ================================
// Helpers
// ================================

function getComplianceRowClass(priority) {
  if (priority === "low") return "compliance-row-low";
  if (priority === "medium") return "compliance-row-medium";
  if (priority === "high") return "compliance-row-high";
  return "";
}

function formatRequestType(value) {
  const requestTypes = {
    "data-export": "Data Export",
    "data-correction": "Data Correction",
    "data-deletion": "Data Deletion",
    "privacy-review": "Privacy Review",
    "retention-review": "Retention Review",
    "sensitive-access": "Sensitive Access"
  };

  return requestTypes[value] || "N/A";
}

function formatStatus(value) {
  const statuses = {
    "pending": "Pending",
    "in-review": "In Review",
    "completed": "Completed",
    "denied": "Denied"
  };

  return statuses[value] || "N/A";
}

function capitalize(value) {
  if (!value) {
    return "N/A";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDate(value) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function getTodayISODate() {
  return new Date().toISOString().split("T")[0];
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

function logAuditEvent(logData) {
  if (typeof SMSAudit !== "undefined") {
    SMSAudit.log(logData);
  }
}

// ================================
// Modal
// ================================

function openModal(mode = "add") {
  requestModal.classList.remove("hidden");

  if (requestModalTitle) {
    requestModalTitle.textContent =
      mode === "edit" ? "Edit Compliance Request" : "Add Compliance Request";
  }
}

function closeModal() {
  requestModal.classList.add("hidden");
  requestForm.reset();
  pendingEditRequest = null;

  if (requestModalTitle) {
    requestModalTitle.textContent = "Add Compliance Request";
  }
}

// ================================
// Delete Confirm
// ================================

function openDeleteConfirm(request) {
  pendingDeleteRequest = request;

  confirmMessage.innerHTML = `
    Are you sure you want to delete this 
    <strong>${formatRequestType(request.type)}</strong> request for 
    <strong>${request.organizationName || "this organization"}</strong>?
  `;

  confirmOverlay.classList.remove("hidden");
}

function closeDeleteConfirm() {
  confirmOverlay.classList.add("hidden");
  pendingDeleteRequest = null;
}

// ================================
// Table Events
// ================================

function attachCompleteEvents() {
  const completeButtons = document.querySelectorAll(".complete-request-btn");

  completeButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const filteredRequests = getFilteredComplianceRequests();
      const index = Number(button.dataset.completeIndex);
      const request = filteredRequests[index];

      if (!request) {
        return;
      }

      await completeComplianceRequest(request);
    });
  });
}

function attachEditEvents() {
  const editButtons = document.querySelectorAll(".edit-request-btn");

  editButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filteredRequests = getFilteredComplianceRequests();
      const index = Number(button.dataset.editIndex);
      const request = filteredRequests[index];

      if (!request) {
        return;
      }

      pendingEditRequest = request;

      requestOrganization.value = request.organizationId || "";
      requestType.value = request.type || "data-export";
      requestStatus.value = request.status || "pending";
      requestPriority.value = request.priority || "low";
      requestedBy.value = request.requestedBy || "";
      createdDate.value = request.createdDate || getTodayISODate();
      dueDate.value = request.dueDate || "";
      targetRecord.value = request.targetRecord || "";
      requestNotes.value = request.notes || "";

      openModal("edit");
    });
  });
}

function attachDeleteEvents() {
  const deleteButtons = document.querySelectorAll(".delete-request-btn");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filteredRequests = getFilteredComplianceRequests();
      const index = Number(button.dataset.deleteIndex);
      const request = filteredRequests[index];

      if (!request) {
        return;
      }

      openDeleteConfirm(request);
    });
  });
}

// ================================
// Actions
// ================================

async function completeComplianceRequest(request) {
  try {
    if (USE_BACKEND) {
      await completeComplianceRequestOnBackend(request.id);
    } else {
      const realIndex = complianceRequests.findIndex((item) => {
        return item.id === request.id;
      });

      if (realIndex !== -1) {
        complianceRequests[realIndex].status = "completed";
        saveComplianceRequestsToLocalStorage();
      }
    }

    logAuditEvent({
      action: "Completed Compliance Request",
      category: "security",
      targetType: "Compliance Request",
      targetName: formatRequestType(request.type),
      organizationId: request.organizationId || "N/A",
      organizationName: request.organizationName || "N/A",
      branchId: "N/A",
      branchName: "No Branch",
      riskLevel: request.priority === "high" ? "high" : "medium",
      details: `${getCurrentActorName()} completed a ${formatRequestType(request.type)} request for ${request.organizationName || "N/A"}.`
    });

    renderComplianceRequests();
  } catch (error) {
    console.error(error);
    alert("Could not complete this request. Please try again.");
  }
}

async function deletePendingRequest() {
  if (!pendingDeleteRequest) {
    return;
  }

  try {
    if (USE_BACKEND) {
      await deleteComplianceRequestFromBackend(pendingDeleteRequest.id);
    } else {
      complianceRequests = complianceRequests.filter((request) => {
        return request.id !== pendingDeleteRequest.id;
      });

      saveComplianceRequestsToLocalStorage();
    }

    logAuditEvent({
      action: "Deleted Compliance Request",
      category: "delete",
      targetType: "Compliance Request",
      targetName: formatRequestType(pendingDeleteRequest.type),
      organizationId: pendingDeleteRequest.organizationId || "N/A",
      organizationName: pendingDeleteRequest.organizationName || "N/A",
      branchId: "N/A",
      branchName: "No Branch",
      riskLevel: "high",
      details: `${getCurrentActorName()} deleted a ${formatRequestType(pendingDeleteRequest.type)} request for ${pendingDeleteRequest.organizationName || "N/A"}.`
    });

    closeDeleteConfirm();
    renderComplianceRequests();
  } catch (error) {
    console.error(error);
    alert("Could not delete this request. Please try again.");
  }
}

// ================================
// Event Listeners
// ================================

addRequestBtn.addEventListener("click", () => {
  pendingEditRequest = null;
  requestForm.reset();
  createdDate.value = getTodayISODate();
  openModal("add");
});

closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);

complianceSearch.addEventListener("input", renderComplianceRequests);
requestTypeFilter.addEventListener("change", renderComplianceRequests);
statusFilter.addEventListener("change", renderComplianceRequests);
priorityFilter.addEventListener("change", renderComplianceRequests);

requestForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const selectedOrganization = getSelectedOrganization();

  if (!selectedOrganization) {
    alert("Please select an organization.");
    return;
  }

  const requestData = {
    id: pendingEditRequest
      ? pendingEditRequest.id
      : (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),

    organizationId: selectedOrganization.orgId || selectedOrganization.id,
    organizationName: selectedOrganization.name,

    type: requestType.value,
    status: requestStatus.value,
    priority: requestPriority.value,

    requestedBy: requestedBy.value.trim(),
    createdDate: createdDate.value,
    dueDate: dueDate.value,
    targetRecord: targetRecord.value.trim(),
    notes: requestNotes.value.trim()
  };

  try {
    if (USE_BACKEND) {
      if (pendingEditRequest) {
        await updateComplianceRequestOnBackend(pendingEditRequest.id, requestData);
      } else {
        await createComplianceRequestOnBackend(requestData);
      }
    } else {
      if (pendingEditRequest) {
        const index = complianceRequests.findIndex((request) => {
          return request.id === pendingEditRequest.id;
        });

        if (index !== -1) {
          complianceRequests[index] = requestData;
        }
      } else {
        complianceRequests.unshift(requestData);
      }

      saveComplianceRequestsToLocalStorage();
    }

    logAuditEvent({
      action: pendingEditRequest
        ? "Edited Compliance Request"
        : "Created Compliance Request",
      category: pendingEditRequest ? "edit" : "create",
      targetType: "Compliance Request",
      targetName: formatRequestType(requestData.type),
      organizationId: requestData.organizationId,
      organizationName: requestData.organizationName,
      branchId: "N/A",
      branchName: "No Branch",
      riskLevel: requestData.priority === "high" ? "high" : "medium",
      details: `${getCurrentActorName()} ${
        pendingEditRequest ? "edited" : "created"
      } a ${formatRequestType(requestData.type)} request for ${requestData.organizationName}.`
    });

    closeModal();
    renderComplianceRequests();
  } catch (error) {
    console.error(error);
    alert("Could not save this request. Please try again.");
  }
});

cancelDeleteBtn.addEventListener("click", closeDeleteConfirm);
confirmDeleteBtn.addEventListener("click", deletePendingRequest);

window.addEventListener("click", (event) => {
  if (event.target === requestModal) {
    closeModal();
  }

  if (event.target === confirmOverlay) {
    closeDeleteConfirm();
  }
});

// ================================
// Initialize
// ================================

async function initializeDataCompliancePage() {
  await loadOrganizations();
  populateOrganizations();
  await renderComplianceRequests();
}

initializeDataCompliancePage();