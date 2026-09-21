var SMS_TEACHER_LAYOUT = (function() {
  var NAV = [
    { section: "Overview" },
    { key: "school-home",   permission:"dashboard.view",     label: "School Home",    icon: "fa-school",           href: "./school-home.html" },
    { key: "dashboard",     permission:"dashboard.view",     label: "Dashboard",     icon: "fa-table-columns",   href: "./dashboard.html" },
    { section: "My Classes" },
    { key: "classes",       permission:"classes.view",       label: "My Classes",    icon: "fa-book-open",       href: "./classes.html" },
    { key: "students",      permission:"students.view",      label: "My Students",   icon: "fa-user-graduate",   href: "./students.html" },
    { key: "attendance",    permission:"attendance.view",    label: "Attendance",    icon: "fa-clipboard-check", href: "./attendance.html" },
    { key: "gradebook",     permission:"grades.view",        label: "Gradebook",     icon: "fa-file-pen",        href: "./gradebook.html" },
    { key: "assignments",   permission:"assignments.view",   label: "Assignments",   icon: "fa-tasks",           href: "./assignments.html" },
    { key: "report-cards",  permission:"report_cards.view",  label: "Report Cards",  icon: "fa-file-lines",      href: "./report-cards.html" },
    { section: "School" },
    { key: "announcements", permission:"announcements.view", label: "Announcements", icon: "fa-bullhorn",        href: "./announcements.html" },
    { key: "schedule",      permission:"schedule.view",      label: "My Schedule",   icon: "fa-calendar",        href: "./schedule.html" },
    { key: "messages",      permission:"messages.view",      label: "Messages",      icon: "fa-envelope",        href: "./messages.html" },
    { key: "documents",     permission:"documents.view",     label: "Documents",     icon: "fa-folder",          href: "./documents.html" },
    { section: "Account" },
    { key: "settings",      permission:"settings.view",      label: "Settings",      icon: "fa-gear",            href: "./settings.html" }
  ];

  function permissionForPage(pageKey) {
    var item = NAV.find(function(n){ return n.key === pageKey; });
    return item ? item.permission : null;
  }

  function init(pageKey) {
    if (!SMS_AUTH.requireTeacherAuth()) return false;
    document.getElementById("footer-year").textContent = new Date().getFullYear();
    buildSidebar(pageKey);
    buildTopbar();
    setupMobile();

    var permission = permissionForPage(pageKey);
    if (permission && permission !== "settings.view" && !SMS_AUTH.hasTeacherPermission(permission)) {
      renderRestricted(pageKey);
      return false;
    }
    return true;
  }

  function renderRestricted(pageKey) {
    var content = document.getElementById("page-content");
    if (!content) return;
    content.innerHTML =
      '<div style="max-width:720px;margin:70px auto">'+
      '<div class="card"><div class="card-body" style="text-align:center;padding:48px 28px">'+
      '<div style="width:64px;height:64px;border-radius:18px;background:var(--gray-100);display:flex;align-items:center;justify-content:center;margin:0 auto 18px;font-size:1.5rem;color:var(--text-secondary)"><i class="fa-solid fa-lock"></i></div>'+
      '<h2 style="margin:0 0 8px">Access Restricted</h2>'+
      '<p class="text-secondary" style="max-width:520px;margin:0 auto 20px">Your principal has not enabled access to this area for your teacher account. If you believe you need it for your role, contact school administration.</p>'+
      '<a class="btn btn-primary" href="./dashboard.html"><i class="fa-solid fa-arrow-left"></i>Back to Dashboard</a>'+
      '</div></div></div>';
  }

  function getMyTeacher() {
    return SMS_AUTH.getCurrentTeacherRecord();
  }
  function getMyClasses() {
    var teacher = getMyTeacher();
    if (!teacher) return [];
    return SMS_CLASSES.filter(function(c){return c.teacherId===teacher.id;});
  }

  function buildSidebar(activeKey) {
    var user = SMS_AUTH.getCurrentUser();
    var session = SMS_AUTH.getSession();
    var school = session ? SMS_SCHOOLS.find(function(s){return s.id===session.schoolId;}) : null;
    var branch = session && session.selectedBranchId ? SMS_BRANCHES.find(function(b){return b.id===session.selectedBranchId;}) : null;

    var html = '<div class="sidebar-brand"><div class="sidebar-logo">' + (school?school.logoText:"SMS") + '</div><div class="sidebar-brand-text"><div class="sidebar-brand-name">' + SMS_UI.esc(school?school.name:"School") + '</div><div class="sidebar-brand-sub">' + SMS_UI.esc(branch?branch.name:"Teacher Portal") + '</div></div></div>';
    html += '<div class="sidebar-user">' + SMS_UI.avatarHtml(user?user.displayName:"Teacher") + '<div><div class="sidebar-user-name">' + SMS_UI.esc(user?user.displayName:"") + '</div><div class="sidebar-user-role">Teacher</div></div></div>';
    html += '<nav class="sidebar-nav">';
    var lastWasSection = false;
    NAV.forEach(function(item) {
      if (item.section) {
        html += '<div class="sidebar-section">'+item.section+'</div>';
        lastWasSection = true;
        return;
      }
      var allowed = item.permission === "settings.view" || SMS_AUTH.hasTeacherPermission(item.permission);
      if (!allowed) return;
      html += '<a class="sidebar-link'+(item.key===activeKey?' active':'')+'" href="'+item.href+'"><i class="fa-solid '+item.icon+'"></i>'+SMS_UI.esc(item.label)+'</a>';
      lastWasSection = false;
    });
    html += '</nav><div class="sidebar-footer"><a class="sidebar-link" href="../login/login.html" id="logout-link"><i class="fa-solid fa-arrow-right-from-bracket"></i>Sign Out</a></div>';
    document.getElementById("sidebar").innerHTML = html;
    document.getElementById("logout-link").addEventListener("click",function(e){e.preventDefault();SMS_AUTH.logout().then(function(){window.location.href="../login/login.html";});});
  }

  function buildTopbar() {
    var user = SMS_AUTH.getCurrentUser();
    var teacher = getMyTeacher();
    var topbar = document.getElementById("topbar");
    topbar.innerHTML = '<div class="topbar-left"><button class="menu-toggle" id="menu-toggle"><i class="fa-solid fa-bars"></i></button></div>'+ 
      '<div class="topbar-right"><span class="role-chip">Teacher</span>'+ 
      (teacher && teacher.permissionPreset ? '<span class="badge badge-outline" title="Permission profile">'+SMS_UI.esc((SMS_TEACHER_PERMISSION_PRESETS[teacher.permissionPreset]||{}).name||"Custom")+'</span>' : '')+
      '<div class="topbar-user-btn" id="user-btn">'+SMS_UI.avatarHtml(user?user.displayName:"Teacher")+'<span class="topbar-user-name">'+SMS_UI.esc(user?user.displayName:"")+'</span></div>'+ 
      '<button class="btn btn-sm btn-ghost" id="topbar-logout"><i class="fa-solid fa-arrow-right-from-bracket"></i></button></div>';
    document.getElementById("topbar-logout").addEventListener("click",function(){SMS_AUTH.logout().then(function(){window.location.href="../login/login.html";});});
  }

  function setupMobile() {
    var toggle = document.getElementById("menu-toggle");
    var sidebar = document.getElementById("sidebar");
    var overlay = document.getElementById("sidebar-overlay");
    if (!toggle) return;
    toggle.addEventListener("click",function(){sidebar.classList.toggle("open");if(overlay)overlay.classList.toggle("show");});
    if (overlay) overlay.addEventListener("click",function(){sidebar.classList.remove("open");overlay.classList.remove("show");});
  }

  return { init: init, getMyTeacher: getMyTeacher, getMyClasses: getMyClasses, permissionForPage:permissionForPage };
})();
