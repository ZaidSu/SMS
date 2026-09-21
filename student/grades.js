SMS_STUDENT_LAYOUT.init("grades");
(function() {
  var child = SMS_STUDENT_LAYOUT.getSelectedChild();
  if (!child) { document.getElementById("page-content").innerHTML='<div class="card"><div class="card-body">'+SMS_UI.emptyState({icon:"fa-child",title:"No child selected"})+'</div></div>'; return; }
  Promise.all([SMS_API.getClassAverages(child.id),SMS_API.getGrades({studentId:child.id}),SMS_API.getClasses(child.branchId)]).then(function(res){
    var averages=res[0]; var grades=res[1]; var allClasses=res[2];
    var myClasses=allClasses.filter(function(c){return (c.studentIds||[]).includes(child.id);});
    var overall=averages.length?(averages.reduce(function(s,a){return s+a.average;},0)/averages.length).toFixed(1):null;
    document.getElementById("page-content").innerHTML=[
      SMS_UI.pageHeader({title:"Grades",subtitle:SMS_UI.esc(child.fullName)+"'s academic performance",breadcrumb:["Student Portal","Grades"]}),
      overall ? '<div style="text-align:center;padding:20px;background:var(--color-primary-light);border-radius:16px;margin-bottom:20px"><div class="fs-xs text-secondary fw-600">OVERALL AVERAGE — SEMESTER 1</div><div style="font-size:3rem;font-weight:800;color:var(--color-primary)">'+overall+'%</div><div class="fw-700 '+SMS_UI.gradeClass(SMS_UI.percentToGrade(parseFloat(overall)))+'" style="font-size:1.25rem">'+SMS_UI.percentToGrade(parseFloat(overall))+'</div></div>' : '',
      '<div style="display:flex;flex-direction:column;gap:12px">',
      myClasses.map(function(c){
        var avg=averages.find(function(a){return a.classId===c.id;});
        var classGrades=grades.filter(function(g){return g.classId===c.id;});
        return '<div class="card"><div class="card-header"><div><div class="card-title">'+SMS_UI.esc(c.name)+'</div><div class="card-subtitle">'+SMS_UI.esc(c.teacherName||"")+'</div></div>'+
          (avg?'<div style="text-align:right"><div class="fs-xs text-secondary">Average</div><div style="font-size:1.5rem;font-weight:800" class="'+SMS_UI.gradeClass(avg.letterGrade)+'">'+avg.average+'%</div><div class="fw-700 '+SMS_UI.gradeClass(avg.letterGrade)+'">'+avg.letterGrade+'</div></div>':'<span class="text-muted fs-sm">No grades yet</span>')+
          '</div>'+
          (classGrades.length?'<div class="card-body">'+SMS_UI.buildTable({columns:[{label:"Assignment",render:function(g){var asn=SMS_ASSIGNMENTS.find(function(a){return a.id===g.assignmentId;});return SMS_UI.esc(asn?asn.title:g.assignmentId);}},{label:"Score",render:function(g){return '<span class="fw-700">'+g.score+'/'+g.totalPoints+'</span>';}},{label:"Grade",render:function(g){return '<span class="fw-700 '+SMS_UI.gradeClass(g.letterGrade)+'">'+g.letterGrade+'</span>';}},{label:"Date",render:function(g){return SMS_UI.fmtDate(g.gradedDate);}}],rows:classGrades})+'</div>':'')+
          '</div>';
      }).join("")||SMS_UI.emptyState({icon:"fa-book-open",title:"No classes enrolled"}),
      '</div>'
    ].join("");
  });
})();
