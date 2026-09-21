"use strict";
document.getElementById("brand-year").textContent = new Date().getFullYear();
document.getElementById("footer-year").textContent = new Date().getFullYear();

// If already logged in (valid session), redirect directly
if (typeof SMS_SEC !== "undefined" && SMS_SEC.readSession() && SMS_AUTH.isAuthenticated()) {
  var r = SMS_AUTH.getRole();
  var dest = SMS_AUTH.PORTAL_HOME_FROM_LOGIN[r] || "../admin/dashboard.html";
  window.location.replace(dest);
}

// Eye toggle
document.getElementById("toggle-password").addEventListener("click", function() {
  var input = document.getElementById("password");
  var icon  = document.getElementById("eye-icon");
  input.type = input.type === "password" ? "text" : "password";
  icon.className = "fa-solid fa-eye" + (input.type === "text" ? "-slash" : "");
});

function showError(msg) {
  var el = document.getElementById("login-error");
  el.textContent = msg;
  el.classList.add("visible");
}
function hideError() { document.getElementById("login-error").classList.remove("visible"); }
function setLoading(on) {
  var btn = document.getElementById("login-btn");
  btn.disabled = on;
  document.getElementById("login-btn-icon").className = "fa-solid " + (on ? "fa-spinner fa-spin" : "fa-arrow-right-to-bracket");
  document.getElementById("login-btn-text").textContent = on ? "Signing in…" : "Sign In";
}

document.getElementById("login-form").addEventListener("submit", function(e) {
  e.preventDefault();
  hideError();

  var schoolId = document.getElementById("school-id").value.trim().toUpperCase();
  var username = document.getElementById("username").value.trim().toLowerCase();
  var password = document.getElementById("password").value;

  if (!schoolId || !username || !password) {
    showError("Please fill in all fields.");
    return;
  }

  // Rate limit check
  if (typeof SMS_SEC !== "undefined") {
    var rl = SMS_SEC.checkRateLimit();
    if (rl.blocked) {
      showError("Too many failed attempts. Please wait " + rl.wait + " seconds before trying again.");
      return;
    }
  }

  setLoading(true);
  SMS_AUTH.login(schoolId, username, password).then(function(result) {
    setLoading(false);
    if (result.success) {
      var role = SMS_AUTH.getRole();
      var dest = SMS_AUTH.PORTAL_HOME_FROM_LOGIN[role] || "../admin/dashboard.html";
      window.location.href = dest;
    } else {
      showError(result.error || "Invalid credentials. Please check your School ID, username, and password.");
    }
  }).catch(function(err) {
    setLoading(false);
    showError("A network error occurred. Please try again.");
    console.error(err);
  });
});

// Keyboard shortcut: Enter in any field
document.querySelectorAll("#school-id, #username, #password").forEach(function(el) {
  el.addEventListener("keydown", function(e) {
    if (e.key === "Enter") document.getElementById("login-form").dispatchEvent(new Event("submit"));
  });
});
