SMS_ADMIN_LAYOUT.init("settings");
(function() {
  "use strict";
  var session = SMS_AUTH.getSession();
  var branchId = SMS_AUTH.getBranchId();
  var branch = SMS_BRANCHES.find(function(b){ return b.id === branchId; }) || {};
  var school = SMS_SCHOOLS.find(function(s){ return s.id === session.schoolId; }) || {};
  var prefKey = "smsBranchPreferences:" + (branchId || session.schoolId || "default");
  var defaults = { attendanceEmails: true, paymentReminders: true, gradeNotifications: false };
  var prefs = defaults;
  try { prefs = Object.assign({}, defaults, JSON.parse(localStorage.getItem(prefKey) || "{}")); } catch(e) {}

  document.getElementById("page-content").innerHTML =
    SMS_UI.pageHeader({title:"Settings",subtitle:"Branch configuration and preferences",breadcrumb:["Administration","Settings"]})+
    '<div style="display:flex;flex-direction:column;gap:20px">'+
    '<div class="card"><div class="card-header"><div class="card-title">Branch Information</div></div><div class="card-body">'+
    '<div class="form-grid"><div class="form-group"><label class="form-label">Branch Name</label><input class="input" id="br-name" value="'+SMS_UI.esc(branch.name||"")+'"></div><div class="form-group"><label class="form-label">School</label><input class="input" value="'+SMS_UI.esc(school.name||"")+'" disabled style="opacity:.6"></div></div>'+
    '<div class="form-group"><label class="form-label">Address</label><input class="input" id="br-address" value="'+SMS_UI.esc(branch.address||"")+'"></div>'+
    '<div class="form-grid"><div class="form-group"><label class="form-label">Phone</label><input class="input" id="br-phone" value="'+SMS_UI.esc(branch.phone||"")+'"></div><div class="form-group"><label class="form-label">Email</label><input class="input" type="email" id="br-email" value="'+SMS_UI.esc(branch.email||"")+'"></div></div>'+
    '<div class="form-group"><label class="form-label">Principal Name</label><input class="input" id="br-principal" value="'+SMS_UI.esc(branch.principalName||"")+'"></div>'+
    '<div style="display:flex;justify-content:flex-end;margin-top:8px"><button class="btn btn-primary" id="save-branch-btn"><i class="fa-solid fa-floppy-disk"></i>Save Changes</button></div>'+
    '</div></div>'+
    '<div class="card"><div class="card-header"><div><div class="card-title">Notification Preferences</div><div class="text-secondary" style="font-size:.78rem;margin-top:3px">Preferences persist in this browser now. Supabase + email/SMS delivery will use these settings later.</div></div></div><div class="card-body">'+
    switchRow("pref-attendance", "Email parents when attendance is marked", "Queue automated attendance summaries for parents", prefs.attendanceEmails)+
    switchRow("pref-payments", "Notify parents of outstanding payments", "Queue payment reminders before the due date", prefs.paymentReminders)+
    switchRow("pref-grades", "Grade notifications", "Queue a parent notification when a new grade is posted", prefs.gradeNotifications)+
    '<div style="display:flex;justify-content:flex-end;margin-top:16px"><button class="btn btn-primary" id="save-prefs-btn"><i class="fa-solid fa-bell"></i>Save Notifications</button></div>'+
    '</div></div>'+
    '<div class="card"><div class="card-header"><div><div class="card-title">User Invitations</div><div class="text-secondary" style="font-size:.78rem;margin-top:3px">Prepare teacher, parent, office, or branch-admin invites now. Supabase Auth will send the actual secure invitation email later.</div></div></div><div class="card-body">'+
    '<div class="form-grid"><div class="form-group"><label class="form-label">Email</label><input class="input" type="email" id="invite-email" placeholder="person@school.org"></div><div class="form-group"><label class="form-label">Role</label><select class="input" id="invite-role"><option value="teacher">Teacher</option><option value="parent">Parent / Guardian</option><option value="front_desk">Front Desk</option><option value="branch_admin">Branch Admin</option></select></div></div>'+
    '<div style="display:flex;justify-content:flex-end;margin-bottom:14px"><button class="btn btn-primary" id="invite-user-btn"><i class="fa-solid fa-user-plus"></i>Create Invitation</button></div>'+
    '<div id="invite-list"></div>'+
    '</div></div>'+
    '<div class="card"><div class="card-header"><div class="card-title">Account</div></div><div class="card-body">'+
    '<div class="form-group"><label class="form-label">Current User</label><input class="input" value="'+SMS_UI.esc(SMS_AUTH.getCurrentUser().displayName||"")+'" disabled style="opacity:.6"></div>'+
    '<div class="form-group"><label class="form-label">Role</label><input class="input" value="'+SMS_AUTH.roleBadge(SMS_AUTH.getRole())+'" disabled style="opacity:.6"></div>'+
    '<div style="padding:12px 14px;border:1px solid var(--border);border-radius:10px;background:var(--gray-50);font-size:.8rem;color:var(--text-secondary);line-height:1.55"><i class="fa-solid fa-shield-halved" style="margin-right:6px"></i>Password changes and multi-factor authentication will be handled by Supabase Auth. The frontend demo does not modify passwords locally.</div>'+
    '<div style="margin-top:14px"><a class="btn btn-secondary" href="../login/forgot-password.html"><i class="fa-solid fa-key"></i>Open Reset Password Flow</a></div>'+
    '</div></div></div>';

  function switchRow(id, title, sub, checked) {
    return '<div class="switch-row"><div><div class="switch-label">'+SMS_UI.esc(title)+'</div><div class="switch-sub">'+SMS_UI.esc(sub)+'</div></div><label class="switch"><input id="'+id+'" type="checkbox"'+(checked?' checked':'')+'><span class="switch-slider"></span></label></div>';
  }

  document.getElementById("save-branch-btn").addEventListener("click", function(){
    var name = document.getElementById("br-name").value.trim();
    if (!name) { SMS_UI.toast("Branch name required", "Enter a branch name before saving.", "error"); return; }
    Object.assign(branch, {
      name: name,
      address: document.getElementById("br-address").value.trim(),
      phone: document.getElementById("br-phone").value.trim(),
      email: document.getElementById("br-email").value.trim(),
      principalName: document.getElementById("br-principal").value.trim()
    });
    if (window.SMS_DEMO_STORE) SMS_DEMO_STORE.save();
    SMS_API.addAuditEntry({
      userId: SMS_AUTH.getCurrentUser().id,
      userName: SMS_AUTH.getCurrentUser().displayName,
      action: "BRANCH_SETTINGS_UPDATED",
      resource: "Branch",
      resourceId: branch.id,
      details: "Updated branch profile settings",
      branchId: branchId
    });
    SMS_UI.toast("Settings saved", "Branch information is saved in the browser demo.", "success");
  });

  document.getElementById("save-prefs-btn").addEventListener("click", function(){
    prefs = {
      attendanceEmails: document.getElementById("pref-attendance").checked,
      paymentReminders: document.getElementById("pref-payments").checked,
      gradeNotifications: document.getElementById("pref-grades").checked
    };
    localStorage.setItem(prefKey, JSON.stringify(prefs));
    SMS_UI.toast("Notifications saved", "These preferences will be used by the messaging backend later.", "success");
  });

  function refreshInvites() {
    SMS_API.getInvitations(session.schoolId).then(function(invites) {
      var own = invites.filter(function(i){ return !branchId || !i.branchId || i.branchId === branchId; }).slice(0, 8);
      var el = document.getElementById("invite-list");
      if (!own.length) {
        el.innerHTML = '<div class="text-secondary" style="font-size:.8rem;padding:8px 0">No pending invitations yet.</div>';
        return;
      }
      el.innerHTML = '<div style="display:flex;flex-direction:column;gap:7px">'+own.map(function(i){
        return '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid var(--border);border-radius:9px"><div><div class="fw-600 fs-sm">'+SMS_UI.esc(i.email)+'</div><div class="fs-xs text-secondary">'+SMS_UI.esc((i.role||"user").replace(/_/g," "))+' · Created '+SMS_UI.esc(SMS_UI.fmtDate(i.sentAt))+'</div></div>'+SMS_UI.statusBadge(i.status||"Pending")+'</div>';
      }).join("")+'</div>';
    });
  }

  document.getElementById("invite-user-btn").addEventListener("click", function(){
    var email = document.getElementById("invite-email").value.trim().toLowerCase();
    var role = document.getElementById("invite-role").value;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { SMS_UI.toast("Valid email required", "", "error"); return; }
    var expiry = new Date(); expiry.setDate(expiry.getDate()+7);
    SMS_API.createInvitation({schoolId:session.schoolId,branchId:branchId,email:email,role:role,expiresAt:expiry.toISOString().slice(0,10),createdBy:SMS_AUTH.getCurrentUser().displayName,deliveryStatus:"Backend Pending"}).then(function(r){
      SMS_API.addAuditEntry({userId:SMS_AUTH.getCurrentUser().id,userName:SMS_AUTH.getCurrentUser().displayName,action:"INVITATION_CREATED",resource:"Invitation",resourceId:r.invitation.id,details:"Created "+role+" invitation for "+email,branchId:branchId});
      document.getElementById("invite-email").value="";
      SMS_UI.toast("Invitation created", "The invitation is saved; Supabase Auth will deliver it once connected.", "success");
      refreshInvites();
    });
  });

  refreshInvites();
})();
