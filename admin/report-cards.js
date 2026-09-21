SMS_ADMIN_LAYOUT.init("report-cards");
(function() {
  var branchId = SMS_AUTH.getBranchId();
  var allStudents = [], allClasses = [], allAverages = [];
  var selectedStudentId = null;
  Promise.all([SMS_API.getStudents(branchId),SMS_API.getClasses(branchId),SMS_API.getClassAverages()]).then(function(res){
    allStudents=res[0];allClasses=res[1];allAverages=res[2];render();
  });
  function render() {
    document.getElementById("page-content").innerHTML =
      SMS_UI.pageHeader({title:"Report Cards",subtitle:"View and generate student report cards",breadcrumb:["Administration","Report Cards"]})+
      '<div class="grid-2" style="gap:20px;align-items:flex-start">'+
      '<div class="card"><div class="card-header"><div class="card-title">Select Student</div></div><div class="card-body">'+
      '<div class="input-with-icon" style="margin-bottom:12px"><i class="fa-solid fa-search icon"></i><input class="input" id="rc-search" placeholder="Search students…"></div>'+
      '<div id="rc-student-list" style="display:flex;flex-direction:column;gap:6px;max-height:400px;overflow-y:auto"></div>'+
      '</div></div>'+
      '<div id="rc-view" class="card"><div class="card-body">'+SMS_UI.emptyState({icon:"fa-file-lines",title:"Select a student","message":"Choose a student on the left to view their report card."})+'</div></div>'+
      '</div>';
    renderStudentList("", allStudents);
    document.getElementById("rc-search").addEventListener("input",function(){
      renderStudentList(this.value, allStudents);
    });
  }
  function renderStudentList(q, students) {
    var filtered = students.filter(function(s){return s.fullName.toLowerCase().includes(q.toLowerCase());});
    var list = document.getElementById("rc-student-list");
    list.innerHTML = filtered.map(function(s){
      var active = s.id===selectedStudentId;
      return '<div class="cursor-pointer" style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:8px;background:'+(active?'var(--color-primary-light)':'var(--gray-50)')+';border:1px solid '+(active?'var(--color-primary-border)':'transparent')+'" data-student-id="'+s.id+'">'+
        SMS_UI.avatarHtml(s.fullName)+'<div><div class="fw-600 fs-sm" style="color:'+(active?'var(--color-primary)':'var(--text-primary)')+'">'+SMS_UI.esc(s.fullName)+'</div><div class="fs-xs text-secondary">'+SMS_UI.esc(s.grade)+'</div></div></div>';
    }).join("")||(q?'<p class="text-secondary fs-sm text-center">No students found</p>':'');
    list.querySelectorAll("[data-student-id]").forEach(function(el){
      el.addEventListener("click",function(){selectedStudentId=el.getAttribute("data-student-id");renderStudentList(document.getElementById("rc-search").value,allStudents);showReportCard(allStudents.find(function(s){return s.id===selectedStudentId;}));});
    });
  }
  function showReportCard(student) {
    if (!student) return;
    var myAverages = allAverages.filter(function(a){return a.studentId===student.id;});
    var view = document.getElementById("rc-view");
    var overallGpa = myAverages.length ? (myAverages.reduce(function(sum,a){return sum+a.average;},0)/myAverages.length).toFixed(1) : null;
    view.innerHTML = [
      '<div class="card-header" style="flex-direction:column;align-items:flex-start">',
      '<div style="display:flex;align-items:center;justify-content:space-between;width:100%">'+
      '<div style="display:flex;align-items:center;gap:12px">'+SMS_UI.avatarHtml(student.fullName,"lg")+'<div><div class="fw-700" style="font-size:1rem">'+SMS_UI.esc(student.fullName)+'</div><div class="fs-sm text-secondary">'+SMS_UI.esc(student.grade)+' · Semester 1 · 2026-2027</div></div></div>'+
      '<button class="btn btn-secondary btn-sm" onclick="window.print()"><i class="fa-solid fa-print"></i>Print</button></div>',
      '</div>',
      '<div class="card-body">',
      overallGpa ? '<div style="text-align:center;padding:16px;background:var(--color-primary-light);border-radius:10px;margin-bottom:16px"><div class="fs-xs text-secondary fw-600">OVERALL AVERAGE</div><div style="font-size:2.5rem;font-weight:800;color:var(--color-primary)">'+overallGpa+'%</div><div class="fw-700 '+SMS_UI.gradeClass(SMS_UI.percentToGrade(parseFloat(overallGpa)))+'">'+SMS_UI.percentToGrade(parseFloat(overallGpa))+'</div></div>' : '',
      myAverages.length
        ? SMS_UI.buildTable({columns:[
            {label:"Subject",render:function(a){var c=allClasses.find(function(x){return x.id===a.classId;});return '<div class="fw-600">'+(c?SMS_UI.esc(c.name):a.classId)+'</div><div class="fs-xs text-secondary">'+(c?SMS_UI.esc(c.teacherName||""):"")+'</div>';}},
            {label:"Average",render:function(a){return '<span class="fw-700 '+SMS_UI.gradeClass(a.letterGrade)+'">'+a.average+'%</span>';}},
            {label:"Grade",render:function(a){return '<span class="fw-700 '+SMS_UI.gradeClass(a.letterGrade)+'" style="font-size:1.1rem">'+SMS_UI.esc(a.letterGrade)+'</span>';}}
          ],rows:myAverages})
        : SMS_UI.emptyState({icon:"fa-file-lines",title:"No grades recorded yet"}),
      '</div>'
    ].join("");

    document.getElementById("export-rc-btn").addEventListener("click", function(){ exportReportCsv(student, myAverages); });
    document.getElementById("print-rc-btn").addEventListener("click", function(){ printReport(student, myAverages, overallGpa); });
  }

  function exportReportCsv(student, averages) {
    var rows = [["Student","Grade","School Year","Course","Teacher","Average","Letter Grade"]];
    averages.forEach(function(a){
      var c = allClasses.find(function(x){return x.id===a.classId;}) || {};
      rows.push([student.fullName,student.grade,"2026-2027",c.name||a.classId,c.teacherName||"",a.average,a.letterGrade]);
    });
    var csv = rows.map(function(row){return row.map(function(v){return '"'+String(v==null?"":v).replace(/"/g,'""')+'"';}).join(",");}).join("\r\n");
    var blob = new Blob([csv],{type:"text/csv;charset=utf-8"});
    var url = URL.createObjectURL(blob);
    var a=document.createElement("a");a.href=url;a.download=student.fullName.replace(/[^a-z0-9]+/gi,"-").toLowerCase()+"-report-card-2026-2027.csv";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
    SMS_UI.toast("Report exported","CSV downloaded for "+student.fullName+".","success");
  }

  function printReport(student, averages, overallGpa) {
    var school = SMS_SCHOOLS.find(function(s){return s.id===student.schoolId;}) || {};
    var branch = SMS_BRANCHES.find(function(b){return b.id===student.branchId;}) || {};
    var courseRows = averages.length ? averages.map(function(a){
      var c=allClasses.find(function(x){return x.id===a.classId;})||{};
      return '<tr><td>'+SMS_UI.esc(c.name||a.classId)+'</td><td>'+SMS_UI.esc(c.teacherName||"")+'</td><td style="text-align:center">'+a.average+'%</td><td style="text-align:center;font-weight:700">'+SMS_UI.esc(a.letterGrade)+'</td></tr>';
    }).join("") : '<tr><td colspan="4" style="text-align:center;color:#64748b">No grades recorded yet.</td></tr>';
    var html='<!doctype html><html><head><title>Report Card - '+SMS_UI.esc(student.fullName)+'</title><style>body{font-family:Arial,sans-serif;color:#172033;max-width:800px;margin:36px auto;padding:0 28px}.header{display:flex;justify-content:space-between;gap:20px;border-bottom:3px solid #172033;padding-bottom:18px}.school{font-size:24px;font-weight:800}.muted{color:#64748b;font-size:13px}.student{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:24px 0;padding:16px;border:1px solid #dbe2ea;border-radius:10px}.label{font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.05em}.value{font-size:14px;font-weight:700;margin-top:4px}.overall{text-align:center;padding:16px;background:#eff6ff;border-radius:10px;margin-bottom:20px}.overall strong{font-size:32px}table{width:100%;border-collapse:collapse}th,td{padding:11px;border-bottom:1px solid #e5e7eb;text-align:left;font-size:13px}th{font-size:11px;text-transform:uppercase;color:#64748b}.footer{text-align:center;color:#64748b;font-size:10px;margin-top:30px}@media print{body{margin:0}}</style></head><body>'+
      '<div class="header"><div><div class="school">'+SMS_UI.esc(school.name||"School")+'</div><div class="muted">'+SMS_UI.esc(branch.name||"")+'</div></div><div style="text-align:right"><strong>REPORT CARD</strong><div class="muted">Semester 1 · 2026-2027</div></div></div>'+
      '<div class="student"><div><div class="label">Student</div><div class="value">'+SMS_UI.esc(student.fullName)+'</div></div><div><div class="label">Grade</div><div class="value">'+SMS_UI.esc(student.grade)+'</div></div><div><div class="label">Student ID</div><div class="value">'+SMS_UI.esc(student.id)+'</div></div></div>'+
      (overallGpa?'<div class="overall"><div class="label">Overall Average</div><strong>'+overallGpa+'%</strong><div>'+SMS_UI.esc(SMS_UI.percentToGrade(parseFloat(overallGpa)))+'</div></div>':'')+
      '<table><thead><tr><th>Course</th><th>Teacher</th><th style="text-align:center">Average</th><th style="text-align:center">Grade</th></tr></thead><tbody>'+courseRows+'</tbody></table>'+
      '<div class="footer">Generated '+new Date().toLocaleDateString()+' · School Management System frontend demo</div><script>window.onload=function(){window.print()}<\/script></body></html>';
    var win=window.open("","_blank","width=850,height=950");
    if(!win){SMS_UI.toast("Pop-up blocked","Allow pop-ups to print the report card.","error");return;}
    win.document.open();win.document.write(html);win.document.close();
  }
})();
