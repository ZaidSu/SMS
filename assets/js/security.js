// ================================================================
// SCHOOL MANAGEMENT SYSTEM — Browser Demo Session Layer
// This is NOT a production security boundary. It provides client-side
// routing/session behavior for the frontend prototype only. Production
// authentication and authorization will be enforced by Supabase/server APIs.
// ================================================================
(function(global) {
  "use strict";

  var SEC = {};
  var _SALT = "sms_v2_$3cur1ty_2026";

  // ---- Reversible demo-session obfuscation (not encryption) ----
  function _xor(str, key) {
    var out = "";
    for (var i = 0; i < str.length; i++) {
      out += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return out;
  }
  function _encode(str) { try { return btoa(_xor(str, _SALT)); } catch(e) { return ""; } }
  function _decode(str) { try { return _xor(atob(str), _SALT); } catch(e) { return ""; } }

  // ---- Demo localStorage session wrapper ----
  var _KEY = "sms_sx_v2";
  SEC.writeSession = function(obj) {
    try {
      var payload = JSON.stringify(obj);
      localStorage.setItem(_KEY, _encode(payload));
      localStorage.removeItem("sms_session"); // remove old plaintext key if present
    } catch(e) {}
  };
  SEC.readSession = function() {
    try {
      var raw = localStorage.getItem(_KEY);
      if (!raw) return null;
      var decoded = _decode(raw);
      return JSON.parse(decoded);
    } catch(e) { return null; }
  };
  SEC.clearSession = function() {
    localStorage.removeItem(_KEY);
    localStorage.removeItem("sms_session");
    sessionStorage.clear();
  };

  // ---- Demo login throttling (in-memory, resets on page reload) ----
  var _attempts = 0, _lockUntil = 0;
  SEC.checkRateLimit = function() {
    if (Date.now() < _lockUntil) {
      var wait = Math.ceil((_lockUntil - Date.now()) / 1000);
      return { blocked: true, wait: wait };
    }
    return { blocked: false };
  };
  SEC.recordFailedAttempt = function() {
    _attempts++;
    if (_attempts >= 5) { _lockUntil = Date.now() + 60000; _attempts = 0; } // 1-min lock after 5 fails
  };
  SEC.resetAttempts = function() { _attempts = 0; _lockUntil = 0; };

  // ---- Auth guard — call at top of every protected page ----
  // Returns true if user is authenticated and has the right role.
  // Otherwise immediately clears DOM, shows a redirect message, and sends to login.
  SEC.guard = function(allowedRoles, loginPath) {
    loginPath = loginPath || "../login/login.html";
    var session = SEC.readSession();
    var ok = !!(session && session.userId);
    if (ok && allowedRoles && allowedRoles.length) {
      ok = allowedRoles.indexOf(session.role) !== -1;
    }
    if (!ok) {
      // Wipe DOM immediately so nothing is visible before redirect
      try { document.documentElement.innerHTML = ""; } catch(e) {}
      SEC.clearSession();
      window.location.replace(loginPath);
      return false;
    }
    // Session age check — expire after 8 hours of inactivity
    var now = Date.now();
    if (session.lastActive && (now - session.lastActive) > 8 * 60 * 60 * 1000) {
      SEC.clearSession();
      window.location.replace(loginPath);
      return false;
    }
    // Refresh lastActive
    session.lastActive = now;
    SEC.writeSession(session);
    return true;
  };

  // ---- Anti-devtools heuristics ----
  // These do not prevent a determined developer but deter casual inspection.
  var _devOpen = false;
  var _threshold = 160;

  function _detectDevtools() {
    var widthDiff  = window.outerWidth  - window.innerWidth;
    var heightDiff = window.outerHeight - window.innerHeight;
    return widthDiff > _threshold || heightDiff > _threshold;
  }

  // Intercept console methods in production mode
  function _patchConsole() {
    var warn = "\u26a0 Unauthorized access detected. Any attempt to manipulate session data is a violation of this system\u2019s terms of use.";
    var _c = window.console;
    var noop = function() {};
    try {
      // Show a security warning on first open, then silence subsequent logs
      var shown = false;
      ["log","debug","info","dir","dirxml","table","trace","group","groupEnd","groupCollapsed","time","timeEnd","timeStamp","count","assert","profile","profileEnd","clear"].forEach(function(m) {
        var orig = _c[m] ? _c[m].bind(_c) : noop;
        _c[m] = function() {
          if (!shown) { shown = true; orig(warn); }
        };
      });
      // Keep error and warn so real errors surface
      _c.error = _c.error ? _c.error.bind(_c) : noop;
      _c.warn  = _c.warn  ? _c.warn.bind(_c)  : noop;
    } catch(e) {}
  }

  // Disable right-click context menu on sensitive elements
  SEC.protectElement = function(el) {
    if (!el) return;
    el.addEventListener("contextmenu", function(e) { e.preventDefault(); });
    el.addEventListener("selectstart", function(e) { e.preventDefault(); });
  };

  // ---- Visibility: log when user leaves/returns (audit trail) ----
  document.addEventListener("visibilitychange", function() {
    if (document.hidden) return;
    // Re-check session on tab focus
    var s = SEC.readSession();
    if (!s) { window.location.replace("../login/login.html"); }
  });

  // ---- Prevent session hijacking via URL ----
  // Strip any query params that look like token injection
  (function() {
    if (window.location.search && window.location.search.indexOf("token=") !== -1) {
      window.location.replace(window.location.pathname);
    }
  })();

  // ---- Secure cookie hint (for when backend is connected) ----
  // document.cookie = "sms_hint=1; Secure; SameSite=Strict";

  // ---- Init ----
  SEC.init = function(opts) {
    opts = opts || {};
    if (opts.patchConsole !== false) _patchConsole();
    // Add CSP-like meta via JS (actual CSP requires server headers)
    try {
      var meta = document.createElement("meta");
      meta.httpEquiv = "Content-Security-Policy";
      meta.content = [
        "default-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com https://cdnjs.cloudflare.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
        "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
        "img-src 'self' data: https:",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "form-action 'self'"
      ].join("; ");
      document.head.appendChild(meta);
    } catch(e) {}
  };

  global.SMS_SEC = SEC;
})(window);
