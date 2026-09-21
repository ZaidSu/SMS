SMS_PARENT_LAYOUT.init("photos");
(function() {
  var child = SMS_PARENT_LAYOUT.getSelectedChild();
  SMS_API.getPhotoAlbums(child?child.branchId:null).then(function(albums) {
    document.getElementById("page-content").innerHTML =
      SMS_UI.pageHeader({title:"Photos",subtitle:"School photo albums and memories",breadcrumb:["Parent Portal","Photos"]})+
      '<div class="grid-3" style="gap:16px">'+
      (albums.length ? albums.map(function(a){
        return '<div class="card" style="overflow:hidden"><div style="height:120px;background:'+a.coverColor+';display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-images" style="font-size:3rem;color:rgba(255,255,255,.6)"></i></div>'+
          '<div class="card-body"><div class="fw-700">'+SMS_UI.esc(a.title)+'</div>'+
          '<div class="fs-sm text-secondary">'+SMS_UI.fmtDate(a.date)+'</div>'+
          '<div class="fs-xs text-muted">'+a.photoCount+' photos</div>'+
          '<button class="btn btn-sm btn-secondary view-album-btn" style="margin-top:10px;width:100%"><i class="fa-solid fa-images"></i>View Album</button>'+
          '</div></div>';
      }).join("") : '<div style="grid-column:1/-1"><div class="card"><div class="card-body">'+SMS_UI.emptyState({icon:"fa-images",title:"No photo albums yet"})+'</div></div></div>')+
      '</div>';
    document.querySelectorAll(".view-album-btn").forEach(function(btn){
      btn.addEventListener("click",function(){SMS_UI.toast("View Album","Album preview requires backend integration.","info");});
    });
  });
})();
