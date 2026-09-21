SMS_ADMIN_LAYOUT.init("documents");
(function() {
  "use strict";
  var branchId = SMS_AUTH.getBranchId();
  var allDocs = [], searchVal = "", catFilter = "all";
  function load() { return SMS_API.getDocuments(branchId).then(function(d){ allDocs=d; }); }
  function fmtSize(bytes) {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + " KB";
    return (bytes/(1024*1024)).toFixed(1) + " MB";
  }
  function fileType(file) {
    var ext = (file.name.split(".").pop() || "FILE").toUpperCase();
    return ext.length <= 5 ? ext : "FILE";
  }

  load().then(function() {
    document.getElementById("page-content").innerHTML =
      SMS_UI.pageHeader({ title:"Documents", subtitle:"Upload and manage shared school documents", breadcrumb:["Administration","Documents"], actions:[{label:"Upload Document",icon:"fa-upload",id:"add-doc-btn",primary:true}] })+
      '<div class="card" style="margin-bottom:20px"><div class="card-body"><div class="filter-bar">'+
      '<div class="input-with-icon" style="flex:1"><i class="fa-solid fa-search icon"></i><input class="input" id="doc-search" placeholder="Search documents…"></div>'+
      '<select class="input" id="doc-cat" style="max-width:180px"><option value="all">All Categories</option><option value="Administrative">Administrative</option><option value="Academic">Academic</option><option value="Policy">Policy</option><option value="Finance">Finance</option><option value="Other">Other</option></select>'+
      '</div></div></div>'+
      '<div id="docs-list"></div>'+
      '<div class="card" style="margin-top:18px"><div class="card-body" style="display:flex;gap:10px"><i class="fa-solid fa-database" style="color:var(--color-primary);margin-top:2px"></i><div class="text-secondary" style="font-size:.8rem;line-height:1.5"><strong style="color:var(--text-primary)">Frontend file demo:</strong> newly uploaded files are stored in this browser with IndexedDB, so downloads actually work across the portals on this device. Supabase Storage will replace this local store.</div></div></div>';
    document.getElementById("add-doc-btn").addEventListener("click", openAddDialog);
    document.getElementById("doc-search").addEventListener("input",function(){searchVal=this.value;renderList();});
    document.getElementById("doc-cat").addEventListener("change",function(){catFilter=this.value;renderList();});
    renderList();
  });

  function renderList() {
    var filtered = allDocs.filter(function(d){
      return ((d.title||"")+" "+(d.description||"")+" "+(d.fileName||"")).toLowerCase().includes(searchVal.toLowerCase()) && (catFilter==="all"||d.category===catFilter);
    });
    var iconMap = {PDF:"fa-file-pdf",DOC:"fa-file-word",DOCX:"fa-file-word",XLS:"fa-file-excel",XLSX:"fa-file-excel",CSV:"fa-file-csv",PNG:"fa-file-image",JPG:"fa-file-image",JPEG:"fa-file-image"};
    var cols = [
      {label:"Document",render:function(d){return '<div style="display:flex;align-items:center;gap:12px"><div style="width:36px;height:36px;background:var(--color-danger-light);border-radius:8px;display:flex;align-items:center;justify-content:center"><i class="fa-solid '+(iconMap[d.fileType]||"fa-file")+'" style="color:var(--color-danger);font-size:.875rem"></i></div><div><div class="fw-600">'+SMS_UI.esc(d.title)+'</div><div class="fs-xs text-secondary">'+SMS_UI.esc(d.description||"")+'</div>'+(d.fileName?'<div class="fs-xs text-secondary" style="margin-top:2px"><i class="fa-solid fa-paperclip"></i> '+SMS_UI.esc(d.fileName)+(d.fileSize?' · '+fmtSize(d.fileSize):'')+'</div>':'')+'</div></div>'; }},
      {label:"Category",render:function(d){return SMS_UI.badge(d.category,"gray");}},
      {label:"Type",render:function(d){return '<span class="fs-xs fw-600">'+SMS_UI.esc(d.fileType||"FILE")+'</span>'; }},
      {label:"Uploaded",render:function(d){return SMS_UI.fmtDate(d.uploadDate);}},
      {label:"By",render:function(d){return '<span class="fs-sm">'+SMS_UI.esc(d.uploadedBy||"")+'</span>'; }},
      {label:"",render:function(d){return '<div style="display:flex;gap:6px;justify-content:flex-end"><button class="btn btn-sm btn-secondary" data-download-doc="'+d.id+'"><i class="fa-solid fa-download"></i>Download</button><button class="btn btn-sm btn-ghost btn-icon" style="color:var(--color-danger)" data-del-doc="'+d.id+'"><i class="fa-solid fa-trash"></i></button></div>'; }}
    ];
    var wrap = document.getElementById("docs-list");
    wrap.innerHTML = SMS_UI.buildTable({columns:cols,rows:filtered,emptyTitle:"No documents found"});
    wrap.querySelectorAll("[data-download-doc]").forEach(function(btn){
      btn.addEventListener("click",function(e){e.stopPropagation();downloadDoc(btn.getAttribute("data-download-doc"));});
    });
    wrap.querySelectorAll("[data-del-doc]").forEach(function(btn){
      btn.addEventListener("click",function(e){
        e.stopPropagation();
        var doc = allDocs.find(function(d){return d.id===btn.getAttribute("data-del-doc");});
        if(!doc)return;
        SMS_UI.confirm("Delete '"+doc.title+"'?","The document record and locally attached demo file will be removed.","Delete Document",function(){
          SMS_API.deleteDocument(doc.id).then(function(){
            var removeFile = window.SMS_DEMO_FILES ? SMS_DEMO_FILES.remove(doc.id).catch(function(){}) : Promise.resolve();
            return removeFile;
          }).then(function(){SMS_UI.toast("Document deleted","","success");load().then(renderList);});
        });
      });
    });
  }

  function downloadDoc(id) {
    var doc = allDocs.find(function(d){return d.id===id;});
    if (!doc) return;
    if (!window.SMS_DEMO_FILES) { SMS_UI.toast("File store unavailable","","error"); return; }
    SMS_DEMO_FILES.download(id, doc.fileName || doc.title).then(function(ok){
      if (!ok) SMS_UI.toast("No file attached", "This is a seeded document record. Upload a file in the demo to test real downloads; Supabase Storage will provide production files.", "info");
    }).catch(function(){ SMS_UI.toast("Could not read file", "The browser demo file may have been cleared.", "error"); });
  }

  function openAddDialog() {
    SMS_UI.openDialog([
      '<div class="dialog-header"><div><div class="dialog-title">Upload Document</div><div class="dialog-subtitle">Attach a real file to the browser demo library</div></div><button class="dialog-close" data-close-dialog><i class="fa-solid fa-xmark"></i></button></div>',
      '<div class="dialog-body">',
      '<div class="form-group"><label class="form-label">Title *</label><input class="input" id="doc-title" placeholder="Document title"></div>',
      '<div class="form-group"><label class="form-label">Description</label><input class="input" id="doc-desc" placeholder="Brief description"></div>',
      '<div class="form-grid"><div class="form-group"><label class="form-label">Category</label><select class="input" id="doc-cat-sel"><option>Administrative</option><option>Academic</option><option>Policy</option><option>Finance</option><option>Other</option></select></div><div class="form-group"><label class="form-label">Visibility</label><select class="input" id="doc-visibility"><option value="public">School community</option><option value="staff">Staff only</option></select></div></div>',
      '<div class="form-group"><label class="form-label">File *</label><input class="input" type="file" id="doc-file"><div class="fs-xs text-secondary" style="margin-top:5px">For this frontend demo, choose reasonably small files. They stay only in this browser.</div></div>',
      '</div>',
      '<div class="dialog-footer"><button class="btn btn-secondary" data-close-dialog>Cancel</button><button class="btn btn-primary" id="save-doc-btn"><i class="fa-solid fa-upload"></i>Upload Document</button></div>'
    ].join(""));
    document.getElementById("save-doc-btn").addEventListener("click",function(){
      var title=document.getElementById("doc-title").value.trim();
      var file=document.getElementById("doc-file").files[0];
      if(!title){SMS_UI.toast("Title required","","error");return;}
      if(!file){SMS_UI.toast("Choose a file","Attach a file before uploading.","error");return;}
      if(file.size>20*1024*1024){SMS_UI.toast("File too large","Keep browser-demo files under 20 MB.","error");return;}
      var user=SMS_AUTH.getCurrentUser();
      var button=document.getElementById("save-doc-btn");button.disabled=true;button.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i>Uploading…';
      SMS_API.createDocument({title:title,description:document.getElementById("doc-desc").value.trim(),category:document.getElementById("doc-cat-sel").value,fileType:fileType(file),fileName:file.name,fileSize:file.size,hasFile:false,uploadedBy:user.displayName,isPublic:document.getElementById("doc-visibility").value==="public",branchId:branchId,schoolId:SMS_AUTH.getSchoolId()}).then(function(r){
        if(!r.success) throw new Error("Could not create document record");
        return SMS_DEMO_FILES.put(r.document.id,file).then(function(){
          r.document.hasFile=true;
          if(window.SMS_DEMO_STORE) SMS_DEMO_STORE.save();
          SMS_API.addAuditEntry({userId:user.id,userName:user.displayName,action:"DOCUMENT_UPLOADED",resource:"Document",resourceId:r.document.id,details:"Uploaded "+file.name,branchId:branchId});
        });
      }).then(function(){SMS_UI.closeDialog();SMS_UI.toast("Document uploaded",file.name+" is available in this browser demo.","success");load().then(renderList);}).catch(function(err){button.disabled=false;button.innerHTML='<i class="fa-solid fa-upload"></i>Upload Document';SMS_UI.toast("Upload failed",err.message||"Could not store the file.","error");});
    });
  }
})();
