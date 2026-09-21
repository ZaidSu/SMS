SMS_ADMIN_LAYOUT.init("protected-records");
(function(){
  "use strict";
  if(!SMS_AUTH.canSeeSensitiveData()) return;
  var branchId=SMS_AUTH.getBranchId(), students=[];
  SMS_API.getStudents(branchId).then(function(rows){students=rows;render();});

  function mask(v){if(!v)return "Not on file";v=String(v);return v.length>4?"••••••"+v.slice(-4):"••••";}
  function idOf(s){return (s.sensitiveInfo&&s.sensitiveInfo.governmentIdentifiers)||{};}
  function render(){
    document.getElementById("page-content").innerHTML=
      SMS_UI.pageHeader({title:"Protected Records",subtitle:"Highly restricted student identifiers",breadcrumb:["Administration","Protected Records"]})+
      '<div class="alert alert-danger" style="margin-bottom:18px"><i class="fa-solid fa-lock"></i><span><strong>Top-admin only.</strong> This area is intentionally unavailable to principals, front desk, teachers, parents and students. Until Supabase is connected, use demo values only — do not enter real SSNs in browser storage.</span></div>'+
      '<div class="card" style="margin-bottom:18px"><div class="card-body"><div style="display:flex;gap:12px;align-items:center"><i class="fa-solid fa-shield-halved" style="font-size:1.4rem;color:var(--color-primary)"></i><div><div class="fw-700">Production behavior already mapped</div><div class="fs-sm text-secondary">Supabase will move these fields into restricted tables with RLS, masked display and access auditing.</div></div></div></div></div>'+
      '<div id="protected-list"></div>';
    var cols=[
      {label:"Student",render:function(s){return '<div class="table-avatar">'+SMS_UI.avatarHtml(s.fullName)+'<div><div class="table-name">'+SMS_UI.esc(s.legalName||s.fullName)+'</div><div class="table-sub">'+SMS_UI.esc(s.id)+' · '+SMS_UI.esc(s.grade)+'</div></div></div>'; }},
      {label:"SSN",render:function(s){return '<span class="fw-600">'+SMS_UI.esc(mask(idOf(s).ssn))+'</span>'; }},
      {label:"Birth Certificate",render:function(s){return '<span class="fs-sm">'+SMS_UI.esc(mask(idOf(s).birthCertificateNumber))+'</span>'; }},
      {label:"State Student ID",render:function(s){return '<span class="fs-sm">'+SMS_UI.esc(mask(idOf(s).stateStudentId))+'</span>'; }},
      {label:"",render:function(s){return '<button class="btn btn-sm btn-secondary" data-protected="'+s.id+'"><i class="fa-solid fa-eye"></i>Open</button>';}}
    ];
    document.getElementById("protected-list").innerHTML=SMS_UI.buildTable({columns:cols,rows:students,emptyTitle:"No protected records"});
    document.querySelectorAll("[data-protected]").forEach(function(btn){btn.addEventListener("click",function(){openRecord(students.find(function(s){return s.id===btn.getAttribute("data-protected");}));});});
  }

  function openRecord(student){
    if(!student)return;var ids=idOf(student),revealed=false;
    SMS_API.addAuditEntry({userId:SMS_AUTH.getCurrentUser().id,userName:SMS_AUTH.getCurrentUser().displayName,action:"PROTECTED_RECORD_OPENED",resource:"StudentProtectedData",resourceId:student.id,details:"Opened protected identifier record for "+student.fullName,branchId:branchId});
    SMS_UI.openDialog([
      '<div class="dialog-header"><div><div class="dialog-title">Protected Record — '+SMS_UI.esc(student.fullName)+'</div><div class="dialog-subtitle">Restricted identifiers · access is audit logged</div></div><button class="dialog-close" data-close-dialog><i class="fa-solid fa-xmark"></i></button></div>',
      '<div class="dialog-body"><div class="alert alert-warning"><i class="fa-solid fa-triangle-exclamation"></i><span>Demo mode: these are invalid placeholder identifiers. Real values belong in the protected Supabase table only.</span></div>',
      '<div class="grid-2"><div class="form-group"><label class="form-label">Social Security Number</label><div style="display:flex;gap:8px"><input class="input" id="pid-ssn" value="'+SMS_UI.esc(mask(ids.ssn))+'" disabled><button class="btn btn-secondary" id="reveal-ssn"><i class="fa-solid fa-eye"></i>Reveal</button></div></div><div class="form-group"><label class="form-label">State Student ID</label><input class="input" id="pid-state" value="'+SMS_UI.esc(ids.stateStudentId||"")+'"></div></div>',
      '<div class="grid-2"><div class="form-group"><label class="form-label">Birth Certificate Number</label><input class="input" id="pid-birth" value="'+SMS_UI.esc(ids.birthCertificateNumber||"")+'"></div><div class="form-group"><label class="form-label">Passport / Government ID (optional)</label><input class="input" id="pid-passport" value="'+SMS_UI.esc(ids.passportNumber||"")+'"></div></div>',
      '</div><div class="dialog-footer"><button class="btn btn-secondary" data-close-dialog>Cancel</button><button class="btn btn-primary" id="save-protected"><i class="fa-solid fa-lock"></i>Save Protected Record</button></div>'
    ].join(""),{lg:true});
    document.getElementById("reveal-ssn").addEventListener("click",function(){
      if(!revealed){document.getElementById("pid-ssn").disabled=false;document.getElementById("pid-ssn").value=ids.ssn||"";this.innerHTML='<i class="fa-solid fa-eye-slash"></i>Hide';revealed=true;SMS_API.addAuditEntry({userId:SMS_AUTH.getCurrentUser().id,userName:SMS_AUTH.getCurrentUser().displayName,action:"SSN_REVEALED",resource:"StudentProtectedData",resourceId:student.id,details:"Revealed SSN field for "+student.fullName,branchId:branchId});}
      else{document.getElementById("pid-ssn").disabled=true;document.getElementById("pid-ssn").value=mask(document.getElementById("pid-ssn").value);this.innerHTML='<i class="fa-solid fa-eye"></i>Reveal';revealed=false;}
    });
    document.getElementById("save-protected").addEventListener("click",function(){
      var next=Object.assign({},ids,{stateStudentId:document.getElementById("pid-state").value.trim(),birthCertificateNumber:document.getElementById("pid-birth").value.trim(),passportNumber:document.getElementById("pid-passport").value.trim()});
      if(revealed)next.ssn=document.getElementById("pid-ssn").value.trim();
      SMS_API.updateStudent(student.id,{sensitiveInfo:Object.assign({},student.sensitiveInfo,{governmentIdentifiers:next})}).then(function(r){if(r.success){SMS_API.addAuditEntry({userId:SMS_AUTH.getCurrentUser().id,userName:SMS_AUTH.getCurrentUser().displayName,action:"PROTECTED_RECORD_UPDATED",resource:"StudentProtectedData",resourceId:student.id,details:"Updated protected identifiers for "+student.fullName,branchId:branchId});SMS_UI.closeDialog();SMS_UI.toast("Protected record saved","The demo record was updated and access was logged.","success");student=r.student;render();}});
    });
  }
})();
