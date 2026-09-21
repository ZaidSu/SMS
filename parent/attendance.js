SMS_PARENT_LAYOUT.init("attendance");
(function() {
  var child = SMS_PARENT_LAYOUT.getSelectedChild();
  if (!child) { document.getElementById("page-content").innerHTML='<div class="card"><div class="card-body">'+SMS_UI.emptyState({icon:"fa-child",title:"No child selected"})+'</div></div>'; return; }
  Promise.all([SMS_API.getAttendance({studentId:child.id}),SMS_API.getClasses(child.branchId)]).then(function(res){
    var records=res[0]; var allClasses=res[1];
    var present=records.filter(function(r){return r.status==="Present";}).length;
    var absent=records.filter(function(r){return r.status==="Absent";}).length;
    var tardy=records.filter(function(r){return r.status==="Tardy";}).length;
    var excused=records.filter(function(r){return r.status==="Excused";}).length;
    var rate=records.length>0?Math.round(100*present/records.length):100;
    document.getElementById("page-content").innerHTML=[
      SMS_UI.pageHeader({title:"Attendance",subtitle:SMS_UI.esc(child.fullName)+"'s attendance record",breadcrumb:["Parent Portal","Attendance"]}),
      '<div class="stats-grid" style="margin-bottom:20px">',
      SMS_UI.statCard({label:"Attendance Rate",value:rate+"%",icon:"fa-percent",color:rate>=90?"green":rate>=75?"yellow":"red"}),
      SMS_UI.statCard({label:"Present",value:present,icon:"fa-circle-check",color:"green"}),
      SMS_UI.statCard({label:"Absent",value:absent,icon:"fa-circle-xmark",color:"red"}),
      SMS_UI.statCard({label:"Tardy",value:tardy,icon:"fa-clock",color:"yellow"}),
      '</div>',
      SMS_UI.buildTable({columns:[
        {label:"Date",render:function(r){return SMS_UI.fmtDate(r.date);}},
        {label:"Class",render:function(r){var c=allClasses.find(function(x){return x.id===r.classId;});return SMS_UI.esc(c?c.name:r.classId);}},
        {label:"Status",render:function(r){return SMS_UI.statusBadge(r.status);}},
        {label:"Time",render:function(r){return '<span class="fs-xs">'+SMS_UI.fmtDateTime(r.markedAt)+'</span>';}}
      ],rows:records.sort(function(a,b){return new Date(b.date)-new Date(a.date);}),emptyTitle:"No attendance records yet"})
    ].join("");
  });
})();
