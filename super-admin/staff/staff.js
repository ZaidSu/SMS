const organizationSelect = document.querySelector("#organizationSelect");
const branchSelect = document.querySelector("#branchSelect");
const clearSelectionBtn = document.querySelector("#clearSelectionBtn");
const currentScopeBadge = document.querySelector("#currentScopeBadge");

const staffSearch = document.querySelector("#staffSearch");
const staffStatusFilter = document.querySelector("#staffStatusFilter");
const staffTableBody = document.querySelector("#staffTableBody");
const emptyState = document.querySelector("#emptyState");
const lockedState = document.querySelector("#lockedState");
const staffContent = document.querySelector("#staffContent");

const addStaffBtn = document.querySelector("#addStaffBtn");
const staffModal = document.querySelector("#staffModal");
const staffModalTitle = document.querySelector("#staffModalTitle");
const closeModalBtn = document.querySelector("#closeModalBtn");
const cancelModalBtn = document.querySelector("#cancelModalBtn");
const staffForm = document.querySelector("#staffForm");

const totalStaff = document.querySelector("#totalStaff");
const activeStaff = document.querySelector("#activeStaff");
const inactiveStaff = document.querySelector("#inactiveStaff");
const suspendedStaff = document.querySelector("#suspendedStaff");

const confirmOverlay = document.querySelector("#confirmOverlay");
const confirmMessage = document.querySelector("#confirmMessage");
const cancelDeleteBtn = document.querySelector("#cancelDeleteBtn");
const confirmDeleteBtn = document.querySelector("#confirmDeleteBtn");

let organizations = JSON.parse(localStorage.getItem("smsOrganizations")) || [];
let branches = JSON.parse(localStorage.getItem("smsBranches")) || [];
let staffMembers = JSON.parse(localStorage.getItem("smsStaff")) || [];

let selectedOrganizationId = "";
let selectedBranchId = "";
let staffPendingEdit = null;
let staffPendingDelete = null;

// ================================
// Temporary demo branches if none exist
// This helps the page work while backend is not connected yet.
// ================================

function seedDemoBranchesIfNeeded() {
  if (branches.length > 0 || organizations.length === 0) {
    return;
  }

  branches = organizations.flatMap((organization) => {
    const branchCount = Number(organization.branches || 0);

    if (branchCount <= 0) {
      return [];
    }

    return Array.from({ length: branchCount }, (_, index) => {
      const branchNumber = index + 1;

      return {
        organizationId: organization.orgId,
        organizationName: organization.name,
        branchId: `${organization.orgId}-BR${branchNumber}`,
        branchName: `Branch ${branchNumber}`,
        city: "",
        state: "",
        status: "active"
      };
    });
  });

  localStorage.setItem("smsBranches", JSON.stringify(branches));
}

function saveStaff() {
  localStorage.setItem("smsStaff", JSON.stringify(staffMembers));
}

function populateOrganizations() {
  organizationSelect.innerHTML = `
    <option value="">Select organization</option>
  `;

  organizations.forEach((organization) => {
    const option = document.createElement("option");
    option.value = organization.orgId;
    option.textContent = `${organization.name} (${organization.orgId})`;
    organizationSelect.appendChild(option);
  });
}

function populateBranches() {
  branchSelect.innerHTML = `
    <option value="">All branches</option>
  `;

  const organizationBranches = branches.filter((branch) => {
    return branch.organizationId === selectedOrganizationId;
  });

  if (!selectedOrganizationId || organizationBranches.length === 0) {
    branchSelect.disabled = true;
    return;
  }

  branchSelect.disabled = false;

  organizationBranches.forEach((branch) => {
    const option = document.createElement("option");
    option.value = branch.branchId;
    option.textContent = `${branch.branchName} (${branch.branchId})`;
    branchSelect.appendChild(option);
  });
}

function updatePageAccessState() {
  const hasOrganization = Boolean(selectedOrganizationId);

  addStaffBtn.disabled = !hasOrganization;
  staffSearch.disabled = !hasOrganization;
  staffStatusFilter.disabled = !hasOrganization;

  if (!hasOrganization) {
    lockedState.classList.remove("hidden");
    staffContent.classList.add("hidden");
    currentScopeBadge.textContent = "No organization selected";
    updateSummaryCards([]);
    return;
  }

  lockedState.classList.add("hidden");
  staffContent.classList.remove("hidden");

  const selectedOrganization = organizations.find((organization) => {
    return organization.orgId === selectedOrganizationId;
  });

  const selectedBranch = branches.find((branch) => {
    return branch.branchId === selectedBranchId;
  });

  if (selectedBranch) {
    currentScopeBadge.textContent = `${selectedOrganization.name} / ${selectedBranch.branchName}`;
  } else {
    currentScopeBadge.textContent = selectedOrganization
      ? `${selectedOrganization.name} / All branches`
      : "Organization selected";
  }
}

function getFilteredStaff() {
  if (!selectedOrganizationId) {
    return [];
  }

  const searchValue = staffSearch.value.trim().toLowerCase();
  const selectedStatus = staffStatusFilter.value;

  return staffMembers.filter((staff) => {
    const matchesOrganization = staff.organizationId === selectedOrganizationId;
    const matchesBranch = !selectedBranchId || staff.branchId === selectedBranchId;

    const searchableText = `
      ${staff.name}
      ${staff.email}
      ${staff.role}
      ${staff.organizationName}
      ${staff.branchName}
      ${staff.status}
    `.toLowerCase();

    const matchesSearch = searchableText.includes(searchValue);
    const matchesStatus = selectedStatus === "all" || staff.status === selectedStatus;

    return matchesOrganization && matchesBranch && matchesSearch && matchesStatus;
  });
}

function updateSummaryCards(list = getFilteredStaff()) {
  totalStaff.textContent = list.length;
  activeStaff.textContent = list.filter((staff) => staff.status === "active").length;
  inactiveStaff.textContent = list.filter((staff) => staff.status === "inactive").length;
  suspendedStaff.textContent = list.filter((staff) => staff.status === "suspended").length;
}

function renderStaff() {
  updatePageAccessState();

  if (!selectedOrganizationId) {
    staffTableBody.innerHTML = "";
    return;
  }

  const filteredStaff = getFilteredStaff();

  staffTableBody.innerHTML = "";

  if (filteredStaff.length === 0) {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
  }

  filteredStaff.forEach((staff, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${staff.name}</td>
      <td>${staff.email}</td>
      <td>${staff.role}</td>
      <td>${staff.organizationName}</td>
      <td>${staff.branchName || "No branch"}</td>
      <td>
        <span class="status ${staff.status}">
          ${capitalize(staff.status)}
        </span>
      </td>
      <td class="actions-cell">
        <button
          class="table-btn edit-staff-btn"
          data-edit-index="${index}"
          type="button">
          Edit
        </button>

        <button
          class="table-btn delete-staff-btn"
          data-delete-index="${index}"
          type="button">
          Delete
        </button>
      </td>
    `;

    staffTableBody.appendChild(row);
  });

  attachEditEvents();
  attachDeleteEvents();
  updateSummaryCards(filteredStaff);
}

function openModal(mode = "add") {
  staffModal.classList.remove("hidden");

  if (staffModalTitle) {
    staffModalTitle.textContent = mode === "edit" ? "Edit Staff" : "Add Staff";
  }
}

function closeModal() {
  staffModal.classList.add("hidden");
  staffForm.reset();
  staffPendingEdit = null;

  if (staffModalTitle) {
    staffModalTitle.textContent = "Add Staff";
  }
}

function openDeleteConfirm(staff) {
  staffPendingDelete = staff;
  confirmMessage.innerHTML = `Are you sure you want to delete <strong>${staff.name}</strong>?`;
  confirmOverlay.classList.remove("hidden");
}

function closeDeleteConfirm() {
  confirmOverlay.classList.add("hidden");
  staffPendingDelete = null;
}

function attachEditEvents() {
  const editButtons = document.querySelectorAll(".edit-staff-btn");

  editButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filteredStaff = getFilteredStaff();
      const index = Number(button.dataset.editIndex);
      const staff = filteredStaff[index];

      if (!staff) {
        return;
      }

      staffPendingEdit = staff;
      openModal("edit");

      document.querySelector("#staffName").value = staff.name;
      document.querySelector("#staffEmail").value = staff.email;
      document.querySelector("#staffRole").value = staff.role;
      document.querySelector("#staffStatus").value = staff.status;
    });
  });
}

function attachDeleteEvents() {
  const deleteButtons = document.querySelectorAll(".delete-staff-btn");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filteredStaff = getFilteredStaff();
      const index = Number(button.dataset.deleteIndex);
      const staff = filteredStaff[index];

      if (!staff) {
        return;
      }

      openDeleteConfirm(staff);
    });
  });
}

function getSelectedOrganization() {
  return organizations.find((organization) => {
    return organization.orgId === selectedOrganizationId;
  });
}

function getSelectedBranch() {
  return branches.find((branch) => {
    return branch.branchId === selectedBranchId;
  });
}

function capitalize(value) {
  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

// ================================
// Event Listeners
// ================================

organizationSelect.addEventListener("change", () => {
  selectedOrganizationId = organizationSelect.value;
  selectedBranchId = "";

  populateBranches();
  renderStaff();
});

branchSelect.addEventListener("change", () => {
  selectedBranchId = branchSelect.value;
  renderStaff();
});

clearSelectionBtn.addEventListener("click", () => {
  selectedOrganizationId = "";
  selectedBranchId = "";

  organizationSelect.value = "";
  branchSelect.innerHTML = `<option value="">Select branch</option>`;
  branchSelect.disabled = true;

  staffSearch.value = "";
  staffStatusFilter.value = "all";

  renderStaff();
});

staffSearch.addEventListener("input", renderStaff);
staffStatusFilter.addEventListener("change", renderStaff);

addStaffBtn.addEventListener("click", () => {
  if (!selectedOrganizationId) {
    alert("Please select an organization first.");
    return;
  }

  staffPendingEdit = null;
  staffForm.reset();
  openModal("add");
});

closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);

staffForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const selectedOrganization = getSelectedOrganization();
  const selectedBranch = getSelectedBranch();

  if (!selectedOrganization) {
    alert("Please select an organization first.");
    return;
  }

  const newStaff = {
    name: document.querySelector("#staffName").value.trim(),
    email: document.querySelector("#staffEmail").value.trim(),
    role: document.querySelector("#staffRole").value,
    status: document.querySelector("#staffStatus").value,
    organizationId: selectedOrganization.orgId,
    organizationName: selectedOrganization.name,
    branchId: selectedBranch ? selectedBranch.branchId : "",
    branchName: selectedBranch ? selectedBranch.branchName : "No branch"
  };

  const duplicateEmail = staffMembers.some((staff) => {
    if (staffPendingEdit && staff.email === staffPendingEdit.email) {
      return false;
    }

    return staff.email.toLowerCase() === newStaff.email.toLowerCase();
  });

  if (duplicateEmail) {
    alert("A staff member with that email already exists.");
    return;
  }

  if (staffPendingEdit) {
    const index = staffMembers.findIndex((staff) => {
      return staff.email === staffPendingEdit.email;
    });

    if (index !== -1) {
      staffMembers[index] = newStaff;
    }

    staffPendingEdit = null;
  } else {
    staffMembers.push(newStaff);
  }

  saveStaff();
  renderStaff();
  closeModal();
});

cancelDeleteBtn.addEventListener("click", closeDeleteConfirm);

confirmDeleteBtn.addEventListener("click", () => {
  if (!staffPendingDelete) {
    return;
  }

  staffMembers = staffMembers.filter((staff) => {
    return staff.email !== staffPendingDelete.email;
  });

  saveStaff();
  renderStaff();
  closeDeleteConfirm();
});

window.addEventListener("click", (event) => {
  if (event.target === staffModal) {
    closeModal();
  }

  if (event.target === confirmOverlay) {
    closeDeleteConfirm();
  }
});

// ================================
// Initialize
// ================================

seedDemoBranchesIfNeeded();
populateOrganizations();
populateBranches();
renderStaff();