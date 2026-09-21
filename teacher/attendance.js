if (SMS_TEACHER_LAYOUT.init("attendance")) {
(function() {
  var myClasses = SMS_TEACHER_LAYOUT.getMyClasses();
  var branchId = SMS_AUTH.getBranchId();
  var canManage = SMS_AUTH.hasTeacherPermission("attendance.manage");
  var selectedClassIdx = 0, selectedDate = new Date().toISOString().slice(0,10);
  SMS_API.getStudents(branchId).then(function(allStudents) {
    var classOptions = myClasses.map(function(c,i){return '<option value="'+i+'">'+SMS_UI.esc(c.name)+'</option>';}).join("");
    document.getElementById("page-content").innerHTML =
      SMS_UI.pageHeader({title:"Attendance",subtitle:canManage?"Mark attendance for your classes":"View attendance for your classes",breadcrumb:["Teacher","Attendance"]})+
      (!canManage?'<div class="alert alert-info" style="margin-bottom:16px"><i class="fa-solid fa-eye"></i><span>Your principal has set Attendance to <strong>View only</strong>. You can review records but cannot change them.</span></div>':'')+
      '<div class="card" style="margin-bottom:20px"><div class="card-body"><div class="filter-bar">'+
      '<div class="form-group" style="flex:1;min-width:200px;margin-bottom:0"><label class="form-label fs-xs">Class</label><select class="input" id="cls-pick">'+classOptions+'</select></div>'+
      '<div class="form-group" style="width:180px;margin-bottom:0"><label class="form-label fs-xs">Date</label><input class="input" type="date" id="date-pick" value="'+selectedDate+'"></div>'+
      '</div></div></div>'+
      '<div id="att-sheet"></div>';
    if (!myClasses.length) { document.getElementById("att-sheet").innerHTML='<div class="card"><div class="card-body">'+SMS_UI.emptyState({icon:"fa-clipboard-check",title:"No classes assigned"})+'</div></div>'; return; }
    function renderSheet() {
      var cls = myClasses[selectedClassIdx];
      var roster = allStudents.filter(function(s){return (cls.studentIds||[]).includes(s.id);});
      SMS_API.getAttendance({classId:cls.id,date:selectedDate}).then(function(records){
        var present=records.filter(function(r){return r.status==="Present";}).length;
        var absent=records.filter(function(r){return r.status==="Absent";}).length;
        var tardy=records.filter(function(r){return r.status==="Tardy";}).length;
        document.getElementById("att-sheet").innerHTML =
          '<div class="stats-grid" style="margin-bottom:20px">'+
          SMS_UI.statCard({label:"Roster",value:roster.length,icon:"fa-users",color:"blue"})+
          SMS_UI.statCard({label:"Present",value:present,icon:"fa-circle-check",color:"green"})+
          SMS_UI.statCard({label:"Absent",value:absent,icon:"fa-circle-xmark",color:"red"})+
          SMS_UI.statCard({label:"Tardy",value:tardy,icon:"fa-clock",color:"yellow"})+
          '</div>'+
          '<div class="card"><div class="card-header"><div class="card-title">'+SMS_UI.esc(cls.name)+'</div><div class="card-subtitle">'+selectedDate+' · '+records.length+' of '+roster.length+' marked</div></div>'+
          '<div class="card-body"><div style="display:flex;flex-direction:column;gap:8px">'+
          (roster.length ? roster.map(function(s){
            var rec=records.find(function(r){return r.studentId===s.id;});
            var cur=rec?rec.status:null;
            var colors={Present:"var(--color-success)",Tardy:"var(--color-warning)",Absent:"var(--color-danger)",Excused:"var(--color-info)"};
            return '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--gray-50);border-radius:10px;flex-wrap:wrap;gap:8px">'+
              '<div style="display:flex;align-items:center;gap:10px">'+SMS_UI.avatarHtml(s.fullName)+'<span class="fw-600">'+SMS_UI.esc(s.fullName)+'</span></div>'+
              '<div style="display:flex;gap:6px">'+(canManage ? ['Present','Tardy','Absent','Excused'].map(function(st){
                var active=cur===st;
                return '<button class="btn btn-sm att-btn" data-stu="'+s.id+'" data-st="'+st+'" style="'+(active?'background:'+colors[st]+';color:#fff;border-color:'+colors[st]:'')+'" title="'+st+'">'+st+'</button>';
              }).join("") : (cur ? SMS_UI.statusBadge(cur) : '<span class="text-muted fs-sm">Not marked</span>'))+'</div></div>';
          }).join("") : SMS_UI.emptyState({icon:"fa-users",title:"No students enrolled"}))+
          '</div></div></div>';
        if (canManage) document.querySelectorAll("[data-stu][data-st]").forEach(function(btn){
          btn.addEventListener("click",function(){
            var cls2=myClasses[selectedClassIdx];
            SMS_API.markAttendance({studentId:btn.getAttribute("data-stu"),classId:cls2.id,date:selectedDate,status:btn.getAttribute("data-st"),branchId:branchId,markedBy:SMS_AUTH.getCurrentUser().id}).then(renderSheet);
          });
        });
      });
    }
    document.getElementById("cls-pick").addEventListener("change",function(){selectedClassIdx=parseInt(this.value);renderSheet();});
    document.getElementById("date-pick").addEventListener("change",function(){selectedDate=this.value;renderSheet();});
    renderSheet();
  });
})();
}
