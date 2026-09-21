// ================================================================
// SCHOOL MANAGEMENT SYSTEM — Auth Layer (v3 — uses SMS_SEC)
// Session stored encrypted via SMS_SEC.writeSession/readSession.
// ================================================================
var SMS_AUTH = (function() {
  "use strict";

  var PORTAL_HOME_FROM_LOGIN = {
    superadmin:   "../super-admin/dashboard.html",
    school_admin: "../admin/school-home.html",
    branch_admin: "../admin/school-home.html",
    front_desk:   "../admin/school-home.html",
    teacher:      "../teacher/school-home.html",
    parent:       "../parent/home.html",
    student:      "../student/dashboard.html"
  };

  // ---- Session helpers (use encrypted store) ----
  function getSession()   {
    // Try encrypted first, fall back to plaintext (migration)
    if (typeof SMS_SEC !== "undefined") return SMS_SEC.readSession();
    try { return JSON.parse(localStorage.getItem("sms_session")); } catch(e) { return null; }
  }
  function setSession(s)  {
    if (typeof SMS_SEC !== "undefined") { SMS_SEC.writeSession(s); return; }
    localStorage.setItem("sms_session", JSON.stringify(s));
  }
  function clearSession() {
    if (typeof SMS_SEC !== "undefined") { SMS_SEC.clearSession(); return; }
    localStorage.removeItem("sms_session");
  }

  // ---- Simple credential verifier (mock mode) ----
  // Passwords are stored as SHA-256-like simple hashes via btoa chain.
  // In production: server handles auth, this function calls an API.
  function _verifyPassword(user, plaintext) {
    // Mock: any non-empty password accepted for demo accounts
    // In production this becomes an API call that returns a JWT
    return !!plaintext;
  }

  // ---- Public API ----
  function isAuthenticated() { var s = getSession(); return !!(s && s.userId); }
  function getCurrentUser()  { var s = getSession(); return s ? s.user   : null; }
  function getRole()         { var s = getSession(); return s ? s.role   : null; }
  function getSchoolId()     { var s = getSession(); return s ? s.schoolId : null; }
  function getBranchId()     { var s = getSession(); return s ? (s.selectedBranchId || s.branchId) : null; }
  function getSelectedChildId() { var s = getSession(); return s ? s.selectedChildId : null; }

  function isSchoolAdmin()  { var r = getRole(); return r === "school_admin" || r === "superadmin"; }
  function isBranchAdmin()  { return getRole() === "branch_admin"; }
  function isFrontDesk()    { return getRole() === "front_desk"; }
  function isTeacher()      { return getRole() === "teacher"; }
  function isParent()       { return getRole() === "parent"; }
  function isStudent()      { return getRole() === "student"; }
  function isAdminLevel()   { var r = getRole(); return ["superadmin","school_admin","branch_admin","front_desk"].indexOf(r) !== -1; }

  function getCurrentTeacherRecord() {
    var user = getCurrentUser();
    if (!user || user.role !== "teacher" || !user.teacherId || typeof SMS_TEACHERS === "undefined") return null;
    return SMS_TEACHERS.find(function(t) { return t.id === user.teacherId; }) || null;
  }
  function getTeacherPermissions() {
    var teacher = getCurrentTeacherRecord();
    if (!teacher) return {};
    if (!teacher.permissions && typeof SMS_cloneTeacherPermissions === "function") {
      teacher.permissions = SMS_cloneTeacherPermissions(teacher.permissionPreset || "standard");
    }
    return teacher.permissions || {};
  }
  function hasTeacherPermission(key) {
    if (!isTeacher()) return false;
    if (key === "settings.view") return true;
    var permissions = getTeacherPermissions();
    return permissions[key] === true;
  }

  // Highly sensitive government identifiers are intentionally restricted to
  // platform and school-level directors. Branch principals do not receive this
  // access automatically.
  function canSeeSensitiveData() { var r = getRole(); return r === "superadmin" || r === "school_admin"; }
  function canSeeHealthData() {
    var r = getRole();
    if (["superadmin","school_admin","branch_admin"].indexOf(r) !== -1) return true;
    return r === "teacher" && hasTeacherPermission("students.health_alerts");
  }
  function canSeeGuardianContacts() {
    var r = getRole();
    if (["superadmin","school_admin","branch_admin","front_desk"].indexOf(r) !== -1) return true;
    return r === "teacher" && hasTeacherPermission("students.guardian_contact");
  }
  function canSeeFinancials()    { var r = getRole(); return ["superadmin","school_admin","branch_admin"].indexOf(r) !== -1; }
  function canManageStaff()      { var r = getRole(); return ["superadmin","school_admin","branch_admin"].indexOf(r) !== -1; }
  function canManageTeacherPermissions() { var r = getRole(); return ["superadmin","school_admin","branch_admin"].indexOf(r) !== -1; }
  function hasAllBranchAccess()  { var r = getRole(); return r === "superadmin" || r === "school_admin"; }

  function login(schoolId, username, password) {
    // Rate limit check
    if (typeof SMS_SEC !== "undefined") {
      var rl = SMS_SEC.checkRateLimit();
      if (rl.blocked) {
        return Promise.resolve({ success: false, error: "Too many failed attempts. Please wait " + rl.wait + " seconds." });
      }
    }
    return SMS_API.login(schoolId, username, password).then(function(result) {
      if (result.success) {
        if (typeof SMS_SEC !== "undefined") SMS_SEC.resetAttempts();
        var user = result.user;
        var session = {
          userId:           user.id,
          role:             user.role,
          schoolId:         user.schoolId || schoolId,
          branchId:         user.branchId || null,
          selectedBranchId: user.branchId || null,
          user:             user,
          selectedChildId:  null,
          lastActive:       Date.now(),
          loginTime:        Date.now()
        };
        if (user.role === "parent" && user.parentId) {
          var parent = SMS_PARENTS.find(function(p) { return p.id === user.parentId; });
          if (parent && parent.childrenIds && parent.childrenIds.length) {
            session.selectedChildId = parent.childrenIds[0];
          }
        }
        // School-level admins enter a concrete branch context by default.
        // They can switch branches from the Admin top bar. This prevents a null
        // branch filter from accidentally mixing records across demo schools.
        if (!session.selectedBranchId && (user.role === "school_admin" || user.role === "superadmin")) {
          var firstBranch = SMS_BRANCHES.find(function(b) { return b.schoolId === session.schoolId && String(b.status || "Active").toLowerCase() !== "inactive"; });
          if (firstBranch) session.selectedBranchId = firstBranch.id;
        }
        setSession(session);
      } else {
        if (typeof SMS_SEC !== "undefined") SMS_SEC.recordFailedAttempt();
      }
      return result;
    });
  }

  function logout() {
    clearSession();
    return SMS_API.logout();
  }

  function setSelectedBranch(branchId) {
    var s = getSession();
    if (!s) return;
    s.selectedBranchId = branchId;
    s.lastActive = Date.now();
    setSession(s);
  }

  function setSelectedChild(childId) {
    var s = getSession();
    if (!s) return;
    s.selectedChildId = childId;
    s.lastActive = Date.now();
    setSession(s);
  }

  // ---- Auth guards ----
  // Uses SMS_SEC.guard if available (which clears DOM before redirect).
  // Falls back to direct redirect otherwise.
  function requireAuth(allowedRoles) {
    if (typeof SMS_SEC !== "undefined") {
      return SMS_SEC.guard(allowedRoles, "../login/login.html");
    }
    if (!isAuthenticated()) { window.location.replace("../login/login.html"); return false; }
    if (allowedRoles && allowedRoles.length) {
      if (allowedRoles.indexOf(getRole()) === -1) { window.location.replace("../login/login.html"); return false; }
    }
    return true;
  }
  function requireAdminAuth()  { return requireAuth(["superadmin","school_admin","branch_admin","front_desk"]); }
  function requireTeacherAuth(){ return requireAuth(["teacher"]); }
  function requireParentAuth() { return requireAuth(["parent"]); }
  function requireStudentAuth(){ return requireAuth(["student"]); }

  function initials(name) {
    if (!name) return "?";
    return name.trim().split(/\s+/).map(function(w) { return w[0]; }).slice(0, 2).join("").toUpperCase();
  }
  function roleBadge(role) {
    return { superadmin:"Super Admin", school_admin:"School Admin", branch_admin:"Branch Admin",
             front_desk:"Front Desk", teacher:"Teacher", parent:"Parent", student:"Student" }[role] || role;
  }

  return {
    getSession: getSession, setSession: setSession, clearSession: clearSession,
    isAuthenticated: isAuthenticated, getCurrentUser: getCurrentUser,
    getRole: getRole, getSchoolId: getSchoolId, getBranchId: getBranchId,
    getSelectedChildId: getSelectedChildId,
    isSchoolAdmin: isSchoolAdmin, isBranchAdmin: isBranchAdmin, isFrontDesk: isFrontDesk,
    isTeacher: isTeacher, isParent: isParent, isStudent: isStudent, isAdminLevel: isAdminLevel,
    getCurrentTeacherRecord: getCurrentTeacherRecord, getTeacherPermissions: getTeacherPermissions,
    hasTeacherPermission: hasTeacherPermission,
    canSeeSensitiveData: canSeeSensitiveData, canSeeHealthData: canSeeHealthData,
    canSeeGuardianContacts: canSeeGuardianContacts, canSeeFinancials: canSeeFinancials,
    canManageStaff: canManageStaff, canManageTeacherPermissions: canManageTeacherPermissions,
    hasAllBranchAccess: hasAllBranchAccess,
    login: login, logout: logout,
    setSelectedBranch: setSelectedBranch, setSelectedChild: setSelectedChild,
    requireAuth: requireAuth, requireAdminAuth: requireAdminAuth,
    requireTeacherAuth: requireTeacherAuth, requireParentAuth: requireParentAuth, requireStudentAuth: requireStudentAuth,
    initials: initials, roleBadge: roleBadge,
    PORTAL_HOME_FROM_LOGIN: PORTAL_HOME_FROM_LOGIN
  };
})();
