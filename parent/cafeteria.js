SMS_PARENT_LAYOUT.init("cafeteria");
(function() {
  SMS_API.getLunchMenu().then(function(menu) {
    document.getElementById("page-content").innerHTML =
      SMS_UI.pageHeader({title:"Cafeteria",subtitle:"This week's lunch menu — week of "+SMS_UI.esc(menu.weekOf),breadcrumb:["Parent Portal","Cafeteria"]})+
      '<div class="grid-3" style="gap:16px">'+
      menu.menu.map(function(day){
        return '<div class="card"><div class="card-header"><div><div class="card-title">'+SMS_UI.esc(day.day)+'</div><div class="card-subtitle">'+SMS_UI.esc(day.date)+'</div></div>'+SMS_UI.badge("$"+day.price.replace("$",""),"gray")+'</div>'+
          '<div class="card-body" style="display:flex;flex-direction:column;gap:8px;font-size:.875rem">'+
          '<div><span class="text-secondary fw-600">Main: </span><span class="fw-600">'+SMS_UI.esc(day.mainDish)+'</span></div>'+
          '<div><span class="text-secondary">Sides: </span>'+SMS_UI.esc((day.sides||[]).join(", "))+'</div>'+
          '<div><span class="text-secondary">Dessert: </span>'+SMS_UI.esc(day.dessert)+'</div>'+
          (day.isHalal?'<div style="margin-top:4px">'+SMS_UI.badge("✓ Halal Certified","success")+'</div>':'')+
          '</div></div>';
      }).join("")+'</div>';
  });
})();
