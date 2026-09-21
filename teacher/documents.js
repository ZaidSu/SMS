if (SMS_TEACHER_LAYOUT.init("documents")) {
(function() {
  "use strict";
  var branchId = SMS_AUTH.getBranchId();
  var canUpload = SMS_AUTH.hasTeacherPermission("documents.upload");
  var allDocs = [];

  SMS_API.getDocuments(branchId).then(function(docs) {
    allDocs = docs.filter(function(d){ return d.isPublic !== false || d.visibility === "staff" || d.audience === "teachers"; });
    render();
  });

  function render() {
    document.getElementById("page-content").innerHTML =
      SMS_UI.pageHeader({title:"Documents",subtitle:"School documents and resources",breadcrumb:["Teacher","Documents"],actions:canUpload?[{label:"Upload Document",icon:"fa-upload",id:"teacher-upload-doc",primary:true}]:[]})+
      (!canUpload?'<div class="alert alert-info" style="margin-bottom:16px"><i class="fa-solid fa-eye"></i><span>You have <strong>View/download</strong> access. Upload permission is not enabled for your account.</span></div>':'')+
      '<div id="docs-list"></div>';
    if (canUpload) document.getElementById("teacher-upload-doc").addEventListener("click", openUpload);
    var cols=[
      {label:"Document",render:function(d){return '<div><div class="fw-600">'+SMS_UI.esc(d.title)+'</div><div class="fs-xs text-secondary">'+SMS_UI.esc(d.description||d.fileName||"")+'</div></div>'; }},
      {label:"Category",render:function(d){return SMS_UI.badge(d.category||"Other","gray");}},
      {label:"Uploaded",render:function(d){return SMS_UI.fmtDate(d.uploadDate);}},
      {label:"By",render:function(d){return '<span class="fs-sm">'+SMS_UI.esc(d.uploadedBy||"School")+'</span>'; }},
      {label:"",render:function(d){return '<button class="btn btn-sm btn-secondary" data-download-doc="'+d.id+'"><i class="fa-solid fa-download"></i>Download</button>';}}
    ];
    document.getElementById("docs-list").innerHTML=SMS_UI.buildTable({columns:cols,rows:allDocs,emptyTitle:"No documents available"});
    document.querySelectorAll("[data-download-doc]").forEach(function(btn){btn.addEventListener("click",function(){var id=btn.getAttribute("data-download-doc"),doc=allDocs.find(function(d){return d.id===id;});SMS_DEMO_FILES.download(id,doc?doc.fileName||doc.title:"document").then(function(ok){if(!ok)SMS_UI.toast("No file attached","This seeded demo record has no local file.","info");});});});
  }

  function openUpload(){
    SMS_UI.openDialog([
      '<div class="dialog-header"><div><div class="dialog-title">Upload Teacher Document</div><div class="dialog-subtitle">Available to staff in this browser demo</div></div><button class="dialog-close" data-close-dialog><i class="fa-solid fa-xmark"></i></button></div>',
      '<div class="dialog-body"><div class="form-group"><label class="form-label">Title *</label><input class="input" id="td-title"></div><div class="form-group"><label class="form-label">Description</label><input class="input" id="td-desc"></div><div class="form-group"><label class="form-label">File *</label><input class="input" type="file" id="td-file"></div></div>',
      '<div class="dialog-footer"><button class="btn btn-secondary" data-close-dialog>Cancel</button><button class="btn btn-primary" id="td-save"><i class="fa-solid fa-upload"></i>Upload</button></div>'
    ].join(""));
    document.getElementById("td-save").addEventListener("click",function(){
      var title=document.getElementById("td-title").value.trim(),file=document.getElementById("td-file").files[0];
      if(!title||!file){SMS_UI.toast("Missing information","Add a title and choose a file.","error");return;}
      var u=SMS_AUTH.getCurrentUser();
      SMS_API.createDocument({title:title,description:document.getElementById("td-desc").value.trim(),category:"Academic",fileType:(file.name.split(".").pop()||"FILE").toUpperCase(),fileName:file.name,fileSize:file.size,uploadedBy:u.displayName,isPublic:false,visibility:"staff",audience:"teachers",branchId:branchId,schoolId:SMS_AUTH.getSchoolId()}).then(function(r){return SMS_DEMO_FILES.put(r.document.id,file).then(function(){allDocs.unshift(r.document);if(window.SMS_DEMO_STORE)SMS_DEMO_STORE.save();});}).then(function(){SMS_UI.closeDialog();SMS_UI.toast("Document uploaded","The document is available to staff in this demo.","success");render();});
    });
  }
})();
}
