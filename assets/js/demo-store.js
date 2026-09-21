// ================================================================
// SCHOOL MANAGEMENT SYSTEM — Demo Persistence Layer
// Keeps mock/demo changes across page refreshes until Supabase is connected.
// This is NOT a production database or security boundary.
// ================================================================
var SMS_DEMO_STORE = (function(global) {
  "use strict";

  var STORAGE_KEY = "sms_demo_database_v5";
  var DATA_VERSION = 5;
  var COLLECTIONS = [
    "SMS_SCHOOLS", "SMS_BRANCHES", "SMS_USERS", "SMS_STUDENTS", "SMS_PARENTS",
    "SMS_TEACHERS", "SMS_CLASSES", "SMS_ASSIGNMENTS", "SMS_GRADES_RECORDS",
    "SMS_CLASS_AVERAGES", "SMS_ATTENDANCE", "SMS_EXPENSES", "SMS_EVENTS",
    "SMS_ANNOUNCEMENTS", "SMS_LUNCH_MENU", "SMS_FORMS", "SMS_DOCUMENTS",
    "SMS_PHOTO_ALBUMS", "SMS_MESSAGES", "SMS_AUDIT_LOG", "SMS_SCHOOL_YEARS",
    "SMS_PTC_SLOTS", "SMS_ENROLLMENTS", "SMS_YEAR_ARCHIVES", "SMS_APPLICATIONS",
    "SMS_INVITATIONS"
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function snapshot() {
    var data = { version: DATA_VERSION, savedAt: new Date().toISOString(), collections: {} };
    COLLECTIONS.forEach(function(name) {
      if (typeof global[name] !== "undefined") data.collections[name] = clone(global[name]);
    });
    return data;
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot()));
      return true;
    } catch (e) {
      console.warn("Demo data could not be saved.", e);
      return false;
    }
  }

  function hydrate() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      var data = JSON.parse(raw);
      if (!data || data.version !== DATA_VERSION || !data.collections) {
        localStorage.removeItem(STORAGE_KEY);
        return false;
      }
      COLLECTIONS.forEach(function(name) {
        if (Object.prototype.hasOwnProperty.call(data.collections, name)) {
          global[name] = clone(data.collections[name]);
        }
      });
      return true;
    } catch (e) {
      localStorage.removeItem(STORAGE_KEY);
      return false;
    }
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }

  function exportData() {
    return snapshot();
  }

  function download(filename, data, type) {
    var blob = new Blob([data], { type: type || "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function() { URL.revokeObjectURL(url); }, 250);
  }

  function downloadBackup() {
    var stamp = new Date().toISOString().slice(0, 10);
    download("sms-demo-backup-" + stamp + ".json", JSON.stringify(snapshot(), null, 2));
  }

  var api = { save: save, hydrate: hydrate, reset: reset, exportData: exportData, download: download, downloadBackup: downloadBackup };
  hydrate();
  return api;
})(window);
