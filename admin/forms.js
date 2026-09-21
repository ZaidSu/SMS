SMS_ADMIN_LAYOUT.init("forms");
(function() {
  var branchId = SMS_AUTH.getBranchId();
  var allForms = [];
  function load() { return SMS_API.getForms(branchId).then(function(f){allForms=f;}); }
  load().then(function() {
    document.getElementById("page-content").innerHTML =
      SMS_UI.pageHeader({ title:"Forms", subtitle:"Create and manage forms sent to families", breadcrumb:["Administration","Forms"],
        actions:[{label:"Create Form",icon:"fa-plus",id:"add-form-btn",primary:true}] })+
      '<div class="grid-3" id="forms-grid" style="gap:16px"></div>';
    document.getElementById("add-form-btn").addEventListener("click", openCreateDialog);
    renderGrid();
  });
  function renderGrid() {
    var grid = document.getElementById("forms-grid");
    if (!allForms.length) { grid.innerHTML = '<div class="card" style="grid-column:1/-1"><div class="card-body">'+SMS_UI.emptyState({icon:"fa-clipboard-list",title:"No forms created yet",message:"Create your first form for families."})+'</div></div>'; return; }
    grid.innerHTML = allForms.map(function(f,i){
      return '<div class="card"><div class="card-body"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">'+SMS_UI.badge(f.category,f.status==="Required"?"warning":"gray")+'<button class="btn btn-sm btn-ghost btn-icon" style="color:var(--color-danger)" data-del-form="'+i+'"><i class="fa-solid fa-trash"></i></button></div>'+
        '<div class="fw-700" style="font-size:.9375rem;margin-bottom:4px">'+SMS_UI.esc(f.title)+'</div>'+
        '<div class="text-secondary fs-sm">'+SMS_UI.esc(f.description)+'</div>'+
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:12px;padding-top:12px;border-top:1px solid var(--border-color)">'+
        '<span class="fs-xs text-muted">Due: '+SMS_UI.esc(f.dueDate)+'</span>'+SMS_UI.badge(f.status,f.status==="Required"?"danger":"gray")+'</div></div></div>';
    }).join("");
    document.querySelectorAll("[data-del-form]").forEach(function(btn){
      btn.addEventListener("click",function(){
        var form=allForms[parseInt(btn.getAttribute("data-del-form"))];
        SMS_UI.confirm("Delete '"+form.title+"'?","Families will no longer see this form.","Delete Form",function(){
          SMS_API.deleteForm(form.id).then(function(){SMS_UI.toast("Form deleted","","success");load().then(renderGrid);});
        });
      });
    });
  }
  function openCreateDialog() {
    SMS_UI.openDialog([
      '<div class="dialog-header"><div><div class="dialog-title">Create Form</div></div><button class="dialog-close" data-close-dialog><i class="fa-solid fa-xmark"></i></button></div>',
      '<div class="dialog-body">',
      '<div class="form-group"><label class="form-label">Title *</label><input class="input" id="frm-title"></div>',
      '<div class="form-group"><label class="form-label">Description</label><textarea class="input" id="frm-desc" rows="3"></textarea></div>',
      '<div class="form-grid"><div class="form-group"><label class="form-label">Category</label><select class="input" id="frm-cat"><option>Required</option><option>Permission Slip</option><option>Survey</option><option>Registration</option><option>Other</option></select></div><div class="form-group"><label class="form-label">Due Date</label><input class="input" type="date" id="frm-due"></div></div>',
      '<label class="checkbox-label" style="margin-bottom:8px"><input type="checkbox" id="frm-required">Mark as required for all families</label>',
      '</div>',
      '<div class="dialog-footer"><button class="btn btn-secondary" data-close-dialog>Cancel</button><button class="btn btn-primary" id="save-form-btn"><i class="fa-solid fa-plus"></i>Create Form</button></div>'
    ].join(""));
    document.getElementById("save-form-btn").addEventListener("click",function(){
      var title=document.getElementById("frm-title").value.trim();
      if(!title){SMS_UI.toast("Title required","","error");return;}
      SMS_API.createForm({title:title,description:document.getElementById("frm-desc").value.trim(),category:document.getElementById("frm-cat").value,dueDate:document.getElementById("frm-due").value,status:document.getElementById("frm-required").checked?"Required":"Optional",branchId:branchId,schoolId:SMS_AUTH.getSchoolId()}).then(function(r){
        if(r.success){SMS_UI.closeDialog();SMS_UI.toast("Form created","","success");load().then(renderGrid);}
      });
    });
  }
})();
