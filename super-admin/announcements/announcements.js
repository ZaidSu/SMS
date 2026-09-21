const announcementSearch = document.querySelector("#announcementSearch");
const announcementStatusFilter = document.querySelector("#announcementStatusFilter");
const announcementScopeFilter = document.querySelector("#announcementScopeFilter");
const announcementTableBody = document.querySelector("#announcementTableBody");
const emptyState = document.querySelector("#emptyState");

const addAnnouncementBtn = document.querySelector("#addAnnouncementBtn");
const announcementModal = document.querySelector("#announcementModal");
const announcementModalTitle = document.querySelector("#announcementModalTitle");
const closeModalBtn = document.querySelector("#closeModalBtn");
const cancelModalBtn = document.querySelector("#cancelModalBtn");
const announcementForm = document.querySelector("#announcementForm");

const announcementTitle = document.querySelector("#announcementTitle");
const announcementMessage = document.querySelector("#announcementMessage");
const announcementScope = document.querySelector("#announcementScope");
const announcementAudience = document.querySelector("#announcementAudience");
const announcementOrganization = document.querySelector("#announcementOrganization");
const announcementBranch = document.querySelector("#announcementBranch");
const announcementPriority = document.querySelector("#announcementPriority");
const announcementStatus = document.querySelector("#announcementStatus");

const totalAnnouncements = document.querySelector("#totalAnnouncements");
const publishedAnnouncements = document.querySelector("#publishedAnnouncements");
const draftAnnouncements = document.querySelector("#draftAnnouncements");
const archivedAnnouncements = document.querySelector("#archivedAnnouncements");

const viewModal = document.querySelector("#viewModal");
const closeViewModalBtn = document.querySelector("#closeViewModalBtn");
const viewTitle = document.querySelector("#viewTitle");
const viewMeta = document.querySelector("#viewMeta");
const viewMessage = document.querySelector("#viewMessage");

const confirmOverlay = document.querySelector("#confirmOverlay");
const confirmMessage = document.querySelector("#confirmMessage");
const cancelDeleteBtn = document.querySelector("#cancelDeleteBtn");
const confirmDeleteBtn = document.querySelector("#confirmDeleteBtn");

let organizations = JSON.parse(localStorage.getItem("smsOrganizations")) || [];
let branches = JSON.parse(localStorage.getItem("smsBranches")) || [];
let announcements = JSON.parse(localStorage.getItem("smsAnnouncements")) || [];

let announcementPendingEdit = null;
let announcementPendingDelete = null;

// ================================
// Storage
// ================================

function saveAnnouncements() {
  localStorage.setItem("smsAnnouncements", JSON.stringify(announcements));
}

// ================================
// Organization / Branch Dropdowns
// ================================

function populateOrganizations() {
  announcementOrganization.innerHTML = `
    <option value="">Select organization</option>
  `;

  organizations.forEach((organization) => {
    const option = document.createElement("option");
    option.value = organization.orgId;
    option.textContent = `${organization.name} (${organization.orgId})`;
    announcementOrganization.appendChild(option);
  });
}

function populateBranches(organizationId = "") {
  announcementBranch.innerHTML = `
    <option value="">Select branch</option>
  `;

  const organizationBranches = branches.filter((branch) => {
    return branch.organizationId === organizationId;
  });

  organizationBranches.forEach((branch) => {
    const option = document.createElement("option");
    option.value = branch.branchId;
    option.textContent = `${branch.branchName} (${branch.branchId})`;
    announcementBranch.appendChild(option);
  });
}

function updateScopeFields() {
  const scope = announcementScope.value;

  if (scope === "platform") {
    announcementOrganization.disabled = true;
    announcementBranch.disabled = true;
    announcementOrganization.value = "";
    announcementBranch.value = "";
    return;
  }

  if (scope === "organization") {
    announcementOrganization.disabled = false;
    announcementBranch.disabled = true;
    announcementBranch.value = "";
    return;
  }

  if (scope === "branch") {
    announcementOrganization.disabled = false;
    announcementBranch.disabled = false;
  }
}

// ================================
// Summary
// ================================

function updateSummaryCards() {
  totalAnnouncements.textContent = announcements.length;

  publishedAnnouncements.textContent = announcements.filter((item) => {
    return item.status === "published";
  }).length;

  draftAnnouncements.textContent = announcements.filter((item) => {
    return item.status === "draft";
  }).length;

  archivedAnnouncements.textContent = announcements.filter((item) => {
    return item.status === "archived";
  }).length;
}

// ================================
// Filters
// ================================

function getFilteredAnnouncements() {
  const searchValue = announcementSearch.value.trim().toLowerCase();
  const statusValue = announcementStatusFilter.value;
  const scopeValue = announcementScopeFilter.value;

  return announcements.filter((announcement) => {
    const searchableText = `
      ${announcement.title}
      ${announcement.message}
      ${announcement.scope}
      ${announcement.audience}
      ${announcement.priority}
      ${announcement.status}
      ${announcement.organizationName}
      ${announcement.branchName}
    `.toLowerCase();

    const matchesSearch = searchableText.includes(searchValue);
    const matchesStatus = statusValue === "all" || announcement.status === statusValue;
    const matchesScope = scopeValue === "all" || announcement.scope === scopeValue;

    return matchesSearch && matchesStatus && matchesScope;
  });
}

// ================================
// Render
// ================================

function renderAnnouncements() {
  const filteredAnnouncements = getFilteredAnnouncements();

  announcementTableBody.innerHTML = "";

  if (filteredAnnouncements.length === 0) {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
  }

  filteredAnnouncements.forEach((announcement, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>
        <strong>${announcement.title}</strong>
        <p class="table-subtext">${getTargetLabel(announcement)}</p>
      </td>

      <td>
        <span class="scope-pill">${capitalize(announcement.scope)}</span>
      </td>

      <td>${capitalize(announcement.audience.replaceAll("_", " "))}</td>

      <td>
        <span class="priority ${announcement.priority}">
          ${capitalize(announcement.priority)}
        </span>
      </td>

      <td>
        <span class="status ${announcement.status}">
          ${capitalize(announcement.status)}
        </span>
      </td>

      <td>${announcement.createdAt}</td>

      <td class="actions-cell">
        <button
          class="table-btn view-announcement-btn"
          data-view-index="${index}"
          type="button">
          View
        </button>

        <button
          class="table-btn edit-announcement-btn"
          data-edit-index="${index}"
          type="button">
          Edit
        </button>

        <button
          class="table-btn delete-announcement-btn"
          data-delete-index="${index}"
          type="button">
          Delete
        </button>
      </td>
    `;

    announcementTableBody.appendChild(row);
  });

  attachViewEvents();
  attachEditEvents();
  attachDeleteEvents();
  updateSummaryCards();
}

function getTargetLabel(announcement) {
  if (announcement.scope === "platform") {
    return "Platform-wide";
  }

  if (announcement.scope === "organization") {
    return announcement.organizationName || "Organization";
  }

  if (announcement.scope === "branch") {
    return `${announcement.organizationName || "Organization"} / ${announcement.branchName || "Branch"}`;
  }

  return "Unknown scope";
}

function getSelectedOrganization() {
  return organizations.find((organization) => {
    return organization.orgId === announcementOrganization.value;
  });
}

function getSelectedBranch() {
  return branches.find((branch) => {
    return branch.branchId === announcementBranch.value;
  });
}

function capitalize(value) {
  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getTodayDate() {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

// ================================
// Modal
// ================================

function openModal(mode = "add") {
  announcementModal.classList.remove("hidden");

  if (announcementModalTitle) {
    announcementModalTitle.textContent =
      mode === "edit" ? "Edit Announcement" : "New Announcement";
  }
}

function closeModal() {
  announcementModal.classList.add("hidden");
  announcementForm.reset();
  announcementPendingEdit = null;
  updateScopeFields();

  if (announcementModalTitle) {
    announcementModalTitle.textContent = "New Announcement";
  }
}

function openViewModal(announcement) {
  viewModal.classList.remove("hidden");

  viewTitle.textContent = announcement.title;

  viewMeta.innerHTML = `
    <span class="scope-pill">${capitalize(announcement.scope)}</span>
    <span class="priority ${announcement.priority}">${capitalize(announcement.priority)}</span>
    <span class="status ${announcement.status}">${capitalize(announcement.status)}</span>
    <span class="scope-pill">${capitalize(announcement.audience.replaceAll("_", " "))}</span>
  `;

  viewMessage.textContent = announcement.message;
}

function closeViewModal() {
  viewModal.classList.add("hidden");
}

// ================================
// Delete
// ================================

function openDeleteConfirm(announcement) {
  announcementPendingDelete = announcement;
  confirmMessage.innerHTML = `Are you sure you want to delete <strong>${announcement.title}</strong>?`;
  confirmOverlay.classList.remove("hidden");
}

function closeDeleteConfirm() {
  confirmOverlay.classList.add("hidden");
  announcementPendingDelete = null;
}

// ================================
// Events for Table Buttons
// ================================

function attachViewEvents() {
  const viewButtons = document.querySelectorAll(".view-announcement-btn");

  viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filteredAnnouncements = getFilteredAnnouncements();
      const index = Number(button.dataset.viewIndex);
      const announcement = filteredAnnouncements[index];

      if (!announcement) {
        return;
      }

      openViewModal(announcement);
    });
  });
}

function attachEditEvents() {
  const editButtons = document.querySelectorAll(".edit-announcement-btn");

  editButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filteredAnnouncements = getFilteredAnnouncements();
      const index = Number(button.dataset.editIndex);
      const announcement = filteredAnnouncements[index];

      if (!announcement) {
        return;
      }

      announcementPendingEdit = announcement;

      announcementTitle.value = announcement.title;
      announcementMessage.value = announcement.message;
      announcementScope.value = announcement.scope;
      announcementAudience.value = announcement.audience;
      announcementPriority.value = announcement.priority;
      announcementStatus.value = announcement.status;

      updateScopeFields();

      announcementOrganization.value = announcement.organizationId || "";
      populateBranches(announcement.organizationId || "");
      announcementBranch.value = announcement.branchId || "";

      openModal("edit");
    });
  });
}

function attachDeleteEvents() {
  const deleteButtons = document.querySelectorAll(".delete-announcement-btn");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filteredAnnouncements = getFilteredAnnouncements();
      const index = Number(button.dataset.deleteIndex);
      const announcement = filteredAnnouncements[index];

      if (!announcement) {
        return;
      }

      openDeleteConfirm(announcement);
    });
  });
}

// ================================
// Event Listeners
// ================================

addAnnouncementBtn.addEventListener("click", () => {
  announcementPendingEdit = null;
  announcementForm.reset();
  updateScopeFields();
  openModal("add");
});

closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);
closeViewModalBtn.addEventListener("click", closeViewModal);

announcementSearch.addEventListener("input", renderAnnouncements);
announcementStatusFilter.addEventListener("change", renderAnnouncements);
announcementScopeFilter.addEventListener("change", renderAnnouncements);

announcementScope.addEventListener("change", () => {
  updateScopeFields();
});

announcementOrganization.addEventListener("change", () => {
  populateBranches(announcementOrganization.value);
});

announcementForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const scope = announcementScope.value;
  const selectedOrganization = getSelectedOrganization();
  const selectedBranch = getSelectedBranch();

  if ((scope === "organization" || scope === "branch") && !selectedOrganization) {
    alert("Please select an organization.");
    return;
  }

  if (scope === "branch" && !selectedBranch) {
    alert("Please select a branch.");
    return;
  }

  const newAnnouncement = {
    id: announcementPendingEdit ? announcementPendingEdit.id : Date.now(),
    title: announcementTitle.value.trim(),
    message: announcementMessage.value.trim(),
    scope,
    audience: announcementAudience.value,
    organizationId: selectedOrganization ? selectedOrganization.orgId : "",
    organizationName: selectedOrganization ? selectedOrganization.name : "",
    branchId: selectedBranch ? selectedBranch.branchId : "",
    branchName: selectedBranch ? selectedBranch.branchName : "",
    priority: announcementPriority.value,
    status: announcementStatus.value,
    createdAt: announcementPendingEdit ? announcementPendingEdit.createdAt : getTodayDate()
  };

  if (announcementPendingEdit) {
    const index = announcements.findIndex((announcement) => {
      return announcement.id === announcementPendingEdit.id;
    });

    if (index !== -1) {
      announcements[index] = newAnnouncement;
    }

    announcementPendingEdit = null;
  } else {
    announcements.push(newAnnouncement);
  }

  saveAnnouncements();
  renderAnnouncements();
  closeModal();
});

cancelDeleteBtn.addEventListener("click", closeDeleteConfirm);

confirmDeleteBtn.addEventListener("click", () => {
  if (!announcementPendingDelete) {
    return;
  }

  announcements = announcements.filter((announcement) => {
    return announcement.id !== announcementPendingDelete.id;
  });

  saveAnnouncements();
  renderAnnouncements();
  closeDeleteConfirm();
});

window.addEventListener("click", (event) => {
  if (event.target === announcementModal) {
    closeModal();
  }

  if (event.target === viewModal) {
    closeViewModal();
  }

  if (event.target === confirmOverlay) {
    closeDeleteConfirm();
  }
});

// ================================
// Initialize
// ================================

populateOrganizations();
updateScopeFields();
renderAnnouncements();