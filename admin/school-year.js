SMS_ADMIN_LAYOUT.init("school-year");
(function() {
  "use strict";

  var schoolId = SMS_AUTH.getSchoolId();
  var allYears = [];
  var currentYear = null;
  var enrollments = [];
  var archives = [];
  var students = [];
  var classes = [];
  var wizard = null;

  function load() {
    return Promise.all([
      SMS_API.getSchoolYears(schoolId),
      SMS_API.getCurrentSchoolYear(schoolId),
      SMS_API.getEnrollments({schoolId: schoolId}),
      SMS_API.getYearArchives(schoolId),
      SMS_API.getStudents(null),
      SMS_API.getClasses(null)
    ]).then(function(res) {
      allYears = res[0] || [];
      currentYear = res[1] || null;
      enrollments = res[2] || [];
      archives = res[3] || [];
      students = (res[4] || []).filter(function(s){ return s.schoolId === schoolId; });
      classes = (res[5] || []).filter(function(c){ return c.schoolId === schoolId; });
    });
  }

  function renderPage() {
    var content = document.getElementById("page-content");
    var activeEnrollments = currentYear ? enrollments.filter(function(e){ return e.schoolYearId === currentYear.id && e.status === "Enrolled"; }) : [];
    var activeClasses = currentYear ? classes.filter(function(c){ return !c.schoolYearId || c.schoolYearId === currentYear.id; }) : [];

    content.innerHTML =
      SMS_UI.pageHeader({
        title:"School Years",
        subtitle:"Close, archive, and roll your school forward without losing historical records.",
        breadcrumb:["Administration","School Years"],
        actions:[
          {label:"Demo Backup",icon:"fa-download",id:"backup-btn"},
          {label:"Start Next School Year",icon:"fa-arrow-right",id:"rollover-btn",primary:true}
        ]
      }) +
      '<div class="sy-notice"><i class="fa-solid fa-database"></i><div><strong>Frontend demo mode</strong><span>Changes are saved in this browser until Supabase replaces the demo storage.</span></div></div>' +
      renderCurrentYear(activeEnrollments, activeClasses) +
      '<div class="sy-grid">' + renderHistory() + renderArchivePanel() + '</div>';

    var backup = document.getElementById("backup-btn");
    if (backup) backup.addEventListener("click", function(){ SMS_DEMO_STORE.downloadBackup(); });
    var rollover = document.getElementById("rollover-btn");
    if (rollover) rollover.addEventListener("click", openRolloverWizard);
    var close = document.getElementById("close-current-btn");
    if (close) close.addEventListener("click", closeCurrentYearOnly);

    document.querySelectorAll("[data-export-archive]").forEach(function(btn){
      btn.addEventListener("click", function(){ exportArchive(btn.getAttribute("data-export-archive")); });
    });
  }

  function renderCurrentYear(activeEnrollments, activeClasses) {
    if (!currentYear) {
      return '<div class="card sy-current-card"><div class="card-body">' +
        '<div class="sy-empty-current"><div class="sy-icon"><i class="fa-solid fa-calendar-plus"></i></div><div><h3>No active school year</h3><p>Your previous year is archived. Start the next school year when you are ready.</p></div></div>' +
        '</div></div>';
    }
    var pct = yearProgress(currentYear.startDate, currentYear.endDate);
    var activeStudents = activeEnrollments.length || students.filter(function(s){return s.status === "Active";}).length;
    var twelfth = students.filter(function(s){return s.status === "Active" && Number(s.gradeId) === 15;}).length;
    return '<div class="card sy-current-card" data-aos="fade-up"><div class="card-body">' +
      '<div class="sy-current-top"><div><div class="sy-kicker">CURRENT SCHOOL YEAR</div><div class="sy-current-name">'+SMS_UI.esc(currentYear.name)+' '+SMS_UI.badge("Active","success")+'</div><div class="sy-dates">'+SMS_UI.fmtDate(currentYear.startDate)+' — '+SMS_UI.fmtDate(currentYear.endDate)+'</div></div>' +
      '<button class="btn btn-secondary" id="close-current-btn"><i class="fa-solid fa-box-archive"></i> Close Year Only</button></div>' +
      '<div class="sy-progress"><div class="sy-progress-head"><span>School year progress</span><strong>'+pct+'%</strong></div><div class="sy-progress-track"><span style="width:'+pct+'%"></span></div></div>' +
      '<div class="sy-metrics">' +
        metric("fa-user-graduate",activeStudents,"Current enrollments","blue") +
        metric("fa-book-open",activeClasses.length,"Classes","purple") +
        metric("fa-graduation-cap",twelfth,"Potential graduates","green") +
        metric("fa-box-archive",archives.length,"Archived years","orange") +
      '</div>' +
      '<div class="sy-tip"><i class="fa-solid fa-lightbulb"></i><div><strong>Recommended:</strong> use <b>Start Next School Year</b>. It closes this year, saves an archive, and lets you decide student-by-student who returns, repeats, graduates, leaves, or is skipped for later.</div></div>' +
      '</div></div>';
  }

  function metric(icon, value, label, color) {
    return '<div class="sy-metric"><div class="sy-metric-icon '+color+'"><i class="fa-solid '+icon+'"></i></div><div><strong>'+value+'</strong><span>'+SMS_UI.esc(label)+'</span></div></div>';
  }

  function renderHistory() {
    var rows = allYears.map(function(y){
      var yEnroll = enrollments.filter(function(e){return e.schoolYearId === y.id;}).length;
      var status = y.isCurrent ? SMS_UI.badge("Current","success") : y.status === "closed" ? SMS_UI.badge("Closed","gray") : SMS_UI.badge("Planned","info");
      return '<div class="sy-history-row"><div class="sy-history-mark '+(y.isCurrent?'active':'')+'"><i class="fa-solid '+(y.isCurrent?'fa-calendar-check':'fa-box-archive')+'"></i></div><div class="sy-history-main"><div class="sy-history-title">'+SMS_UI.esc(y.name)+' '+status+'</div><div class="sy-history-meta">'+SMS_UI.fmtDate(y.startDate)+' — '+SMS_UI.fmtDate(y.endDate)+' · '+yEnroll+' enrollment'+(yEnroll===1?'':'s')+'</div></div></div>';
    }).join("");
    return '<div class="card"><div class="card-header"><div><div class="card-title">School Year History</div><div class="text-secondary fs-sm">Current, planned, and closed academic years</div></div></div><div class="card-body"><div class="sy-history">'+(rows || '<div class="text-secondary fs-sm">No school years yet.</div>')+'</div></div></div>';
  }

  function renderArchivePanel() {
    var list = archives.slice(0,5).map(function(a){
      var s=a.summary||{};
      return '<div class="sy-archive-item"><div><div class="fw-700">'+SMS_UI.esc(a.schoolYearName)+'</div><div class="fs-xs text-secondary">Closed '+SMS_UI.fmtDateTime(a.closedAt)+' · '+(s.students||0)+' students · '+(s.graduates||0)+' graduates · '+(s.notReturning||0)+' not returning</div></div><button class="btn btn-sm btn-secondary" data-export-archive="'+SMS_UI.esc(a.id)+'"><i class="fa-solid fa-download"></i> Export</button></div>';
    }).join("");
    return '<div class="card"><div class="card-header"><div><div class="card-title">Archived Year Snapshots</div><div class="text-secondary fs-sm">Closed years stay available for reporting and audit history</div></div></div><div class="card-body"><div class="sy-archive-list">'+(list || '<div class="text-secondary fs-sm">No archived years yet.</div>')+'</div></div></div>';
  }

  function yearProgress(start, end) {
    var s = new Date(start).getTime(), e = new Date(end).getTime(), n = Date.now();
    if (!s || !e || e <= s) return 0;
    return Math.max(0,Math.min(100,Math.round(((n-s)/(e-s))*100)));
  }

  function nextYearDefaults() {
    var baseStart = currentYear ? parseInt(String(currentYear.name).match(/\d{4}/)?.[0] || "2026",10) + 1 : 2027;
    if (!isFinite(baseStart)) baseStart = 2027;
    return {
      name: baseStart+"-"+(baseStart+1),
      startDate: baseStart+"-08-16",
      endDate: (baseStart+1)+"-06-02",
      sem1Start: baseStart+"-08-16",
      sem1End: baseStart+"-12-17",
      sem2Start: (baseStart+1)+"-01-04",
      sem2End: (baseStart+1)+"-06-02"
    };
  }

  function openRolloverWizard() {
    var source = currentYear || allYears[0];
    if (!source) { SMS_UI.toast("Create a school year first","There is no year to roll forward from.","warning"); return; }
    var defaults = nextYearDefaults();
    var eligible = students.filter(function(s){ return s.status !== "Graduated" && s.status !== "Inactive" && s.status !== "Withdrawn"; });
    wizard = {
      step:1, source:source, defaults:defaults, copyClasses:true, archiveNotes:"",
      decisions:eligible.map(function(s){
        var isGraduate = Number(s.gradeId) === 15;
        return { studentId:s.id, action:isGraduate?"graduate":"promote", nextGradeId:isGraduate?15:Math.min(15,Number(s.gradeId||1)+1) };
      })
    };
    renderWizard();
  }

  function renderWizard() {
    if (!wizard) return;
    var steps='<div class="sy-wizard-steps"><div class="'+(wizard.step>=1?'active':'')+'"><span>1</span>Year setup</div><div class="'+(wizard.step>=2?'active':'')+'"><span>2</span>Student rollover</div><div class="'+(wizard.step>=3?'active':'')+'"><span>3</span>Review</div></div>';
    var body = wizard.step===1 ? wizardSetupHtml() : wizard.step===2 ? wizardRosterHtml() : wizardReviewHtml();
    var footer='<div class="dialog-footer">'+(wizard.step>1?'<button class="btn btn-secondary" id="wizard-back"><i class="fa-solid fa-arrow-left"></i> Back</button>':'<button class="btn btn-secondary" data-close-dialog>Cancel</button>')+'<div style="flex:1"></div>'+(wizard.step<3?'<button class="btn btn-primary" id="wizard-next">Continue <i class="fa-solid fa-arrow-right"></i></button>':'<button class="btn btn-primary" id="wizard-finish"><i class="fa-solid fa-check"></i> Close & Start New Year</button>')+'</div>';
    SMS_UI.openDialog('<div class="dialog-header"><div><div class="dialog-title">Start Next School Year</div><div class="dialog-subtitle">Archive '+SMS_UI.esc(wizard.source.name)+' and prepare the next academic year.</div></div><button class="dialog-close" data-close-dialog><i class="fa-solid fa-xmark"></i></button></div>'+steps+'<div class="dialog-body sy-wizard-body">'+body+'</div>'+footer,{xl:true});
    wireWizard();
  }

  function wizardSetupHtml() {
    var d=wizard.defaults;
    return '<div class="sy-callout"><i class="fa-solid fa-shield-heart"></i><div><strong>No student history is deleted.</strong><span>The old year becomes read-only in the archive. Student profiles remain available even if a family does not return.</span></div></div>'+
      '<div class="form-grid"><div class="form-group"><label class="form-label">New school year name *</label><input class="input" id="wy-name" value="'+SMS_UI.esc(d.name)+'"></div><div class="form-group"><label class="form-label">Copy class structure</label><label class="sy-check"><input type="checkbox" id="wy-copy" '+(wizard.copyClasses?'checked':'')+'><span>Copy classes & teacher assignments with empty rosters</span></label></div></div>'+
      '<div class="form-grid"><div class="form-group"><label class="form-label">School year starts *</label><input class="input" type="date" id="wy-start" value="'+d.startDate+'"></div><div class="form-group"><label class="form-label">School year ends *</label><input class="input" type="date" id="wy-end" value="'+d.endDate+'"></div></div>'+
      '<div class="sy-semester-grid"><div class="sy-semester-box"><strong>Semester 1</strong><div class="form-grid"><input class="input" type="date" id="wy-s1s" value="'+d.sem1Start+'"><input class="input" type="date" id="wy-s1e" value="'+d.sem1End+'"></div></div><div class="sy-semester-box"><strong>Semester 2</strong><div class="form-grid"><input class="input" type="date" id="wy-s2s" value="'+d.sem2Start+'"><input class="input" type="date" id="wy-s2e" value="'+d.sem2End+'"></div></div></div>'+
      '<div class="form-group"><label class="form-label">Archive note <span class="text-secondary">(optional)</span></label><textarea class="input" id="wy-notes" rows="3" placeholder="Example: Final grades approved and tuition reconciliation completed.">'+SMS_UI.esc(wizard.archiveNotes)+'</textarea></div>';
  }

  function wizardRosterHtml() {
    var counts=countDecisions();
    var cards='<div class="sy-decision-stats">'+decisionStat(counts.promote+counts.retain,"Returning","success")+decisionStat(counts.graduate,"Graduating","info")+decisionStat(counts.not_returning,"Not returning","danger")+decisionStat(counts.skip,"Skipped","warning")+'</div>';
    var rows=wizard.decisions.map(function(d){
      var s=students.find(function(x){return x.id===d.studentId;}); if(!s)return '';
      return '<tr data-student="'+s.id+'"><td><div class="fw-700">'+SMS_UI.esc(s.fullName)+'</div><div class="fs-xs text-secondary">'+SMS_UI.esc(SMS_BRANCHES.find(function(b){return b.id===s.branchId;})?.name||'')+'</div></td><td>'+SMS_UI.esc(s.grade)+'</td><td><select class="input sy-action" data-id="'+s.id+'"><option value="promote" '+sel(d.action,'promote')+'>Return & promote</option><option value="retain" '+sel(d.action,'retain')+'>Return & repeat grade</option><option value="graduate" '+sel(d.action,'graduate')+'>Graduate / complete program</option><option value="not_returning" '+sel(d.action,'not_returning')+'>Not returning</option><option value="skip" '+sel(d.action,'skip')+'>Skip — decide later</option></select></td><td>'+gradeSelect(s,d)+'</td></tr>';
    }).join('');
    return cards+'<div class="sy-roster-toolbar"><div><strong>Student rollover roster</strong><div class="fs-xs text-secondary">Nothing is permanently deleted. “Not returning” makes the profile inactive while preserving history.</div></div><div class="sy-bulk"><button class="btn btn-sm btn-secondary" id="bulk-promote">Promote all</button><button class="btn btn-sm btn-secondary" id="bulk-skip">Skip all</button></div></div><div class="table-wrap sy-roster-table"><table><thead><tr><th>Student</th><th>Current grade</th><th>Next-year decision</th><th>Next grade</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
  }

  function gradeSelect(student,d) {
    var disabled = ['graduate','not_returning','skip'].indexOf(d.action)!==-1 ? ' disabled' : '';
    var options=SMS_GRADES.map(function(g){ return '<option value="'+g.id+'" '+(Number(d.nextGradeId)===Number(g.id)?'selected':'')+'>'+SMS_UI.esc(g.name)+'</option>';}).join('');
    return '<select class="input sy-grade" data-id="'+student.id+'"'+disabled+'>'+options+'</select>';
  }
  function sel(a,b){return a===b?'selected':'';}
  function decisionStat(v,label,type){return '<div class="sy-decision-stat '+type+'"><strong>'+v+'</strong><span>'+label+'</span></div>';}

  function wizardReviewHtml() {
    var c=countDecisions();
    var d=wizard.defaults;
    return '<div class="sy-review-hero"><div class="sy-review-icon"><i class="fa-solid fa-calendar-check"></i></div><div><h3>'+SMS_UI.esc(d.name)+'</h3><p>'+SMS_UI.fmtDate(d.startDate)+' — '+SMS_UI.fmtDate(d.endDate)+'</p></div></div>'+
      '<div class="sy-review-grid">'+reviewItem(c.promote,'Promoted')+reviewItem(c.retain,'Repeating grade')+reviewItem(c.graduate,'Graduating')+reviewItem(c.not_returning,'Not returning')+reviewItem(c.skip,'Skipped for later')+reviewItem(wizard.copyClasses?'Yes':'No','Copy classes')+'</div>'+
      (c.skip?'<div class="sy-warning"><i class="fa-solid fa-triangle-exclamation"></i><div><strong>'+c.skip+' student'+(c.skip===1?'':'s')+' will be skipped.</strong><span>They will not be enrolled in the new year yet. You can enroll them manually later.</span></div></div>':'')+
      '<div class="sy-final-check"><i class="fa-solid fa-box-archive"></i><div><strong>'+SMS_UI.esc(wizard.source.name)+' will be closed and archived.</strong><span>Grades, attendance, billing history, and past enrollment records remain in the archived year.</span></div></div>';
  }
  function reviewItem(v,l){return '<div><strong>'+v+'</strong><span>'+l+'</span></div>';}

  function wireWizard() {
    var back=document.getElementById('wizard-back'); if(back)back.addEventListener('click',function(){wizard.step--;renderWizard();});
    var next=document.getElementById('wizard-next'); if(next)next.addEventListener('click',function(){ if(wizard.step===1 && !captureSetup())return; wizard.step++; renderWizard(); });
    var finish=document.getElementById('wizard-finish'); if(finish)finish.addEventListener('click',finishRollover);
    if(wizard.step===1){
      ['wy-name','wy-start','wy-end','wy-s1s','wy-s1e','wy-s2s','wy-s2e','wy-notes'].forEach(function(id){var el=document.getElementById(id);if(el)el.addEventListener('input',captureSetupSilent);});
      var copy=document.getElementById('wy-copy');if(copy)copy.addEventListener('change',captureSetupSilent);
    }
    if(wizard.step===2){
      document.querySelectorAll('.sy-action').forEach(function(el){el.addEventListener('change',function(){var d=findDecision(el.dataset.id);var s=students.find(function(x){return x.id===el.dataset.id;});d.action=el.value;if(el.value==='retain')d.nextGradeId=s.gradeId;if(el.value==='promote')d.nextGradeId=Math.min(15,Number(s.gradeId)+1);renderWizard();});});
      document.querySelectorAll('.sy-grade').forEach(function(el){el.addEventListener('change',function(){findDecision(el.dataset.id).nextGradeId=Number(el.value);});});
      document.getElementById('bulk-promote').addEventListener('click',function(){wizard.decisions.forEach(function(d){var s=students.find(function(x){return x.id===d.studentId;});d.action=Number(s.gradeId)===15?'graduate':'promote';d.nextGradeId=Math.min(15,Number(s.gradeId)+1);});renderWizard();});
      document.getElementById('bulk-skip').addEventListener('click',function(){wizard.decisions.forEach(function(d){d.action='skip';});renderWizard();});
    }
  }

  function captureSetupSilent(){captureSetup(true);}
  function captureSetup(silent){
    var name=document.getElementById('wy-name')?.value.trim(); var start=document.getElementById('wy-start')?.value; var end=document.getElementById('wy-end')?.value;
    if(!silent && (!name||!start||!end)){SMS_UI.toast('Missing school-year details','Name, start date, and end date are required.','error');return false;}
    if(!silent && new Date(end)<=new Date(start)){SMS_UI.toast('Check the dates','The school year end date must be after the start date.','error');return false;}
    wizard.defaults={name:name||wizard.defaults.name,startDate:start||wizard.defaults.startDate,endDate:end||wizard.defaults.endDate,sem1Start:document.getElementById('wy-s1s')?.value||wizard.defaults.sem1Start,sem1End:document.getElementById('wy-s1e')?.value||wizard.defaults.sem1End,sem2Start:document.getElementById('wy-s2s')?.value||wizard.defaults.sem2Start,sem2End:document.getElementById('wy-s2e')?.value||wizard.defaults.sem2End};
    wizard.copyClasses=!!document.getElementById('wy-copy')?.checked; wizard.archiveNotes=document.getElementById('wy-notes')?.value||''; return true;
  }

  function findDecision(id){return wizard.decisions.find(function(d){return d.studentId===id;});}
  function countDecisions(){var c={promote:0,retain:0,graduate:0,not_returning:0,skip:0};wizard.decisions.forEach(function(d){c[d.action]=(c[d.action]||0)+1;});return c;}

  function finishRollover(){
    var btn=document.getElementById('wizard-finish'); if(btn){btn.disabled=true;btn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Processing…';}
    var d=wizard.defaults;
    SMS_API.rolloverSchoolYear({sourceYearId:wizard.source.id,name:d.name,startDate:d.startDate,endDate:d.endDate,semesters:[{name:'Semester 1',start:d.sem1Start,end:d.sem1End},{name:'Semester 2',start:d.sem2Start,end:d.sem2End}],copyClasses:wizard.copyClasses,archiveNotes:wizard.archiveNotes,closedBy:SMS_AUTH.getCurrentUser()?.displayName||'School Administrator',decisions:wizard.decisions}).then(function(result){
      if(!result.success){SMS_UI.toast('Could not start the year',result.error||'Please try again.','error');if(btn)btn.disabled=false;return;}
      SMS_UI.closeDialog(); SMS_UI.toast('New school year started',result.newYear.name+' is now active. '+result.counts.returning+' students promoted.','success');
      load().then(renderPage);
    });
  }

  function closeCurrentYearOnly(){
    if(!currentYear)return;
    SMS_UI.confirm('Close '+currentYear.name+'?','This archives the current year without automatically starting a new one. Student records are preserved.','Close School Year',function(){
      SMS_API.closeSchoolYear(currentYear.id,{closedBy:SMS_AUTH.getCurrentUser()?.displayName||'School Administrator'}).then(function(r){if(r.success){SMS_UI.toast('School year archived',currentYear.name+' is now closed.','success');load().then(renderPage);}});
    });
  }

  function exportArchive(id){
    var archive=archives.find(function(a){return a.id===id;}); if(!archive)return;
    var payload={archive:archive,schoolYear:allYears.find(function(y){return y.id===archive.schoolYearId;})||null,enrollments:enrollments.filter(function(e){return e.schoolYearId===archive.schoolYearId;}),students:students};
    SMS_DEMO_STORE.download('school-year-'+String(archive.schoolYearName).replace(/\s+/g,'-')+'-archive.json',JSON.stringify(payload,null,2));
  }

  load().then(renderPage);
})();
