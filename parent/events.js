SMS_PARENT_LAYOUT.init("events");
(function() {
  var child = SMS_PARENT_LAYOUT.getSelectedChild();
  SMS_API.getEvents(child?child.branchId:null).then(function(events) {
    var upcoming=events.filter(function(e){return new Date(e.startDate)>=new Date();}).sort(function(a,b){return new Date(a.startDate)-new Date(b.startDate);});
    var past=events.filter(function(e){return new Date(e.startDate)<new Date();});
    var typeColors={PTC:"blue",Academic:"teal",Holiday:"warning",Fundraiser:"green","Field Trip":"warning"};
    function renderEvents(list) {
      return list.map(function(ev, i){
        var d=new Date(ev.startDate);
        return '<div class="card"><div class="card-body" style="display:flex;align-items:center;gap:16px">'+
          '<div style="width:52px;height:52px;background:var(--color-primary-light);border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0"><span style="font-size:.55rem;font-weight:700;text-transform:uppercase;color:var(--color-primary)">'+d.toLocaleString("default",{month:"short"})+'</span><span style="font-size:1.25rem;font-weight:800;color:var(--color-primary);line-height:1">'+d.getDate()+'</span></div>'+
          '<div style="flex:1"><div class="fw-600">'+SMS_UI.esc(ev.title)+'</div>'+
          '<div class="text-secondary fs-sm">'+SMS_UI.esc(ev.description||"")+'</div>'+
          '<div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap">'+SMS_UI.badge(ev.type,typeColors[ev.type]||"gray")+(ev.location?'<span class="fs-xs text-secondary"><i class="fa-solid fa-location-dot" style="margin-right:3px"></i>'+SMS_UI.esc(ev.location)+'</span>':'')+'</div></div>'+
          (ev.requiresRegistration?'<button class="btn btn-sm btn-primary" data-register-ev="'+SMS_UI.esc(ev.title)+'"><i class="fa-solid fa-check"></i>Register</button>':'')+
          '</div></div>';
      }).join("");
    }
    document.getElementById("page-content").innerHTML =
      SMS_UI.pageHeader({title:"Events",subtitle:"School events and activities",breadcrumb:["Parent Portal","Events"]})+
      (upcoming.length?'<div class="fw-700 fs-sm" style="margin-bottom:12px;color:var(--text-secondary)">UPCOMING</div><div style="display:flex;flex-direction:column;gap:10px;margin-bottom:24px">'+renderEvents(upcoming)+'</div>':'')+
      (past.length?'<div class="fw-700 fs-sm" style="margin-bottom:12px;color:var(--text-secondary)">PAST</div><div style="display:flex;flex-direction:column;gap:10px;opacity:.7">'+renderEvents(past)+'</div>':'')+
      (!events.length?'<div class="card"><div class="card-body">'+SMS_UI.emptyState({icon:"fa-calendar",title:"No events scheduled"})+'</div></div>':'');
    document.querySelectorAll("[data-register-ev]").forEach(function(btn){
      btn.addEventListener("click",function(){SMS_UI.toast("Registered!","You have registered for "+btn.getAttribute("data-register-ev"),"success");});
    });
  });
})();
