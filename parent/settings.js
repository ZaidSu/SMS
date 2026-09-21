SMS_PARENT_LAYOUT.init("settings");
(function() {
  var user = SMS_AUTH.getCurrentUser();
  var parent = SMS_PARENT_LAYOUT.getMyParent();
  var children = SMS_PARENT_LAYOUT.getMyChildren();
  document.getElementById("page-content").innerHTML =
    SMS_UI.pageHeader({title:"Settings",subtitle:"Your account and preferences",breadcrumb:["Parent Portal","Settings"]})+
    '<div style="display:flex;flex-direction:column;gap:20px">'+
    '<div class="card"><div class="card-header"><div class="card-title">My Profile</div></div><div class="card-body">'+
    '<div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">'+SMS_UI.avatarHtml(user.displayName,"xl")+'<div><div class="fw-700" style="font-size:1.1rem">'+SMS_UI.esc(user.displayName)+'</div><div class="text-secondary fs-sm">'+SMS_UI.esc(user.email)+'</div><div class="text-muted fs-xs">'+SMS_UI.esc(parent?parent.relationship:"Parent")+'</div></div></div>'+
    '<div class="form-grid"><div class="form-group"><label class="form-label">Full Name</label><input class="input" value="'+SMS_UI.esc(user.displayName)+'" disabled style="opacity:.7"></div><div class="form-group"><label class="form-label">Email</label><input class="input" value="'+SMS_UI.esc(user.email)+'" disabled style="opacity:.7"></div></div>'+
    (parent?'<div class="form-grid"><div class="form-group"><label class="form-label">Phone</label><input class="input" value="'+SMS_UI.esc(parent.phone||"")+'" disabled style="opacity:.7"></div><div class="form-group"><label class="form-label">Relationship</label><input class="input" value="'+SMS_UI.esc(parent.relationship||"")+'" disabled style="opacity:.7"></div></div>':'')+
    '<div class="alert alert-info"><i class="fa-solid fa-circle-info"></i><span>Contact the school office to update your contact information.</span></div>'+
    '</div></div>'+
    '<div class="card"><div class="card-header"><div class="card-title">My Children</div></div><div class="card-body" style="display:flex;flex-direction:column;gap:8px">'+
    children.map(function(c){return '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:var(--gray-50);border-radius:10px">'+SMS_UI.avatarHtml(c.fullName)+'<div style="flex:1;margin-left:12px"><div class="fw-600">'+SMS_UI.esc(c.fullName)+'</div><div class="fs-xs text-secondary">'+SMS_UI.esc(c.grade)+'</div></div>'+SMS_UI.statusBadge(c.status)+'</div>';}).join("")||'<p class="text-secondary">No children linked.</p>'+
    '</div></div>'+
    '<div class="card"><div class="card-header"><div class="card-title">Notifications</div></div><div class="card-body">'+
    '<div class="switch-row"><div><div class="switch-label">Email when grades are posted</div></div><label class="switch"><input type="checkbox" checked><span class="switch-slider"></span></label></div>'+
    '<div class="switch-row"><div><div class="switch-label">Attendance notifications</div><div class="switch-sub">Notify me if my child is marked absent or tardy</div></div><label class="switch"><input type="checkbox" checked><span class="switch-slider"></span></label></div>'+
    '<div class="switch-row"><div><div class="switch-label">Payment reminders</div></div><label class="switch"><input type="checkbox" checked><span class="switch-slider"></span></label></div>'+
    '</div></div>'+
    '<div class="card"><div class="card-body"><div style="display:flex;justify-content:space-between"><div><div class="fw-600">Sign Out</div></div><button class="btn btn-secondary" id="signout-btn"><i class="fa-solid fa-arrow-right-from-bracket"></i>Sign Out</button></div></div></div>'+
    '</div>';
  document.getElementById("signout-btn").addEventListener("click", function(){
    SMS_AUTH.logout().then(function(){ window.location.href = "../login/login.html"; });
  });
})();
