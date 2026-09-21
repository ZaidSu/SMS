SMS_ADMIN_LAYOUT.init("teachers");

(function() {
  "use strict";
  var branchId = SMS_AUTH.getBranchId();
  var allTeachers = [], allClasses = [];
  var searchVal = "";

  Promise.all([SMS_API.getTeachers(branchId), SMS_API.getClasses(branchId)]).then(function(res) {
    allTeachers = res[0]; allClasses = res[1]; render();
  });

  function presetName(t) {
    if (!t || !t.permissionPreset || t.permissionPreset === "custom") return "Custom";
    return (SMS_TEACHER_PERMISSION_PRESETS[t.permissionPreset] || {}).name || "Custom";
  }

  function render() {
    document.getElementById("page-content").innerHTML =
      SMS_UI.pageHeader({ title:"Teachers", subtitle:"Manage staff, portal access and individual permissions", breadcrumb:["Administration","Teachers"], actions:[{label:"Add Teacher",icon:"fa-plus",id:"add-teacher-btn",primary:true}] })+
      '<div class="alert alert-info" style="margin-bottom:18px"><i class="fa-solid fa-key"></i><span><strong>Granular teacher access:</strong> principals can decide what each teacher can view or manage. Government identifiers and financial records are never available to teacher accounts.</span></div>'+
      '<div class="card" style="margin-bottom:20px"><div class="card-body"><div class="filter-bar"><div class="input-with-icon" style="flex:1"><i class="fa-solid fa-search icon"></i><input class="input" id="teacher-search" placeholder="Search by name, subject or permission profile…"></div></div></div></div>'+
      '<div id="teachers-list"></div>';
    document.getElementById("add-teacher-btn").addEventListener("click", openAddDialog);
    document.getElementById("teacher-search").addEventListener("input", function(){searchVal=this.value;renderList();});
    renderList();
  }

  function renderList() {
    var q=searchVal.toLowerCase();
    var rows=allTeachers.filter(function(t){return !q || (t.fullName+" "+(t.subjects||[]).join(" ")+" "+presetName(t)).toLowerCase().includes(q);});
    var cols=[
      {label:"Teacher",render:function(t){return '<div class="table-avatar">'+SMS_UI.avatarHtml(t.fullName)+'<div><div class="table-name">'+SMS_UI.esc(t.fullName)+'</div><div class="table-sub">'+SMS_UI.esc(t.department||"")+'</div></div></div>'; }},
      {label:"Subjects",render:function(t){return SMS_UI.esc((t.subjects||[]).join(", ")||"—");}},
      {label:"Portal Access",render:function(t){return '<div><span class="badge badge-outline">'+SMS_UI.esc(presetName(t))+'</span><div class="fs-xs text-secondary" style="margin-top:4px">'+SMS_UI.esc((t.portalAccess&&t.portalAccess.username)||"Invite pending")+'</div></div>'; }},
      {label:"Classes",render:function(t){return String((t.assignedClassIds||[]).length);}},
      {label:"Status",render:function(t){return SMS_UI.statusBadge(t.status);}},
      {label:"",render:function(){return '<i class="fa-solid fa-chevron-right" style="color:var(--text-muted)"></i>';}}
    ];
    var wrap=document.getElementById("teachers-list");
    wrap.innerHTML=SMS_UI.buildTable({columns:cols,rows:rows,emptyTitle:"No teachers found"});
    SMS_UI.wireTableClicks(wrap,rows,openProfile);
  }

  function presetOptions(selected) {
    return Object.keys(SMS_TEACHER_PERMISSION_PRESETS).map(function(k){var p=SMS_TEACHER_PERMISSION_PRESETS[k];return '<option value="'+k+'"'+(selected===k?' selected':'')+'>'+SMS_UI.esc(p.name)+'</option>';}).join("");
  }

  function openAddDialog() {
    SMS_UI.openDialog([
      '<div class="dialog-header"><div><div class="dialog-title">Add Teacher</div><div class="dialog-subtitle">Create the staff record and choose initial portal permissions</div></div><button class="dialog-close" data-close-dialog><i class="fa-solid fa-xmark"></i></button></div>',
      '<div class="dialog-body">',
      '<div class="form-grid"><div class="form-group"><label class="form-label">First Name *</label><input class="input" id="t-first"></div><div class="form-group"><label class="form-label">Last Name *</label><input class="input" id="t-last"></div></div>',
      '<div class="form-grid"><div class="form-group"><label class="form-label">Title</label><select class="input" id="t-title"><option>Mr.</option><option>Ms.</option><option>Mrs.</option><option>Dr.</option><option>Ustadh</option><option>Ustadha</option></select></div><div class="form-group"><label class="form-label">Department</label><select class="input" id="t-dept"><option>STEM</option><option>Humanities</option><option>Islamic Studies</option><option>Arts</option><option>Physical Education</option><option>Administration</option></select></div></div>',
      '<div class="form-group"><label class="form-label">Subjects</label><input class="input" id="t-subjects" placeholder="Mathematics, Science"></div>',
      '<div class="form-grid"><div class="form-group"><label class="form-label">Email *</label><input class="input" type="email" id="t-email"></div><div class="form-group"><label class="form-label">Phone</label><input class="input" id="t-phone"></div></div>',
      '<div class="card" style="margin-top:8px"><div class="card-body"><div class="form-grid"><div class="form-group"><label class="form-label">Permission Profile *</label><select class="input" id="t-preset">'+presetOptions("standard")+'</select></div><div class="form-group"><label class="form-label">Demo Portal Username</label><input class="input" id="t-username" placeholder="Auto-generated if blank"></div></div><div class="fs-xs text-secondary" id="preset-desc"></div></div></div>',
      '</div>',
      '<div class="dialog-footer"><button class="btn btn-secondary" data-close-dialog>Cancel</button><button class="btn btn-primary" id="save-teacher-btn"><i class="fa-solid fa-plus"></i>Add Teacher</button></div>'
    ].join(""),{lg:true});
    function updateDesc(){var k=document.getElementById("t-preset").value,p=SMS_TEACHER_PERMISSION_PRESETS[k];document.getElementById("preset-desc").textContent=p?p.description:"";}
    document.getElementById("t-preset").addEventListener("change",updateDesc);updateDesc();
    document.getElementById("save-teacher-btn").addEventListener("click",function(){
      var first=document.getElementById("t-first").value.trim(),last=document.getElementById("t-last").value.trim(),email=document.getElementById("t-email").value.trim();
      if(!first||!last||!email){SMS_UI.toast("Missing fields","First name, last name and email are required.","error");return;}
      var title=document.getElementById("t-title").value,preset=document.getElementById("t-preset").value;
      SMS_API.createTeacher({firstName:first,lastName:last,fullName:title+" "+first+" "+last,title:title,email:email,phone:document.getElementById("t-phone").value.trim(),department:document.getElementById("t-dept").value,subjects:document.getElementById("t-subjects").value.split(",").map(function(x){return x.trim();}).filter(Boolean),branchId:branchId,schoolId:SMS_AUTH.getSchoolId(),permissionPreset:preset,permissions:SMS_cloneTeacherPermissions(preset),portalUsername:document.getElementById("t-username").value.trim()}).then(function(r){
        if(!r.success)return;
        SMS_API.addAuditEntry({userId:SMS_AUTH.getCurrentUser().id,userName:SMS_AUTH.getCurrentUser().displayName,action:"TEACHER_ADDED",resource:"Teacher",resourceId:r.teacher.id,details:"Added "+r.teacher.fullName+" with "+presetName(r.teacher)+" permissions",branchId:branchId});
        SMS_UI.closeDialog();SMS_UI.toast("Teacher added","Demo username: "+r.username+" · Any non-empty password works until Supabase Auth is connected.","success");
        SMS_API.getTeachers(branchId).then(function(t){allTeachers=t;renderList();});
      });
    });
  }

  function openProfile(teacher) {
    var classes=allClasses.filter(function(c){return c.teacherId===teacher.id;});
    var enabled=Object.keys(teacher.permissions||{}).filter(function(k){return teacher.permissions[k];}).length;
    SMS_UI.openDialog([
      '<div class="dialog-header"><div style="display:flex;align-items:center;gap:16px">'+SMS_UI.avatarHtml(teacher.fullName,"xl")+'<div><div class="dialog-title">'+SMS_UI.esc(teacher.fullName)+'</div><div class="dialog-subtitle">'+SMS_UI.esc(teacher.department||"")+'</div><div style="margin-top:5px">'+SMS_UI.statusBadge(teacher.status)+' <span class="badge badge-outline">'+SMS_UI.esc(presetName(teacher))+'</span></div></div></div><button class="dialog-close" data-close-dialog><i class="fa-solid fa-xmark"></i></button></div>',
      '<div class="dialog-body">',
      '<div class="grid-2" style="margin-bottom:16px"><div class="card"><div class="card-body"><div class="fs-xs text-secondary fw-600">CONTACT</div><div style="margin-top:10px"><div class="fw-600">'+SMS_UI.esc(teacher.email)+'</div><div class="fs-sm text-secondary">'+SMS_UI.esc(teacher.phone||"No phone")+'</div></div></div></div><div class="card"><div class="card-body"><div class="fs-xs text-secondary fw-600">PORTAL</div><div style="margin-top:10px"><div class="fw-600">'+SMS_UI.esc((teacher.portalAccess&&teacher.portalAccess.username)||"Invite pending")+'</div><div class="fs-sm text-secondary">'+enabled+' permission switches enabled</div></div></div></div></div>',
      '<div class="card" style="margin-bottom:16px"><div class="card-header"><div><div class="card-title">Teacher Permissions</div><div class="card-subtitle">Controls this teacher only</div></div>'+(SMS_AUTH.canManageTeacherPermissions()?'<button class="btn btn-sm btn-primary" id="manage-perm-btn"><i class="fa-solid fa-sliders"></i>Manage Permissions</button>':'')+'</div><div class="card-body">'+permissionSummary(teacher)+'</div></div>',
      '<div class="card"><div class="card-header"><div class="card-title">Assigned Classes</div></div><div class="card-body">'+(classes.length?classes.map(function(c){return '<span class="badge badge-outline" style="margin:3px">'+SMS_UI.esc(c.name)+'</span>';}).join(""):'<span class="text-secondary fs-sm">No classes assigned.</span>')+'</div></div>',
      '</div>',
      '<div class="dialog-footer dialog-footer-left"><button class="btn btn-secondary" style="color:var(--color-danger);border-color:var(--color-danger)" id="remove-teacher-btn"><i class="fa-solid fa-user-minus"></i>Remove Teacher</button><button class="btn btn-secondary" data-close-dialog>Close</button></div>'
    ].join(""),{lg:true});
    var mp=document.getElementById("manage-perm-btn");if(mp)mp.addEventListener("click",function(){openPermissionEditor(teacher);});
    document.getElementById("remove-teacher-btn").addEventListener("click",function(){SMS_UI.confirm("Remove "+teacher.fullName+"?","The teacher will be unassigned from classes and their demo portal account will be disabled.","Remove Teacher",function(){SMS_API.deleteTeacher(teacher.id).then(function(r){if(r.success){SMS_UI.closeDialog();SMS_UI.toast("Teacher removed","Portal access has been disabled.","success");Promise.all([SMS_API.getTeachers(branchId),SMS_API.getClasses(branchId)]).then(function(res){allTeachers=res[0];allClasses=res[1];renderList();});}});});});
  }

  function permissionSummary(teacher){
    var groups={};SMS_TEACHER_PERMISSION_CATALOG.forEach(function(p){if(teacher.permissions&&teacher.permissions[p.key]){(groups[p.group]||(groups[p.group]=[])).push(p.label);}});
    return Object.keys(groups).length?Object.keys(groups).map(function(g){return '<div style="margin-bottom:9px"><div class="fs-xs fw-700 text-secondary">'+SMS_UI.esc(g.toUpperCase())+'</div><div class="fs-sm">'+groups[g].map(SMS_UI.esc).join(' · ')+'</div></div>';}).join(""):'<span class="text-secondary fs-sm">No optional permissions enabled.</span>';
  }

  function openPermissionEditor(teacher){
    var working=Object.assign({},teacher.permissions||{}),groups=[];
    SMS_TEACHER_PERMISSION_CATALOG.forEach(function(p){if(groups.indexOf(p.group)===-1)groups.push(p.group);});
    var body=groups.map(function(group){return '<div class="card" style="margin-bottom:12px"><div class="card-header"><div class="card-title">'+SMS_UI.esc(group)+'</div></div><div class="card-body" style="padding-top:6px">'+SMS_TEACHER_PERMISSION_CATALOG.filter(function(x){return x.group===group;}).map(function(item){return '<label style="display:flex;gap:12px;align-items:flex-start;padding:10px 2px;border-bottom:1px solid var(--border-color);cursor:pointer"><input type="checkbox" data-perm="'+item.key+'" '+(working[item.key]?'checked':'')+' style="margin-top:3px"><div><div class="fw-600 fs-sm">'+SMS_UI.esc(item.label)+(item.level==='sensitive'?' <span class="badge badge-warning">Sensitive</span>':'')+'</div><div class="fs-xs text-secondary">'+SMS_UI.esc(item.description)+'</div></div></label>';}).join("")+'</div></div>';}).join("");
    SMS_UI.openDialog('<div class="dialog-header"><div><div class="dialog-title">Permissions — '+SMS_UI.esc(teacher.fullName)+'</div><div class="dialog-subtitle">Changes apply only to this teacher</div></div><button class="dialog-close" data-close-dialog><i class="fa-solid fa-xmark"></i></button></div><div class="dialog-body"><div class="alert alert-warning"><i class="fa-solid fa-shield-halved"></i><span>Teacher permissions never grant SSN/government identifiers, school billing, audit logs or administrative settings.</span></div><div class="form-group"><label class="form-label">Apply a preset</label><select class="input" id="perm-preset"><option value="custom">Custom — keep current selections</option>'+presetOptions(teacher.permissionPreset)+'</select></div>'+body+'</div><div class="dialog-footer"><button class="btn btn-secondary" data-close-dialog>Cancel</button><button class="btn btn-primary" id="save-perms"><i class="fa-solid fa-check"></i>Save Permissions</button></div>',{xl:true});
    var presetEl=document.getElementById("perm-preset");presetEl.value=teacher.permissionPreset||"custom";
    presetEl.addEventListener("change",function(){if(this.value==='custom')return;var perms=SMS_cloneTeacherPermissions(this.value);document.querySelectorAll('[data-perm]').forEach(function(cb){cb.checked=!!perms[cb.getAttribute('data-perm')];});});
    document.querySelectorAll('[data-perm]').forEach(function(cb){cb.addEventListener('change',function(){var item=SMS_TEACHER_PERMISSION_CATALOG.find(function(p){return p.key===cb.getAttribute('data-perm');});if(item&&item.requires&&cb.checked){var req=document.querySelector('[data-perm="'+item.requires+'"]');if(req)req.checked=true;}if(!cb.checked){SMS_TEACHER_PERMISSION_CATALOG.filter(function(p){return p.requires===cb.getAttribute('data-perm');}).forEach(function(dep){var d=document.querySelector('[data-perm="'+dep.key+'"]');if(d)d.checked=false;});}});});
    document.getElementById("save-perms").addEventListener("click",function(){var perms={};document.querySelectorAll('[data-perm]').forEach(function(cb){perms[cb.getAttribute('data-perm')]=cb.checked;});var selected=presetEl.value;var exact=Object.keys(SMS_TEACHER_PERMISSION_PRESETS).find(function(k){var base=SMS_cloneTeacherPermissions(k);return SMS_TEACHER_PERMISSION_CATALOG.every(function(x){return !!base[x.key]===!!perms[x.key];});});SMS_API.updateTeacher(teacher.id,{permissions:perms,permissionPreset:exact||'custom'}).then(function(r){if(!r.success)return;teacher=r.teacher;SMS_API.addAuditEntry({userId:SMS_AUTH.getCurrentUser().id,userName:SMS_AUTH.getCurrentUser().displayName,action:"TEACHER_PERMISSIONS_UPDATED",resource:"Teacher",resourceId:teacher.id,details:"Updated portal permissions for "+teacher.fullName,branchId:branchId});SMS_UI.closeDialog();SMS_UI.toast("Permissions saved",teacher.fullName+" will see the updated access on their next page load.","success");SMS_API.getTeachers(branchId).then(function(t){allTeachers=t;renderList();});});});
  }
})();
