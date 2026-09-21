if (SMS_TEACHER_LAYOUT.init("assignments")) {
(function() {
  var myClasses = SMS_TEACHER_LAYOUT.getMyClasses();
  var branchId = SMS_AUTH.getBranchId();
  var canManage = SMS_AUTH.hasTeacherPermission("assignments.manage");
  var myClassIds = myClasses.map(function(c){return c.id;});
  SMS_API.getAssignments().then(function(all) {
    var myAssignments = all.filter(function(a){return myClassIds.includes(a.classId);});
    document.getElementById("page-content").innerHTML =
      SMS_UI.pageHeader({title:"Assignments",subtitle:canManage?"View and manage assignments across your classes":"View assignments across your classes",breadcrumb:["Teacher","Assignments"]})+
      (!canManage?'<div class="alert alert-info" style="margin-bottom:16px"><i class="fa-solid fa-eye"></i><span>Assignments are <strong>View only</strong> for your account.</span></div>':'')+
      '<div id="asn-list"></div>';
    var cols = [
      {label:"Assignment",render:function(a){return '<div class="fw-600">'+SMS_UI.esc(a.title)+'</div><div class="fs-xs text-secondary">'+SMS_UI.esc(a.type)+'</div>';}},
      {label:"Class",render:function(a){var c=myClasses.find(function(x){return x.id===a.classId;});return SMS_UI.esc(c?c.name:a.classId);}},
      {label:"Points",render:function(a){return String(a.totalPoints);}},
      {label:"Due",render:function(a){return SMS_UI.fmtDate(a.dueDate);}},
      {label:"Status",render:function(a){return SMS_UI.statusBadge(a.status);}},
      {label:"",render:function(a){return canManage?'<button class="btn btn-sm btn-ghost btn-icon" style="color:var(--color-danger)" data-del-asn="'+a.id+'"><i class="fa-solid fa-trash"></i></button>':'';}}
    ];
    document.getElementById("asn-list").innerHTML = SMS_UI.buildTable({columns:cols,rows:myAssignments,emptyTitle:"No assignments yet",emptyMessage:"Create assignments from the Gradebook page."});
    if (canManage) document.querySelectorAll("[data-del-asn]").forEach(function(btn){
      btn.addEventListener("click",function(e){e.stopPropagation();SMS_UI.confirm("Delete assignment?","This cannot be undone.","Delete",function(){SMS_API.deleteAssignment(btn.getAttribute("data-del-asn")).then(function(){SMS_UI.toast("Assignment deleted","","success");location.reload();});});});
    });
  });
})();
}
