var SMS_PARENT_LAYOUT = (function() {
  var NAV = [
    { section: "My Children" },
    { key: "home",      label: "My Child",         icon: "fa-child",          href: "./home.html" },
    { key: "news",      label: "News",             icon: "fa-newspaper",      href: "./news.html" },
    { key: "calendar",  label: "Calendar",         icon: "fa-calendar-days",  href: "./calendar.html" },
    { key: "classes",   label: "Classes",          icon: "fa-book-open",      href: "./classes.html" },
    { key: "grades",    label: "Grades",           icon: "fa-file-lines",     href: "./grades.html" },
    { key: "attendance",label: "Attendance",       icon: "fa-clipboard-check",href: "./attendance.html" },
    { section: "School" },
    { key: "school-home",label: "School Home",      icon: "fa-school",         href: "./school-home.html" },
    { key: "cafeteria", label: "Cafeteria",        icon: "fa-utensils",       href: "./cafeteria.html" },
    { key: "forms",     label: "Forms",            icon: "fa-clipboard-list", href: "./forms.html" },
    { key: "events",    label: "Events",           icon: "fa-calendar-check", href: "./events.html" },
    { key: "expenses",  label: "Expenses",         icon: "fa-dollar-sign",    href: "./expenses.html" },
    { key: "documents", label: "Documents",        icon: "fa-folder",         href: "./documents.html" },
    { key: "photos",    label: "Photos",           icon: "fa-images",         href: "./photos.html" },
    { key: "messages",  label: "Messages",         icon: "fa-envelope",       href: "./messages.html" },
    { section: "Account" },
    { key: "settings",  label: "Settings",         icon: "fa-gear",           href: "./settings.html" }
  ];

  function init(pageKey) {
    if (!SMS_AUTH.requireParentAuth()) return;
    document.getElementById("footer-year").textContent = new Date().getFullYear();
    buildSidebar(pageKey);
    buildTopbar();
    setupMobile();
  }

  function getMyParent() {
    var user = SMS_AUTH.getCurrentUser();
    return user && user.parentId ? SMS_PARENTS.find(function(p){return p.id===user.parentId;}) : null;
  }
  function getMyChildren() {
    var parent = getMyParent();
    if (!parent) return [];
    return SMS_STUDENTS.filter(function(s){return (parent.childrenIds||[]).includes(s.id);});
  }
  function getSelectedChild() {
    var childId = SMS_AUTH.getSelectedChildId();
    var children = getMyChildren();
    if (!childId || !children.length) return children[0]||null;
    return children.find(function(c){return c.id===childId;}) || children[0] || null;
  }

  function buildSidebar(activeKey) {
    var user = SMS_AUTH.getCurrentUser();
    var session = SMS_AUTH.getSession();
    var school = session ? SMS_SCHOOLS.find(function(s){return s.id===session.schoolId;}) : null;
    var children = getMyChildren();
    var selectedChild = getSelectedChild();

    var html = '<div class="sidebar-brand"><div class="sidebar-logo">'+(school?school.logoText:"SMS")+'</div><div class="sidebar-brand-text"><div class="sidebar-brand-name">'+SMS_UI.esc(school?school.name:"School")+'</div><div class="sidebar-brand-sub">Parent Portal</div></div></div>';
    html += '<div class="sidebar-user">'+SMS_UI.avatarHtml(user?user.displayName:"Parent")+'<div><div class="sidebar-user-name">'+SMS_UI.esc(user?user.displayName:"")+'</div><div class="sidebar-user-role">Parent</div></div></div>';

    // Child switcher
    if (children.length > 1) {
      html += '<div style="padding:8px 10px"><select class="input" id="child-switcher" style="font-size:.8125rem;font-weight:600">';
      children.forEach(function(c){
        html += '<option value="'+c.id+'"'+(c.id===(selectedChild&&selectedChild.id)?' selected':'')+'>'+SMS_UI.esc(c.firstName||c.fullName)+' ('+SMS_UI.esc(c.grade)+')</option>';
      });
      html += '</select></div>';
    } else if (selectedChild) {
      html += '<div style="padding:8px 14px 0"><div style="padding:8px 10px;background:rgba(255,255,255,.06);border-radius:8px"><div class="fs-xs" style="color:var(--sidebar-text-muted)">Viewing</div><div style="font-weight:700;color:#fff;font-size:.875rem">'+SMS_UI.esc(selectedChild.fullName)+'</div><div style="font-size:.7rem;color:var(--sidebar-text-muted)">'+SMS_UI.esc(selectedChild.grade)+'</div></div></div>';
    }

    html += '<nav class="sidebar-nav">';
    NAV.forEach(function(item) {
      if (item.section) { html += '<div class="sidebar-section">'+item.section+'</div>'; return; }
      html += '<a class="sidebar-link'+(item.key===activeKey?' active':'')+'" href="'+item.href+'"><i class="fa-solid '+item.icon+'"></i>'+SMS_UI.esc(item.label)+'</a>';
    });
    html += '</nav><div class="sidebar-footer"><a class="sidebar-link" href="../login/login.html" id="logout-link"><i class="fa-solid fa-arrow-right-from-bracket"></i>Sign Out</a></div>';

    document.getElementById("sidebar").innerHTML = html;
    document.getElementById("logout-link").addEventListener("click",function(e){e.preventDefault();SMS_AUTH.logout().then(function(){window.location.href="../login/login.html";});});
    var sw = document.getElementById("child-switcher");
    if (sw) { sw.addEventListener("change",function(){SMS_AUTH.setSelectedChild(sw.value);window.location.reload();}); }
  }

  function buildTopbar() {
    var user = SMS_AUTH.getCurrentUser();
    var child = getSelectedChild();
    document.getElementById("topbar").innerHTML = '<div class="topbar-left"><button class="menu-toggle" id="menu-toggle"><i class="fa-solid fa-bars"></i></button>'+(child?'<span style="font-size:.8125rem;font-weight:600;color:var(--text-secondary)"><i class="fa-solid fa-child" style="margin-right:4px"></i>'+SMS_UI.esc(child.fullName)+'</span>':'')+'</div>'+
      '<div class="topbar-right"><span class="role-chip">Parent</span><div style="display:flex;align-items:center;gap:8px;padding:6px 10px">'+SMS_UI.avatarHtml(user?user.displayName:"Parent")+'<span class="topbar-user-name">'+SMS_UI.esc(user?user.displayName:"")+'</span></div>'+
      '<button class="btn btn-sm btn-ghost" id="topbar-logout"><i class="fa-solid fa-arrow-right-from-bracket"></i></button></div>';
    document.getElementById("topbar-logout").addEventListener("click",function(){SMS_AUTH.logout().then(function(){window.location.href="../login/login.html";});});
    var toggle = document.getElementById("menu-toggle");
    var sidebar = document.getElementById("sidebar");
    var overlay = document.getElementById("sidebar-overlay");
    if (toggle) { toggle.addEventListener("click",function(){sidebar.classList.toggle("open");if(overlay)overlay.classList.toggle("show");}); }
    if (overlay) { overlay.addEventListener("click",function(){sidebar.classList.remove("open");overlay.classList.remove("show");}); }
  }

  function setupMobile() {} // handled in buildTopbar

  return { init: init, getMyParent: getMyParent, getMyChildren: getMyChildren, getSelectedChild: getSelectedChild };
})();
