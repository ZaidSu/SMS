// =============================================================
// SCHOOL MANAGEMENT SYSTEM — Shared UI Helpers
// Dialogs, toasts, table builder, form helpers.
// Available globally as SMS_UI.*
// =============================================================
var SMS_UI = (function() {

  // ---- Initials helper (forwarded from auth) ----
  function initials(name) { return SMS_AUTH.initials(name); }

  // ---- Toast ----
  var toastRoot = null;
  function ensureToastRoot() {
    if (!toastRoot) { toastRoot = document.getElementById("toast-root"); }
    if (!toastRoot) { toastRoot = document.createElement("div"); toastRoot.id = "toast-root"; document.body.appendChild(toastRoot); }
    return toastRoot;
  }

  function toast(title, message, type) {
    var root = ensureToastRoot();
    var icons = { success: "fa-circle-check", error: "fa-circle-xmark", info: "fa-circle-info", warning: "fa-triangle-exclamation" };
    var div = document.createElement("div");
    div.className = "toast toast-" + (type || "info");
    div.innerHTML = '<i class="fa-solid ' + (icons[type] || "fa-circle-info") + ' toast-icon"></i>' +
      '<div><div class="toast-title">' + esc(title) + '</div>' +
      (message ? '<div class="toast-msg">' + esc(message) + '</div>' : '') + '</div>' +
      '<button class="toast-close" aria-label="Dismiss">×</button>';
    root.appendChild(div);
    var closeBtn = div.querySelector('.toast-close');
    if (closeBtn) closeBtn.addEventListener('click', function() { if (div.parentNode) div.remove(); });
    setTimeout(function() { if (div.parentNode) { div.style.opacity = "0"; div.style.transition = "opacity 0.3s"; setTimeout(function() { div.remove(); }, 320); } }, 3800);
  }

  // ---- Dialog ----
  var dialogOverlay = null;

  function openDialog(contentHtml, opts) {
    opts = opts || {};
    closeDialog();
    var sizeClass = opts.xl ? "dialog-xl" : opts.lg ? "dialog-lg" : "";
    var overlay = document.createElement("div");
    overlay.className = "dialog-overlay";
    overlay.id = "sms-dialog";
    overlay.innerHTML = '<div class="dialog ' + sizeClass + '">' + contentHtml + '</div>';
    overlay.addEventListener("click", function(e) { if (e.target === overlay) closeDialog(); });
    overlay.querySelectorAll("[data-close-dialog]").forEach(function(btn) { btn.addEventListener("click", closeDialog); });
    document.body.appendChild(overlay);
    requestAnimationFrame(function() { overlay.classList.add("open"); });
    dialogOverlay = overlay;
  
  // AOS-aware render helper — call this instead of el.innerHTML = html
  function render(elOrId, html) {
    var el = typeof elOrId === "string" ? document.getElementById(elOrId) : elOrId;
    if (!el) return;
    el.innerHTML = html;
    if (typeof AOS !== "undefined") {
      requestAnimationFrame(function() { AOS.refresh(); });
    }
  }

  return { el: overlay, close: closeDialog };
  }

  function closeDialog() {
    var existing = document.getElementById("sms-dialog");
    if (existing) {
      existing.classList.remove("open");
      setTimeout(function() { if (existing.parentNode) existing.remove(); }, 220);
    }
    dialogOverlay = null;
  }

  function closeAllDialogs() { closeDialog(); }

  // ---- Table builder ----
  function buildTable(opts) {
    // opts: { columns: [{key, label, render, className}], rows: [], emptyTitle, emptyMessage, clickable }
    if (!opts.rows || !opts.rows.length) {
      return '<div class="table-empty"><i class="fa-solid ' + (opts.emptyIcon || "fa-inbox") + '"></i>' +
        '<p>' + esc(opts.emptyTitle || "No records found") + '</p>' +
        '<span>' + esc(opts.emptyMessage || "") + '</span></div>';
    }
    var html = '<div class="table-wrap"><table><thead><tr>';
    opts.columns.forEach(function(col) {
      html += '<th>' + esc(col.label || "") + '</th>';
    });
    html += '</tr></thead><tbody>';
    opts.rows.forEach(function(row, i) {
      var rowClass = "clickable" + (opts.clickable !== false ? "" : "");
      html += '<tr class="' + rowClass + '" data-row-index="' + i + '">';
      opts.columns.forEach(function(col) {
        var cellClass = col.className || "";
        var val = col.render ? col.render(row, i) : (esc(row[col.key] || ""));
        html += '<td class="' + cellClass + '">' + val + '</td>';
      });
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    return html;
  }

  // Wire row clicks after inserting table HTML
  function wireTableClicks(container, rows, callback) {
    container.querySelectorAll("tr[data-row-index]").forEach(function(tr) {
      tr.addEventListener("click", function() {
        callback(rows[parseInt(tr.getAttribute("data-row-index"))]);
      });
    });
  }

  // ---- Status badge helper ----
  function badge(text, type) {
    var classMap = { success: "badge-success", danger: "badge-danger", warning: "badge-warning", info: "badge-info", primary: "badge-primary", gray: "badge-gray", outline: "badge-outline" };
    return '<span class="badge ' + (classMap[type] || "badge-gray") + '">' + esc(text || "") + '</span>';
  }

  function statusBadge(status) {
    var map = {
      "Active": "success", "Enrolled": "success", "Paid": "success", "Present": "success",
      "Inactive": "gray", "Withdrawn": "gray", "Graduated": "gray",
      "Partial": "warning", "Tardy": "warning", "Pending": "warning",
      "Unpaid": "danger", "Absent": "danger", "Overdue": "danger",
      "Excused": "info"
    };
    return badge(status, map[status] || "gray");
  }

  // ---- Avatar ----
  function avatarHtml(name, size) {
    var cls = size === "lg" ? "avatar avatar-lg" : size === "xl" ? "avatar avatar-xl" : "avatar";
    return '<div class="' + cls + '">' + initials(name) + '</div>';
  }

  // ---- Escape HTML ----
  function esc(str) {
    if (str == null) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // ---- Format helpers ----
  function fmtDate(d) { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); } catch(e) { return d; } }
  function fmtMoney(n) { if (n == null) return "—"; return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function fmtDateTime(d) { if (!d) return "—"; try { return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }); } catch(e) { return d; } }

  // ---- Confirm dialog ----
  function confirm(title, message, dangerLabel, onConfirm) {
    var html = '<div class="dialog-header"><div><div class="dialog-title">' + esc(title) + '</div>' +
      (message ? '<div class="dialog-subtitle">' + esc(message) + '</div>' : '') + '</div>' +
      '<button class="dialog-close" data-close-dialog><i class="fa-solid fa-xmark"></i></button></div>' +
      '<div class="dialog-footer"><button class="btn btn-secondary" data-close-dialog>Cancel</button>' +
      '<button class="btn btn-danger" id="sms-confirm-ok">' + esc(dangerLabel || "Confirm") + '</button></div>';
    var d = openDialog(html);
    document.getElementById("sms-confirm-ok").addEventListener("click", function() {
      closeDialog();
      if (onConfirm) onConfirm();
    });
    return d;
  }

  // ---- Page header ----
  function pageHeader(opts) {
    // opts: { title, subtitle, actions: [{label, icon, id, primary, danger}], breadcrumb }
    var breadHtml = "";
    if (opts.breadcrumb && opts.breadcrumb.length) {
      breadHtml = '<div class="topbar-breadcrumb" style="margin-bottom:8px">';
      opts.breadcrumb.forEach(function(crumb, i) {
        if (i < opts.breadcrumb.length - 1) {
          breadHtml += '<span>' + esc(crumb) + '</span><span class="crumb-sep"><i class="fa-solid fa-chevron-right" style="font-size:.6rem"></i></span>';
        } else {
          breadHtml += '<span class="crumb-current">' + esc(crumb) + '</span>';
        }
      });
      breadHtml += '</div>';
    }
    var actHtml = "";
    if (opts.actions && opts.actions.length) {
      actHtml = '<div class="page-actions">';
      opts.actions.forEach(function(a) {
        var cls = a.primary ? "btn-primary" : a.danger ? "btn-danger" : "btn-secondary";
        actHtml += '<button class="btn ' + cls + '" id="' + (a.id || "") + '">' +
          (a.icon ? '<i class="fa-solid ' + a.icon + '"></i>' : "") + esc(a.label) + '</button>';
      });
      actHtml += '</div>';
    }
    return '<div class="page-header">' + breadHtml +
      '<div class="page-header-row"><div>' +
      '<div class="page-title">' + esc(opts.title) + '</div>' +
      (opts.subtitle ? '<div class="page-subtitle">' + esc(opts.subtitle) + '</div>' : '') +
      '</div>' + actHtml + '</div></div>';
  }

  // ---- Stat card ----
  function statCard(opts) {
    return '<div class="stat-card" data-aos="zoom-in"><div class="stat-icon ' + (opts.color || "blue") + '"><i class="fa-solid ' + opts.icon + '"></i></div>' +
      '<div><div class="stat-label">' + esc(opts.label) + '</div>' +
      '<div class="stat-value">' + esc(opts.value) + '</div>' +
      (opts.meta ? '<div class="stat-meta">' + esc(opts.meta) + '</div>' : '') + '</div></div>';
  }

  // ---- Empty state ----
  function emptyState(opts) {
    return '<div class="empty-state"><div class="empty-state-icon"><i class="fa-solid ' + (opts.icon || "fa-inbox") + '"></i></div>' +
      '<h3>' + esc(opts.title || "No records found") + '</h3>' +
      (opts.message ? '<p>' + esc(opts.message) + '</p>' : '') +
      (opts.action ? '<button class="btn btn-primary" id="' + (opts.actionId || "") + '">' + esc(opts.action) + '</button>' : '') + '</div>';
  }

  // ---- Grade letter from % ----
  function percentToGrade(pct) {
    if (pct >= 97) return "A+";
    if (pct >= 93) return "A";
    if (pct >= 90) return "A-";
    if (pct >= 87) return "B+";
    if (pct >= 83) return "B";
    if (pct >= 80) return "B-";
    if (pct >= 77) return "C+";
    if (pct >= 73) return "C";
    if (pct >= 70) return "C-";
    if (pct >= 67) return "D+";
    if (pct >= 60) return "D";
    return "F";
  }
  function gradeClass(letter) {
    if (!letter) return "";
    var l = letter[0];
    if (l === "A") return "grade-a";
    if (l === "B") return "grade-b";
    if (l === "C") return "grade-c";
    if (l === "D") return "grade-d";
    return "grade-f";
  }


  // AOS-aware render helper — call this instead of el.innerHTML = html
  function render(elOrId, html) {
    var el = typeof elOrId === "string" ? document.getElementById(elOrId) : elOrId;
    if (!el) return;
    el.innerHTML = html;
    if (typeof AOS !== "undefined") {
      requestAnimationFrame(function() { AOS.refresh(); });
    }
  }

  return {
    toast: toast, openDialog: openDialog, closeDialog: closeDialog, closeAllDialogs: closeAllDialogs,
    buildTable: buildTable, wireTableClicks: wireTableClicks,
    badge: badge, statusBadge: statusBadge, avatarHtml: avatarHtml,
    esc: esc, fmtDate: fmtDate, fmtMoney: fmtMoney, fmtDateTime: fmtDateTime,
    confirm: confirm, pageHeader: pageHeader, statCard: statCard, emptyState: emptyState,
    initials: initials, render: render, percentToGrade: percentToGrade, gradeClass: gradeClass
  };
})();

// Auto-refresh AOS when page-content changes (handles async rendering)
if (typeof MutationObserver !== "undefined") {
  document.addEventListener("DOMContentLoaded", function() {
    var pc = document.getElementById("page-content");
    if (pc) {
      var obs = new MutationObserver(function() {
        if (typeof AOS !== "undefined") {
          clearTimeout(obs._t);
          obs._t = setTimeout(function() { AOS.refresh(); }, 80);
        }
      });
      obs.observe(pc, { childList: true });
    }
  });
}
