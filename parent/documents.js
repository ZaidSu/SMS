SMS_PARENT_LAYOUT.init("documents");
(function() {
  var child = SMS_PARENT_LAYOUT.getSelectedChild();
  SMS_API.getDocuments(child?child.branchId:null).then(function(docs) {
    document.getElementById("page-content").innerHTML =
      SMS_UI.pageHeader({title:"Documents",subtitle:"School documents and resources",breadcrumb:["Parent Portal","Documents"]})+
      '<div id="docs-list"></div>';
    var iconMap={PDF:"fa-file-pdf",DOCX:"fa-file-word",XLSX:"fa-file-excel"};
    document.getElementById("docs-list").innerHTML = SMS_UI.buildTable({columns:[
      {label:"Document",render:function(d){return '<div style="display:flex;align-items:center;gap:12px"><div style="width:36px;height:36px;background:var(--color-danger-light);border-radius:8px;display:flex;align-items:center;justify-content:center"><i class="fa-solid '+(iconMap[d.fileType]||"fa-file")+'" style="color:var(--color-danger);font-size:.875rem"></i></div><div><div class="fw-600">'+SMS_UI.esc(d.title)+'</div><div class="fs-xs text-secondary">'+SMS_UI.esc(d.description)+'</div></div></div>';}},
      {label:"Category",render:function(d){return SMS_UI.badge(d.category,"gray");}},
      {label:"Date",render:function(d){return SMS_UI.fmtDate(d.uploadDate);}},
      {label:"",render:function(d){return '<button class="btn btn-sm btn-secondary" data-download-doc="'+d.id+'"><i class="fa-solid fa-download"></i>Download</button>';}}
    ],rows:docs,emptyTitle:"No documents available"});
    document.querySelectorAll("[data-download-doc]").forEach(function(btn){ btn.addEventListener("click",function(){ var id=btn.getAttribute("data-download-doc"); var doc=docs.find(function(d){return d.id===id;}); SMS_DEMO_FILES.download(id,doc?doc.fileName||doc.title:"document").then(function(ok){ if(!ok) SMS_UI.toast("No file attached","This seeded demo record has no local file. Uploaded demo files will download here.","info"); }).catch(function(){SMS_UI.toast("Download unavailable","The local demo file may have been cleared.","error");}); }); });
  });
})();
