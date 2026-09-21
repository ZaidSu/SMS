var SMS_STUDENT_LAYOUT = (function(){
  "use strict";
  var NAV=[
    {section:"My School"},
    {key:"school-home",label:"School Home",icon:"fa-school",href:"./school-home.html"},
    {key:"dashboard",label:"Dashboard",icon:"fa-house",href:"./dashboard.html"},
    {key:"classes",label:"My Classes",icon:"fa-book-open",href:"./classes.html"},
    {key:"assignments",label:"Assignments",icon:"fa-list-check",href:"./assignments.html"},
    {key:"grades",label:"Grades",icon:"fa-file-lines",href:"./grades.html"},
    {key:"attendance",label:"Attendance",icon:"fa-clipboard-check",href:"./attendance.html"},
    {key:"calendar",label:"Calendar",icon:"fa-calendar-days",href:"./calendar.html"},
    {section:"Communication"},
    {key:"news",label:"News",icon:"fa-newspaper",href:"./news.html"},
    {key:"documents",label:"Documents",icon:"fa-folder",href:"./documents.html"},
    {key:"messages",label:"Messages",icon:"fa-envelope",href:"./messages.html"}
  ];
  function getStudent(){var u=SMS_AUTH.getCurrentUser();return u&&u.studentId?SMS_STUDENTS.find(function(s){return s.id===u.studentId;})||null:null;}
  function getSelectedChild(){return getStudent();}
  function init(pageKey){if(!SMS_AUTH.requireStudentAuth())return;document.getElementById('footer-year').textContent=new Date().getFullYear();buildSidebar(pageKey);buildTopbar();}
  function buildSidebar(active){var user=SMS_AUTH.getCurrentUser(),s=SMS_AUTH.getSession(),school=s?SMS_SCHOOLS.find(function(x){return x.id===s.schoolId;}):null,student=getStudent();var html='<div class="sidebar-brand"><div class="sidebar-logo">'+(school?school.logoText:'SMS')+'</div><div class="sidebar-brand-text"><div class="sidebar-brand-name">'+SMS_UI.esc(school?school.name:'School')+'</div><div class="sidebar-brand-sub">Student Portal</div></div></div>';
    html+='<div class="sidebar-user">'+SMS_UI.avatarHtml(student?student.fullName:(user?user.displayName:'Student'))+'<div><div class="sidebar-user-name">'+SMS_UI.esc(student?student.fullName:(user?user.displayName:''))+'</div><div class="sidebar-user-role">'+SMS_UI.esc(student?student.grade:'Student')+'</div></div></div>';
    html+='<nav class="sidebar-nav">';NAV.forEach(function(i){if(i.section){html+='<div class="sidebar-section">'+i.section+'</div>';return;}html+='<a class="sidebar-link'+(i.key===active?' active':'')+'" href="'+i.href+'"><i class="fa-solid '+i.icon+'"></i>'+SMS_UI.esc(i.label)+'</a>';});html+='</nav><div class="sidebar-footer"><a class="sidebar-link" href="../login/login.html" id="logout-link"><i class="fa-solid fa-arrow-right-from-bracket"></i>Sign Out</a></div>';document.getElementById('sidebar').innerHTML=html;document.getElementById('logout-link').addEventListener('click',function(e){e.preventDefault();SMS_AUTH.logout().then(function(){location.href='../login/login.html';});});}
  function buildTopbar(){var user=SMS_AUTH.getCurrentUser(),student=getStudent();document.getElementById('topbar').innerHTML='<div class="topbar-left"><button class="menu-toggle" id="menu-toggle"><i class="fa-solid fa-bars"></i></button><span style="font-size:.8125rem;font-weight:600;color:var(--text-secondary)"><i class="fa-solid fa-user-graduate" style="margin-right:5px"></i>'+SMS_UI.esc(student?student.fullName:'Student')+'</span></div><div class="topbar-right"><span class="role-chip">Student</span>'+SMS_UI.avatarHtml(user?user.displayName:'Student')+'<button class="btn btn-sm btn-ghost" id="topbar-logout"><i class="fa-solid fa-arrow-right-from-bracket"></i></button></div>';document.getElementById('topbar-logout').addEventListener('click',function(){SMS_AUTH.logout().then(function(){location.href='../login/login.html';});});var t=document.getElementById('menu-toggle'),sb=document.getElementById('sidebar'),ov=document.getElementById('sidebar-overlay');if(t)t.addEventListener('click',function(){sb.classList.toggle('open');if(ov)ov.classList.toggle('show');});if(ov)ov.addEventListener('click',function(){sb.classList.remove('open');ov.classList.remove('show');});}
  return {init:init,getStudent:getStudent,getSelectedChild:getSelectedChild};
})();
