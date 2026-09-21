const billingSearch = document.querySelector("#billingSearch");
const billingStatusFilter = document.querySelector("#billingStatusFilter");
const billingPlanFilter = document.querySelector("#billingPlanFilter");
const billingTableBody = document.querySelector("#billingTableBody");
const emptyState = document.querySelector("#emptyState");

const addBillingBtn = document.querySelector("#addBillingBtn");
const billingModal = document.querySelector("#billingModal");
const billingModalTitle = document.querySelector("#billingModalTitle");
const closeModalBtn = document.querySelector("#closeModalBtn");
const cancelModalBtn = document.querySelector("#cancelModalBtn");
const billingForm = document.querySelector("#billingForm");

const billingOrganization = document.querySelector("#billingOrganization");
const billingPlan = document.querySelector("#billingPlan");
const billingStatus = document.querySelector("#billingStatus");
const amountDue = document.querySelector("#amountDue");
const dueDate = document.querySelector("#dueDate");
const lastPaymentDate = document.querySelector("#lastPaymentDate");
const billingNotes = document.querySelector("#billingNotes");

const totalDue = document.querySelector("#totalDue");
const paidCount = document.querySelector("#paidCount");
const unpaidCount = document.querySelector("#unpaidCount");
const overdueCount = document.querySelector("#overdueCount");

const confirmOverlay = document.querySelector("#confirmOverlay");
const confirmMessage = document.querySelector("#confirmMessage");
const cancelDeleteBtn = document.querySelector("#cancelDeleteBtn");
const confirmDeleteBtn = document.querySelector("#confirmDeleteBtn");

const pastDueOrganizations = document.querySelector("#pastDueOrganizations");
const paidOnTimeOrganizations = document.querySelector("#paidOnTimeOrganizations");
const pendingOrganizations = document.querySelector("#pendingOrganizations");

let organizations = JSON.parse(localStorage.getItem("smsOrganizations")) || [];
let billingRecords = JSON.parse(localStorage.getItem("smsBillingRecords")) || [];

let billingPendingEdit = null;
let billingPendingDelete = null;

// ================================
// Storage
// ================================

function saveBillingRecords() {
  localStorage.setItem("smsBillingRecords", JSON.stringify(billingRecords));
}

// ================================
// Organizations
// ================================

function populateOrganizations() {
  billingOrganization.innerHTML = `
    <option value="">Select organization</option>
  `;

  organizations.forEach((organization) => {
    const option = document.createElement("option");
    option.value = organization.orgId;
    option.textContent = `${organization.name} (${organization.orgId})`;
    billingOrganization.appendChild(option);
  });
}

function getSelectedOrganization() {
  return organizations.find((organization) => {
    return organization.orgId === billingOrganization.value;
  });
}

// ================================
// Summary
// ================================

function updateSummaryCards() {
  const unpaidOrOverdue = billingRecords.filter((record) => {
    return record.status === "unpaid" || record.status === "overdue";
  });

  const totalAmountDue = unpaidOrOverdue.reduce((sum, record) => {
    return sum + Number(record.amountDue || 0);
  }, 0);

  const paidRecords = billingRecords.filter((record) => {
    return record.status === "paid";
  });

  const unpaidRecords = billingRecords.filter((record) => {
    return record.status === "unpaid";
  });

  const overdueRecords = billingRecords.filter((record) => {
    return record.status === "overdue";
  });

  totalDue.textContent = formatMoney(totalAmountDue);
  paidCount.textContent = paidRecords.length;
  unpaidCount.textContent = unpaidRecords.length;
  overdueCount.textContent = overdueRecords.length;

  if (pastDueOrganizations) {
    pastDueOrganizations.textContent = overdueRecords.length;
  }

  if (paidOnTimeOrganizations) {
    paidOnTimeOrganizations.textContent = paidRecords.length;
  }

  if (pendingOrganizations) {
    pendingOrganizations.textContent = unpaidRecords.length;
  }
}

// ================================
// Filters
// ================================

function getFilteredBillingRecords() {
  const searchValue = billingSearch.value.trim().toLowerCase();
  const statusValue = billingStatusFilter.value;
  const planValue = billingPlanFilter.value;

  return billingRecords.filter((record) => {
    const searchableText = `
      ${record.organizationName}
      ${record.organizationId}
      ${record.plan}
      ${record.status}
      ${record.amountDue}
      ${record.dueDate}
      ${record.lastPaymentDate}
      ${record.notes}
    `.toLowerCase();

    const matchesSearch = searchableText.includes(searchValue);
    const matchesStatus = statusValue === "all" || record.status === statusValue;
    const matchesPlan = planValue === "all" || record.plan === planValue;

    return matchesSearch && matchesStatus && matchesPlan;
  });
}

// ================================
// Render
// ================================

function renderBillingRecords() {
  const filteredRecords = getFilteredBillingRecords();

  billingTableBody.innerHTML = "";

  if (filteredRecords.length === 0) {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
  }

  filteredRecords.forEach((record, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>
        <strong>${record.organizationName}</strong>
        <p class="table-subtext">${record.organizationId}</p>
      </td>

      <td>
        <span class="plan-pill">${record.plan}</span>
      </td>

      <td>
        <span class="amount">${formatMoney(record.amountDue)}</span>
      </td>

      <td>
        <span class="status ${record.status}">
          ${capitalize(record.status)}
        </span>
      </td>

      <td>${record.dueDate || "N/A"}</td>
      <td>${record.lastPaymentDate || "No payment yet"}</td>
      <td>${record.notes || "—"}</td>

      <td class="actions-cell">
        <button
          class="table-btn mark-paid-btn"
          data-paid-index="${index}"
          type="button">
          Mark Paid
        </button>

        <button
          class="table-btn edit-billing-btn"
          data-edit-index="${index}"
          type="button">
          Edit
        </button>

        <button
          class="table-btn delete-billing-btn"
          data-delete-index="${index}"
          type="button">
          Delete
        </button>
      </td>
    `;

    billingTableBody.appendChild(row);
  });

  attachMarkPaidEvents();
  attachEditEvents();
  attachDeleteEvents();
  updateSummaryCards();
}

row.className = getBillingRowClass(record.status);

row.innerHTML = `
  <td>
    <strong>${record.organizationName}</strong>
    <p class="table-subtext">${record.organizationId}</p>
  </td>

  <td>
    <span class="plan-pill">${record.plan}</span>
  </td>

  <td>
    <span class="amount">${formatMoney(record.amountDue)}</span>
  </td>

  <td>
    <span class="status ${record.status}">
      ${capitalize(record.status)}
    </span>
  </td>

  <td>
    ${record.dueDate || "N/A"}
    ${getBillingStatusLabel(record)}
  </td>

  <td>${record.lastPaymentDate || "No payment yet"}</td>
  <td>${record.notes || "—"}</td>

  <td class="actions-cell">
    <button
      class="table-btn mark-paid-btn"
      data-paid-index="${index}"
      type="button">
      Mark Paid
    </button>

    <button
      class="table-btn edit-billing-btn"
      data-edit-index="${index}"
      type="button">
      Edit
    </button>

    <button
      class="table-btn delete-billing-btn"
      data-delete-index="${index}"
      type="button">
      Delete
    </button>
  </td>
`;

function formatMoney(amount) {
  return `$${Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function getBillingRowClass(status) {
  if (status === "paid") return "billing-row-paid";
  if (status === "unpaid") return "billing-row-unpaid";
  if (status === "overdue") return "billing-row-overdue";
  if (status === "trial") return "billing-row-trial";
  return "";
}

function getBillingStatusLabel(record) {
  if (record.status === "paid") {
    return `
      <div class="billing-status-card">
        <strong class="due-success">Paid on time</strong>
        <small>No balance due</small>
      </div>
    `;
  }

  if (record.status === "overdue") {
    return `
      <div class="billing-status-card">
        <strong class="due-danger">Past due</strong>
        <small>Payment needed ASAP</small>
      </div>
    `;
  }

  if (record.status === "unpaid") {
    return `
      <div class="billing-status-card">
        <strong class="due-warning">Payment pending</strong>
        <small>Not marked paid yet</small>
      </div>
    `;
  }

  if (record.status === "trial") {
    return `
      <div class="billing-status-card">
        <strong>Trial account</strong>
        <small>No payment required yet</small>
      </div>
    `;
  }

  return "";
}

function capitalize(value) {
  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getTodayISODate() {
  return new Date().toISOString().split("T")[0];
}

// ================================
// Modal
// ================================

function openModal(mode = "add") {
  billingModal.classList.remove("hidden");

  if (billingModalTitle) {
    billingModalTitle.textContent =
      mode === "edit" ? "Edit Billing Record" : "Add Billing Record";
  }
}

function closeModal() {
  billingModal.classList.add("hidden");
  billingForm.reset();
  billingPendingEdit = null;

  if (billingModalTitle) {
    billingModalTitle.textContent = "Add Billing Record";
  }
}

// ================================
// Delete
// ================================

function openDeleteConfirm(record) {
  billingPendingDelete = record;
  confirmMessage.innerHTML = `Are you sure you want to delete billing for <strong>${record.organizationName}</strong>?`;
  confirmOverlay.classList.remove("hidden");
}

function closeDeleteConfirm() {
  confirmOverlay.classList.add("hidden");
  billingPendingDelete = null;
}

// ================================
// Table Events
// ================================

function attachMarkPaidEvents() {
  const paidButtons = document.querySelectorAll(".mark-paid-btn");

  paidButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filteredRecords = getFilteredBillingRecords();
      const index = Number(button.dataset.paidIndex);
      const record = filteredRecords[index];

      if (!record) {
        return;
      }

      const realIndex = billingRecords.findIndex((item) => {
        return item.id === record.id;
      });

      if (realIndex !== -1) {
        billingRecords[realIndex].status = "paid";
        billingRecords[realIndex].amountDue = 0;
        billingRecords[realIndex].lastPaymentDate = getTodayISODate();
      }

      saveBillingRecords();
      renderBillingRecords();
    });
  });
}

function attachEditEvents() {
  const editButtons = document.querySelectorAll(".edit-billing-btn");

  editButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filteredRecords = getFilteredBillingRecords();
      const index = Number(button.dataset.editIndex);
      const record = filteredRecords[index];

      if (!record) {
        return;
      }

      billingPendingEdit = record;

      billingOrganization.value = record.organizationId;
      billingPlan.value = record.plan;
      billingStatus.value = record.status;
      amountDue.value = record.amountDue;
      dueDate.value = record.dueDate;
      lastPaymentDate.value = record.lastPaymentDate || "";
      billingNotes.value = record.notes || "";

      openModal("edit");
    });
  });
}

function attachDeleteEvents() {
  const deleteButtons = document.querySelectorAll(".delete-billing-btn");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filteredRecords = getFilteredBillingRecords();
      const index = Number(button.dataset.deleteIndex);
      const record = filteredRecords[index];

      if (!record) {
        return;
      }

      openDeleteConfirm(record);
    });
  });
}

// ================================
// Event Listeners
// ================================

addBillingBtn.addEventListener("click", () => {
  billingPendingEdit = null;
  billingForm.reset();
  openModal("add");
});

closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);

billingSearch.addEventListener("input", renderBillingRecords);
billingStatusFilter.addEventListener("change", renderBillingRecords);
billingPlanFilter.addEventListener("change", renderBillingRecords);

billingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const selectedOrganization = getSelectedOrganization();

  if (!selectedOrganization) {
    alert("Please select an organization.");
    return;
  }

  const newRecord = {
    id: billingPendingEdit ? billingPendingEdit.id : Date.now(),
    organizationId: selectedOrganization.orgId,
    organizationName: selectedOrganization.name,
    plan: billingPlan.value,
    status: billingStatus.value,
    amountDue: Number(amountDue.value),
    dueDate: dueDate.value,
    lastPaymentDate: lastPaymentDate.value,
    notes: billingNotes.value.trim()
  };

  if (billingPendingEdit) {
    const index = billingRecords.findIndex((record) => {
      return record.id === billingPendingEdit.id;
    });

    if (index !== -1) {
      billingRecords[index] = newRecord;
    }

    billingPendingEdit = null;
  } else {
    billingRecords.push(newRecord);
  }

  saveBillingRecords();
  renderBillingRecords();
  closeModal();
});

cancelDeleteBtn.addEventListener("click", closeDeleteConfirm);

confirmDeleteBtn.addEventListener("click", () => {
  if (!billingPendingDelete) {
    return;
  }

  billingRecords = billingRecords.filter((record) => {
    return record.id !== billingPendingDelete.id;
  });

  saveBillingRecords();
  renderBillingRecords();
  closeDeleteConfirm();
});

window.addEventListener("click", (event) => {
  if (event.target === billingModal) {
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
renderBillingRecords();