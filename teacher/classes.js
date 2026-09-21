if (SMS_TEACHER_LAYOUT.init("classes")) {
(function() {
  var myClasses = SMS_TEACHER_LAYOUT.getMyClasses();
  var branchId = SMS_AUTH.getBranchId();
  var canAttendance = SMS_AUTH.hasTeacherPermission("attendance.view");
  var canGrades = SMS_AUTH.hasTeacherPermission("grades.view");
  var requested = new URLSearchParams(window.location.search).get("term");
  var activeTerm = requested === "S2" ? "S2" : "S1";
  var schoolYear = SMS_SCHOOL_YEARS.find(function(y){return y.schoolId===SMS_AUTH.getSchoolId()&&y.isCurrent;});

  SMS_API.getStudents(branchId).then(function(allStudents) {
    function semesterLabel(term){
      var s = schoolYear && schoolYear.semesters ? schoolYear.semesters[term==="S2"?1:0] : null;
      return s ? s.name : (term==="S2"?"Semester 2":"Semester 1");
    }
    function classVisible(c){
      var sem=(c.semester||"Full Year").toLowerCase();
      if(sem==="full year"||sem==="full-year"||sem==="year") return true;
      return activeTerm==="S2" ? sem.indexOf("2")!==-1 : sem.indexOf("1")!==-1;
    }
    function render(){
      var visible=myClasses.filter(classVisible);
      document.getElementById("page-content").innerHTML =
        SMS_UI.pageHeader({title:"My Classes",subtitle:"Open a class home for news, calendar, documents, photos, students, attendance, assignments, and grades.",breadcrumb:["Teacher","My Classes"]})+
        '<div class="term-tabs"><button class="term-tab '+(activeTerm==='S1'?'active':'')+'" data-term="S1">Semester 1'+(schoolYear&&schoolYear.semesters&&schoolYear.semesters[0]?'<span class="text-secondary" style="font-weight:500;margin-left:6px">'+SMS_UI.fmtDate(schoolYear.semesters[0].start)+' – '+SMS_UI.fmtDate(schoolYear.semesters[0].end)+'</span>':'')+'</button><button class="term-tab '+(activeTerm==='S2'?'active':'')+'" data-term="S2">Semester 2'+(schoolYear&&schoolYear.semesters&&schoolYear.semesters[1]?'<span class="text-secondary" style="font-weight:500;margin-left:6px">'+SMS_UI.fmtDate(schoolYear.semesters[1].start)+' – '+SMS_UI.fmtDate(schoolYear.semesters[1].end)+'</span>':'')+'</button></div>'+
        (visible.length ? '<div class="class-grid-modern">'+visible.map(function(c){
          var enrolled=allStudents.filter(function(s){return (c.studentIds||[]).includes(s.id);});
          return '<article class="class-card-modern" data-class-id="'+c.id+'"><div class="class-card-band"></div><div class="class-card-body"><div class="class-card-top"><div style="min-width:0"><div class="class-card-name">'+SMS_UI.esc(c.name)+'</div><div class="class-card-subject">'+SMS_UI.esc(c.subject||'')+'</div></div>'+SMS_UI.badge(c.grade||'Class','primary')+'</div><div class="class-meta-grid"><div class="class-meta"><span>Students</span><b>'+enrolled.length+'</b></div><div class="class-meta"><span>Term</span><b>'+SMS_UI.esc(c.semester||'Full Year')+'</b></div><div class="class-meta"><span>Room</span><b>'+SMS_UI.esc(c.room||'—')+'</b></div><div class="class-meta"><span>Schedule</span><b>'+SMS_UI.esc(c.schedule||'—')+'</b></div></div></div><div class="class-card-actions">'+(canAttendance?'<a href="./attendance.html" class="btn btn-sm btn-secondary"><i class="fa-solid fa-clipboard-check"></i>Attendance</a>':'')+(canGrades?'<a href="./gradebook.html" class="btn btn-sm btn-secondary"><i class="fa-solid fa-file-pen"></i>Grades</a>':'')+'<a href="./class-home.html?id='+encodeURIComponent(c.id)+'&term='+activeTerm+'" class="btn btn-sm btn-primary class-open-btn"><i class="fa-solid fa-arrow-up-right-from-square"></i>Open Class</a></div></article>';
        }).join("")+'</div>' : '<div class="card"><div class="card-body">'+SMS_UI.emptyState({icon:"fa-book-open",title:"No classes in "+semesterLabel(activeTerm),message:"Full-year classes and classes assigned to this semester will appear here."})+'</div></div>');
      document.querySelectorAll('[data-term]').forEach(function(btn){btn.addEventListener('click',function(){activeTerm=btn.dataset.term;var u=new URL(window.location.href);u.searchParams.set('term',activeTerm);history.replaceState({},'',u);render();});});
      document.querySelectorAll('[data-class-id]').forEach(function(card){card.addEventListener('click',function(e){if(e.target.closest('a,button,input,select,textarea')) return; window.location.href='./class-home.html?id='+encodeURIComponent(card.dataset.classId)+'&term='+activeTerm;});});
    }
    render();
  });
})();
}
