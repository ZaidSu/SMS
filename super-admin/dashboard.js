// ================================
// Super Admin Dashboard JS
// Backend-ready structure with local fallback for now
// ================================

const addOrganizationBtn = document.querySelector("#addOrganizationBtn");
const createAdminBtn = document.querySelector("#createAdminBtn");
const auditLogsBtn = document.querySelector("#auditLogsBtn");
const noticeBtn = document.querySelector("#noticeBtn");

const totalOrganizations = document.querySelector("#totalOrganizations");
const totalBranches = document.querySelector("#totalBranches");
const totalUsers = document.querySelector("#totalUsers");
const activeUsers = document.querySelector("#activeUsers");
const inactiveUsers = document.querySelector("#inactiveUsers");
const billingDue = document.querySelector("#billingDue");
const securityStatus = document.querySelector("#securityStatus");
const importantAlerts = document.querySelector("#importantAlerts");

const summaryOrganizations = document.querySelector("#summaryOrganizations");
const summaryBranches = document.querySelector("#summaryBranches");
const summaryUsers = document.querySelector("#summaryUsers");
const summaryBillingDue = document.querySelector("#summaryBillingDue");

const organizationTableBody = document.querySelector("#organizationTableBody");
const dashboardEmptyState = document.querySelector("#dashboardEmptyState");
const alertList = document.querySelector("#alertList");

const menuBtn = document.querySelector("#menuBtn");
const sidebar = document.querySelector("#sidebar");
const sidebarOverlay = document.querySelector("#sidebarOverlay");

// ================================
// Temporary Local Fallback
// Later this will come from backend API
// ================================

function getOrganizationsFallback() {
  return JSON.parse(localStorage.getItem("smsOrganizations")) || [];
}

function getUsersFallback() {
  return JSON.parse(localStorage.getItem("smsGlobalUsers")) || [];
}

function getAlertsFallback() {
  return JSON.parse(localStorage.getItem("smsPlatformAlerts")) || [];
}

// Later backend version can replace this function
async function getDashboardData() {
  const organizations = getOrganizationsFallback();
  const users = getUsersFallback();
  const alerts = getAlertsFallback();

  const branchCount = organizations.reduce((total, org) => {
    return total + Number(org.branches || 0);
  }, 0);

  const activeUserCount = users.filter((user) => {
    return user.status === "active";
  }).length;

  const inactiveUserCount = users.filter((user) => {
    return user.status === "inactive";
  }).length;

  const totalBillingDue = organizations.reduce((total, org) => {
    return total + Number(org.billingDue || 0);
  }, 0);

  return {
    totalOrganizations: organizations.length,
    totalBranches: branchCount,
    totalUsers: users.length,
    activeUsers: activeUserCount,
    inactiveUsers: inactiveUserCount,
    billingDue: totalBillingDue,
    securityStatus: "Healthy",
    importantAlerts: alerts.length,
    organizations,
    alerts
  };
}

// ================================
// Sidebar Toggle
// ================================

function openSidebar() {
  if (!sidebar || !sidebarOverlay) {
    return;
  }

  sidebar.classList.add("show");
  sidebarOverlay.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeSidebar() {
  if (!sidebar || !sidebarOverlay) {
    return;
  }

  sidebar.classList.remove("show");
  sidebarOverlay.classList.remove("show");
  document.body.style.overflow = "";
}

if (menuBtn && sidebar && sidebarOverlay) {
  menuBtn.addEventListener("click", () => {
    if (sidebar.classList.contains("show")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  sidebarOverlay.addEventListener("click", closeSidebar);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && sidebar?.classList.contains("show")) {
    closeSidebar();
  }
});

document.querySelectorAll(".nav-link, .logout-link").forEach((link) => {
  link.addEventListener("click", () => {
    if (window.innerWidth <= 800) {
      closeSidebar();
    }
  });
});

// ================================
// Render Dashboard
// ================================

async function renderDashboard() {
  const dashboardData = await getDashboardData();

  updateText(totalOrganizations, dashboardData.totalOrganizations);
  updateText(totalBranches, dashboardData.totalBranches);
  updateText(totalUsers, dashboardData.totalUsers);
  updateText(activeUsers, dashboardData.activeUsers);
  updateText(inactiveUsers, dashboardData.inactiveUsers);
  updateText(billingDue, formatMoney(dashboardData.billingDue));
  updateText(securityStatus, dashboardData.securityStatus);
  updateText(importantAlerts, dashboardData.importantAlerts);

  updateText(summaryOrganizations, dashboardData.totalOrganizations);
  updateText(summaryBranches, dashboardData.totalBranches);
  updateText(summaryUsers, dashboardData.totalUsers);
  updateText(summaryBillingDue, formatMoney(dashboardData.billingDue));

  renderDashboardOrganizations(dashboardData.organizations);
  renderAlerts(dashboardData.alerts);
}

function updateText(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function renderDashboardOrganizations(organizations) {
  if (!organizationTableBody || !dashboardEmptyState) {
    return;
  }

  organizationTableBody.innerHTML = "";

  if (!organizations || organizations.length === 0) {
    dashboardEmptyState.style.display = "block";
    return;
  }

  dashboardEmptyState.style.display = "none";

  organizations.slice(0, 5).forEach((org) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${org.name || "Unnamed Organization"}</td>
      <td>${org.orgId || "N/A"}</td>
      <td>${org.branches || 0}</td>
      <td>
        <span class="status ${org.status || "inactive"}">
          ${capitalize(org.status || "inactive")}
        </span>
      </td>
    `;

    organizationTableBody.appendChild(row);
  });
}

function renderAlerts(alerts) {
  if (!alertList) {
    return;
  }

  if (!alerts || alerts.length === 0) {
    alertList.innerHTML = `
      <div class="empty-alert">
        <i class="fa-solid fa-circle-check"></i>
        <p>No important alerts right now.</p>
      </div>
    `;
    return;
  }

  alertList.innerHTML = alerts
    .map((alert) => {
      return `
        <div class="alert-item">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <div>
            <strong>${alert.title || "Platform Alert"}</strong>
            <p>${alert.message || "This alert needs attention."}</p>
          </div>
        </div>
      `;
    })
    .join("");
}

function capitalize(value) {
  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatMoney(amount) {
  return `$${Number(amount || 0).toLocaleString()}`;
}

// ================================
// Quick Actions
// ================================

if (addOrganizationBtn) {
  addOrganizationBtn.addEventListener("click", () => {
    window.location.href = "organizations/organization.html";
  });
}

if (createAdminBtn) {
  createAdminBtn.addEventListener("click", () => {
    window.location.href = "global-users/global-users.html";
  });
}

if (auditLogsBtn) {
  auditLogsBtn.addEventListener("click", () => {
    window.location.href = "audit-logs/audit-logs.html";
  });
}

if (noticeBtn) {
  noticeBtn.addEventListener("click", () => {
    window.location.href = "announcements/announcements.html";
  });
}

// ================================
// Initialize
// ================================

renderDashboard();