SMS_PARENT_LAYOUT.init("expenses");
(function() {
  var child = SMS_PARENT_LAYOUT.getSelectedChild();
  if (!child) { document.getElementById("page-content").innerHTML='<div class="card"><div class="card-body">'+SMS_UI.emptyState({icon:"fa-child",title:"No child selected"})+'</div></div>'; return; }
  SMS_API.getExpenses(child.branchId).then(function(allExpenses) {
    var myExpenses=allExpenses.filter(function(e){return e.studentId===child.id;});
    var totalBilled=myExpenses.reduce(function(s,e){return s+e.amount;},0);
    var totalPaid=myExpenses.reduce(function(s,e){return s+e.paid;},0);
    var totalBalance=myExpenses.reduce(function(s,e){return s+e.balance;},0);
    document.getElementById("page-content").innerHTML=[
      SMS_UI.pageHeader({title:"Expenses",subtitle:SMS_UI.esc(child.fullName)+"'s account and payment history",breadcrumb:["Parent Portal","Expenses"]}),
      '<div class="stats-grid" style="margin-bottom:20px">',
      SMS_UI.statCard({label:"Total Billed",value:SMS_UI.fmtMoney(totalBilled),icon:"fa-file-invoice-dollar",color:"blue"}),
      SMS_UI.statCard({label:"Paid",value:SMS_UI.fmtMoney(totalPaid),icon:"fa-circle-check",color:"green"}),
      SMS_UI.statCard({label:"Balance Due",value:SMS_UI.fmtMoney(totalBalance),icon:"fa-hourglass-half",color:totalBalance>0?"yellow":"green"}),
      '</div>',
      totalBalance>0?'<div class="alert alert-warning" style="margin-bottom:16px"><i class="fa-solid fa-triangle-exclamation"></i><span>You have an outstanding balance of <strong>'+SMS_UI.fmtMoney(totalBalance)+'</strong>. Please contact the school office to make a payment.</span></div>':'',
      SMS_UI.buildTable({columns:[
        {label:"Description",render:function(e){return '<div class="fw-600">'+SMS_UI.esc(e.description)+'</div><div class="fs-xs text-secondary">'+SMS_UI.esc(e.category||"")+'</div>';}},
        {label:"Amount",render:function(e){return SMS_UI.fmtMoney(e.amount);}},
        {label:"Paid",render:function(e){return SMS_UI.fmtMoney(e.paid);}},
        {label:"Balance",render:function(e){return e.balance>0?'<span class="fw-700 text-danger">'+SMS_UI.fmtMoney(e.balance)+'</span>':'<span class="text-success fw-600">$0.00</span>';}},
        {label:"Due Date",render:function(e){return SMS_UI.fmtDate(e.dueDate);}},
        {label:"Status",render:function(e){return SMS_UI.statusBadge(e.status);}}
      ],rows:myExpenses,emptyTitle:"No charges on record"})
    ].join("");
  });
})();
