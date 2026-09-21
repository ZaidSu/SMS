if (SMS_TEACHER_LAYOUT.init("gradebook")) {
(function() {
  var myClasses = SMS_TEACHER_LAYOUT.getMyClasses();
  var branchId = SMS_AUTH.getBranchId();
  var canManageGrades = SMS_AUTH.hasTeacherPermission("grades.manage");
  var canManageAssignments = SMS_AUTH.hasTeacherPermission("assignments.manage");
  var selectedClassIdx = 0;
  SMS_API.getStudents(branchId).then(function(allStudents) {
    var classOptions = myClasses.map(function(c,i){return '<option value="'+i+'">'+SMS_UI.esc(c.name)+'</option>';}).join("");
    document.getElementById("page-content").innerHTML =
      SMS_UI.pageHeader({title:"Gradebook",subtitle:canManageGrades?"Enter and manage grades for your classes":"View grades for your classes",breadcrumb:["Teacher","Gradebook"]})+
      (!canManageGrades?'<div class="alert alert-info" style="margin-bottom:16px"><i class="fa-solid fa-eye"></i><span>Gradebook access is <strong>View only</strong>. Your principal can enable grade editing from Staff Permissions.</span></div>':'')+
      '<div class="card" style="margin-bottom:20px"><div class="card-body"><div class="filter-bar"><div class="form-group" style="flex:1;min-width:200px;margin-bottom:0"><label class="form-label fs-xs">Class</label><select class="input" id="cls-pick">'+classOptions+'</select></div></div></div></div>'+
      '<div id="gradebook-content"></div>';
    if (!myClasses.length) { document.getElementById("gradebook-content").innerHTML='<div class="card"><div class="card-body">'+SMS_UI.emptyState({icon:"fa-file-pen",title:"No classes assigned"})+'</div></div>'; return; }
    function renderGradebook() {
      var cls = myClasses[selectedClassIdx];
      var roster = allStudents.filter(function(s){return (cls.studentIds||[]).includes(s.id);});
      Promise.all([SMS_API.getAssignments(cls.id),SMS_API.getGrades({classId:cls.id})]).then(function(res){
        var assignments=res[0]; var gradeRecords=res[1];
        document.getElementById("gradebook-content").innerHTML =
          '<div class="card"><div class="card-header"><div class="card-title">'+SMS_UI.esc(cls.name)+'</div>'+(canManageAssignments?'<button class="btn btn-sm btn-primary" id="add-asn-btn"><i class="fa-solid fa-plus"></i>Add Assignment</button>':'')+'</div>'+
          '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse">'+
          '<thead><tr style="border-bottom:2px solid var(--border-color);background:var(--gray-50)">'+
          '<th style="padding:10px 16px;text-align:left;font-size:.75rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.05em;white-space:nowrap">Student</th>'+
          assignments.map(function(a){return '<th style="padding:10px 12px;text-align:center;font-size:.75rem;font-weight:700;color:var(--text-secondary);min-width:90px"><div class="truncate" style="max-width:90px" title="'+SMS_UI.esc(a.title)+'">'+SMS_UI.esc(a.title)+'</div><div style="font-size:.65rem;color:var(--text-muted);font-weight:400">'+a.totalPoints+'pts</div></th>';}).join("")+
          '</tr></thead><tbody>'+
          roster.map(function(s){
            return '<tr style="border-bottom:1px solid var(--border-color)"><td style="padding:10px 16px"><div style="display:flex;align-items:center;gap:8px">'+SMS_UI.avatarHtml(s.fullName)+'<span class="fw-600 fs-sm">'+SMS_UI.esc(s.fullName)+'</span></div></td>'+
            assignments.map(function(a){
              var rec=gradeRecords.find(function(g){return g.studentId===s.id&&g.assignmentId===a.id;});
              var pct=rec?Math.round(rec.score/a.totalPoints*100):null;
              return '<td style="padding:8px 12px;text-align:center">'+
                '<input type="number" min="0" max="'+a.totalPoints+'" placeholder="—" value="'+(rec?rec.score:"")+'" data-stu="'+s.id+'" data-asn="'+a.id+'" data-tot="'+a.totalPoints+'" '+(canManageGrades?'':'disabled')+' style="width:70px;text-align:center;border:1px solid var(--border-color);border-radius:6px;padding:4px;font-size:.875rem;font-weight:600;color:'+(pct!==null?SMS_UI.gradeClass(SMS_UI.percentToGrade(pct)).replace("grade-","var(--color-")+")":'var(--text-primary)')+'">'+
                '</td>';
            }).join("")+'</tr>';
          }).join("")+
          '</tbody></table></div></div>';
        var addBtn = document.getElementById("add-asn-btn");
        if (addBtn && canManageAssignments) addBtn.addEventListener("click",function(){ openAddAssignment(cls); });
        var timer;
        if (canManageGrades) document.querySelectorAll("input[data-stu][data-asn]").forEach(function(input){
          input.addEventListener("change",function(){
            clearTimeout(timer);
            timer=setTimeout(function(){
              var score=parseFloat(input.value);
              var tot=parseInt(input.getAttribute("data-tot"));
              if (isNaN(score)||score<0||score>tot) return;
              var pct=Math.round(score/tot*100);
              SMS_API.saveGrade({studentId:input.getAttribute("data-stu"),assignmentId:input.getAttribute("data-asn"),classId:cls.id,score:score,totalPoints:tot,letterGrade:SMS_UI.percentToGrade(pct),branchId:branchId}).then(function(){
                input.style.color=SMS_UI.gradeClass(SMS_UI.percentToGrade(pct)).replace("grade-","var(--color-")+")";
                SMS_UI.toast("Grade saved","","success");
              });
            },600);
          });
        });
      });
    }
    function openAddAssignment(cls) {
      if (!canManageAssignments) return;
      SMS_UI.openDialog([
        '<div class="dialog-header"><div><div class="dialog-title">Add Assignment</div><div class="dialog-subtitle">'+SMS_UI.esc(cls.name)+'</div></div><button class="dialog-close" data-close-dialog><i class="fa-solid fa-xmark"></i></button></div>',
        '<div class="dialog-body">',
        '<div class="form-group"><label class="form-label">Title *</label><input class="input" id="asn-title"></div>',
        '<div class="form-grid"><div class="form-group"><label class="form-label">Type</label><select class="input" id="asn-type"><option>Homework</option><option>Quiz</option><option>Exam</option><option>Project</option><option>Classwork</option></select></div><div class="form-group"><label class="form-label">Total Points</label><input class="input" type="number" id="asn-pts" value="100" min="1"></div></div>',
        '<div class="form-group"><label class="form-label">Due Date</label><input class="input" type="date" id="asn-due"></div>',
        '</div>',
        '<div class="dialog-footer"><button class="btn btn-secondary" data-close-dialog>Cancel</button><button class="btn btn-primary" id="save-asn-btn"><i class="fa-solid fa-plus"></i>Add</button></div>'
      ].join(""));
      document.getElementById("save-asn-btn").addEventListener("click",function(){
        var title=document.getElementById("asn-title").value.trim();
        if(!title){SMS_UI.toast("Title required","","error");return;}
        SMS_API.createAssignment({title:title,classId:cls.id,subject:cls.subject,type:document.getElementById("asn-type").value,totalPoints:parseInt(document.getElementById("asn-pts").value)||100,dueDate:document.getElementById("asn-due").value,branchId:branchId}).then(function(r){
          if(r.success){SMS_UI.closeDialog();SMS_UI.toast("Assignment added","","success");renderGradebook();}
        });
      });
    }
    document.getElementById("cls-pick").addEventListener("change",function(){selectedClassIdx=parseInt(this.value);renderGradebook();});
    renderGradebook();
  });
})();
}
