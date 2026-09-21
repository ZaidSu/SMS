const searchInput = document.querySelector("#organizationSearch");
const statusFilter = document.querySelector("#statusFilter");
const tableBody = document.querySelector("#organizationTableBody");
const emptyState = document.querySelector("#emptyState");

const addOrganizationBtn = document.querySelector("#addOrganizationBtn");
const organizationModal = document.querySelector("#organizationModal");
const organizationModalTitle = document.querySelector("#organizationModalTitle");
const closeModalBtn = document.querySelector("#closeModalBtn");
const cancelModalBtn = document.querySelector("#cancelModalBtn");
const organizationForm = document.querySelector("#organizationForm");

const totalOrganizations = document.querySelector("#totalOrganizations");
const activeOrganizations = document.querySelector("#activeOrganizations");
const trialOrganizations = document.querySelector("#trialOrganizations");
const suspendedOrganizations = document.querySelector("#suspendedOrganizations");

const confirmOverlay = document.querySelector("#confirmOverlay");
const confirmMessage = document.querySelector("#confirmMessage");
const cancelDeleteBtn = document.querySelector("#cancelDeleteBtn");
const confirmDeleteBtn = document.querySelector("#confirmDeleteBtn");

// Temporary local fallback.
// Later this can be replaced with backend API calls.
let organizations = JSON.parse(localStorage.getItem("smsOrganizations")) || [];

let orgPendingEdit = null;
let orgPendingDelete = null;


function generateSchoolId() {
  const used = new Set(organizations.map(org => String(org.orgId || "").toUpperCase()));
  if (window.SMS_SCHOOLS) SMS_SCHOOLS.forEach(s => used.add(String(s.id || "").toUpperCase()));
  let n = 1;
  while (used.has("SCH" + String(n).padStart(3, "0"))) n += 1;
  return "SCH" + String(n).padStart(3, "0");
}

function queuePrimaryAdminInvite(org, previousAdmin) {
  if (!window.SMS_API || !org.admin || (previousAdmin && previousAdmin.toLowerCase() === org.admin.toLowerCase())) return;
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);
  SMS_API.createInvitation({
    schoolId: org.orgId,
    branchId: null,
    email: org.admin.toLowerCase(),
    role: "school_admin",
    expiresAt: expiry.toISOString().slice(0, 10),
    createdBy: "Platform Admin",
    deliveryStatus: "Backend Pending"
  });
}
function saveOrganizations() {
  localStorage.setItem("smsOrganizations", JSON.stringify(organizations));
}

function getStatusClass(status) {
  if (status === "active") return "active";
  if (status === "trial") return "trial";
  if (status === "suspended") return "suspended";
  return "archived";
}

function capitalize(value) {
  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function updateSummaryCards() {
  if (totalOrganizations) {
    totalOrganizations.textContent = organizations.length;
  }

  if (activeOrganizations) {
    activeOrganizations.textContent = organizations.filter((org) => {
      return org.status === "active";
    }).length;
  }

  if (trialOrganizations) {
    trialOrganizations.textContent = organizations.filter((org) => {
      return org.status === "trial";
    }).length;
  }

  if (suspendedOrganizations) {
    suspendedOrganizations.textContent = organizations.filter((org) => {
      return org.status === "suspended";
    }).length;
  }
}

function getFilteredOrganizations() {
  const searchValue = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;

  return organizations.filter((org) => {
    const searchableText = `
      ${org.name}
      ${org.orgId}
      ${org.branches}
      ${org.admin}
      ${org.plan}
      ${org.status}
    `.toLowerCase();

    const matchesSearch = searchableText.includes(searchValue);
    const matchesStatus = selectedStatus === "all" || org.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });
}

function renderOrganizations() {
  tableBody.innerHTML = "";

  const filteredOrganizations = getFilteredOrganizations();

  if (filteredOrganizations.length === 0) {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
  }

  filteredOrganizations.forEach((org, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${org.name}</td>
      <td>${org.orgId}</td>
      <td>${org.branches}</td>
      <td>${org.admin}</td>
      <td>${org.plan}</td>
      <td>
        <span class="status ${getStatusClass(org.status)}">
          ${capitalize(org.status)}
        </span>
      </td>
      <td class="actions-cell">
        <button
          class="table-btn edit-org-btn"
          data-edit-index="${index}"
          type="button">
          Edit
        </button>

        <button
          class="table-btn delete-org-btn"
          data-delete-index="${index}"
          type="button">
          Delete
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });

  attachEditEvents();
  attachDeleteEvents();
  updateSummaryCards();
}

function openModal(mode = "add") {
  organizationModal.classList.remove("hidden");

  if (organizationModalTitle) {
    organizationModalTitle.textContent =
      mode === "edit" ? "Edit Organization" : "Add Organization";
  }
}

function closeModal() {
  organizationModal.classList.add("hidden");
  organizationForm.reset();
  orgPendingEdit = null;

  if (organizationModalTitle) {
    organizationModalTitle.textContent = "Add Organization";
  }
}

function openDeleteConfirm(org) {
  orgPendingDelete = org;
  confirmMessage.innerHTML = `Are you sure you want to delete <strong>${org.name}</strong>?`;
  confirmOverlay.classList.remove("hidden");
}

function closeDeleteConfirm() {
  confirmOverlay.classList.add("hidden");
  orgPendingDelete = null;
}

function attachDeleteEvents() {
  const deleteButtons = document.querySelectorAll(".delete-org-btn");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filteredOrganizations = getFilteredOrganizations();
      const index = Number(button.dataset.deleteIndex);
      const org = filteredOrganizations[index];

      if (!org) {
        return;
      }

      openDeleteConfirm(org);
    });
  });
}

function attachEditEvents() {
  const editButtons = document.querySelectorAll(".edit-org-btn");

  editButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filteredOrganizations = getFilteredOrganizations();
      const index = Number(button.dataset.editIndex);
      const org = filteredOrganizations[index];

      if (!org) {
        return;
      }

      openModal("edit");

      document.querySelector("#orgName").value = org.name;
      document.querySelector("#orgId").value = org.orgId;
      document.querySelector("#orgBranches").value = org.branches;
      document.querySelector("#orgAdmin").value = org.admin;
      document.querySelector("#orgPlan").value = org.plan;
      document.querySelector("#orgStatus").value = org.status;

      orgPendingEdit = org;
    });
  });
}

if (addOrganizationBtn) {
  addOrganizationBtn.addEventListener("click", () => {
    orgPendingEdit = null;
    organizationForm.reset();
    document.querySelector("#orgId").value = generateSchoolId();
    document.querySelector("#orgBranches").value = 1;
    openModal("add");
  });
}

if (closeModalBtn) {
  closeModalBtn.addEventListener("click", closeModal);
}

if (cancelModalBtn) {
  cancelModalBtn.addEventListener("click", closeModal);
}

if (searchInput) {
  searchInput.addEventListener("input", renderOrganizations);
}

if (statusFilter) {
  statusFilter.addEventListener("change", renderOrganizations);
}

if (organizationForm) {
  organizationForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const newOrganization = {
      name: document.querySelector("#orgName").value.trim(),
      orgId: document.querySelector("#orgId").value.trim(),
      branches: Number(document.querySelector("#orgBranches").value),
      admin: document.querySelector("#orgAdmin").value.trim(),
      plan: document.querySelector("#orgPlan").value,
      status: document.querySelector("#orgStatus").value
    };

    const duplicateOrgId = organizations.some((org) => {
      if (orgPendingEdit && org.orgId === orgPendingEdit.orgId) {
        return false;
      }

      return org.orgId.toLowerCase() === newOrganization.orgId.toLowerCase();
    });

    if (duplicateOrgId) {
      alert("That Org ID already exists.");
      return;
    }

    const previousAdmin = orgPendingEdit ? orgPendingEdit.admin : null;

    if (orgPendingEdit) {
      const index = organizations.findIndex((org) => {
        return org.orgId === orgPendingEdit.orgId;
      });

      if (index !== -1) {
        organizations[index] = newOrganization;
      }

      orgPendingEdit = null;
    } else {
      organizations.push(newOrganization);
    }

    saveOrganizations();
    if(window.SMS_SUPER_BRIDGE) SMS_SUPER_BRIDGE.syncOrganization(newOrganization);
    queuePrimaryAdminInvite(newOrganization, previousAdmin);
    renderOrganizations();
    closeModal();
    alert("School saved. The primary-admin invitation is queued for " + newOrganization.admin + ". Supabase Auth will deliver it in the backend phase.");
  });
}

if (cancelDeleteBtn) {
  cancelDeleteBtn.addEventListener("click", closeDeleteConfirm);
}

if (confirmDeleteBtn) {
  confirmDeleteBtn.addEventListener("click", () => {
    if (!orgPendingDelete) {
      return;
    }

    organizations = organizations.filter((org) => {
      return org.orgId !== orgPendingDelete.orgId;
    });

    saveOrganizations();
    if(window.SMS_SUPER_BRIDGE) SMS_SUPER_BRIDGE.removeOrganization(orgPendingDelete.orgId);
    renderOrganizations();
    closeDeleteConfirm();
  });
}

window.addEventListener("click", (event) => {
  if (event.target === organizationModal) {
    closeModal();
  }

  if (event.target === confirmOverlay) {
    closeDeleteConfirm();
  }
});

renderOrganizations();