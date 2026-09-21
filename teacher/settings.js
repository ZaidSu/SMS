if (SMS_TEACHER_LAYOUT.init("settings")) {
(function() {
  var user = SMS_AUTH.getCurrentUser();
  var teacher = SMS_TEACHER_LAYOUT.getMyTeacher();
  document.getElementById("page-content").innerHTML =
    SMS_UI.pageHeader({title:"Settings",subtitle:"Your account and preferences",breadcrumb:["Teacher","Settings"]})+
    '<div style="display:flex;flex-direction:column;gap:20px">'+
    '<div class="card"><div class="card-header"><div class="card-title">Profile</div></div><div class="card-body">'+
    '<div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">'+SMS_UI.avatarHtml(user.displayName,"xl")+'<div><div class="fw-700" style="font-size:1.1rem">'+SMS_UI.esc(user.displayName)+'</div><div class="text-secondary fs-sm">'+SMS_UI.esc(user.email)+'</div></div></div>'+
    '<div class="form-grid"><div class="form-group"><label class="form-label">Display Name</label><input class="input" value="'+SMS_UI.esc(user.displayName)+'" disabled style="opacity:.7"></div><div class="form-group"><label class="form-label">Email</label><input class="input" value="'+SMS_UI.esc(user.email)+'" disabled style="opacity:.7"></div></div>'+
    (teacher ? '<div class="form-grid"><div class="form-group"><label class="form-label">Department</label><input class="input" value="'+SMS_UI.esc(teacher.department||"")+'" disabled style="opacity:.7"></div><div class="form-group"><label class="form-label">Subjects</label><input class="input" value="'+SMS_UI.esc((teacher.subjects||[]).join(", "))+'" disabled style="opacity:.7"></div></div>' : '')+
    '<div class="alert alert-info"><i class="fa-solid fa-circle-info"></i><span>Contact your administrator to update your profile information.</span></div>'+
    '</div></div>'+
    '<div class="card"><div class="card-header"><div class="card-title">Notifications</div></div><div class="card-body">'+
    '<div class="switch-row"><div><div class="switch-label">Email when parent sends a message</div></div><label class="switch"><input type="checkbox" checked><span class="switch-slider"></span></label></div>'+
    '<div class="switch-row"><div><div class="switch-label">Remind me to mark attendance</div><div class="switch-sub">Daily reminder at 8:30 AM</div></div><label class="switch"><input type="checkbox" checked><span class="switch-slider"></span></label></div>'+
    '</div></div>'+
    '<div class="card"><div class="card-body"><div style="display:flex;justify-content:space-between"><div><div class="fw-600">Sign Out</div><div class="fs-sm text-secondary">Sign out from all devices</div></div><button class="btn btn-secondary" id="signout-btn"><i class="fa-solid fa-arrow-right-from-bracket"></i>Sign Out</button></div></div></div>'+
    '</div>';
  document.getElementById("signout-btn").addEventListener("click", function(){
    SMS_AUTH.logout().then(function(){ window.location.href = "../login/login.html"; });
  });
})();
}
