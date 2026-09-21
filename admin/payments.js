SMS_ADMIN_LAYOUT.init("payments");
(function() {
  "use strict";
  var branchId = SMS_AUTH.getBranchId();
  var allStudents = [], allExpenses = [];
  var searchVal = "", statusFilter = "all";

  function load() {
    return Promise.all([SMS_API.getStudents(branchId), SMS_API.getExpenses(branchId)]).then(function(res) {
      allStudents = res[0];
      var sids = new Set(allStudents.map(function(s){ return s.id; }));
      allExpenses = res[1].filter(function(e){ return sids.has(e.studentId); });
    });
  }

  function studentName(id) {
    var s = allStudents.find(function(x){ return x.id === id; });
    return s ? s.fullName : id;
  }
  function getStudent(id) { return allStudents.find(function(x){ return x.id === id; }) || {}; }
  function esc(v) { return SMS_UI.esc(v == null ? "" : String(v)); }

  load().then(renderPage);

  function renderPage() {
    var totalBilled = allExpenses.reduce(function(sum,e){ return sum + Number(e.amount || 0); },0);
    var totalPaid   = allExpenses.reduce(function(sum,e){ return sum + Number(e.paid || 0); },0);
    var totalOut    = allExpenses.reduce(function(sum,e){ return sum + Number(e.balance || 0); },0);

    document.getElementById("page-content").innerHTML =
      SMS_UI.pageHeader({ title: "Payments & Billing", subtitle: "Track charges, payment history, and printable receipts", breadcrumb: ["Administration", "Payments"],
        actions: [{ label: "Add Charge", icon: "fa-plus", id: "add-charge-btn", primary: true }] }) +
      '<div class="stats-grid" style="margin-bottom:20px">'+
      SMS_UI.statCard({ label: "Total Billed", value: SMS_UI.fmtMoney(totalBilled), icon: "fa-file-invoice-dollar", color: "blue" })+
      SMS_UI.statCard({ label: "Collected", value: SMS_UI.fmtMoney(totalPaid), icon: "fa-circle-check", color: "green" })+
      SMS_UI.statCard({ label: "Outstanding", value: SMS_UI.fmtMoney(totalOut), icon: "fa-hourglass-half", color: totalOut>0?"yellow":"green" })+
      '</div>'+
      '<div class="card" style="margin-bottom:20px"><div class="card-body"><div class="filter-bar">'+
      '<div class="input-with-icon" style="flex:1"><i class="fa-solid fa-search icon"></i><input class="input" id="pay-search" placeholder="Search by student or description…"></div>'+
      '<select class="input" id="pay-status" style="max-width:180px"><option value="all">All Statuses</option><option value="Unpaid">Unpaid</option><option value="Partial">Partial</option><option value="Paid">Paid</option></select>'+
      '</div></div></div>'+
      '<div id="payments-list"></div>'+
      '<div class="card" style="margin-top:18px"><div class="card-body" style="display:flex;gap:12px;align-items:flex-start">'+
      '<i class="fa-solid fa-circle-info" style="margin-top:2px;color:var(--color-primary)"></i><div><div class="fw-600">Frontend billing demo</div><div class="text-secondary" style="font-size:.8rem;line-height:1.5;margin-top:2px">Recorded payments and receipts persist in this browser. Online card/ACH processing, reconciled transactions, emailed receipts, and webhook verification will be connected during the Supabase/payment-provider backend phase.</div></div></div></div>';

    document.getElementById("add-charge-btn").addEventListener("click", openAddCharge);
    document.getElementById("pay-search").addEventListener("input", function() { searchVal = this.value; renderList(); });
    document.getElementById("pay-status").addEventListener("change", function() { statusFilter = this.value; renderList(); });
    renderList();
  }

  function renderList() {
    var filtered = allExpenses.filter(function(e) {
      var haystack = (studentName(e.studentId)+" "+e.description).toLowerCase();
      return haystack.includes(searchVal.toLowerCase()) && (statusFilter === "all" || e.status === statusFilter);
    });
    var cols = [
      { label: "Student", render: function(e) { return '<div class="fw-600">'+esc(studentName(e.studentId))+'</div>'; }},
      { label: "Description", render: function(e) { return esc(e.description); }},
      { label: "Amount", render: function(e) { return SMS_UI.fmtMoney(e.amount); }},
      { label: "Paid", render: function(e) { return SMS_UI.fmtMoney(e.paid); }},
      { label: "Balance", render: function(e) { return e.balance>0 ? '<span class="fw-700 text-danger">'+SMS_UI.fmtMoney(e.balance)+'</span>' : '<span class="text-success fw-600">$0.00</span>'; }},
      { label: "Due", render: function(e) { return SMS_UI.fmtDate(e.dueDate); }},
      { label: "Status", render: function(e) { return SMS_UI.statusBadge(e.status); }},
      { label: "", render: function(e) {
        var html = '<div style="display:flex;gap:6px;justify-content:flex-end">';
        html += '<button class="btn btn-sm btn-secondary" data-statement="'+e.id+'"><i class="fa-solid fa-receipt"></i> Details</button>';
        if (e.balance > 0) html += '<button class="btn btn-sm btn-primary" data-record-pay="'+e.id+'">Record Payment</button>';
        html += '<button class="btn btn-sm btn-ghost btn-icon" data-del-exp="'+e.id+'" title="Delete charge"><i class="fa-solid fa-trash" style="font-size:.75rem;color:var(--color-danger)"></i></button>';
        return html + '</div>';
      }}
    ];
    var wrap = document.getElementById("payments-list");
    wrap.innerHTML = SMS_UI.buildTable({ columns: cols, rows: filtered, emptyTitle: "No charges found" });
    wrap.querySelectorAll("[data-record-pay]").forEach(function(btn) {
      btn.addEventListener("click", function(e) { e.stopPropagation(); openRecordPayment(findExpense(btn.getAttribute("data-record-pay"))); });
    });
    wrap.querySelectorAll("[data-statement]").forEach(function(btn) {
      btn.addEventListener("click", function(e) { e.stopPropagation(); openStatement(findExpense(btn.getAttribute("data-statement"))); });
    });
    wrap.querySelectorAll("[data-del-exp]").forEach(function(btn) {
      btn.addEventListener("click", function(e) {
        e.stopPropagation();
        var expense = findExpense(btn.getAttribute("data-del-exp"));
        if (expense && expense.paid > 0) {
          SMS_UI.toast("Cannot delete paid charge", "Keep paid charges for billing history. Create an adjustment in the production billing system instead.", "error");
          return;
        }
        if (!confirm("Delete this unpaid charge?")) return;
        SMS_API.deleteExpense(btn.getAttribute("data-del-exp")).then(function() {
          SMS_UI.toast("Charge deleted", "", "success");
          load().then(function(){ renderPage(); });
        });
      });
    });
  }

  function findExpense(id) { return allExpenses.find(function(x){ return x.id === id; }); }

  function openRecordPayment(expense) {
    if (!expense) return;
    SMS_UI.openDialog([
      '<div class="dialog-header"><div><div class="dialog-title">Record Payment</div><div class="dialog-subtitle">'+esc(studentName(expense.studentId))+' — '+esc(expense.description)+'</div></div><button class="dialog-close" data-close-dialog><i class="fa-solid fa-xmark"></i></button></div>',
      '<div class="dialog-body">',
      '<div style="display:flex;flex-direction:column;gap:8px;padding:14px;background:var(--gray-50);border-radius:10px;margin-bottom:16px">',
      '<div style="display:flex;justify-content:space-between"><span class="text-secondary">Total Amount</span><span class="fw-700">'+SMS_UI.fmtMoney(expense.amount)+'</span></div>',
      '<div style="display:flex;justify-content:space-between"><span class="text-secondary">Already Paid</span><span class="fw-700">'+SMS_UI.fmtMoney(expense.paid)+'</span></div>',
      '<div style="display:flex;justify-content:space-between"><span class="text-secondary">Balance Due</span><span class="fw-700 text-danger">'+SMS_UI.fmtMoney(expense.balance)+'</span></div>',
      '</div>',
      '<div class="form-grid"><div class="form-group"><label class="form-label">Payment Amount *</label><input class="input" type="number" id="pay-amount" min="0.01" max="'+expense.balance+'" step="0.01" value="'+expense.balance+'"></div>',
      '<div class="form-group"><label class="form-label">Payment Date *</label><input class="input" type="date" id="pay-date" value="'+new Date().toISOString().slice(0,10)+'"></div></div>',
      '<div class="form-grid"><div class="form-group"><label class="form-label">Method</label><select class="input" id="pay-method"><option>Cash</option><option>Check</option><option>Card</option><option>ACH / Bank</option><option>Other</option></select></div>',
      '<div class="form-group"><label class="form-label">Reference</label><input class="input" id="pay-reference" placeholder="Check #, confirmation #, etc."></div></div>',
      '<div class="form-group"><label class="form-label">Internal Note</label><textarea class="input" id="pay-note" rows="2" placeholder="Optional note"></textarea></div>',
      '</div>',
      '<div class="dialog-footer"><button class="btn btn-secondary" data-close-dialog>Cancel</button><button class="btn btn-primary" id="confirm-pay-btn"><i class="fa-solid fa-check"></i>Record & Create Receipt</button></div>'
    ].join(""));

    document.getElementById("confirm-pay-btn").addEventListener("click", function() {
      var amount = parseFloat(document.getElementById("pay-amount").value);
      var date = document.getElementById("pay-date").value;
      if (!amount || amount <= 0 || amount > expense.balance) { SMS_UI.toast("Invalid amount", "Enter an amount no greater than the balance due.", "error"); return; }
      if (!date) { SMS_UI.toast("Payment date required", "", "error"); return; }
      var meta = {
        date: date,
        method: document.getElementById("pay-method").value,
        reference: document.getElementById("pay-reference").value.trim(),
        note: document.getElementById("pay-note").value.trim(),
        recordedBy: SMS_AUTH.getCurrentUser().displayName
      };
      SMS_API.recordPayment(expense.id, amount, meta).then(function(r) {
        if (!r.success) { SMS_UI.toast("Could not record payment", r.message || "Try again.", "error"); return; }
        SMS_API.addAuditEntry({ userId: SMS_AUTH.getCurrentUser().id, userName: SMS_AUTH.getCurrentUser().displayName, action: "PAYMENT_RECORDED", resource: "Expense", resourceId: expense.id, details: "Payment of "+SMS_UI.fmtMoney(amount)+" for "+studentName(expense.studentId), branchId: branchId });
        SMS_UI.closeDialog();
        SMS_UI.toast("Payment recorded", "Receipt "+r.payment.receiptNumber+" created.", "success");
        load().then(function() {
          renderPage();
          openReceipt(findExpense(expense.id), r.payment);
        });
      });
    });
  }

  function openStatement(expense) {
    if (!expense) return;
    var payments = expense.payments || [];
    var rows = payments.length ? payments.map(function(p) {
      return '<tr><td>'+esc(p.receiptNumber)+'</td><td>'+esc(SMS_UI.fmtDate(p.date))+'</td><td>'+esc(p.method)+'</td><td>'+esc(p.reference||"—")+'</td><td style="text-align:right;font-weight:700">'+SMS_UI.fmtMoney(p.amount)+'</td><td><button class="btn btn-sm btn-secondary" data-receipt="'+esc(p.id)+'">Receipt</button></td></tr>';
    }).join("") : '<tr><td colspan="6" class="text-secondary" style="padding:18px;text-align:center">No itemized browser-demo payment records yet.</td></tr>';
    SMS_UI.openDialog([
      '<div class="dialog-header"><div><div class="dialog-title">Billing Details</div><div class="dialog-subtitle">'+esc(studentName(expense.studentId))+'</div></div><button class="dialog-close" data-close-dialog><i class="fa-solid fa-xmark"></i></button></div>',
      '<div class="dialog-body">',
      '<div style="padding:14px;border:1px solid var(--border);border-radius:10px;margin-bottom:16px"><div class="fw-700" style="font-size:1rem">'+esc(expense.description)+'</div><div class="text-secondary" style="font-size:.8rem;margin-top:3px">Due '+esc(SMS_UI.fmtDate(expense.dueDate))+'</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px"><div><div class="text-secondary" style="font-size:.72rem">BILLED</div><div class="fw-700">'+SMS_UI.fmtMoney(expense.amount)+'</div></div><div><div class="text-secondary" style="font-size:.72rem">PAID</div><div class="fw-700 text-success">'+SMS_UI.fmtMoney(expense.paid)+'</div></div><div><div class="text-secondary" style="font-size:.72rem">BALANCE</div><div class="fw-700 '+(expense.balance?'text-danger':'text-success')+'">'+SMS_UI.fmtMoney(expense.balance)+'</div></div></div></div>',
      '<div class="fw-700" style="margin-bottom:8px">Payment History</div>',
      '<div style="overflow:auto"><table class="table"><thead><tr><th>Receipt</th><th>Date</th><th>Method</th><th>Reference</th><th style="text-align:right">Amount</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>',
      expense.paid > 0 && !payments.length ? '<div style="margin-top:10px;font-size:.75rem;color:var(--text-secondary)">This charge contains payment totals from the original demo dataset, created before itemized receipt tracking was added.</div>' : '',
      '</div>',
      '<div class="dialog-footer"><button class="btn btn-secondary" data-close-dialog>Close</button><button class="btn btn-primary" id="print-statement"><i class="fa-solid fa-print"></i>Print Statement</button></div>'
    ].join(""), { size: "lg" });
    document.querySelectorAll("[data-receipt]").forEach(function(btn) {
      btn.addEventListener("click", function() {
        var payment = payments.find(function(p){ return p.id === btn.getAttribute("data-receipt"); });
        if (payment) openReceipt(expense, payment);
      });
    });
    document.getElementById("print-statement").addEventListener("click", function(){ printBillingDocument(expense, null); });
  }

  function openReceipt(expense, payment) {
    if (!expense || !payment) return;
    var school = SMS_SCHOOLS.find(function(s){ return s.id === expense.schoolId; }) || {};
    var branch = SMS_BRANCHES.find(function(b){ return b.id === expense.branchId; }) || {};
    SMS_UI.openDialog([
      '<div class="dialog-header"><div><div class="dialog-title">Payment Receipt</div><div class="dialog-subtitle">'+esc(payment.receiptNumber)+'</div></div><button class="dialog-close" data-close-dialog><i class="fa-solid fa-xmark"></i></button></div>',
      '<div class="dialog-body">',
      '<div style="text-align:center;padding:4px 0 18px"><div style="font-size:1.15rem;font-weight:800">'+esc(school.name || "School Management System")+'</div><div class="text-secondary" style="font-size:.8rem">'+esc(branch.name || "")+'</div></div>',
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:14px;background:var(--gray-50);border-radius:10px">',
      receiptField("Student", studentName(expense.studentId))+receiptField("Date", SMS_UI.fmtDate(payment.date))+receiptField("For", expense.description)+receiptField("Method", payment.method)+receiptField("Reference", payment.reference || "—")+receiptField("Recorded By", payment.recordedBy || "—"),
      '</div>',
      '<div style="display:flex;justify-content:space-between;align-items:center;padding:20px 2px 8px"><span class="fw-700">Payment received</span><span style="font-size:1.6rem;font-weight:800">'+SMS_UI.fmtMoney(payment.amount)+'</span></div>',
      '<div style="display:flex;justify-content:space-between;padding:8px 2px;border-top:1px solid var(--border)"><span class="text-secondary">Remaining balance</span><span class="fw-700">'+SMS_UI.fmtMoney(expense.balance)+'</span></div>',
      payment.note ? '<div style="margin-top:12px;padding:10px 12px;border:1px solid var(--border);border-radius:8px"><div class="text-secondary" style="font-size:.7rem;text-transform:uppercase">Note</div><div style="font-size:.82rem;margin-top:3px">'+esc(payment.note)+'</div></div>' : '',
      '</div>',
      '<div class="dialog-footer"><button class="btn btn-secondary" data-close-dialog>Close</button><button class="btn btn-primary" id="print-receipt"><i class="fa-solid fa-print"></i>Print Receipt</button></div>'
    ].join(""));
    document.getElementById("print-receipt").addEventListener("click", function(){ printBillingDocument(expense, payment); });
  }

  function receiptField(label, value) {
    return '<div><div class="text-secondary" style="font-size:.68rem;text-transform:uppercase;letter-spacing:.04em">'+esc(label)+'</div><div class="fw-600" style="font-size:.82rem;margin-top:3px">'+esc(value)+'</div></div>';
  }

  function printBillingDocument(expense, payment) {
    var school = SMS_SCHOOLS.find(function(s){ return s.id === expense.schoolId; }) || {};
    var branch = SMS_BRANCHES.find(function(b){ return b.id === expense.branchId; }) || {};
    var student = getStudent(expense.studentId);
    var isReceipt = !!payment;
    var history = (expense.payments || []).map(function(p) {
      return '<tr><td>'+esc(p.receiptNumber)+'</td><td>'+esc(SMS_UI.fmtDate(p.date))+'</td><td>'+esc(p.method)+'</td><td style="text-align:right">'+SMS_UI.fmtMoney(p.amount)+'</td></tr>';
    }).join("");
    var body = '<!doctype html><html><head><title>'+(isReceipt?'Receipt '+esc(payment.receiptNumber):'Billing Statement')+'</title><style>body{font-family:Arial,sans-serif;color:#172033;max-width:760px;margin:36px auto;padding:0 24px}h1{font-size:24px;margin:0}.muted{color:#64748b}.top{display:flex;justify-content:space-between;gap:20px;border-bottom:2px solid #172033;padding-bottom:18px}.box{margin-top:24px;border:1px solid #dbe2ea;border-radius:10px;padding:18px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.label{font-size:11px;color:#64748b;text-transform:uppercase}.value{font-size:14px;font-weight:600;margin-top:3px}.amount{font-size:30px;font-weight:800;text-align:right}table{width:100%;border-collapse:collapse;margin-top:14px}th,td{padding:9px;border-bottom:1px solid #e5e7eb;text-align:left;font-size:13px}th{font-size:11px;color:#64748b;text-transform:uppercase}.foot{font-size:11px;color:#64748b;margin-top:28px;text-align:center}@media print{body{margin:0}}</style></head><body>'+
      '<div class="top"><div><h1>'+esc(school.name || "School")+'</h1><div class="muted">'+esc(branch.name || "")+'</div><div class="muted">'+esc(branch.address || "")+'</div></div><div style="text-align:right"><strong>'+(isReceipt?'PAYMENT RECEIPT':'BILLING STATEMENT')+'</strong><div class="muted">'+(isReceipt?esc(payment.receiptNumber):esc(expense.id))+'</div></div></div>'+
      '<div class="box"><div class="grid"><div><div class="label">Student</div><div class="value">'+esc(student.fullName || studentName(expense.studentId))+'</div></div><div><div class="label">Charge</div><div class="value">'+esc(expense.description)+'</div></div><div><div class="label">Due Date</div><div class="value">'+esc(SMS_UI.fmtDate(expense.dueDate))+'</div></div><div><div class="label">Status</div><div class="value">'+esc(expense.status)+'</div></div></div></div>';
    if (isReceipt) {
      body += '<div class="box"><div class="grid"><div><div class="label">Payment Date</div><div class="value">'+esc(SMS_UI.fmtDate(payment.date))+'</div></div><div><div class="label">Method</div><div class="value">'+esc(payment.method)+'</div></div><div><div class="label">Reference</div><div class="value">'+esc(payment.reference || "—")+'</div></div><div><div class="label">Recorded By</div><div class="value">'+esc(payment.recordedBy || "—")+'</div></div></div><div class="amount">'+SMS_UI.fmtMoney(payment.amount)+'</div><div class="muted" style="text-align:right">Remaining balance: '+SMS_UI.fmtMoney(expense.balance)+'</div></div>';
    } else {
      body += '<div class="box"><div class="grid"><div><div class="label">Billed</div><div class="value">'+SMS_UI.fmtMoney(expense.amount)+'</div></div><div><div class="label">Paid</div><div class="value">'+SMS_UI.fmtMoney(expense.paid)+'</div></div><div><div class="label">Balance</div><div class="value">'+SMS_UI.fmtMoney(expense.balance)+'</div></div></div>'+(history?'<table><thead><tr><th>Receipt</th><th>Date</th><th>Method</th><th style="text-align:right">Amount</th></tr></thead><tbody>'+history+'</tbody></table>':'')+'</div>';
    }
    body += '<div class="foot">Generated by School Management System frontend demo · '+new Date().toLocaleString()+'</div><script>window.onload=function(){window.print()}<\/script></body></html>';
    var win = window.open("", "_blank", "width=820,height=900");
    if (!win) { SMS_UI.toast("Pop-up blocked", "Allow pop-ups to print the receipt.", "error"); return; }
    win.document.open(); win.document.write(body); win.document.close();
  }

  function openAddCharge() {
    var studentOptions = allStudents.filter(function(s){ return s.status !== "Inactive" && s.status !== "Graduated"; }).map(function(s) { return '<option value="'+s.id+'">'+esc(s.fullName)+' ('+esc(s.grade)+')</option>'; }).join("");
    SMS_UI.openDialog([
      '<div class="dialog-header"><div><div class="dialog-title">Add Charge</div><div class="dialog-subtitle">Bill a student for tuition, fees, or other charges</div></div><button class="dialog-close" data-close-dialog><i class="fa-solid fa-xmark"></i></button></div>',
      '<div class="dialog-body">',
      '<div class="form-group"><label class="form-label">Student *</label><select class="input" id="charge-student">'+studentOptions+'</select></div>',
      '<div class="form-group"><label class="form-label">Description *</label><input class="input" id="charge-desc" placeholder="e.g. Field Trip Fee"></div>',
      '<div class="form-grid"><div class="form-group"><label class="form-label">Amount *</label><input class="input" type="number" id="charge-amount" min="0.01" step="0.01" placeholder="0.00"></div><div class="form-group"><label class="form-label">Due Date</label><input class="input" type="date" id="charge-due"></div></div>',
      '<div class="form-group"><label class="form-label">Category</label><select class="input" id="charge-cat"><option value="Tuition">Tuition</option><option value="Fee">Fee</option><option value="Activity">Activity</option><option value="Other">Other</option></select></div>',
      '</div>',
      '<div class="dialog-footer"><button class="btn btn-secondary" data-close-dialog>Cancel</button><button class="btn btn-primary" id="save-charge-btn"><i class="fa-solid fa-plus"></i>Add Charge</button></div>'
    ].join(""));

    document.getElementById("save-charge-btn").addEventListener("click", function() {
      var studentId = document.getElementById("charge-student").value;
      var desc = document.getElementById("charge-desc").value.trim();
      var amount = parseFloat(document.getElementById("charge-amount").value);
      if (!studentId || !desc || !amount) { SMS_UI.toast("Missing fields", "Student, description, and amount are required.", "error"); return; }
      SMS_API.createExpense({ studentId: studentId, description: desc, amount: amount, dueDate: document.getElementById("charge-due").value, category: document.getElementById("charge-cat").value, branchId: branchId, schoolId: SMS_AUTH.getSchoolId(), payments: [] }).then(function(r) {
        if (r.success) {
          SMS_API.addAuditEntry({ userId: SMS_AUTH.getCurrentUser().id, userName: SMS_AUTH.getCurrentUser().displayName, action: "CHARGE_ADDED", resource: "Expense", resourceId: r.expense.id, details: "Charge added: "+desc+" ("+SMS_UI.fmtMoney(amount)+") for "+studentName(studentId), branchId: branchId });
          SMS_UI.closeDialog();
          SMS_UI.toast("Charge added", SMS_UI.fmtMoney(amount)+" billed.", "success");
          load().then(function(){ renderPage(); });
        }
      });
    });
  }
})();
