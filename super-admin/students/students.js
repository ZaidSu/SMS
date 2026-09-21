const organizationSelect = document.querySelector("#organizationSelect");
const branchSelect = document.querySelector("#branchSelect");
const clearSelectionBtn = document.querySelector("#clearSelectionBtn");
const currentScopeBadge = document.querySelector("#currentScopeBadge");

const studentSearch = document.querySelector("#studentSearch");
const studentStatusFilter = document.querySelector("#studentStatusFilter");
const studentTableBody = document.querySelector("#studentTableBody");
const emptyState = document.querySelector("#emptyState");
const lockedState = document.querySelector("#lockedState");
const studentsContent = document.querySelector("#studentsContent");

const addStudentBtn = document.querySelector("#addStudentBtn");
const studentModal = document.querySelector("#studentModal");
const studentModalTitle = document.querySelector("#studentModalTitle");
const closeModalBtn = document.querySelector("#closeModalBtn");
const cancelModalBtn = document.querySelector("#cancelModalBtn");
const studentForm = document.querySelector("#studentForm");

const totalStudents = document.querySelector("#totalStudents");
const activeStudents = document.querySelector("#activeStudents");
const inactiveStudents = document.querySelector("#inactiveStudents");
const withdrawnStudents = document.querySelector("#withdrawnStudents");

const confirmOverlay = document.querySelector("#confirmOverlay");
const confirmMessage = document.querySelector("#confirmMessage");
const cancelDeleteBtn = document.querySelector("#cancelDeleteBtn");
const confirmDeleteBtn = document.querySelector("#confirmDeleteBtn");

let organizations = JSON.parse(localStorage.getItem("smsOrganizations")) || [];
let branches = JSON.parse(localStorage.getItem("smsBranches")) || [];
let students = JSON.parse(localStorage.getItem("smsStudents")) || [];

let selectedOrganizationId = "";
let selectedBranchId = "";
let studentPendingEdit = null;
let studentPendingDelete = null;

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

function saveStudents() {
  localStorage.setItem("smsStudents", JSON.stringify(students));
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

  addStudentBtn.disabled = !hasOrganization;
  studentSearch.disabled = !hasOrganization;
  studentStatusFilter.disabled = !hasOrganization;

  if (!hasOrganization) {
    lockedState.classList.remove("hidden");
    studentsContent.classList.add("hidden");
    currentScopeBadge.textContent = "No organization selected";
    updateSummaryCards([]);
    return;
  }

  lockedState.classList.add("hidden");
  studentsContent.classList.remove("hidden");

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

function getFilteredStudents() {
  if (!selectedOrganizationId) {
    return [];
  }

  const searchValue = studentSearch.value.trim().toLowerCase();
  const selectedStatus = studentStatusFilter.value;

  return students.filter((student) => {
    const matchesOrganization = student.organizationId === selectedOrganizationId;
    const matchesBranch = !selectedBranchId || student.branchId === selectedBranchId;

    const searchableText = `
      ${student.name}
      ${student.studentId}
      ${student.grade}
      ${student.organizationName}
      ${student.branchName}
      ${student.parentEmail}
      ${student.status}
    `.toLowerCase();

    const matchesSearch = searchableText.includes(searchValue);
    const matchesStatus = selectedStatus === "all" || student.status === selectedStatus;

    return matchesOrganization && matchesBranch && matchesSearch && matchesStatus;
  });
}

function updateSummaryCards(list = getFilteredStudents()) {
  totalStudents.textContent = list.length;
  activeStudents.textContent = list.filter((student) => student.status === "active").length;
  inactiveStudents.textContent = list.filter((student) => student.status === "inactive").length;
  withdrawnStudents.textContent = list.filter((student) => student.status === "withdrawn").length;
}

function renderStudents() {
  updatePageAccessState();

  if (!selectedOrganizationId) {
    studentTableBody.innerHTML = "";
    return;
  }

  const filteredStudents = getFilteredStudents();

  studentTableBody.innerHTML = "";

  if (filteredStudents.length === 0) {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
  }

  filteredStudents.forEach((student, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${student.name}</td>
      <td>${student.studentId}</td>
      <td>${student.grade}</td>
      <td>${student.organizationName}</td>
      <td>${student.branchName || "No branch"}</td>
      <td>${student.parentEmail || "N/A"}</td>
      <td>
        <span class="status ${student.status}">
          ${capitalize(student.status)}
        </span>
      </td>
      <td class="actions-cell">
        <button
          class="table-btn edit-student-btn"
          data-edit-index="${index}"
          type="button">
          Edit
        </button>

        <button
          class="table-btn delete-student-btn"
          data-delete-index="${index}"
          type="button">
          Delete
        </button>
      </td>
    `;

    studentTableBody.appendChild(row);
  });

  attachEditEvents();
  attachDeleteEvents();
  updateSummaryCards(filteredStudents);
}

function openModal(mode = "add") {
  studentModal.classList.remove("hidden");

  if (studentModalTitle) {
    studentModalTitle.textContent = mode === "edit" ? "Edit Student" : "Add Student";
  }
}

function closeModal() {
  studentModal.classList.add("hidden");
  studentForm.reset();
  studentPendingEdit = null;

  if (studentModalTitle) {
    studentModalTitle.textContent = "Add Student";
  }
}

function openDeleteConfirm(student) {
  studentPendingDelete = student;
  confirmMessage.innerHTML = `Are you sure you want to delete <strong>${student.name}</strong>?`;
  confirmOverlay.classList.remove("hidden");
}

function closeDeleteConfirm() {
  confirmOverlay.classList.add("hidden");
  studentPendingDelete = null;
}

function attachEditEvents() {
  const editButtons = document.querySelectorAll(".edit-student-btn");

  editButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filteredStudents = getFilteredStudents();
      const index = Number(button.dataset.editIndex);
      const student = filteredStudents[index];

      if (!student) {
        return;
      }

      studentPendingEdit = student;
      openModal("edit");

      document.querySelector("#studentName").value = student.name;
      document.querySelector("#studentId").value = student.studentId;
      document.querySelector("#studentGrade").value = student.grade;
      document.querySelector("#studentStatus").value = student.status;
      document.querySelector("#parentEmail").value = student.parentEmail || "";
    });
  });
}

function attachDeleteEvents() {
  const deleteButtons = document.querySelectorAll(".delete-student-btn");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filteredStudents = getFilteredStudents();
      const index = Number(button.dataset.deleteIndex);
      const student = filteredStudents[index];

      if (!student) {
        return;
      }

      openDeleteConfirm(student);
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
  renderStudents();
});

branchSelect.addEventListener("change", () => {
  selectedBranchId = branchSelect.value;
  renderStudents();
});

clearSelectionBtn.addEventListener("click", () => {
  selectedOrganizationId = "";
  selectedBranchId = "";

  organizationSelect.value = "";
  branchSelect.innerHTML = `<option value="">Select branch</option>`;
  branchSelect.disabled = true;

  studentSearch.value = "";
  studentStatusFilter.value = "all";

  renderStudents();
});

studentSearch.addEventListener("input", renderStudents);
studentStatusFilter.addEventListener("change", renderStudents);

addStudentBtn.addEventListener("click", () => {
  if (!selectedOrganizationId) {
    alert("Please select an organization first.");
    return;
  }

  studentPendingEdit = null;
  studentForm.reset();
  openModal("add");
});

closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);

studentForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const selectedOrganization = getSelectedOrganization();
  const selectedBranch = getSelectedBranch();

  if (!selectedOrganization) {
    alert("Please select an organization first.");
    return;
  }

  const newStudent = {
    name: document.querySelector("#studentName").value.trim(),
    studentId: document.querySelector("#studentId").value.trim(),
    grade: document.querySelector("#studentGrade").value.trim(),
    status: document.querySelector("#studentStatus").value,
    parentEmail: document.querySelector("#parentEmail").value.trim(),
    organizationId: selectedOrganization.orgId,
    organizationName: selectedOrganization.name,
    branchId: selectedBranch ? selectedBranch.branchId : "",
    branchName: selectedBranch ? selectedBranch.branchName : "No branch"
  };

  const duplicateStudentId = students.some((student) => {
    if (studentPendingEdit && student.studentId === studentPendingEdit.studentId) {
      return false;
    }

    return (
      student.organizationId === newStudent.organizationId &&
      student.studentId.toLowerCase() === newStudent.studentId.toLowerCase()
    );
  });

  if (duplicateStudentId) {
    alert("That Student ID already exists inside this organization.");
    return;
  }

  if (studentPendingEdit) {
    const index = students.findIndex((student) => {
      return (
        student.organizationId === studentPendingEdit.organizationId &&
        student.studentId === studentPendingEdit.studentId
      );
    });

    if (index !== -1) {
      students[index] = newStudent;
    }

    studentPendingEdit = null;
  } else {
    students.push(newStudent);
  }

  saveStudents();
  renderStudents();
  closeModal();
});

cancelDeleteBtn.addEventListener("click", closeDeleteConfirm);

confirmDeleteBtn.addEventListener("click", () => {
  if (!studentPendingDelete) {
    return;
  }

  students = students.filter((student) => {
    return !(
      student.organizationId === studentPendingDelete.organizationId &&
      student.studentId === studentPendingDelete.studentId
    );
  });

  saveStudents();
  renderStudents();
  closeDeleteConfirm();
});

window.addEventListener("click", (event) => {
  if (event.target === studentModal) {
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
renderStudents();