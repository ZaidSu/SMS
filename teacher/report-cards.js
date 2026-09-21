if (SMS_TEACHER_LAYOUT.init("report-cards")) {
(function() {
  var myClasses = SMS_TEACHER_LAYOUT.getMyClasses();
  var branchId = SMS_AUTH.getBranchId();
  Promise.all([SMS_API.getStudents(branchId),SMS_API.getClassAverages()]).then(function(res){
    var allStudents=res[0]; var allAverages=res[1];
    var myStudentIds=new Set(myClasses.reduce(function(ids,c){return ids.concat(c.studentIds||[]);},[]));
    var myStudents=allStudents.filter(function(s){return myStudentIds.has(s.id);});
    document.getElementById("page-content").innerHTML =
      SMS_UI.pageHeader({title:"Report Cards",subtitle:"View report cards for your students",breadcrumb:["Teacher","Report Cards"]})+
      '<div id="rc-list" style="display:flex;flex-direction:column;gap:12px"></div>';
    document.getElementById("rc-list").innerHTML = myStudents.map(function(s){
      var myAvgs = allAverages.filter(function(a){return a.studentId===s.id && myClasses.some(function(c){return c.id===a.classId;});});
      var overall = myAvgs.length ? (myAvgs.reduce(function(sum,a){return sum+a.average;},0)/myAvgs.length).toFixed(1) : null;
      return '<div class="card"><div class="card-body"><div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">'+
        '<div style="display:flex;align-items:center;gap:12px">'+SMS_UI.avatarHtml(s.fullName,"lg")+'<div><div class="fw-700">'+SMS_UI.esc(s.fullName)+'</div><div class="text-secondary fs-sm">'+SMS_UI.esc(s.grade)+'</div></div></div>'+
        (overall ? '<div style="text-align:center"><div class="fs-xs text-secondary">Overall Avg</div><div style="font-size:1.5rem;font-weight:800" class="'+SMS_UI.gradeClass(SMS_UI.percentToGrade(parseFloat(overall)))+'">'+overall+'%</div><div class="fw-700 '+SMS_UI.gradeClass(SMS_UI.percentToGrade(parseFloat(overall)))+'">'+SMS_UI.percentToGrade(parseFloat(overall))+'</div></div>' : '<span class="text-muted fs-sm">No grades entered</span>')+
        '</div>'+
        (myAvgs.length ? '<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border-color)">'+myAvgs.map(function(a){var c=myClasses.find(function(x){return x.id===a.classId;});return '<span style="margin-right:12px" class="fs-sm">'+SMS_UI.esc(c?c.name:a.classId)+': <span class="fw-700 '+SMS_UI.gradeClass(a.letterGrade)+'">'+a.average+'% ('+a.letterGrade+')</span></span>';}).join("")+'</div>' : '')+
        '</div></div>';
    }).join("")||(SMS_UI.emptyState({icon:"fa-file-lines",title:"No students assigned"}));
  });
})();
}
