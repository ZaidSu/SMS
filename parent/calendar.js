SMS_PARENT_LAYOUT.init("calendar");
(function() {
  var child = SMS_PARENT_LAYOUT.getSelectedChild();
  SMS_API.getEvents(child?child.branchId:null).then(function(events) {
    var sorted = events.sort(function(a,b){return new Date(a.startDate)-new Date(b.startDate);});
    var months = {};
    sorted.forEach(function(ev){var m=new Date(ev.startDate).toLocaleString("default",{month:"long",year:"numeric"});months[m]=(months[m]||[]).concat([ev]);});
    document.getElementById("page-content").innerHTML =
      SMS_UI.pageHeader({title:"Calendar",subtitle:"School events and important dates",breadcrumb:["Parent Portal","Calendar"]})+
      Object.keys(months).map(function(month){
        return '<div style="margin-bottom:24px"><div class="fw-700" style="font-size:1.1rem;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid var(--border-color)">'+SMS_UI.esc(month)+'</div>'+
          '<div style="display:flex;flex-direction:column;gap:8px">'+months[month].map(function(ev){
            var d=new Date(ev.startDate);
            var typeColors={PTC:"blue",Academic:"teal",Holiday:"yellow",Fundraiser:"green","Field Trip":"yellow"};
            return '<div class="card"><div class="card-body" style="display:flex;align-items:center;gap:16px">'+
              '<div style="width:52px;height:52px;background:var(--color-primary-light);border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0">'+
              '<span style="font-size:.55rem;font-weight:700;text-transform:uppercase;color:var(--color-primary)">'+d.toLocaleString("default",{month:"short"})+'</span>'+
              '<span style="font-size:1.25rem;font-weight:800;color:var(--color-primary);line-height:1">'+d.getDate()+'</span></div>'+
              '<div><div class="fw-600">'+SMS_UI.esc(ev.title)+'</div>'+
              '<div class="text-secondary fs-sm">'+SMS_UI.esc(ev.description||"")+'</div>'+
              '<div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap">'+SMS_UI.badge(ev.type,typeColors[ev.type]||"gray")+(ev.location?'<span class="fs-xs text-secondary"><i class="fa-solid fa-location-dot" style="margin-right:3px"></i>'+SMS_UI.esc(ev.location)+'</span>':'')+(ev.requiresRegistration?SMS_UI.badge("Registration required","info"):'')+'</div>'+
              '</div></div></div>';
          }).join("")+'</div>';
      }).join("")||('<div class="card"><div class="card-body">'+SMS_UI.emptyState({icon:"fa-calendar",title:"No events scheduled"})+'</div></div>');
  });
})();
