SMS_PARENT_LAYOUT.init("messages");
(function() {
  var user = SMS_AUTH.getCurrentUser();
  var child = SMS_PARENT_LAYOUT.getSelectedChild();
  SMS_API.getMessages(user.id).then(function(messages) {
    document.getElementById("page-content").innerHTML =
      SMS_UI.pageHeader({title:"Messages",subtitle:"Communicate with teachers and administration",breadcrumb:["Parent Portal","Messages"],
        actions:[{label:"New Message",icon:"fa-pen",id:"new-msg-btn",primary:true}]})+
      '<div id="msgs-list" style="display:flex;flex-direction:column;gap:10px"></div>';
    document.getElementById("new-msg-btn").addEventListener("click",function(){
      SMS_UI.openDialog([
        '<div class="dialog-header"><div><div class="dialog-title">Send Message</div></div><button class="dialog-close" data-close-dialog><i class="fa-solid fa-xmark"></i></button></div>',
        '<div class="dialog-body">',
        '<div class="form-group"><label class="form-label">To</label><select class="input" id="msg-to"><option value="">Select recipient</option>'+SMS_TEACHERS.filter(function(t){return t.branchId===(child&&child.branchId);}).map(function(t){return '<option value="'+t.id+'">'+SMS_UI.esc(t.fullName)+'</option>';}).join("")+'</select></div>',
        '<div class="form-group"><label class="form-label">Subject</label><input class="input" id="msg-subj"></div>',
        '<div class="form-group"><label class="form-label">Message</label><textarea class="input" id="msg-body" rows="5"></textarea></div>',
        '</div>',
        '<div class="dialog-footer"><button class="btn btn-secondary" data-close-dialog>Cancel</button><button class="btn btn-primary" id="send-btn"><i class="fa-solid fa-paper-plane"></i>Send</button></div>'
      ].join(""));
      document.getElementById("send-btn").addEventListener("click",function(){
        var to=document.getElementById("msg-to").value;
        var subj=document.getElementById("msg-subj").value.trim();
        var body=document.getElementById("msg-body").value.trim();
        if(!to||!subj||!body){SMS_UI.toast("Missing fields","Please fill in all fields.","error");return;}
        var teacher=SMS_TEACHERS.find(function(t){return t.id===to;});
        SMS_API.sendMessage({fromUserId:user.id,fromName:user.displayName,toUserId:to,toName:teacher?teacher.fullName:"",subject:subj,body:body,branchId:child?child.branchId:null}).then(function(r){
          if(r.success){SMS_UI.closeDialog();SMS_UI.toast("Message sent","","success");location.reload();}
        });
      });
    });
    document.getElementById("msgs-list").innerHTML = messages.length ? messages.map(function(m){
      var isFrom=m.fromUserId===user.id;
      return '<div class="card" style="border-left:3px solid '+(m.read?"var(--border-color)":"var(--color-primary)")+'">' +
        '<div class="card-body"><div style="display:flex;align-items:flex-start;justify-content:space-between"><div><div class="fw-600 fs-sm">'+SMS_UI.esc(m.subject)+'</div>'+
        '<div class="fs-xs text-secondary">'+(isFrom?'To: '+SMS_UI.esc(m.toName):'From: '+SMS_UI.esc(m.fromName))+' · '+SMS_UI.fmtDateTime(m.date)+'</div></div>'+(!m.read&&!isFrom?SMS_UI.badge("New","primary"):'')+'</div>'+
        '<div class="text-secondary fs-sm" style="margin-top:6px">'+SMS_UI.esc(m.body)+'</div></div></div>';
    }).join("") : '<div class="card"><div class="card-body">'+SMS_UI.emptyState({icon:"fa-envelope",title:"No messages yet"})+'</div></div>';
  });
})();
