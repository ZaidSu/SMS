SMS_ADMIN_LAYOUT.init("communications");
(function() {
  var branchId = SMS_AUTH.getBranchId();
  var allParents = [], allTeachers = [], allStudents = [], recentMessages = [];

  Promise.all([
    SMS_API.getParents(branchId),
    SMS_API.getTeachers(branchId),
    SMS_API.getStudents(branchId),
    SMS_API.getMessages(SMS_AUTH.getCurrentUser().id)
  ]).then(function(res) {
    allParents    = res[0];
    allTeachers   = res[1];
    allStudents   = res[2];
    recentMessages = res[3].slice(0, 5);
    render();
  });

  function render() {
    document.getElementById("page-content").innerHTML =
      SMS_UI.pageHeader({ title:"Communications", subtitle:"Compose school messages and prepare audiences for email/SMS delivery", breadcrumb:["Administration","Communications"] }) +
      '<div class="grid-2" style="gap:20px">' +
      '<div class="card"><div class="card-header"><div class="card-title">Compose Message</div></div><div class="card-body" id="compose-area"></div></div>' +
      '<div class="card"><div class="card-header"><div class="card-title">Recent Messages</div></div><div class="card-body" id="messages-area"></div></div>' +
      '</div>';
    renderCompose();
    renderMessages();
  }

  function renderCompose() {
    var gradeOptions = SMS_GRADES.map(function(g) { return '<option value="grade_'+g.id+'">Grade: '+g.name+'</option>'; }).join("");
    document.getElementById("compose-area").innerHTML = [
      '<div class="form-group"><label class="form-label">To *</label><select class="input" id="msg-to">',
      '<option value="all_parents">All Parents ('+allParents.length+')</option>',
      '<option value="all_teachers">All Teachers ('+allTeachers.length+')</option>',
      '<option value="all">Everyone — parents + staff ('+( allParents.length + allTeachers.length )+')</option>',
      gradeOptions,
      '</select></div>',
      '<div class="form-group"><label class="form-label">Subject *</label><input class="input" id="msg-subject" placeholder="Message subject"></div>',
      '<div class="form-group"><label class="form-label">Message *</label><textarea class="input" id="msg-body" rows="6" placeholder="Type your message here…"></textarea></div>',
      '<div style="display:flex;justify-content:flex-end"><button class="btn btn-primary" id="send-msg-btn"><i class="fa-solid fa-paper-plane"></i>Send Message</button></div>'
    ].join("");

    document.getElementById("send-msg-btn").addEventListener("click", function() {
      var subject = document.getElementById("msg-subject").value.trim();
      var body    = document.getElementById("msg-body").value.trim();
      var toVal   = document.getElementById("msg-to").value;
      if (!subject || !body) { SMS_UI.toast("Missing fields","Subject and message are required.","error"); return; }
      var countMap = { all_parents: allParents.length, all_teachers: allTeachers.length, all: allParents.length + allTeachers.length };
      var targetName = { all_parents:"All Parents", all_teachers:"All Teachers", all:"Everyone" }[toVal] || "Grade Audience";
      var count = countMap[toVal];
      if (toVal.indexOf("grade_") === 0) {
        var gradeId = Number(toVal.replace("grade_", ""));
        var studentIds = allStudents.filter(function(s){ return Number(s.gradeId) === gradeId; }).map(function(s){ return s.id; });
        count = allParents.filter(function(p){ return (p.childrenIds || []).some(function(id){ return studentIds.indexOf(id) !== -1; }); }).length;
        var grade = SMS_GRADES.find(function(g){ return Number(g.id) === gradeId; });
        targetName = grade ? grade.name + " Families" : "Grade Families";
      }
      count = count || 0;
      var user  = SMS_AUTH.getCurrentUser();
      SMS_API.sendMessage({
        fromUserId:user.id, fromName:user.displayName, toUserId:"AUDIENCE:"+toVal, toName:targetName,
        subject:subject, body:body, branchId:branchId, schoolId:SMS_AUTH.getSchoolId(), audience:toVal, recipientCount:count, deliveryStatus:"Demo Saved"
      }).then(function(r){
        SMS_API.addAuditEntry({ userId:user.id, userName:user.displayName, action:"MESSAGE_QUEUED", resource:"Communication", resourceId:r.message.id, details:'Saved "'+subject+'" for '+count+' recipient'+(count!==1?"s":""), branchId:branchId });
        recentMessages.unshift(r.message);
        recentMessages = recentMessages.slice(0,5);
        renderMessages();
        SMS_UI.toast("Message saved", '"'+subject+'" saved for '+count+' recipient'+(count!==1?"s":"")+". Delivery will be connected in the backend phase.", "success");
        document.getElementById("msg-subject").value = "";
        document.getElementById("msg-body").value = "";
      });
    });
  }

  function renderMessages() {
    var area = document.getElementById("messages-area");
    if (!recentMessages.length) {
      area.innerHTML = SMS_UI.emptyState({ icon:"fa-envelope", title:"No messages yet" });
      return;
    }
    var user = SMS_AUTH.getCurrentUser();
    area.innerHTML = '<div style="display:flex;flex-direction:column;gap:8px">' +
      recentMessages.map(function(m) {
        var isFrom = m.fromUserId === user.id;
        return '<div style="padding:12px;background:var(--gray-50);border-radius:8px;border-left:3px solid '+(m.read?"var(--border-color)":"var(--color-primary)")+'">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">' +
          '<div class="fw-600 fs-sm">'+SMS_UI.esc(m.subject)+'</div>'+(!m.read&&!isFrom?SMS_UI.badge("Unread","primary"):'')+'</div>'+
          '<div class="fs-xs text-secondary">'+(isFrom?'To: '+SMS_UI.esc(m.toName):'From: '+SMS_UI.esc(m.fromName))+' · '+SMS_UI.fmtDateTime(m.date)+'</div>'+
          '<div class="text-secondary fs-sm truncate" style="margin-top:4px">'+SMS_UI.esc(m.body)+'</div></div>';
      }).join("") + '</div>';
  }
})();
