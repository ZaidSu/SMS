// Browser-only document blob storage for the frontend prototype.
// Supabase Storage will replace this module in production.
var SMS_DEMO_FILES = (function () {
  "use strict";
  var DB_NAME = "sms_demo_files_v1";
  var STORE = "documents";

  function openDb() {
    return new Promise(function(resolve, reject) {
      if (!window.indexedDB) { reject(new Error("IndexedDB is not available.")); return; }
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function() {
        var db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
      };
      req.onsuccess = function() { resolve(req.result); };
      req.onerror = function() { reject(req.error || new Error("Could not open local file store.")); };
    });
  }

  function put(id, file) {
    if (!id || !file) return Promise.reject(new Error("Document id and file are required."));
    return openDb().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put({ id: id, name: file.name, type: file.type, size: file.size, blob: file, updatedAt: new Date().toISOString() });
        tx.oncomplete = function() { db.close(); resolve(true); };
        tx.onerror = function() { var err = tx.error; db.close(); reject(err); };
      });
    });
  }

  function get(id) {
    return openDb().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction(STORE, "readonly");
        var req = tx.objectStore(STORE).get(id);
        req.onsuccess = function() { resolve(req.result || null); };
        req.onerror = function() { reject(req.error); };
        tx.oncomplete = function() { db.close(); };
      });
    });
  }

  function remove(id) {
    return openDb().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).delete(id);
        tx.oncomplete = function() { db.close(); resolve(true); };
        tx.onerror = function() { var err = tx.error; db.close(); reject(err); };
      });
    });
  }

  function download(id, fallbackName) {
    return get(id).then(function(record) {
      if (!record || !record.blob) return false;
      var url = URL.createObjectURL(record.blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = record.name || fallbackName || "document";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function(){ URL.revokeObjectURL(url); }, 5000);
      return true;
    });
  }

  function clear() {
    return openDb().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).clear();
        tx.oncomplete = function(){ db.close(); resolve(true); };
        tx.onerror = function(){ var err=tx.error; db.close(); reject(err); };
      });
    });
  }

  return { put: put, get: get, remove: remove, download: download, clear: clear };
})();
