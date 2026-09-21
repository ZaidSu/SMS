// ================================
// Super Admin Shared Layout
// Builds the sidebar once for every Super Admin page.
// This prevents manually fixing ../ links on every page.
// ================================

const superAdminNavItems = [
  {
    section: "Platform",
    links: [
      {
        label: "Dashboard",
        icon: "fa-solid fa-chart-line",
        path: "dashboard.html",
        page: "dashboard"
      },
      {
        label: "Organizations",
        icon: "fa-solid fa-building",
        path: "organizations/organization.html",
        page: "organizations"
      },
      {
        label: "Branches",
        icon: "fa-solid fa-code-branch",
        path: "branch/branch-ids.html",
        page: "branches"
      },
      {
        label: "Global Users",
        icon: "fa-solid fa-users",
        path: "global-users/global-users.html",
        page: "global-users"
      }
    ]
  },
  {
    section: "School Data",
    links: [
      {
        label: "Students",
        icon: "fa-solid fa-user-graduate",
        path: "students/students.html",
        page: "students"
      },
      {
        label: "Staff",
        icon: "fa-solid fa-chalkboard-user",
        path: "staff/staff.html",
        page: "staff"
      },
      {
        label: "Role Templates",
        icon: "fa-solid fa-key",
        path: "role-templates/role-templates.html",
        page: "role-templates"
      }
    ]
  },
  {
    section: "Management",
    links: [
      {
        label: "Announcements",
        icon: "fa-solid fa-bullhorn",
        path: "announcements/announcements.html",
        page: "announcements"
      },
      {
        label: "Billing",
        icon: "fa-solid fa-credit-card",
        path: "billing/billing.html",
        page: "billing"
      },
      {
        label: "Security",
        icon: "fa-solid fa-shield-halved",
        path: "security/security.html",
        page: "security"
      },
      {
        label: "Audit Logs",
        icon: "fa-solid fa-clock-rotate-left",
        path: "audit-logs/audit-logs.html",
        page: "audit-logs"
      },
      {
        label: "Sessions",
        icon: "fa-solid fa-laptop",
        path: "sessions/sessions.html",
        page: "sessions"
      }
    ]
  },
  {
    section: "System",
    links: [
      {
        label: "Data & Compliance",
        icon: "fa-solid fa-database",
        path: "data-compliance/data-compliance.html",
        page: "data-compliance"
      },
      {
        label: "Integrations",
        icon: "fa-solid fa-plug",
        path: "integrations/integrations.html",
        page: "integrations"
      },
      {
        label: "Theme Settings",
        icon: "fa-solid fa-palette",
        path: "theme/theme.html",
        page: "theme"
      },
      {
        label: "Settings",
        icon: "fa-solid fa-gear",
        path: "settings/settings.html",
        page: "settings"
      }
    ]
  }
];

// Gets the right base path based on where this shared script is loaded from.
// dashboard.html uses: shared/superadmin-layout.js => base path ""
// role-templates.html uses: ../shared/superadmin-layout.js => base path "../"
function getSuperAdminBasePath() {
  const script = document.querySelector('script[src$="superadmin-layout.js"]');

  if (!script) {
    return "";
  }

  const scriptSrc = script.getAttribute("src");

  return scriptSrc.replace("shared/superadmin-layout.js", "");
}

function buildSuperAdminSidebar() {
  var savedAccent = localStorage.getItem("smsSuperAccent");
  const sidebar = document.getElementById("sidebar");

  if (!sidebar) {
    return;
  }

  const currentPage = document.body.dataset.page;
  const basePath = getSuperAdminBasePath();

  let navHTML = "";

  superAdminNavItems.forEach((group) => {
    navHTML += `<p class="nav-section-title">${group.section}</p>`;

    group.links.forEach((link) => {
      const activeClass = currentPage === link.page ? "active" : "";
      const badgeHTML = link.badge
        ? `<span class="coming-badge">${link.badge}</span>`
        : "";

      navHTML += `
        <a href="${basePath}${link.path}" class="nav-link ${activeClass}">
          <i class="${link.icon}"></i>
          <span>${link.label}</span>
          ${badgeHTML}
        </a>
      `;
    });
  });

  if (savedAccent) sidebar.style.background = "linear-gradient(180deg," + savedAccent + " 0%," + savedAccent + "dd 100%)";

  sidebar.innerHTML = `
    <div class="sidebar-top">
      <a href="${basePath}../index.html" class="brand">
        <div class="brand-box">
          <i class="fa-solid fa-layer-group"></i>
        </div>
        <span class="brand-copy"><span class="brand-name">School Management</span><span class="brand-sub">Super Admin Console</span></span>
      </a>
    </div>

    <nav class="sidebar-nav">
      ${navHTML}
    </nav>

    <div class="sidebar-bottom">
      <a href="${basePath}../login/login.html" class="logout-link">
        <i class="fa-solid fa-right-from-bracket"></i>
        <span>Logout</span>
      </a>
    </div>
  `;
}

function setupSuperAdminSidebarToggle() {
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");

  if (!menuBtn || !sidebar || !sidebarOverlay) {
    return;
  }

  function openSidebar() {
    sidebar.classList.add("show");
    sidebarOverlay.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function closeSidebar() {
    sidebar.classList.remove("show");
    sidebarOverlay.classList.remove("show");
    document.body.style.overflow = "";
  }

  menuBtn.addEventListener("click", () => {
    if (sidebar.classList.contains("show")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  sidebarOverlay.addEventListener("click", closeSidebar);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && sidebar.classList.contains("show")) {
      closeSidebar();
    }
  });

  sidebar.addEventListener("click", (event) => {
    const clickedLink = event.target.closest(".nav-link, .logout-link");

    if (clickedLink && window.innerWidth <= 900) {
      closeSidebar();
    }
  });
}

// ================================
// Preserve Sidebar Scroll Position
// ================================

const sidebar = document.querySelector("#sidebar");

if (sidebar) {
  const savedSidebarScroll = sessionStorage.getItem("smsSidebarScrollTop");

  if (savedSidebarScroll !== null) {
    sidebar.scrollTop = Number(savedSidebarScroll);
  }

  sidebar.addEventListener("scroll", () => {
    sessionStorage.setItem("smsSidebarScrollTop", sidebar.scrollTop);
  });

  const sidebarLinks = sidebar.querySelectorAll("a");

  sidebarLinks.forEach((link) => {
    link.addEventListener("click", () => {
      sessionStorage.setItem("smsSidebarScrollTop", sidebar.scrollTop);
    });
  });
}

buildSuperAdminSidebar();
setupSuperAdminSidebarToggle();