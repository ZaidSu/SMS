// =============================================================
// SCHOOL MANAGEMENT SYSTEM — API Layer
// Frontend-ready demo mode. USE_MOCK=true uses data.js plus
// SMS_DEMO_STORE so CRUD changes persist in this browser.
// The next implementation step is replacing mock methods with
// Supabase Auth/Postgres/Storage while keeping the same UI flows.
// =============================================================
var SMS_API = (function () {
  var USE_MOCK = true;
  var API_BASE_URL = "";

  function persist() { if (USE_MOCK && typeof SMS_DEMO_STORE !== "undefined") SMS_DEMO_STORE.save(); }

  function delay(ms) { return new Promise(function(r) { setTimeout(r, ms || 150); }); }

  function uid(prefix) {
    return prefix + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  }

  function request(path, options) {
    return fetch(API_BASE_URL + path, Object.assign({ headers: { "Content-Type": "application/json" } }, options || {}))
      .then(function(r) { return r.json(); });
  }

  // ----- Auth -----
  function login(schoolId, username, password) {
    if (USE_MOCK) {
      return delay(400).then(function() {
        var school = SMS_SCHOOLS.find(function(s) { return s.id === schoolId; });
        if (!school) return { success: false, error: "School not found. Check your School ID." };
        var user = SMS_USERS.find(function(u) { return u.username === username && (u.schoolId === schoolId || u.role === "superadmin"); });
        if (!user || !password || user.status === "Inactive") return { success: false, error: "Invalid username or password." };
        return { success: true, user: user, school: school };
      });
    }
    return request("/auth/login", { method: "POST", body: JSON.stringify({ schoolId: schoolId, username: username, password: password }) });
  }

  function logout() {
    if (USE_MOCK) return delay(100);
    return request("/auth/logout", { method: "POST" });
  }

  // ----- Schools & Branches -----
  function getSchools()            { return delay().then(function() { return JSON.parse(JSON.stringify(SMS_SCHOOLS)); }); }
  function getBranches(schoolId)   { return delay().then(function() { return SMS_BRANCHES.filter(function(b) { return !schoolId || b.schoolId === schoolId; }); }); }
  function getSchoolById(id)       { return delay().then(function() { return SMS_SCHOOLS.find(function(s) { return s.id === id; }) || null; }); }
  function getBranchById(id)       { return delay().then(function() { return SMS_BRANCHES.find(function(b) { return b.id === id; }) || null; }); }

  // ----- Students -----
  function getStudents(branchId) {
    return delay().then(function() {
      return SMS_STUDENTS.filter(function(s) { return !branchId || s.branchId === branchId; });
    });
  }
  function getStudentById(id) {
    return delay().then(function() { return SMS_STUDENTS.find(function(s) { return s.id === id; }) || null; });
  }
  function createStudent(data) {
    if (USE_MOCK) {
      return delay(300).then(function() {
        var record = Object.assign({
          id: uid("STU"), status: "Active", parentIds: [], middleName:"", preferredName:"",
          sensitiveInfo: { allergies: [], medicalConditions: [], medications: [], emergencyNotes: "", governmentIdentifiers:{ssn:"",birthCertificateNumber:"",passportNumber:"",stateStudentId:""} },
          address: {street:"",line2:"",city:"",state:"",zip:"",country:"United States"},
          emergencyContact:{name:"",phone:"",relationship:""}
        }, data);
        record.fullName = [record.firstName, record.lastName].filter(Boolean).join(" ");
        record.legalName = [record.firstName, record.middleName, record.lastName].filter(Boolean).join(" ");
        record.preferredName = record.preferredName || record.firstName;
        SMS_STUDENTS.push(record);
        var currentYear = SMS_SCHOOL_YEARS.find(function(y){ return y.schoolId === record.schoolId && y.isCurrent; });
        if (currentYear) SMS_ENROLLMENTS.push({ id: uid("ENR"), studentId: record.id, schoolId: record.schoolId, branchId: record.branchId, schoolYearId: currentYear.id, gradeId: record.gradeId, grade: record.grade, status: "Enrolled", enrolledAt: new Date().toISOString().slice(0,10), rolloverSourceId: null });
        persist();
        return { success: true, student: record };
      });
    }
    return request("/students", { method: "POST", body: JSON.stringify(data) });
  }
  function updateStudent(id, data) {
    if (USE_MOCK) {
      return delay(250).then(function() {
        var s = SMS_STUDENTS.find(function(x) { return x.id === id; });
        if (!s) return { success: false };
        Object.assign(s, data);
        if (data.firstName || data.lastName) s.fullName = ((s.firstName || "") + " " + (s.lastName || "")).trim();
        if (data.firstName || data.middleName !== undefined || data.lastName) s.legalName = [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ");
        persist();
        return { success: true, student: s };
      });
    }
    return request("/students/" + id, { method: "PATCH", body: JSON.stringify(data) });
  }
  function deleteStudent(id) {
    if (USE_MOCK) {
      return delay(250).then(function() {
        SMS_STUDENTS = SMS_STUDENTS.filter(function(s) { return s.id !== id; });
        SMS_CLASSES.forEach(function(c) { c.studentIds = (c.studentIds || []).filter(function(sid) { return sid !== id; }); });
        SMS_ENROLLMENTS = SMS_ENROLLMENTS.filter(function(e) { return e.studentId !== id; });
        persist();
        return { success: true };
      });
    }
    return request("/students/" + id, { method: "DELETE" });
  }

  // ----- Parents -----
  function getParents(branchId) {
    return delay().then(function() {
      return SMS_PARENTS.filter(function(p) { return !branchId || p.branchId === branchId; });
    });
  }
  function getParentById(id) {
    return delay().then(function() { return SMS_PARENTS.find(function(p) { return p.id === id; }) || null; });
  }
  function createParent(data) {
    if (USE_MOCK) {
      return delay(220).then(function() {
        var record = Object.assign({
          id: uid("PAR"), childrenIds:[], isPrimary:false, legalGuardian:true,
          authorizedPickup:true, receivesSchoolCommunication:true, preferredLanguage:"English",
          middleName:"", employer:"", workPhone:"",
          address:{street:"",line2:"",city:"",state:"",zip:"",country:"United States"}
        }, data);
        record.fullName = [record.firstName, record.lastName].filter(Boolean).join(" ");
        record.legalName = [record.firstName, record.middleName, record.lastName].filter(Boolean).join(" ");
        SMS_PARENTS.push(record);
        persist();
        return {success:true,parent:record};
      });
    }
    return request("/parents", {method:"POST", body:JSON.stringify(data)});
  }
  function updateParent(id, data) {
    if (USE_MOCK) {
      return delay(180).then(function() {
        var parent = SMS_PARENTS.find(function(p){ return p.id === id; });
        if (!parent) return {success:false};
        Object.assign(parent, data);
        if (data.firstName || data.lastName) parent.fullName = [parent.firstName, parent.lastName].filter(Boolean).join(" ");
        if (data.firstName || data.middleName !== undefined || data.lastName) parent.legalName = [parent.firstName, parent.middleName, parent.lastName].filter(Boolean).join(" ");
        persist();
        return {success:true,parent:parent};
      });
    }
    return request("/parents/"+id, {method:"PATCH", body:JSON.stringify(data)});
  }

  // ----- Teachers -----
  function getTeachers(branchId) {
    return delay().then(function() {
      return SMS_TEACHERS.filter(function(t) { return !branchId || t.branchId === branchId; });
    });
  }
  function getTeacherById(id) {
    return delay().then(function() { return SMS_TEACHERS.find(function(t) { return t.id === id; }) || null; });
  }
  function createTeacher(data) {
    if (USE_MOCK) {
      return delay(300).then(function() {
        var record = Object.assign({
          id: uid("TCH"), status: "Active", assignedClassIds: [],
          hireDate: new Date().toISOString().slice(0, 10), permissionPreset:"standard",
          permissions: (typeof SMS_cloneTeacherPermissions === "function" ? SMS_cloneTeacherPermissions("standard") : {}),
          portalAccess:{status:"Active",inviteEmail:"",lastInviteAt:null}
        }, data);
        if (!record.permissions || !Object.keys(record.permissions).length) {
          record.permissions = typeof SMS_cloneTeacherPermissions === "function" ? SMS_cloneTeacherPermissions(record.permissionPreset || "standard") : {};
        }
        record.portalAccess = Object.assign({status:"Active",inviteEmail:record.email,lastInviteAt:null}, record.portalAccess || {});
        SMS_TEACHERS.push(record);

        // Demo portal account so newly-created teachers can immediately test the
        // permissions assigned by the principal. Supabase Auth will replace this.
        var baseUsername = (data.portalUsername || ("t." + String(record.firstName||"teacher") + "." + String(record.lastName||"user"))).toLowerCase().replace(/[^a-z0-9._-]/g, "");
        var username = baseUsername || ("teacher." + String(Date.now()).slice(-6));
        var suffix = 1;
        while (SMS_USERS.some(function(u){ return u.username === username && u.schoolId === record.schoolId; })) {
          username = baseUsername + suffix++;
        }
        SMS_USERS.push({
          id:uid("USR"), username:username, role:"teacher", schoolId:record.schoolId,
          branchId:record.branchId, teacherId:record.id, displayName:record.fullName,
          email:record.email, status:"Active"
        });
        record.portalAccess.username = username;
        persist();
        return { success: true, teacher: record, username: username };
      });
    }
    return request("/teachers", { method: "POST", body: JSON.stringify(data) });
  }
  function updateTeacher(id, data) {
    if (USE_MOCK) {
      return delay(250).then(function() {
        var t = SMS_TEACHERS.find(function(x) { return x.id === id; });
        if (!t) return { success: false };
        Object.assign(t, data);
        persist();
        return { success: true, teacher: t };
      });
    }
    return request("/teachers/" + id, { method: "PATCH", body: JSON.stringify(data) });
  }
  function deleteTeacher(id) {
    if (USE_MOCK) {
      return delay(250).then(function() {
        SMS_TEACHERS = SMS_TEACHERS.filter(function(t) { return t.id !== id; });
        SMS_CLASSES.forEach(function(c) { if (c.teacherId === id) { c.teacherId = null; c.teacherName = "Unassigned"; } });
        SMS_USERS.forEach(function(u) { if (u.teacherId === id) u.status = "Inactive"; });
        persist();
        return { success: true };
      });
    }
    return request("/teachers/" + id, { method: "DELETE" });
  }

  // ----- Classes -----
  function getClasses(branchId) {
    return delay().then(function() {
      return SMS_CLASSES.filter(function(c) { return !branchId || c.branchId === branchId; });
    });
  }
  function createClass(data) {
    if (USE_MOCK) {
      return delay(300).then(function() {
        var record = Object.assign({ id: uid("CLS"), studentIds: [], semester: "Full Year" }, data);
        SMS_CLASSES.push(record);
        if (record.teacherId) {
          var teacher = SMS_TEACHERS.find(function(t) { return t.id === record.teacherId; });
          if (teacher) { teacher.assignedClassIds = (teacher.assignedClassIds || []).concat([record.id]); }
        }
        persist();
        return { success: true, cls: record };
      });
    }
    return request("/classes", { method: "POST", body: JSON.stringify(data) });
  }
  function updateClass(id, data) {
    if (USE_MOCK) {
      return delay(250).then(function() {
        var c = SMS_CLASSES.find(function(x) { return x.id === id; });
        if (!c) return { success: false };
        var oldTeacherId = c.teacherId;
        Object.assign(c, data);
        if (data.teacherId && data.teacherId !== oldTeacherId) {
          if (oldTeacherId) {
            var prev = SMS_TEACHERS.find(function(t) { return t.id === oldTeacherId; });
            if (prev) prev.assignedClassIds = (prev.assignedClassIds || []).filter(function(cid) { return cid !== id; });
          }
          var next = SMS_TEACHERS.find(function(t) { return t.id === data.teacherId; });
          if (next) { next.assignedClassIds = Array.from(new Set((next.assignedClassIds || []).concat([id]))); c.teacherName = next.fullName; }
        }
        persist();
        return { success: true, cls: c };
      });
    }
    return request("/classes/" + id, { method: "PATCH", body: JSON.stringify(data) });
  }
  function deleteClass(id) {
    if (USE_MOCK) {
      return delay(250).then(function() {
        SMS_CLASSES = SMS_CLASSES.filter(function(c) { return c.id !== id; });
        SMS_TEACHERS.forEach(function(t) { t.assignedClassIds = (t.assignedClassIds || []).filter(function(cid) { return cid !== id; }); });
        persist();
        return { success: true };
      });
    }
    return request("/classes/" + id, { method: "DELETE" });
  }

  // ----- Assignments -----
  function getAssignments(classId) {
    return delay().then(function() { return SMS_ASSIGNMENTS.filter(function(a) { return !classId || a.classId === classId; }); });
  }
  function createAssignment(data) {
    if (USE_MOCK) {
      return delay(250).then(function() {
        var record = Object.assign({ id: uid("ASN"), status: "Active" }, data);
        SMS_ASSIGNMENTS.push(record);
        persist();
        return { success: true, assignment: record };
      });
    }
    return request("/assignments", { method: "POST", body: JSON.stringify(data) });
  }
  function deleteAssignment(id) {
    if (USE_MOCK) { return delay(200).then(function() { SMS_ASSIGNMENTS = SMS_ASSIGNMENTS.filter(function(a) { return a.id !== id; }); persist(); return { success: true }; }); }
    return request("/assignments/" + id, { method: "DELETE" });
  }

  // ----- Grades -----
  function getGrades(params) {
    return delay().then(function() {
      return SMS_GRADES_RECORDS.filter(function(g) {
        return (!params || !params.studentId || g.studentId === params.studentId) &&
               (!params || !params.classId   || g.classId   === params.classId);
      });
    });
  }
  function saveGrade(data) {
    if (USE_MOCK) {
      return delay(200).then(function() {
        var existing = SMS_GRADES_RECORDS.find(function(g) { return g.studentId === data.studentId && g.assignmentId === data.assignmentId; });
        if (existing) { Object.assign(existing, data); persist(); return { success: true, grade: existing }; }
        var record = Object.assign({ id: uid("GRD"), gradedDate: new Date().toISOString().slice(0, 10) }, data);
        SMS_GRADES_RECORDS.push(record);
        persist();
        return { success: true, grade: record };
      });
    }
    return request("/grades", { method: "POST", body: JSON.stringify(data) });
  }
  function getClassAverages(studentId) {
    return delay().then(function() { return SMS_CLASS_AVERAGES.filter(function(a) { return !studentId || a.studentId === studentId; }); });
  }

  // ----- Attendance -----
  function getAttendance(params) {
    return delay().then(function() {
      return SMS_ATTENDANCE.filter(function(a) {
        return (!params || !params.classId   || a.classId   === params.classId) &&
               (!params || !params.studentId || a.studentId === params.studentId) &&
               (!params || !params.date      || a.date      === params.date) &&
               (!params || !params.branchId  || a.branchId  === params.branchId);
      });
    });
  }
  function markAttendance(data) {
    if (USE_MOCK) {
      return delay(150).then(function() {
        var ex = SMS_ATTENDANCE.find(function(a) { return a.studentId === data.studentId && a.classId === data.classId && a.date === data.date; });
        if (ex) { Object.assign(ex, data, { markedAt: new Date().toISOString() }); persist(); return { success: true, record: ex }; }
        var record = Object.assign({ id: uid("ATT"), markedAt: new Date().toISOString() }, data);
        SMS_ATTENDANCE.push(record);
        persist();
        return { success: true, record: record };
      });
    }
    return request("/attendance", { method: "POST", body: JSON.stringify(data) });
  }

  // ----- Expenses / Payments -----
  function getExpenses(branchId) {
    return delay().then(function() { return SMS_EXPENSES.filter(function(e) { return !branchId || e.branchId === branchId; }); });
  }
  function createExpense(data) {
    if (USE_MOCK) {
      return delay(250).then(function() {
        var record = Object.assign({ id: uid("EXP"), paid: 0, balance: data.amount, status: "Unpaid" }, data);
        SMS_EXPENSES.push(record);
        persist();
        return { success: true, expense: record };
      });
    }
    return request("/expenses", { method: "POST", body: JSON.stringify(data) });
  }
  function recordPayment(expenseId, amount, meta) {
    meta = meta || {};
    if (USE_MOCK) {
      return delay(300).then(function() {
        var e = SMS_EXPENSES.find(function(x) { return x.id === expenseId; });
        if (!e) return { success: false };
        var applied = Math.min(Math.max(Number(amount) || 0, 0), e.balance);
        if (!applied) return { success: false, message: "Payment amount must be greater than zero." };
        var payment = {
          id: uid("PAY"),
          receiptNumber: "RCT-" + new Date().getFullYear() + "-" + String(Date.now()).slice(-7),
          amount: applied,
          date: meta.date || new Date().toISOString().slice(0, 10),
          method: meta.method || "Other",
          reference: meta.reference || "",
          note: meta.note || "",
          recordedBy: meta.recordedBy || "",
          createdAt: new Date().toISOString()
        };
        e.payments = e.payments || [];
        e.payments.push(payment);
        e.paid = Math.min(e.amount, (Number(e.paid) || 0) + applied);
        e.balance = Math.max(0, e.amount - e.paid);
        e.status = e.balance === 0 ? "Paid" : e.paid > 0 ? "Partial" : "Unpaid";
        persist();
        return { success: true, expense: e, payment: payment };
      });
    }
    return request("/expenses/" + expenseId + "/payments", { method: "POST", body: JSON.stringify({ amount: amount, meta: meta }) });
  }
  function deleteExpense(id) {
    if (USE_MOCK) { return delay(200).then(function() { SMS_EXPENSES = SMS_EXPENSES.filter(function(e) { return e.id !== id; }); persist(); return { success: true }; }); }
    return request("/expenses/" + id, { method: "DELETE" });
  }

  // ----- Events -----
  function getEvents(branchId) {
    return delay().then(function() { return SMS_EVENTS.filter(function(e) { return !branchId || e.branchId === branchId; }); });
  }
  function createEvent(data) {
    if (USE_MOCK) { return delay(250).then(function() { var r = Object.assign({ id: uid("EVT"), requiresRegistration: false }, data); SMS_EVENTS.push(r); persist(); return { success: true, event: r }; }); }
    return request("/events", { method: "POST", body: JSON.stringify(data) });
  }
  function deleteEvent(id) {
    if (USE_MOCK) { return delay(200).then(function() { SMS_EVENTS = SMS_EVENTS.filter(function(e) { return e.id !== id; }); persist(); return { success: true }; }); }
    return request("/events/" + id, { method: "DELETE" });
  }

  // ----- Announcements -----
  function getAnnouncements(branchId) {
    return delay().then(function() { return SMS_ANNOUNCEMENTS.filter(function(a) { return !branchId || a.branchId === branchId || a.branchId === null; }); });
  }
  function createAnnouncement(data) {
    if (USE_MOCK) { return delay(250).then(function() { var r = Object.assign({ id: uid("ANN"), date: new Date().toISOString().slice(0, 10) }, data); SMS_ANNOUNCEMENTS.unshift(r); persist(); return { success: true, announcement: r }; }); }
    return request("/announcements", { method: "POST", body: JSON.stringify(data) });
  }
  function deleteAnnouncement(id) {
    if (USE_MOCK) { return delay(200).then(function() { SMS_ANNOUNCEMENTS = SMS_ANNOUNCEMENTS.filter(function(a) { return a.id !== id; }); persist(); return { success: true }; }); }
    return request("/announcements/" + id, { method: "DELETE" });
  }

  // ----- Lunch menu -----
  function getLunchMenu() { return delay().then(function() { return SMS_LUNCH_MENU; }); }
  function updateLunchDay(date, data) {
    if (USE_MOCK) {
      return delay(200).then(function() {
        var day = SMS_LUNCH_MENU.menu.find(function(m) { return m.date === date; });
        if (!day) return { success: false };
        Object.assign(day, data);
        persist();
        return { success: true, day: day };
      });
    }
    return request("/lunch-menu/" + date, { method: "PATCH", body: JSON.stringify(data) });
  }

  // ----- Forms -----
  function getForms(branchId) { return delay().then(function() { return SMS_FORMS.filter(function(f) { return !branchId || f.branchId === branchId; }); }); }
  function createForm(data) {
    if (USE_MOCK) { return delay(250).then(function() { var r = Object.assign({ id: uid("FRM"), status: "Optional" }, data); SMS_FORMS.push(r); persist(); return { success: true, form: r }; }); }
    return request("/forms", { method: "POST", body: JSON.stringify(data) });
  }
  function deleteForm(id) {
    if (USE_MOCK) { return delay(200).then(function() { SMS_FORMS = SMS_FORMS.filter(function(f) { return f.id !== id; }); persist(); return { success: true }; }); }
    return request("/forms/" + id, { method: "DELETE" });
  }

  // ----- Documents -----
  function getDocuments(branchId) { return delay().then(function() { return SMS_DOCUMENTS.filter(function(d) { return !branchId || d.branchId === branchId; }); }); }
  function createDocument(data) {
    if (USE_MOCK) { return delay(250).then(function() { var r = Object.assign({ id: uid("DOC"), uploadDate: new Date().toISOString().slice(0, 10), fileType: "PDF" }, data); SMS_DOCUMENTS.push(r); persist(); return { success: true, document: r }; }); }
    return request("/documents", { method: "POST", body: JSON.stringify(data) });
  }
  function deleteDocument(id) {
    if (USE_MOCK) { return delay(200).then(function() { SMS_DOCUMENTS = SMS_DOCUMENTS.filter(function(d) { return d.id !== id; }); persist(); return { success: true }; }); }
    return request("/documents/" + id, { method: "DELETE" });
  }

  // ----- Photos -----
  function getPhotoAlbums(branchId) { return delay().then(function() { return SMS_PHOTO_ALBUMS.filter(function(a) { return !branchId || a.branchId === branchId; }); }); }

  // ----- Messages -----
  function getMessages(userId) {
    return delay().then(function() {
      return SMS_MESSAGES.filter(function(m) { return m.fromUserId === userId || m.toUserId === userId; });
    });
  }
  function sendMessage(data) {
    if (USE_MOCK) { return delay(250).then(function() { var r = Object.assign({ id: uid("MSG"), date: new Date().toISOString(), read: false }, data); SMS_MESSAGES.unshift(r); persist(); return { success: true, message: r }; }); }
    return request("/messages", { method: "POST", body: JSON.stringify(data) });
  }
  function markMessageRead(id) {
    if (USE_MOCK) { return delay(100).then(function() { var m = SMS_MESSAGES.find(function(x) { return x.id === id; }); if (m) m.read = true; persist(); return { success: true }; }); }
    return request("/messages/" + id + "/read", { method: "PATCH" });
  }

  // ----- Audit log -----
  function getAuditLog(branchId) { return delay().then(function() { return SMS_AUDIT_LOG.filter(function(a) { return !branchId || a.branchId === branchId; }); }); }
  function addAuditEntry(data) {
    var entry = Object.assign({ id: uid("AUD"), timestamp: new Date().toISOString() }, data);
    SMS_AUDIT_LOG.unshift(entry);
    persist();
    return entry;
  }

  // ----- PTC / Scheduling -----
  function getPtcSlots(branchId) { return delay().then(function() { return SMS_PTC_SLOTS.filter(function(s) { return !branchId || s.branchId === branchId; }); }); }
  function bookPtcSlot(slotId, parentId) {
    if (USE_MOCK) { return delay(200).then(function() { var s = SMS_PTC_SLOTS.find(function(x) { return x.id === slotId; }); if (s) { s.booked = true; s.bookedBy = parentId; } persist(); return { success: true }; }); }
    return request("/ptc-slots/" + slotId + "/book", { method: "POST", body: JSON.stringify({ parentId: parentId }) });
  }

  // ----- School years / rollover -----
  function getSchoolYears(schoolId) { return delay().then(function() { return SMS_SCHOOL_YEARS.filter(function(y) { return !schoolId || y.schoolId === schoolId; }).sort(function(a,b){ return String(b.startDate).localeCompare(String(a.startDate)); }); }); }
  function getCurrentSchoolYear(schoolId) { return delay().then(function(){ return SMS_SCHOOL_YEARS.find(function(y){ return y.schoolId === schoolId && y.isCurrent; }) || null; }); }
  function getEnrollments(params) {
    params = params || {};
    return delay().then(function(){ return SMS_ENROLLMENTS.filter(function(e){
      return (!params.schoolId || e.schoolId === params.schoolId) && (!params.branchId || e.branchId === params.branchId) && (!params.schoolYearId || e.schoolYearId === params.schoolYearId) && (!params.studentId || e.studentId === params.studentId);
    }); });
  }
  function getYearArchives(schoolId) { return delay().then(function(){ return SMS_YEAR_ARCHIVES.filter(function(a){ return !schoolId || a.schoolId === schoolId; }); }); }
  function createSchoolYear(data) {
    if (USE_MOCK) { return delay(250).then(function() { var r = Object.assign({ id: uid("SY"), isCurrent: false, status:"planned", closedAt:null }, data); SMS_SCHOOL_YEARS.push(r); persist(); return { success: true, schoolYear: r }; }); }
    return request("/school-years", { method: "POST", body: JSON.stringify(data) });
  }
  function closeSchoolYear(schoolYearId, options) {
    options = options || {};
    if (!USE_MOCK) return request("/school-years/"+schoolYearId+"/close", {method:"POST",body:JSON.stringify(options)});
    return delay(300).then(function(){
      var y = SMS_SCHOOL_YEARS.find(function(x){ return x.id === schoolYearId; });
      if (!y) return {success:false,error:"School year not found."};
      y.isCurrent = false; y.status = "closed"; y.closedAt = new Date().toISOString();
      var enrollments = SMS_ENROLLMENTS.filter(function(e){ return e.schoolYearId === schoolYearId; });
      var archive = { id:uid("ARC"), schoolId:y.schoolId, schoolYearId:y.id, schoolYearName:y.name, closedAt:y.closedAt, closedBy:options.closedBy||"School Administrator", notes:options.notes||"", summary:{ students:enrollments.length, classes:SMS_CLASSES.filter(function(c){return c.schoolYearId===schoolYearId;}).length, graduates:0, notReturning:0, attendanceRecords:SMS_ATTENDANCE.length, gradeRecords:SMS_GRADES_RECORDS.length } };
      SMS_YEAR_ARCHIVES.unshift(archive);
      persist();
      return {success:true,schoolYear:y,archive:archive};
    });
  }
  function rolloverSchoolYear(payload) {
    if (!USE_MOCK) return request("/school-years/rollover", {method:"POST",body:JSON.stringify(payload)});
    return delay(500).then(function(){
      var source = SMS_SCHOOL_YEARS.find(function(y){ return y.id === payload.sourceYearId; });
      if (!source) return {success:false,error:"Current school year not found."};
      var existingName = SMS_SCHOOL_YEARS.find(function(y){ return y.schoolId===source.schoolId && y.name===payload.name; });
      if (existingName) return {success:false,error:"A school year with that name already exists."};
      source.isCurrent=false; source.status="closed"; source.closedAt=new Date().toISOString();
      var newYear={ id:uid("SY"), schoolId:source.schoolId, name:payload.name, startDate:payload.startDate, endDate:payload.endDate, semesters:payload.semesters||[], isCurrent:true, status:"active", closedAt:null, createdFrom:source.id };
      SMS_SCHOOL_YEARS.push(newYear);
      SMS_SCHOOLS.forEach(function(school){ if(school.id===source.schoolId) school.currentYear=newYear.name; });
      var counts={returning:0,retained:0,graduated:0,notReturning:0,skipped:0};
      (payload.decisions||[]).forEach(function(d){
        var student=SMS_STUDENTS.find(function(s){return s.id===d.studentId;}); if(!student) return;
        if(d.action==="graduate"){ student.status="Graduated"; counts.graduated++; return; }
        if(d.action==="not_returning"){ student.status="Inactive"; counts.notReturning++; return; }
        if(d.action==="skip"){ counts.skipped++; return; }
        student.status="Active"; student.gradeId=Number(d.nextGradeId||student.gradeId);
        var gradeDef=SMS_GRADES.find(function(g){return g.id===student.gradeId;}); if(gradeDef) student.grade=gradeDef.name;
        SMS_ENROLLMENTS.push({id:uid("ENR"),studentId:student.id,schoolId:student.schoolId,branchId:student.branchId,schoolYearId:newYear.id,gradeId:student.gradeId,grade:student.grade,status:"Enrolled",enrolledAt:payload.startDate||new Date().toISOString().slice(0,10),rolloverSourceId:source.id});
        if(d.action==="retain") counts.retained++; else counts.returning++;
      });
      var copiedClasses=0;
      if(payload.copyClasses){
        SMS_CLASSES.filter(function(c){return c.schoolId===source.schoolId && (!c.schoolYearId || c.schoolYearId===source.id);}).forEach(function(c){
          var copy=Object.assign({},c,{id:uid("CLS"),schoolYearId:newYear.id,studentIds:[]}); SMS_CLASSES.push(copy); copiedClasses++;
        });
      }
      var archive={id:uid("ARC"),schoolId:source.schoolId,schoolYearId:source.id,schoolYearName:source.name,closedAt:source.closedAt,closedBy:payload.closedBy||"School Administrator",notes:payload.archiveNotes||"Closed during new-year rollover.",summary:{students:(payload.decisions||[]).length,classes:SMS_CLASSES.filter(function(c){return c.schoolYearId===source.id;}).length,graduates:counts.graduated,notReturning:counts.notReturning,attendanceRecords:SMS_ATTENDANCE.length,gradeRecords:SMS_GRADES_RECORDS.length}};
      SMS_YEAR_ARCHIVES.unshift(archive);
      persist();
      return {success:true,newYear:newYear,archive:archive,counts:counts,copiedClasses:copiedClasses};
    });
  }

  // ----- Admissions / invitations -----
  function getApplications(branchId) { return delay().then(function(){ return SMS_APPLICATIONS.filter(function(a){return !branchId || a.branchId===branchId;}); }); }
  function createApplication(data) { if(USE_MOCK) return delay(250).then(function(){var r=Object.assign({id:uid("APP"),submittedAt:new Date().toISOString().slice(0,10),status:"New",documents:0,notes:""},data);SMS_APPLICATIONS.unshift(r);persist();return {success:true,application:r};}); return request("/applications",{method:"POST",body:JSON.stringify(data)}); }
  function updateApplication(id,data) { if(USE_MOCK) return delay(200).then(function(){var a=SMS_APPLICATIONS.find(function(x){return x.id===id;});if(!a)return {success:false};Object.assign(a,data);persist();return {success:true,application:a};}); return request("/applications/"+id,{method:"PATCH",body:JSON.stringify(data)}); }
  function getInvitations(schoolId) { return delay().then(function(){return SMS_INVITATIONS.filter(function(i){return !schoolId||i.schoolId===schoolId;});}); }
  function createInvitation(data) { if(USE_MOCK) return delay(200).then(function(){var r=Object.assign({id:uid("INV"),status:"Pending",sentAt:new Date().toISOString().slice(0,10)},data);SMS_INVITATIONS.unshift(r);persist();return {success:true,invitation:r};}); return request("/invitations",{method:"POST",body:JSON.stringify(data)}); }

  // ----- Grade structures -----
  function getGradeStructures() { return delay().then(function() { return SMS_GRADES; }); }

  return {
    USE_MOCK: USE_MOCK,
    login: login, logout: logout,
    getSchools: getSchools, getBranches: getBranches, getSchoolById: getSchoolById, getBranchById: getBranchById,
    getStudents: getStudents, getStudentById: getStudentById, createStudent: createStudent, updateStudent: updateStudent, deleteStudent: deleteStudent,
    getParents: getParents, getParentById: getParentById, createParent: createParent, updateParent: updateParent,
    getTeachers: getTeachers, getTeacherById: getTeacherById, createTeacher: createTeacher, updateTeacher: updateTeacher, deleteTeacher: deleteTeacher,
    getClasses: getClasses, createClass: createClass, updateClass: updateClass, deleteClass: deleteClass,
    getAssignments: getAssignments, createAssignment: createAssignment, deleteAssignment: deleteAssignment,
    getGrades: getGrades, saveGrade: saveGrade, getClassAverages: getClassAverages,
    getAttendance: getAttendance, markAttendance: markAttendance,
    getExpenses: getExpenses, createExpense: createExpense, recordPayment: recordPayment, deleteExpense: deleteExpense,
    getEvents: getEvents, createEvent: createEvent, deleteEvent: deleteEvent,
    getAnnouncements: getAnnouncements, createAnnouncement: createAnnouncement, deleteAnnouncement: deleteAnnouncement,
    getLunchMenu: getLunchMenu, updateLunchDay: updateLunchDay,
    getForms: getForms, createForm: createForm, deleteForm: deleteForm,
    getDocuments: getDocuments, createDocument: createDocument, deleteDocument: deleteDocument,
    getPhotoAlbums: getPhotoAlbums,
    getMessages: getMessages, sendMessage: sendMessage, markMessageRead: markMessageRead,
    getAuditLog: getAuditLog, addAuditEntry: addAuditEntry,
    getPtcSlots: getPtcSlots, bookPtcSlot: bookPtcSlot,
    getSchoolYears: getSchoolYears, getCurrentSchoolYear: getCurrentSchoolYear, getEnrollments: getEnrollments, getYearArchives: getYearArchives, createSchoolYear: createSchoolYear, closeSchoolYear: closeSchoolYear, rolloverSchoolYear: rolloverSchoolYear,
    getApplications: getApplications, createApplication: createApplication, updateApplication: updateApplication, getInvitations: getInvitations, createInvitation: createInvitation,
    getGradeStructures: getGradeStructures
  };
})();
