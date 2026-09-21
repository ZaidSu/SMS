SMS_PARENT_LAYOUT.init("forms");
(function() {
  var child = SMS_PARENT_LAYOUT.getSelectedChild();
  SMS_API.getForms(child?child.branchId:null).then(function(forms) {
    document.getElementById("page-content").innerHTML =
      SMS_UI.pageHeader({title:"Forms",subtitle:"Required and optional forms for your family",breadcrumb:["Parent Portal","Forms"]})+
      '<div class="grid-2" style="gap:16px" id="forms-grid">'+
      (forms.length ? forms.map(function(f,i){
        return '<div class="card"><div class="card-body">'+
          '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">'+SMS_UI.badge(f.category,f.status==="Required"?"warning":"gray")+SMS_UI.badge(f.status,f.status==="Required"?"danger":"gray")+'</div>'+
          '<div class="fw-700" style="font-size:.9375rem;margin-bottom:4px">'+SMS_UI.esc(f.title)+'</div>'+
          '<div class="text-secondary fs-sm">'+SMS_UI.esc(f.description)+'</div>'+
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:12px">'+
          '<span class="fs-xs text-muted">Due: '+SMS_UI.esc(f.dueDate)+'</span>'+
          '<button class="btn btn-sm btn-primary" data-submit-form="'+i+'"><i class="fa-solid fa-paper-plane"></i>Submit</button>'+
          '</div></div></div>';
      }).join("") : '<div style="grid-column:1/-1"><div class="card"><div class="card-body">'+SMS_UI.emptyState({icon:"fa-clipboard-list",title:"No forms at this time"})+'</div></div></div>')+
      '</div>';
    document.querySelectorAll("[data-submit-form]").forEach(function(btn){
      btn.addEventListener("click",function(){SMS_UI.toast("Form submitted","Thank you for submitting this form.","success");});
    });
  });
})();
