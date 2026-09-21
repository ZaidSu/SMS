SMS_ADMIN_LAYOUT.init("audit-logs");
(function() {
  var branchId = SMS_AUTH.getBranchId();
  var allLogs = [], searchVal = "";
  SMS_API.getAuditLog(branchId).then(function(logs){
    allLogs = logs;
    document.getElementById("page-content").innerHTML =
      SMS_UI.pageHeader({title:"Audit Logs",subtitle:"Chronological log of all administrative actions in this branch",breadcrumb:["Administration","Audit Logs"]})+
      '<div class="card" style="margin-bottom:20px"><div class="card-body"><div class="filter-bar"><div class="input-with-icon" style="flex:1"><i class="fa-solid fa-search icon"></i><input class="input" id="log-search" placeholder="Search logs…"></div></div></div></div>'+
      '<div id="logs-list"></div>';
    document.getElementById("log-search").addEventListener("input",function(){searchVal=this.value;renderList();});
    renderList();
  });
  function renderList() {
    var filtered = allLogs.filter(function(l){ return (l.details+" "+l.userName+" "+l.action).toLowerCase().includes(searchVal.toLowerCase()); });
    var actionIcons = {STUDENT_ENROLLED:"fa-user-plus",STUDENT_REMOVED:"fa-user-minus",TEACHER_ADDED:"fa-chalkboard-teacher",TEACHER_REMOVED:"fa-user-slash",CLASS_CREATED:"fa-book-open",ATTENDANCE_MARKED:"fa-clipboard-check",PAYMENT_RECORDED:"fa-circle-check",CHARGE_ADDED:"fa-dollar-sign"};
    var cols = [
      {label:"Action",render:function(l){return '<div style="display:flex;align-items:center;gap:10px"><div style="width:32px;height:32px;background:var(--color-primary-light);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="fa-solid '+(actionIcons[l.action]||"fa-circle")+'" style="font-size:.75rem;color:var(--color-primary)"></i></div><div class="fw-600 fs-sm">'+SMS_UI.esc(l.action.replace(/_/g," "))+'</div></div>';}},
      {label:"Details",render:function(l){return '<span class="fs-sm">'+SMS_UI.esc(l.details)+'</span>';}},
      {label:"User",render:function(l){return SMS_UI.esc(l.userName||"—");}},
      {label:"Timestamp",render:function(l){return '<span class="fs-xs">'+SMS_UI.fmtDateTime(l.timestamp)+'</span>';}}
    ];
    var wrap = document.getElementById("logs-list");
    wrap.innerHTML = SMS_UI.buildTable({columns:cols,rows:filtered,emptyTitle:"No audit logs found"});
  }
})();
