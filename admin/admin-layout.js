// =============================================================
// Admin Portal — Shared Layout Builder (v2 — flat file structure)
// Nav links use ./page.html relative paths (same folder).
// Logout redirects to ../login/login.html
// =============================================================
var SMS_ADMIN_LAYOUT = (function() {
  var ALL_NAV = [
    { section: "Overview" },
    { key: "school-home",    label: "School Home",       icon: "fa-school",              href: "./school-home.html" },
    { key: "dashboard",      label: "Operations Dashboard",         icon: "fa-table-columns",      href: "./dashboard.html" },
    { section: "Students & Families" },
    { key: "students",       label: "Students",           icon: "fa-user-graduate",      href: "./students.html" },
    { key: "protected-records", label: "Protected Records", icon: "fa-user-shield", href: "./protected-records.html", restrict: ["superadmin","school_admin"] },
    { key: "admissions",      label: "Admissions",         icon: "fa-file-signature",     href: "./admissions.html" },
    { key: "families",       label: "Families",           icon: "fa-users",              href: "./families.html" },
    { key: "attendance",     label: "Attendance",         icon: "fa-clipboard-check",    href: "./attendance.html" },
    { key: "report-cards",   label: "Report Cards",       icon: "fa-file-lines",         href: "./report-cards.html" },
    { section: "Staff & Academics" },
    { key: "teachers",       label: "Teachers",           icon: "fa-chalkboard-teacher", href: "./teachers.html", restrict: ["school_admin","branch_admin","superadmin"] },
    { key: "classes",        label: "Classes",            icon: "fa-book-open",          href: "./classes.html" },
    { section: "Finance" },
    { key: "payments",       label: "Payments & Billing", icon: "fa-dollar-sign",        href: "./payments.html", restrict: ["school_admin","branch_admin","superadmin"] },
    { section: "School Life" },
    { key: "lunch",          label: "Lunch Menu",         icon: "fa-utensils",           href: "./lunch.html" },
    { key: "events",         label: "Events",             icon: "fa-calendar-days",      href: "./events.html" },
    { key: "forms",          label: "Forms",              icon: "fa-clipboard-list",     href: "./forms.html" },
    { key: "announcements",  label: "Announcements",      icon: "fa-bullhorn",           href: "./announcements.html" },
    { key: "communications", label: "Communications",     icon: "fa-envelope",           href: "./communications.html" },
    { key: "documents",      label: "Documents",          icon: "fa-folder",             href: "./documents.html" },
    { section: "Administration" },
    { key: "school-year",    label: "School Year",        icon: "fa-calendar",           href: "./school-year.html", restrict: ["school_admin","branch_admin","superadmin"] },
    { key: "audit-logs",     label: "Audit Logs",         icon: "fa-shield",             href: "./audit-logs.html",  restrict: ["school_admin","branch_admin","superadmin"] },
    { key: "settings",       label: "Settings",           icon: "fa-gear",               href: "./settings.html",    restrict: ["school_admin","branch_admin","superadmin"] }
  ];

  function init(pageKey) {
    if (!SMS_AUTH.requireAdminAuth()) return;
    document.getElementById("footer-year").textContent = new Date().getFullYear();
    buildSidebar(pageKey);
    buildTopbar(pageKey);
    setupMobileMenu();
  }

  function buildSidebar(activeKey) {
    var user    = SMS_AUTH.getCurrentUser();
    var role    = SMS_AUTH.getRole();
    var session = SMS_AUTH.getSession();
    var school  = session ? SMS_SCHOOLS.find(function(s) { return s.id === session.schoolId; }) : null;

    var html = '<div class="sidebar-brand">' +
      '<div class="sidebar-logo">' + (school ? school.logoText : "SMS") + '</div>' +
      '<div class="sidebar-brand-text"><div class="sidebar-brand-name">' + SMS_UI.esc(school ? school.name : "School") + '</div>' +
      '<div class="sidebar-brand-sub">Management System</div></div></div>';

    html += '<div class="sidebar-user">' + SMS_UI.avatarHtml(user ? user.displayName : "User") +
      '<div><div class="sidebar-user-name">' + SMS_UI.esc(user ? user.displayName : "") + '</div>' +
      '<div class="sidebar-user-role">' + SMS_AUTH.roleBadge(role) + '</div></div></div>';

    html += '<nav class="sidebar-nav">';
    ALL_NAV.forEach(function(item) {
      if (item.section) { html += '<div class="sidebar-section">' + item.section + '</div>'; return; }
      if (item.restrict && !item.restrict.includes(role)) return;
      var active = item.key === activeKey ? " active" : "";
      html += '<a class="sidebar-link' + active + '" href="' + item.href + '">' +
        '<i class="fa-solid ' + item.icon + '"></i>' + SMS_UI.esc(item.label) + '</a>';
    });
    html += '</nav>';
    html += '<div class="sidebar-footer"><a class="sidebar-link" href="../login/login.html" id="logout-link"><i class="fa-solid fa-arrow-right-from-bracket"></i>Sign Out</a></div>';

    document.getElementById("sidebar").innerHTML = html;
    document.getElementById("logout-link").addEventListener("click", function(e) {
      e.preventDefault();
      SMS_AUTH.logout().then(function() { window.location.href = "../login/login.html"; });
    });
  }

  function buildTopbar(activeKey) {
    var user    = SMS_AUTH.getCurrentUser();
    var role    = SMS_AUTH.getRole();
    var session = SMS_AUTH.getSession();

    // Branch switcher for school-level admins with multiple branches
    var branchHtml = "";
    if (SMS_AUTH.hasAllBranchAccess() && session && session.schoolId) {
      var branches = SMS_BRANCHES.filter(function(b) { return b.schoolId === session.schoolId; });
      if (branches.length > 1) {
        branchHtml = '<select class="topbar-branch-select" id="branch-switcher">';
        branches.forEach(function(b) {
          var sel = (session.selectedBranchId === b.id || session.branchId === b.id) ? " selected" : "";
          branchHtml += '<option value="' + b.id + '"' + sel + '>' + SMS_UI.esc(b.name) + '</option>';
        });
        branchHtml += '</select>';
      } else if (branches.length === 1) {
        branchHtml = '<span style="font-size:.8125rem;font-weight:600;color:var(--text-secondary)">' + SMS_UI.esc(branches[0].name) + '</span>';
      }
    } else if (session && session.selectedBranchId) {
      var br = SMS_BRANCHES.find(function(b) { return b.id === session.selectedBranchId; });
      if (br) branchHtml = '<span style="font-size:.8125rem;font-weight:600;color:var(--text-secondary)"><i class="fa-solid fa-location-dot" style="margin-right:4px"></i>' + SMS_UI.esc(br.name) + '</span>';
    }

    document.getElementById("topbar").innerHTML =
      '<div class="topbar-left"><button class="menu-toggle" id="menu-toggle"><i class="fa-solid fa-bars"></i></button></div>' +
      '<div class="topbar-right">' + branchHtml +
      '<span class="role-chip">' + SMS_AUTH.roleBadge(role) + '</span>' +
      '<div class="dropdown" id="user-dd"><div class="topbar-user-btn" id="user-dd-btn">' +
      SMS_UI.avatarHtml(user ? user.displayName : "User") +
      '<span class="topbar-user-name" style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + SMS_UI.esc(user ? user.displayName : "") + '</span>' +
      '<i class="fa-solid fa-chevron-down" style="font-size:.65rem;color:var(--text-muted)"></i></div>' +
      '<div class="dropdown-menu" id="user-dd-menu">' +
      '<div class="dropdown-label">Account</div><div class="dropdown-sep"></div>' +
      '<div class="dropdown-item" id="signout-dd"><i class="fa-solid fa-arrow-right-from-bracket"></i>Sign Out</div>' +
      '</div></div></div>';

    var bs = document.getElementById("branch-switcher");
    if (bs) bs.addEventListener("change", function() { SMS_AUTH.setSelectedBranch(bs.value); window.location.reload(); });

    var ddBtn  = document.getElementById("user-dd-btn");
    var ddMenu = document.getElementById("user-dd-menu");
    ddBtn.addEventListener("click", function(e) { e.stopPropagation(); ddMenu.classList.toggle("open"); });
    document.addEventListener("click", function() { ddMenu.classList.remove("open"); });
    document.getElementById("signout-dd").addEventListener("click", function() {
      SMS_AUTH.logout().then(function() { window.location.href = "../login/login.html"; });
    });
  }

  function setupMobileMenu() {
    var toggle  = document.getElementById("menu-toggle");
    var sidebar = document.getElementById("sidebar");
    var overlay = document.getElementById("sidebar-overlay");
    if (!toggle) return;
    toggle.addEventListener("click", function() { sidebar.classList.toggle("open"); if (overlay) overlay.classList.toggle("show"); });
    if (overlay) overlay.addEventListener("click", function() { sidebar.classList.remove("open"); overlay.classList.remove("show"); });
  }

  return { init: init };
})();
