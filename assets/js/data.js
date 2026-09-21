// =============================================================
// SCHOOL MANAGEMENT SYSTEM — Mock Data
// Multi-school, multi-branch. Every record scoped to a branch.
// =============================================================

var SMS_SCHOOLS = [
  { id:"SCH001", name:"Al-Noor Academy", address:"1234 Education Blvd, Richardson, TX 75080", phone:"(972) 555-0100", email:"info@alnoor.edu", website:"www.alnoor.edu", status:"active", plan:"premium", logoText:"AN", currentYear:"2026-2027" },
  { id:"SCH002", name:"Springfield Islamic School", address:"910 Oak Avenue, Dallas, TX 75201", phone:"(214) 555-0200", email:"info@sis.edu", website:"www.sis.edu", status:"active", plan:"standard", logoText:"SIS", currentYear:"2026-2027" }
];

var SMS_BRANCHES = [
  { id:"BR001", schoolId:"SCH001", name:"Richardson Campus", address:"1234 Education Blvd, Richardson, TX 75080", phone:"(972) 555-0101", email:"richardson@alnoor.edu", status:"Active", principalName:"Principal Sarah Ahmed" },
  { id:"BR002", schoolId:"SCH001", name:"Plano Campus",      address:"5678 Legacy Dr, Plano, TX 75024",           phone:"(972) 555-0202", email:"plano@alnoor.edu",      status:"Active", principalName:"Principal Omar Hassan" },
  { id:"BR003", schoolId:"SCH001", name:"Garland Campus",    address:"2468 Garland Rd, Garland, TX 75040",        phone:"(972) 555-0303", email:"garland@alnoor.edu",    status:"Active", principalName:"Principal Zainab Malik" },
  { id:"BR004", schoolId:"SCH002", name:"Main Campus",       address:"910 Oak Avenue, Dallas, TX 75201",          phone:"(214) 555-0201", email:"main@sis.edu",          status:"Active", principalName:"Principal Khalid Rauf" }
];

var SMS_GRADES = [
  {id:1,name:"Pre-K3",type:"early"},{id:2,name:"Pre-K4",type:"early"},{id:3,name:"Kindergarten",type:"elementary"},
  {id:4,name:"1st Grade",type:"elementary"},{id:5,name:"2nd Grade",type:"elementary"},{id:6,name:"3rd Grade",type:"elementary"},
  {id:7,name:"4th Grade",type:"elementary"},{id:8,name:"5th Grade",type:"elementary"},{id:9,name:"6th Grade",type:"middle"},
  {id:10,name:"7th Grade",type:"middle"},{id:11,name:"8th Grade",type:"middle"},{id:12,name:"9th Grade",type:"high"},
  {id:13,name:"10th Grade",type:"high"},{id:14,name:"11th Grade",type:"high"},{id:15,name:"12th Grade",type:"high"}
];

var SMS_USERS = [
  { id:"USR000", username:"superadmin",       role:"superadmin",   schoolId:null,     branchId:null,  displayName:"Platform Admin",        email:"admin@sms.platform" },
  { id:"USR001", username:"director",         role:"school_admin", schoolId:"SCH001", branchId:null,  displayName:"Dr. Yusuf Al-Rashidi",  email:"director@alnoor.edu" },
  { id:"USR002", username:"admin.richardson", role:"branch_admin", schoolId:"SCH001", branchId:"BR001", displayName:"Principal Sarah Ahmed",email:"s.ahmed@alnoor.edu" },
  { id:"USR003", username:"admin.plano",      role:"branch_admin", schoolId:"SCH001", branchId:"BR002", displayName:"Principal Omar Hassan",email:"o.hassan@alnoor.edu" },
  { id:"USR004", username:"frontdesk",        role:"front_desk",   schoolId:"SCH001", branchId:"BR001", displayName:"Fatima Malik",        email:"f.malik@alnoor.edu" },
  { id:"USR005", username:"t.aisha",          role:"teacher",      schoolId:"SCH001", branchId:"BR001", teacherId:"TCH001", displayName:"Ms. Aisha Hassan",     email:"a.hassan@alnoor.edu" },
  { id:"USR006", username:"t.khalid",         role:"teacher",      schoolId:"SCH001", branchId:"BR001", teacherId:"TCH002", displayName:"Mr. Khalid Khan",      email:"k.khan@alnoor.edu" },
  { id:"USR007", username:"t.maryam",         role:"teacher",      schoolId:"SCH001", branchId:"BR001", teacherId:"TCH003", displayName:"Ms. Maryam Siddiqui",  email:"m.siddiqui@alnoor.edu" },
  { id:"USR008", username:"t.ibrahim",        role:"teacher",      schoolId:"SCH001", branchId:"BR002", teacherId:"TCH004", displayName:"Ustadh Ibrahim Rauf",  email:"i.rauf@alnoor.edu" },
  { id:"USR009", username:"p.ali",            role:"parent",       schoolId:"SCH001", branchId:"BR001", parentId:"PAR001", displayName:"Mohammad Ali",         email:"m.ali@email.com" },
  { id:"USR010", username:"p.noor",           role:"parent",       schoolId:"SCH001", branchId:"BR001", parentId:"PAR002", displayName:"Nadia Noor",           email:"n.noor@email.com" },
  { id:"USR011", username:"director.sis",     role:"school_admin", schoolId:"SCH002", branchId:null,  displayName:"Dr. Amira Hassan",      email:"director@sis.edu" },
  { id:"USR012", username:"s.ahmed",          role:"student",      schoolId:"SCH001", branchId:"BR001", studentId:"STU001", displayName:"Ahmed Ali", email:"ahmed.student@alnoor.edu" }
];

var SMS_STUDENTS = [
  { id:"STU001", schoolId:"SCH001", branchId:"BR001", firstName:"Ahmed",   lastName:"Ali",      fullName:"Ahmed Ali",      grade:"7th Grade",  gradeId:10, gender:"Male",   dateOfBirth:"2012-03-15", enrollmentDate:"2022-08-15", status:"Active", parentIds:["PAR001"], address:{street:"123 Oak Lane",city:"Richardson",state:"TX",zip:"75080"},       emergencyContact:{name:"Mohammad Ali",phone:"(972) 555-0201",relationship:"Father"}, sensitiveInfo:{allergies:["Peanuts"],medicalConditions:[],medications:[],emergencyNotes:"Carries EpiPen"} },
  { id:"STU002", schoolId:"SCH001", branchId:"BR001", firstName:"Zara",    lastName:"Noor",     fullName:"Zara Noor",      grade:"5th Grade",  gradeId:8,  gender:"Female", dateOfBirth:"2014-07-22", enrollmentDate:"2022-08-15", status:"Active", parentIds:["PAR002"], address:{street:"456 Elm St",city:"Richardson",state:"TX",zip:"75082"},          emergencyContact:{name:"Nadia Noor",phone:"(972) 555-0301",relationship:"Mother"},  sensitiveInfo:{allergies:[],medicalConditions:["Asthma"],medications:["Albuterol inhaler"],emergencyNotes:""} },
  { id:"STU003", schoolId:"SCH001", branchId:"BR001", firstName:"Omar",    lastName:"Hassan",   fullName:"Omar Hassan",    grade:"9th Grade",  gradeId:12, gender:"Male",   dateOfBirth:"2010-11-05", enrollmentDate:"2019-08-12", status:"Active", parentIds:["PAR003"], address:{street:"789 Maple Ave",city:"Plano",state:"TX",zip:"75024"},            emergencyContact:{name:"Hassan Omar",phone:"(972) 555-0401",relationship:"Father"}, sensitiveInfo:{allergies:[],medicalConditions:[],medications:[],emergencyNotes:""} },
  { id:"STU004", schoolId:"SCH001", branchId:"BR002", firstName:"Layla",   lastName:"Ibrahim",  fullName:"Layla Ibrahim",  grade:"3rd Grade",  gradeId:6,  gender:"Female", dateOfBirth:"2016-02-14", enrollmentDate:"2023-08-14", status:"Active", parentIds:["PAR004"], address:{street:"321 Cedar Ct",city:"Plano",state:"TX",zip:"75025"},             emergencyContact:{name:"Sara Ibrahim",phone:"(972) 555-0501",relationship:"Mother"}, sensitiveInfo:{allergies:["Dairy"],medicalConditions:[],medications:[],emergencyNotes:""} },
  { id:"STU005", schoolId:"SCH001", branchId:"BR001", firstName:"Yusuf",   lastName:"Malik",    fullName:"Yusuf Malik",    grade:"7th Grade",  gradeId:10, gender:"Male",   dateOfBirth:"2012-09-18", enrollmentDate:"2023-01-10", status:"Active", parentIds:["PAR005"], address:{street:"654 Pine Rd",city:"Richardson",state:"TX",zip:"75081"},          emergencyContact:{name:"Bilal Malik",phone:"(972) 555-0601",relationship:"Father"}, sensitiveInfo:{allergies:[],medicalConditions:[],medications:[],emergencyNotes:""} },
  { id:"STU006", schoolId:"SCH001", branchId:"BR001", firstName:"Hana",    lastName:"Qureshi",  fullName:"Hana Qureshi",   grade:"6th Grade",  gradeId:9,  gender:"Female", dateOfBirth:"2013-05-10", enrollmentDate:"2022-08-15", status:"Active", parentIds:["PAR006"], address:{street:"88 Willow Way",city:"Richardson",state:"TX",zip:"75083"},         emergencyContact:{name:"Tariq Qureshi",phone:"(972) 555-0701",relationship:"Father"}, sensitiveInfo:{allergies:[],medicalConditions:[],medications:[],emergencyNotes:""} },
  { id:"STU007", schoolId:"SCH001", branchId:"BR001", firstName:"Adam",    lastName:"Karimi",   fullName:"Adam Karimi",    grade:"8th Grade",  gradeId:11, gender:"Male",   dateOfBirth:"2011-08-30", enrollmentDate:"2021-08-16", status:"Active", parentIds:["PAR007"], address:{street:"17 Birch Blvd",city:"Garland",state:"TX",zip:"75040"},           emergencyContact:{name:"Lena Karimi",phone:"(972) 555-0801",relationship:"Mother"},  sensitiveInfo:{allergies:[],medicalConditions:[],medications:[],emergencyNotes:""} },
  { id:"STU008", schoolId:"SCH001", branchId:"BR001", firstName:"Mariam",  lastName:"Hussain",  fullName:"Mariam Hussain", grade:"5th Grade",  gradeId:8,  gender:"Female", dateOfBirth:"2014-01-25", enrollmentDate:"2022-08-15", status:"Active", parentIds:["PAR008"], address:{street:"52 Spruce St",city:"Richardson",state:"TX",zip:"75080"},          emergencyContact:{name:"Rahim Hussain",phone:"(972) 555-0901",relationship:"Father"}, sensitiveInfo:{allergies:["Nuts","Shellfish"],medicalConditions:[],medications:[],emergencyNotes:"Severe nut allergy — EpiPen on file"} },
  { id:"STU009", schoolId:"SCH001", branchId:"BR001", firstName:"Khalid",  lastName:"Farooqi",  fullName:"Khalid Farooqi", grade:"10th Grade", gradeId:13, gender:"Male",   dateOfBirth:"2009-12-04", enrollmentDate:"2018-08-20", status:"Active", parentIds:["PAR009"], address:{street:"300 Oak Blvd",city:"Plano",state:"TX",zip:"75025"},             emergencyContact:{name:"Sara Farooqi",phone:"(972) 555-1001",relationship:"Mother"},  sensitiveInfo:{allergies:[],medicalConditions:["ADHD"],medications:["Adderall XR"],emergencyNotes:""} },
  { id:"STU010", schoolId:"SCH001", branchId:"BR001", firstName:"Safiya",  lastName:"Rahman",   fullName:"Safiya Rahman",  grade:"4th Grade",  gradeId:7,  gender:"Female", dateOfBirth:"2015-06-19", enrollmentDate:"2023-08-14", status:"Active", parentIds:["PAR010"], address:{street:"120 Maple Dr",city:"Richardson",state:"TX",zip:"75081"},          emergencyContact:{name:"Dawud Rahman",phone:"(972) 555-1101",relationship:"Father"}, sensitiveInfo:{allergies:[],medicalConditions:[],medications:[],emergencyNotes:""} },
  { id:"STU011", schoolId:"SCH001", branchId:"BR001", firstName:"Ibrahim", lastName:"Chaudhry", fullName:"Ibrahim Chaudhry", grade:"7th Grade", gradeId:10, gender:"Male", dateOfBirth:"2012-07-11", enrollmentDate:"2022-08-15", status:"Active", parentIds:["PAR011"], address:{street:"9 Fern Ct",city:"Richardson",state:"TX",zip:"75082"}, emergencyContact:{name:"Asma Chaudhry",phone:"(972) 555-1201",relationship:"Mother"}, sensitiveInfo:{allergies:[],medicalConditions:[],medications:[],emergencyNotes:""} },
  { id:"STU012", schoolId:"SCH001", branchId:"BR001", firstName:"Nadia",   lastName:"Ansari",   fullName:"Nadia Ansari",   grade:"9th Grade",  gradeId:12, gender:"Female", dateOfBirth:"2010-03-28", enrollmentDate:"2019-08-12", status:"Active", parentIds:["PAR012"], address:{street:"77 Palm Ave",city:"Plano",state:"TX",zip:"75024"},              emergencyContact:{name:"Javid Ansari",phone:"(972) 555-1301",relationship:"Father"}, sensitiveInfo:{allergies:["Latex"],medicalConditions:[],medications:[],emergencyNotes:""} }
];

var SMS_PARENTS = [
  {id:"PAR001",schoolId:"SCH001",branchId:"BR001",firstName:"Mohammad",lastName:"Ali",      fullName:"Mohammad Ali",      email:"m.ali@email.com",      phone:"(972) 555-0201",relationship:"Father",childrenIds:["STU001"],isPrimary:true},
  {id:"PAR002",schoolId:"SCH001",branchId:"BR001",firstName:"Nadia",   lastName:"Noor",     fullName:"Nadia Noor",        email:"n.noor@email.com",     phone:"(972) 555-0301",relationship:"Mother",childrenIds:["STU002","STU008"],isPrimary:true},
  {id:"PAR003",schoolId:"SCH001",branchId:"BR001",firstName:"Hassan",  lastName:"Omar",     fullName:"Hassan Omar",       email:"h.omar@email.com",     phone:"(972) 555-0401",relationship:"Father",childrenIds:["STU003"],isPrimary:true},
  {id:"PAR004",schoolId:"SCH001",branchId:"BR002",firstName:"Sara",    lastName:"Ibrahim",  fullName:"Sara Ibrahim",      email:"s.ibrahim@email.com",  phone:"(972) 555-0501",relationship:"Mother",childrenIds:["STU004"],isPrimary:true},
  {id:"PAR005",schoolId:"SCH001",branchId:"BR001",firstName:"Bilal",   lastName:"Malik",    fullName:"Bilal Malik",       email:"b.malik@email.com",    phone:"(972) 555-0601",relationship:"Father",childrenIds:["STU005"],isPrimary:true},
  {id:"PAR006",schoolId:"SCH001",branchId:"BR001",firstName:"Tariq",   lastName:"Qureshi",  fullName:"Tariq Qureshi",     email:"t.qureshi@email.com",  phone:"(972) 555-0701",relationship:"Father",childrenIds:["STU006"],isPrimary:true},
  {id:"PAR007",schoolId:"SCH001",branchId:"BR001",firstName:"Lena",    lastName:"Karimi",   fullName:"Lena Karimi",       email:"l.karimi@email.com",   phone:"(972) 555-0801",relationship:"Mother",childrenIds:["STU007"],isPrimary:true},
  {id:"PAR008",schoolId:"SCH001",branchId:"BR001",firstName:"Rahim",   lastName:"Hussain",  fullName:"Rahim Hussain",     email:"r.hussain@email.com",  phone:"(972) 555-0901",relationship:"Father",childrenIds:["STU008"],isPrimary:false},
  {id:"PAR009",schoolId:"SCH001",branchId:"BR001",firstName:"Sara",    lastName:"Farooqi",  fullName:"Sara Farooqi",      email:"s.farooqi@email.com",  phone:"(972) 555-1001",relationship:"Mother",childrenIds:["STU009"],isPrimary:true},
  {id:"PAR010",schoolId:"SCH001",branchId:"BR001",firstName:"Dawud",   lastName:"Rahman",   fullName:"Dawud Rahman",      email:"d.rahman@email.com",   phone:"(972) 555-1101",relationship:"Father",childrenIds:["STU010"],isPrimary:true},
  {id:"PAR011",schoolId:"SCH001",branchId:"BR001",firstName:"Asma",    lastName:"Chaudhry", fullName:"Asma Chaudhry",     email:"a.chaudhry@email.com", phone:"(972) 555-1201",relationship:"Mother",childrenIds:["STU011"],isPrimary:true},
  {id:"PAR012",schoolId:"SCH001",branchId:"BR001",firstName:"Javid",   lastName:"Ansari",   fullName:"Javid Ansari",      email:"j.ansari@email.com",   phone:"(972) 555-1301",relationship:"Father",childrenIds:["STU012"],isPrimary:true}
];


// ----- Teacher permission architecture -----
// UI/demo permissions are stored per teacher. Supabase will enforce the same
// keys with RLS / server-side authorization; the browser is not a security boundary.
var SMS_TEACHER_PERMISSION_CATALOG = [
  { group:"Core", key:"dashboard.view", label:"Dashboard", description:"Open the teacher dashboard.", level:"view" },
  { group:"Academics", key:"classes.view", label:"Classes", description:"View assigned classes and rosters.", level:"view" },
  { group:"Students", key:"students.view", label:"Student basic profiles", description:"View names, grade, DOB and assigned-class information for their students.", level:"view" },
  { group:"Students", key:"students.guardian_contact", label:"Guardian contact details", description:"View parent/guardian names, phone numbers and email addresses for assigned students.", level:"sensitive" },
  { group:"Students", key:"students.health_alerts", label:"Health & emergency alerts", description:"View allergies, medical alerts, medications and emergency notes for assigned students.", level:"sensitive" },
  { group:"Attendance", key:"attendance.view", label:"Attendance — View", description:"View attendance for assigned classes.", level:"view" },
  { group:"Attendance", key:"attendance.manage", label:"Attendance — Manage", description:"Mark or change attendance for assigned classes.", level:"manage", requires:"attendance.view" },
  { group:"Grades", key:"grades.view", label:"Gradebook — View", description:"View grades for assigned classes.", level:"view" },
  { group:"Grades", key:"grades.manage", label:"Gradebook — Manage", description:"Enter and update grades for assigned classes.", level:"manage", requires:"grades.view" },
  { group:"Assignments", key:"assignments.view", label:"Assignments — View", description:"View assignments for assigned classes.", level:"view" },
  { group:"Assignments", key:"assignments.manage", label:"Assignments — Manage", description:"Create and remove assignments for assigned classes.", level:"manage", requires:"assignments.view" },
  { group:"Reports", key:"report_cards.view", label:"Report Cards — View", description:"View report-card information for assigned students.", level:"view" },
  { group:"Reports", key:"report_cards.manage", label:"Report Cards — Manage", description:"Prepare/update report-card information for assigned students.", level:"manage", requires:"report_cards.view" },
  { group:"Communication", key:"announcements.view", label:"Announcements", description:"View school announcements.", level:"view" },
  { group:"Communication", key:"messages.view", label:"Messages — View", description:"Open teacher messages.", level:"view" },
  { group:"Communication", key:"messages.send", label:"Messages — Send", description:"Send messages through allowed school channels.", level:"manage", requires:"messages.view" },
  { group:"Resources", key:"schedule.view", label:"Schedule", description:"View personal teaching schedule.", level:"view" },
  { group:"Resources", key:"documents.view", label:"Documents — View", description:"View/download teacher-visible documents.", level:"view" },
  { group:"Resources", key:"documents.upload", label:"Documents — Upload", description:"Upload documents for permitted audiences.", level:"manage", requires:"documents.view" }
];

var SMS_TEACHER_PERMISSION_PRESETS = {
  standard: {
    name:"Standard Teacher",
    description:"Normal classroom access for assigned classes and students.",
    permissions:{
      "dashboard.view":true,"classes.view":true,"students.view":true,
      "students.guardian_contact":false,"students.health_alerts":true,
      "attendance.view":true,"attendance.manage":true,
      "grades.view":true,"grades.manage":true,
      "assignments.view":true,"assignments.manage":true,
      "report_cards.view":true,"report_cards.manage":true,
      "announcements.view":true,"messages.view":true,"messages.send":true,
      "schedule.view":true,"documents.view":true,"documents.upload":false
    }
  },
  academic: {
    name:"Academic Only",
    description:"Grades, assignments and reports; no guardian or health access.",
    permissions:{
      "dashboard.view":true,"classes.view":true,"students.view":true,
      "students.guardian_contact":false,"students.health_alerts":false,
      "attendance.view":true,"attendance.manage":false,
      "grades.view":true,"grades.manage":true,
      "assignments.view":true,"assignments.manage":true,
      "report_cards.view":true,"report_cards.manage":true,
      "announcements.view":true,"messages.view":true,"messages.send":false,
      "schedule.view":true,"documents.view":true,"documents.upload":false
    }
  },
  limited: {
    name:"Limited Instructor",
    description:"Basic classroom and attendance access with no grade editing.",
    permissions:{
      "dashboard.view":true,"classes.view":true,"students.view":true,
      "students.guardian_contact":false,"students.health_alerts":false,
      "attendance.view":true,"attendance.manage":true,
      "grades.view":false,"grades.manage":false,
      "assignments.view":true,"assignments.manage":false,
      "report_cards.view":false,"report_cards.manage":false,
      "announcements.view":true,"messages.view":true,"messages.send":false,
      "schedule.view":true,"documents.view":true,"documents.upload":false
    }
  }
};

function SMS_cloneTeacherPermissions(presetKey) {
  var p = SMS_TEACHER_PERMISSION_PRESETS[presetKey] || SMS_TEACHER_PERMISSION_PRESETS.standard;
  return JSON.parse(JSON.stringify(p.permissions));
}

var SMS_TEACHERS = [
  {id:"TCH001",schoolId:"SCH001",branchId:"BR001",firstName:"Aisha",  lastName:"Hassan",   fullName:"Ms. Aisha Hassan",    title:"Ms.",     email:"a.hassan@alnoor.edu",    phone:"(972) 555-1001",subjects:["Mathematics","Science"],         department:"STEM",          hireDate:"2019-08-01",status:"Active",assignedClassIds:["CLS001","CLS002"]},
  {id:"TCH002",schoolId:"SCH001",branchId:"BR001",firstName:"Khalid", lastName:"Khan",     fullName:"Mr. Khalid Khan",     title:"Mr.",     email:"k.khan@alnoor.edu",      phone:"(972) 555-1002",subjects:["English Language Arts","Social Studies"],department:"Humanities", hireDate:"2020-08-01",status:"Active",assignedClassIds:["CLS003","CLS004"]},
  {id:"TCH003",schoolId:"SCH001",branchId:"BR001",firstName:"Maryam", lastName:"Siddiqui", fullName:"Ms. Maryam Siddiqui", title:"Ms.",     email:"m.siddiqui@alnoor.edu",  phone:"(972) 555-1003",subjects:["Islamic Studies","Arabic"],       department:"Islamic Studies",hireDate:"2021-08-01",status:"Active",assignedClassIds:["CLS005"]},
  {id:"TCH004",schoolId:"SCH001",branchId:"BR002",firstName:"Ibrahim",lastName:"Rauf",     fullName:"Ustadh Ibrahim Rauf", title:"Ustadh", email:"i.rauf@alnoor.edu",       phone:"(972) 555-2001",subjects:["Quran","Islamic Studies"],        department:"Islamic Studies",hireDate:"2022-01-15",status:"Active",assignedClassIds:["CLS006"]}
];

// Normalize demo records into the richer enrollment model used by the UI.
SMS_STUDENTS.forEach(function(student, index) {
  student.middleName = student.middleName || "";
  student.preferredName = student.preferredName || student.firstName;
  student.legalName = student.legalName || [student.firstName, student.middleName, student.lastName].filter(Boolean).join(" ");
  student.address = student.address || {};
  student.address.line2 = student.address.line2 || "";
  student.address.country = student.address.country || "United States";
  student.emergencyContact = student.emergencyContact || {name:"",phone:"",relationship:""};
  student.sensitiveInfo = student.sensitiveInfo || {};
  student.sensitiveInfo.allergies = student.sensitiveInfo.allergies || [];
  student.sensitiveInfo.medicalConditions = student.sensitiveInfo.medicalConditions || [];
  student.sensitiveInfo.medications = student.sensitiveInfo.medications || [];
  student.sensitiveInfo.emergencyNotes = student.sensitiveInfo.emergencyNotes || "";
  // Invalid 000-prefix values are deliberate demo placeholders, never real SSNs.
  student.sensitiveInfo.governmentIdentifiers = student.sensitiveInfo.governmentIdentifiers || {
    ssn: "000-00-" + String(index + 1).padStart(4, "0"),
    birthCertificateNumber: "DEMO-TX-BC-" + String(index + 1).padStart(5, "0"),
    passportNumber: "",
    stateStudentId: "TX-DEMO-" + String(index + 1).padStart(6, "0")
  };
});

SMS_PARENTS.forEach(function(parent) {
  var firstChild = SMS_STUDENTS.find(function(student) { return (parent.childrenIds || []).indexOf(student.id) !== -1; });
  parent.middleName = parent.middleName || "";
  parent.legalName = parent.legalName || [parent.firstName, parent.middleName, parent.lastName].filter(Boolean).join(" ");
  parent.address = parent.address || (firstChild && firstChild.address ? JSON.parse(JSON.stringify(firstChild.address)) : {street:"",line2:"",city:"",state:"",zip:"",country:"United States"});
  parent.legalGuardian = parent.legalGuardian !== false;
  parent.authorizedPickup = parent.authorizedPickup !== false;
  parent.receivesSchoolCommunication = parent.receivesSchoolCommunication !== false;
  parent.preferredLanguage = parent.preferredLanguage || "English";
  parent.employer = parent.employer || "";
  parent.workPhone = parent.workPhone || "";
});

// A couple of two-guardian demo households make the family workflow visible.
if (!SMS_PARENTS.some(function(p){ return p.id === "PAR013"; })) {
  SMS_PARENTS.push({id:"PAR013",schoolId:"SCH001",branchId:"BR001",firstName:"Amina",middleName:"",lastName:"Ali",fullName:"Amina Ali",legalName:"Amina Ali",email:"amina.ali@email.com",phone:"(972) 555-0202",relationship:"Mother",childrenIds:["STU001"],isPrimary:false,legalGuardian:true,authorizedPickup:true,receivesSchoolCommunication:true,preferredLanguage:"English",address:{street:"123 Oak Lane",line2:"",city:"Richardson",state:"TX",zip:"75080",country:"United States"}});
  var demoStudent1 = SMS_STUDENTS.find(function(s){return s.id==="STU001";});
  if (demoStudent1 && demoStudent1.parentIds.indexOf("PAR013")===-1) demoStudent1.parentIds.push("PAR013");
}
if (!SMS_PARENTS.some(function(p){ return p.id === "PAR014"; })) {
  SMS_PARENTS.push({id:"PAR014",schoolId:"SCH001",branchId:"BR001",firstName:"Samir",middleName:"",lastName:"Noor",fullName:"Samir Noor",legalName:"Samir Noor",email:"samir.noor@email.com",phone:"(972) 555-0302",relationship:"Father",childrenIds:["STU002"],isPrimary:false,legalGuardian:true,authorizedPickup:true,receivesSchoolCommunication:true,preferredLanguage:"English",address:{street:"456 Elm St",line2:"",city:"Richardson",state:"TX",zip:"75082",country:"United States"}});
  var demoStudent2 = SMS_STUDENTS.find(function(s){return s.id==="STU002";});
  if (demoStudent2 && demoStudent2.parentIds.indexOf("PAR014")===-1) demoStudent2.parentIds.push("PAR014");
}

SMS_TEACHERS.forEach(function(teacher, index) {
  teacher.permissionPreset = teacher.permissionPreset || (index === 2 ? "academic" : "standard");
  teacher.permissions = teacher.permissions || SMS_cloneTeacherPermissions(teacher.permissionPreset);
  teacher.portalAccess = teacher.portalAccess || { status:"Active", inviteEmail:teacher.email, lastInviteAt:null };
  var teacherUser = SMS_USERS.find(function(u){ return u.teacherId === teacher.id; });
  if (teacherUser) teacher.portalAccess.username = teacherUser.username;
});

var SMS_CLASSES = [
  {id:"CLS001",schoolId:"SCH001",branchId:"BR001",name:"Mathematics 7",       subject:"Mathematics",        grade:"7th Grade",gradeId:10,teacherId:"TCH001",teacherName:"Ms. Aisha Hassan",   room:"101",   schedule:"Mon, Wed, Fri 8:00–8:50 AM",  studentIds:["STU001","STU005","STU011"],semester:"Full Year"},
  {id:"CLS002",schoolId:"SCH001",branchId:"BR001",name:"Science 9",           subject:"Science",            grade:"9th Grade",gradeId:12,teacherId:"TCH001",teacherName:"Ms. Aisha Hassan",   room:"Lab 1", schedule:"Tue, Thu 9:00–10:15 AM",      studentIds:["STU003","STU012"],          semester:"Full Year"},
  {id:"CLS003",schoolId:"SCH001",branchId:"BR001",name:"English 7",           subject:"English Language Arts",grade:"7th Grade",gradeId:10,teacherId:"TCH002",teacherName:"Mr. Khalid Khan",   room:"203",   schedule:"Mon, Wed, Fri 9:00–9:50 AM",  studentIds:["STU001","STU005","STU011"],semester:"Full Year"},
  {id:"CLS004",schoolId:"SCH001",branchId:"BR001",name:"English 5",           subject:"English Language Arts",grade:"5th Grade",gradeId:8, teacherId:"TCH002",teacherName:"Mr. Khalid Khan",   room:"204",   schedule:"Tue, Thu 10:00–10:50 AM",     studentIds:["STU002","STU008"],          semester:"Full Year"},
  {id:"CLS005",schoolId:"SCH001",branchId:"BR001",name:"Islamic Studies",     subject:"Islamic Studies",    grade:"All",     gradeId:null,teacherId:"TCH003",teacherName:"Ms. Maryam Siddiqui",room:"Masjid",schedule:"Mon–Thu 1:00–1:45 PM",       studentIds:["STU001","STU002","STU003","STU005","STU006","STU007","STU009","STU011","STU012"],semester:"Full Year"},
  {id:"CLS006",schoolId:"SCH001",branchId:"BR002",name:"Quran & Tajweed",     subject:"Quran",              grade:"3rd Grade",gradeId:6, teacherId:"TCH004",teacherName:"Ustadh Ibrahim Rauf",room:"P-101", schedule:"Mon, Wed 9:00–9:45 AM",       studentIds:["STU004"],                   semester:"Full Year"}
];

var SMS_ASSIGNMENTS = [
  {id:"ASN001",classId:"CLS001",schoolId:"SCH001",branchId:"BR001",title:"Chapter 5 Problem Set",     subject:"Mathematics",        type:"Homework",  totalPoints:100,dueDate:"2026-08-24",status:"Active"},
  {id:"ASN002",classId:"CLS001",schoolId:"SCH001",branchId:"BR001",title:"Mid-Term Exam",             subject:"Mathematics",        type:"Exam",      totalPoints:200,dueDate:"2026-09-18",status:"Active"},
  {id:"ASN003",classId:"CLS001",schoolId:"SCH001",branchId:"BR001",title:"Chapter 6 Quiz",            subject:"Mathematics",        type:"Quiz",      totalPoints:50, dueDate:"2026-09-11",status:"Active"},
  {id:"ASN004",classId:"CLS003",schoolId:"SCH001",branchId:"BR001",title:"Book Report — Hatchet",     subject:"English Language Arts",type:"Project",  totalPoints:150,dueDate:"2026-08-28",status:"Active"},
  {id:"ASN005",classId:"CLS003",schoolId:"SCH001",branchId:"BR001",title:"Grammar Worksheet 4",       subject:"English Language Arts",type:"Homework", totalPoints:25, dueDate:"2026-08-21",status:"Active"},
  {id:"ASN006",classId:"CLS002",schoolId:"SCH001",branchId:"BR001",title:"Lab Report — Photosynthesis",subject:"Science",           type:"Project",   totalPoints:100,dueDate:"2026-09-08",status:"Active"},
  {id:"ASN007",classId:"CLS002",schoolId:"SCH001",branchId:"BR001",title:"Chapter 4 Test",            subject:"Science",            type:"Exam",      totalPoints:100,dueDate:"2026-09-15",status:"Active"},
  {id:"ASN008",classId:"CLS004",schoolId:"SCH001",branchId:"BR001",title:"Reading Comprehension Quiz", subject:"English Language Arts",type:"Quiz",    totalPoints:40, dueDate:"2026-08-27",status:"Active"}
];

var SMS_GRADES_RECORDS = [
  {id:"GRD001",studentId:"STU001",classId:"CLS001",assignmentId:"ASN001",schoolId:"SCH001",branchId:"BR001",score:88,  totalPoints:100,letterGrade:"B+",gradedDate:"2026-08-25"},
  {id:"GRD002",studentId:"STU005",classId:"CLS001",assignmentId:"ASN001",schoolId:"SCH001",branchId:"BR001",score:95,  totalPoints:100,letterGrade:"A", gradedDate:"2026-08-25"},
  {id:"GRD003",studentId:"STU011",classId:"CLS001",assignmentId:"ASN001",schoolId:"SCH001",branchId:"BR001",score:76,  totalPoints:100,letterGrade:"C+",gradedDate:"2026-08-25"},
  {id:"GRD004",studentId:"STU001",classId:"CLS003",assignmentId:"ASN004",schoolId:"SCH001",branchId:"BR001",score:138, totalPoints:150,letterGrade:"A-",gradedDate:"2026-08-31"},
  {id:"GRD005",studentId:"STU005",classId:"CLS003",assignmentId:"ASN004",schoolId:"SCH001",branchId:"BR001",score:142, totalPoints:150,letterGrade:"A", gradedDate:"2026-08-31"},
  {id:"GRD006",studentId:"STU002",classId:"CLS004",assignmentId:"ASN008",schoolId:"SCH001",branchId:"BR001",score:36,  totalPoints:40, letterGrade:"A-",gradedDate:"2026-08-28"},
  {id:"GRD007",studentId:"STU008",classId:"CLS004",assignmentId:"ASN008",schoolId:"SCH001",branchId:"BR001",score:32,  totalPoints:40, letterGrade:"B", gradedDate:"2026-08-28"},
  {id:"GRD008",studentId:"STU003",classId:"CLS002",assignmentId:"ASN006",schoolId:"SCH001",branchId:"BR001",score:91,  totalPoints:100,letterGrade:"A-",gradedDate:"2026-09-02"},
  {id:"GRD009",studentId:"STU012",classId:"CLS002",assignmentId:"ASN006",schoolId:"SCH001",branchId:"BR001",score:85,  totalPoints:100,letterGrade:"B",gradedDate:"2026-09-02"},
  {id:"GRD010",studentId:"STU001",classId:"CLS001",assignmentId:"ASN003",schoolId:"SCH001",branchId:"BR001",score:44,  totalPoints:50, letterGrade:"A-",gradedDate:"2026-09-03"},
  {id:"GRD011",studentId:"STU005",classId:"CLS001",assignmentId:"ASN003",schoolId:"SCH001",branchId:"BR001",score:48,  totalPoints:50, letterGrade:"A+",gradedDate:"2026-09-03"},
  {id:"GRD012",studentId:"STU011",classId:"CLS001",assignmentId:"ASN003",schoolId:"SCH001",branchId:"BR001",score:38,  totalPoints:50, letterGrade:"B",gradedDate:"2026-09-03"}
];

var SMS_CLASS_AVERAGES = [
  {studentId:"STU001",classId:"CLS001",average:91,letterGrade:"A-",period:"2026-2027-S1"},
  {studentId:"STU001",classId:"CLS003",average:92,letterGrade:"A-",period:"2026-2027-S1"},
  {studentId:"STU001",classId:"CLS005",average:88,letterGrade:"B+",period:"2026-2027-S1"},
  {studentId:"STU005",classId:"CLS001",average:96,letterGrade:"A", period:"2026-2027-S1"},
  {studentId:"STU005",classId:"CLS003",average:95,letterGrade:"A", period:"2026-2027-S1"},
  {studentId:"STU011",classId:"CLS001",average:78,letterGrade:"C+",period:"2026-2027-S1"},
  {studentId:"STU011",classId:"CLS003",average:82,letterGrade:"B-",period:"2026-2027-S1"},
  {studentId:"STU002",classId:"CLS004",average:90,letterGrade:"A-",period:"2026-2027-S1"},
  {studentId:"STU002",classId:"CLS005",average:95,letterGrade:"A", period:"2026-2027-S1"},
  {studentId:"STU008",classId:"CLS004",average:83,letterGrade:"B", period:"2026-2027-S1"},
  {studentId:"STU003",classId:"CLS002",average:89,letterGrade:"B+",period:"2026-2027-S1"},
  {studentId:"STU003",classId:"CLS005",average:97,letterGrade:"A+",period:"2026-2027-S1"},
  {studentId:"STU012",classId:"CLS002",average:86,letterGrade:"B", period:"2026-2027-S1"},
  {studentId:"STU012",classId:"CLS005",average:91,letterGrade:"A-",period:"2026-2027-S1"}
];

var SMS_ATTENDANCE = [
  // Ahmed Ali (STU001) — Math 7 (CLS001)
  {id:"ATT001",studentId:"STU001",classId:"CLS001",branchId:"BR001",date:"2026-08-18",status:"Present",markedBy:"TCH001",markedAt:"2026-08-18T08:05:00"},
  {id:"ATT002",studentId:"STU001",classId:"CLS001",branchId:"BR001",date:"2026-08-20",status:"Present",markedBy:"TCH001",markedAt:"2026-08-20T08:03:00"},
  {id:"ATT003",studentId:"STU001",classId:"CLS001",branchId:"BR001",date:"2026-08-24",status:"Absent", markedBy:"TCH001",markedAt:"2026-08-24T08:07:00"},
  {id:"ATT004",studentId:"STU001",classId:"CLS001",branchId:"BR001",date:"2026-08-25",status:"Present",markedBy:"TCH001",markedAt:"2026-08-25T08:04:00"},
  {id:"ATT005",studentId:"STU001",classId:"CLS001",branchId:"BR001",date:"2026-08-27",status:"Tardy",  markedBy:"TCH001",markedAt:"2026-08-27T08:15:00"},
  {id:"ATT006",studentId:"STU001",classId:"CLS001",branchId:"BR001",date:"2026-08-31",status:"Present",markedBy:"TCH001",markedAt:"2026-08-31T08:02:00"},
  {id:"ATT007",studentId:"STU001",classId:"CLS001",branchId:"BR001",date:"2026-09-01",status:"Present",markedBy:"TCH001",markedAt:"2026-09-01T08:05:00"},
  {id:"ATT008",studentId:"STU001",classId:"CLS001",branchId:"BR001",date:"2026-09-03",status:"Excused",markedBy:"TCH001",markedAt:"2026-09-03T08:06:00"},
  // Yusuf Malik (STU005)
  {id:"ATT009",studentId:"STU005",classId:"CLS001",branchId:"BR001",date:"2026-08-18",status:"Present",markedBy:"TCH001",markedAt:"2026-08-18T08:05:00"},
  {id:"ATT010",studentId:"STU005",classId:"CLS001",branchId:"BR001",date:"2026-08-20",status:"Present",markedBy:"TCH001",markedAt:"2026-08-20T08:03:00"},
  {id:"ATT011",studentId:"STU005",classId:"CLS001",branchId:"BR001",date:"2026-08-24",status:"Present",markedBy:"TCH001",markedAt:"2026-08-24T08:07:00"},
  {id:"ATT012",studentId:"STU005",classId:"CLS001",branchId:"BR001",date:"2026-08-25",status:"Present",markedBy:"TCH001",markedAt:"2026-08-25T08:04:00"},
  {id:"ATT013",studentId:"STU005",classId:"CLS001",branchId:"BR001",date:"2026-08-27",status:"Present",markedBy:"TCH001",markedAt:"2026-08-27T08:03:00"},
  // Zara Noor (STU002)
  {id:"ATT014",studentId:"STU002",classId:"CLS004",branchId:"BR001",date:"2026-08-19",status:"Tardy",  markedBy:"TCH002",markedAt:"2026-08-19T10:12:00"},
  {id:"ATT015",studentId:"STU002",classId:"CLS004",branchId:"BR001",date:"2026-08-21",status:"Present",markedBy:"TCH002",markedAt:"2026-08-21T10:01:00"},
  {id:"ATT016",studentId:"STU002",classId:"CLS004",branchId:"BR001",date:"2026-08-26",status:"Present",markedBy:"TCH002",markedAt:"2026-08-26T10:01:00"},
  {id:"ATT017",studentId:"STU002",classId:"CLS004",branchId:"BR001",date:"2026-08-28",status:"Absent", markedBy:"TCH002",markedAt:"2026-08-28T10:02:00"},
  {id:"ATT018",studentId:"STU002",classId:"CLS004",branchId:"BR001",date:"2026-09-02",status:"Present",markedBy:"TCH002",markedAt:"2026-09-02T10:01:00"},
  // Omar Hassan (STU003)
  {id:"ATT019",studentId:"STU003",classId:"CLS002",branchId:"BR001",date:"2026-08-19",status:"Present",markedBy:"TCH001",markedAt:"2026-08-19T09:02:00"},
  {id:"ATT020",studentId:"STU003",classId:"CLS002",branchId:"BR001",date:"2026-08-21",status:"Present",markedBy:"TCH001",markedAt:"2026-08-21T09:01:00"},
  {id:"ATT021",studentId:"STU003",classId:"CLS002",branchId:"BR001",date:"2026-08-26",status:"Absent", markedBy:"TCH001",markedAt:"2026-08-26T09:05:00"},
  {id:"ATT022",studentId:"STU003",classId:"CLS002",branchId:"BR001",date:"2026-08-28",status:"Present",markedBy:"TCH001",markedAt:"2026-08-28T09:01:00"},
  // Ibrahim Chaudhry (STU011)
  {id:"ATT023",studentId:"STU011",classId:"CLS001",branchId:"BR001",date:"2026-08-18",status:"Present",markedBy:"TCH001",markedAt:"2026-08-18T08:05:00"},
  {id:"ATT024",studentId:"STU011",classId:"CLS001",branchId:"BR001",date:"2026-08-20",status:"Absent", markedBy:"TCH001",markedAt:"2026-08-20T08:08:00"},
  {id:"ATT025",studentId:"STU011",classId:"CLS001",branchId:"BR001",date:"2026-08-24",status:"Present",markedBy:"TCH001",markedAt:"2026-08-24T08:05:00"},
  {id:"ATT026",studentId:"STU011",classId:"CLS001",branchId:"BR001",date:"2026-08-25",status:"Tardy",  markedBy:"TCH001",markedAt:"2026-08-25T08:18:00"},
  {id:"ATT027",studentId:"STU011",classId:"CLS001",branchId:"BR001",date:"2026-08-27",status:"Present",markedBy:"TCH001",markedAt:"2026-08-27T08:04:00"},
  {id:"ATT028",studentId:"STU011",classId:"CLS001",branchId:"BR001",date:"2026-08-31",status:"Absent", markedBy:"TCH001",markedAt:"2026-08-31T08:09:00"},
];

var SMS_EXPENSES = [
  {id:"EXP001",studentId:"STU001",schoolId:"SCH001",branchId:"BR001",description:"Annual Tuition 2026-2027",  amount:9600,paid:4800,balance:4800,dueDate:"2027-06-01",status:"Partial",category:"Tuition"},
  {id:"EXP002",studentId:"STU001",schoolId:"SCH001",branchId:"BR001",description:"Registration Fee",           amount:300, paid:300, balance:0,   dueDate:"2026-08-01",status:"Paid",   category:"Fee"},
  {id:"EXP003",studentId:"STU001",schoolId:"SCH001",branchId:"BR001",description:"Technology Fee 2026-2027",  amount:200, paid:200, balance:0,   dueDate:"2026-09-01",status:"Paid",   category:"Fee"},
  {id:"EXP004",studentId:"STU002",schoolId:"SCH001",branchId:"BR001",description:"Annual Tuition 2026-2027",  amount:9600,paid:9600,balance:0,   dueDate:"2027-06-01",status:"Paid",   category:"Tuition"},
  {id:"EXP005",studentId:"STU003",schoolId:"SCH001",branchId:"BR001",description:"Annual Tuition 2026-2027",  amount:9600,paid:0,   balance:9600,dueDate:"2026-09-15",status:"Unpaid", category:"Tuition"},
  {id:"EXP006",studentId:"STU003",schoolId:"SCH001",branchId:"BR001",description:"Technology Fee 2026-2027",  amount:200, paid:0,   balance:200, dueDate:"2026-09-15",status:"Unpaid", category:"Fee"},
  {id:"EXP007",studentId:"STU005",schoolId:"SCH001",branchId:"BR001",description:"Annual Tuition 2026-2027",  amount:9600,paid:6400,balance:3200,dueDate:"2027-06-01",status:"Partial",category:"Tuition"},
  {id:"EXP008",studentId:"STU006",schoolId:"SCH001",branchId:"BR001",description:"Annual Tuition 2026-2027",  amount:9600,paid:9600,balance:0,   dueDate:"2027-06-01",status:"Paid",   category:"Tuition"},
  {id:"EXP009",studentId:"STU007",schoolId:"SCH001",branchId:"BR001",description:"Annual Tuition 2026-2027",  amount:9600,paid:3200,balance:6400,dueDate:"2026-10-01",status:"Partial",category:"Tuition"},
  {id:"EXP010",studentId:"STU009",schoolId:"SCH001",branchId:"BR001",description:"Annual Tuition 2026-2027",  amount:9600,paid:9600,balance:0,   dueDate:"2027-06-01",status:"Paid",   category:"Tuition"},
  {id:"EXP011",studentId:"STU009",schoolId:"SCH001",branchId:"BR001",description:"Field Trip — Science Museum",amount:45,  paid:0,   balance:45,  dueDate:"2026-09-30",status:"Unpaid", category:"Activity"},
  {id:"EXP012",studentId:"STU011",schoolId:"SCH001",branchId:"BR001",description:"Annual Tuition 2026-2027",  amount:9600,paid:4800,balance:4800,dueDate:"2027-06-01",status:"Partial",category:"Tuition"}
];

var SMS_EVENTS = [
  {id:"EVT001",schoolId:"SCH001",branchId:"BR001",title:"Parent-Teacher Conference",   description:"Fall conference week with all teachers",                   startDate:"2026-09-21",endDate:"2026-09-25",type:"PTC",        location:"Main Building",                requiresRegistration:true,  registrationDeadline:"2026-09-18"},
  {id:"EVT002",schoolId:"SCH001",branchId:"BR001",title:"Islamic Awareness Week",       description:"A week of community education and reflection",             startDate:"2026-10-05",endDate:"2026-10-09",type:"Academic",   location:"Campus-wide",                  requiresRegistration:false, registrationDeadline:null},
  {id:"EVT003",schoolId:"SCH001",branchId:"BR001",title:"Annual Fundraising Gala",      description:"Support Al-Noor Academy's building expansion fund",        startDate:"2026-11-14",endDate:"2026-11-14",type:"Fundraiser", location:"Richardson Civic Center",      requiresRegistration:true,  registrationDeadline:"2026-11-07",ticketPrice:"$75/person"},
  {id:"EVT004",schoolId:"SCH001",branchId:"BR002",title:"Quran Competition (Plano)",    description:"Branch-level Quran recitation competition",                startDate:"2026-10-24",endDate:"2026-10-24",type:"Academic",   location:"Plano Campus Auditorium",      requiresRegistration:true,  registrationDeadline:"2026-10-19"},
  {id:"EVT005",schoolId:"SCH001",branchId:"BR001",title:"Family Welcome Picnic",      description:"School-wide family picnic with activities for all ages", startDate:"2026-09-12",endDate:"2026-09-12",type:"Academic",   location:"Gymnasium",                    requiresRegistration:false, registrationDeadline:null},
  {id:"EVT006",schoolId:"SCH001",branchId:"BR001",title:"Science Fair 2026",            description:"Annual science fair — students showcase their projects",   startDate:"2026-11-06",endDate:"2026-11-06",type:"Academic",   location:"Main Building — Gymnasium",    requiresRegistration:false, registrationDeadline:null},
  {id:"EVT007",schoolId:"SCH001",branchId:"BR001",title:"Community Dinner",         description:"Community dinner for families and staff",            startDate:"2026-09-18",endDate:"2026-09-18",type:"Fundraiser", location:"School Cafeteria",             requiresRegistration:true,  registrationDeadline:"2026-09-14"}
];

var SMS_ANNOUNCEMENTS = [
  {id:"ANN001",schoolId:"SCH001",branchId:"BR001",title:"Welcome to the 2026–2027 School Year",        body:"Welcome back! The 2026–2027 school year is underway. Please review the updated handbook, calendar, and arrival procedures in the Documents area.",                          date:"2026-08-17",authorId:"USR002",authorName:"Principal Sarah Ahmed",audience:"All",   priority:"high"},
  {id:"ANN002",schoolId:"SCH001",branchId:"BR001",title:"Arrival & Dismissal Reminder",               body:"Morning drop-off begins at 7:35 AM. Please use the designated lane and keep student pickup cards visible during dismissal.",                   date:"2026-08-24",authorId:"USR002",authorName:"Principal Sarah Ahmed",audience:"All",   priority:"normal"},
  {id:"ANN003",schoolId:"SCH001",branchId:null,   title:"Cafeteria Menu Is Live",      body:"The September cafeteria menu is now available in the Parent Portal. Allergy notes and meal details are listed for each day.",   date:"2026-08-27",authorId:"USR001",authorName:"Dr. Yusuf Al-Rashidi",  audience:"All",   priority:"normal"},
  {id:"ANN004",schoolId:"SCH001",branchId:"BR001",title:"First Progress Check Coming Soon",      body:"Teachers will post the first progress check this month. Families can review current grades anytime in the Parent Portal.", date:"2026-08-31",authorId:"USR002",authorName:"Principal Sarah Ahmed",audience:"Parents",priority:"normal"},
  {id:"ANN005",schoolId:"SCH001",branchId:"BR001",title:"Fall Book Fair — September 14–18",            body:"The fall book fair runs September 14–18. Students may visit during lunch and families are welcome after dismissal.",               date:"2026-09-01",authorId:"USR002",authorName:"Principal Sarah Ahmed",audience:"All",   priority:"normal"},
  {id:"ANN006",schoolId:"SCH001",branchId:"BR001",title:"Reminder: Fall PTC Slots Open",        body:"Fall Parent-Teacher Conference slots are open. Log in to the Parent Portal, go to Events, and choose your preferred time.",     date:"2026-09-02",authorId:"USR002",authorName:"Principal Sarah Ahmed",audience:"Parents",priority:"high"}
];

var SMS_LUNCH_MENU = {
  weekOf:"2026-08-31",
  branchId:"BR001",
  menu:[
    {day:"Monday",   date:"2026-08-31",mainDish:"Chicken Biryani",         sides:["Garden Salad","Naan"],        dessert:"Fresh Fruit",  price:"$6.00",isHalal:true},
    {day:"Tuesday",  date:"2026-09-01",mainDish:"Beef Tacos",              sides:["Rice","Black Beans"],          dessert:"Churros",      price:"$6.00",isHalal:true},
    {day:"Wednesday",date:"2026-09-02",mainDish:"Grilled Salmon",          sides:["Roasted Vegetables","Quinoa"], dessert:"Fruit Cup",    price:"$7.00",isHalal:true},
    {day:"Thursday", date:"2026-09-03",mainDish:"Chicken Shawarma Wrap",   sides:["Hummus","Pita Bread"],         dessert:"Baklava",      price:"$6.50",isHalal:true},
    {day:"Friday",   date:"2026-09-04",mainDish:"Pasta Primavera",         sides:["Garlic Bread","Caesar Salad"], dessert:"Cookies",      price:"$5.50",isHalal:true}
  ]
};

var SMS_FORMS = [
  {id:"FRM001",schoolId:"SCH001",branchId:"BR001",title:"Medical Update Form 2026-2027",      description:"Annual health and medical information update required for all students. Includes allergies, medications, and emergency contacts.", category:"Required",       dueDate:"2026-09-11",status:"Required"},
  {id:"FRM002",schoolId:"SCH001",branchId:"BR001",title:"Field Trip Permission — Dallas Zoo",  description:"Permission slip for the 7th & 8th grade Dallas Zoo field trip on September 25th. Transportation provided.",                     category:"Permission Slip", dueDate:"2026-09-18",status:"Optional"},
  {id:"FRM003",schoolId:"SCH001",branchId:"BR001",title:"Parent Volunteer Interest Survey",    description:"Let us know if you'd like to volunteer for school events, reading circles, or field trips this semester.",                       category:"Survey",          dueDate:"2026-09-10",status:"Optional"},
  {id:"FRM004",schoolId:"SCH001",branchId:"BR001",title:"Technology Acceptable Use Policy",    description:"Annual sign-off on the school's technology and internet acceptable use policy for students in grades 5–12.",                    category:"Required",        dueDate:"2026-09-21",status:"Required"},
  {id:"FRM005",schoolId:"SCH001",branchId:"BR001",title:"After-School Program Registration",   description:"Register your child for the 2026–2027 after-school Quran and Arabic program (Mon–Thu, 3:30–5:00 PM).",                   category:"Registration",    dueDate:"2026-09-30",status:"Optional"}
];

var SMS_DOCUMENTS = [
  {id:"DOC001",schoolId:"SCH001",branchId:"BR001",title:"Student Handbook 2026-2027",   description:"Complete guide to school policies, rules, dress code, and procedures",   category:"Administrative",fileType:"PDF",uploadDate:"2026-08-01",uploadedBy:"Administration",isPublic:true},
  {id:"DOC002",schoolId:"SCH001",branchId:"BR001",title:"Academic Calendar 2026-2027",  description:"Full year calendar including holidays, exam periods, and school events",    category:"Administrative",fileType:"PDF",uploadDate:"2026-08-01",uploadedBy:"Administration",isPublic:true},
  {id:"DOC003",schoolId:"SCH001",branchId:"BR001",title:"Uniform Policy",               description:"Dress code and uniform requirements with photos and vendor information",      category:"Policy",        fileType:"PDF",uploadDate:"2026-08-01",uploadedBy:"Administration",isPublic:true},
  {id:"DOC004",schoolId:"SCH001",branchId:"BR001",title:"Ramadan 2026 Schedule",        description:"Adjusted school hours and prayer schedule for the month of Ramadan",         category:"Administrative",fileType:"PDF",uploadDate:"2026-01-15",uploadedBy:"Principal Sarah Ahmed",isPublic:true},
  {id:"DOC005",schoolId:"SCH001",branchId:"BR001",title:"Emergency Procedures",         description:"Fire drill, shelter-in-place, and emergency contact procedures",             category:"Policy",        fileType:"PDF",uploadDate:"2026-09-01",uploadedBy:"Administration",isPublic:true},
  {id:"DOC006",schoolId:"SCH001",branchId:"BR001",title:"Grade Scale & Transcript Info","description":"How grades are calculated, weighted GPA policy, and transcript request form",category:"Academic",      fileType:"PDF",uploadDate:"2026-08-01",uploadedBy:"Registrar",isPublic:true}
];

var SMS_PHOTO_ALBUMS = [
  {id:"ALB001",schoolId:"SCH001",branchId:"BR001",title:"Back to School 2026",      date:"2026-08-19",photoCount:24,coverColor:"#1e40af"},
  {id:"ALB002",schoolId:"SCH001",branchId:"BR001",title:"Eid al-Adha Celebration", date:"2026-06-17",photoCount:31,coverColor:"#15803d"},
  {id:"ALB003",schoolId:"SCH001",branchId:"BR001",title:"Science Fair 2026",        date:"2026-05-15",photoCount:48,coverColor:"#b45309"},
  {id:"ALB004",schoolId:"SCH001",branchId:"BR001",title:"Quran Competition 2026",   date:"2026-03-22",photoCount:19,coverColor:"#7e22ce"},
  {id:"ALB005",schoolId:"SCH001",branchId:"BR001",title:"Sports Day 2026",          date:"2026-04-10",photoCount:62,coverColor:"#0e7490"},
  {id:"ALB006",schoolId:"SCH001",branchId:"BR001",title:"Graduation Ceremony 2026", date:"2026-06-05",photoCount:87,coverColor:"#b91c1c"}
];

var SMS_MESSAGES = [
  {id:"MSG001",fromUserId:"USR009",fromName:"Mohammad Ali",     toUserId:"USR005",toName:"Ms. Aisha Hassan",    subject:"Ahmed's absence on Jan 17",        body:"As-salamu alaykum, Ahmed was unwell on Friday. Please let me know if he missed anything important. Jazakallah khair.",                        date:"2026-01-17T10:30:00",read:true, branchId:"BR001"},
  {id:"MSG002",fromUserId:"USR005",fromName:"Ms. Aisha Hassan", toUserId:"USR009",toName:"Mohammad Ali",       subject:"Re: Ahmed's absence on Jan 17",     body:"Wa alaykum as-salam, thank you for reaching out. Ahmed missed a quiz on Friday but I can arrange a makeup for him next week. Please have him come see me.",date:"2026-01-17T14:00:00",read:false,branchId:"BR001"},
  {id:"MSG003",fromUserId:"USR010",fromName:"Nadia Noor",       toUserId:"USR006",toName:"Mr. Khalid Khan",    subject:"Zara's reading assignments",         body:"As-salamu alaykum Mr. Khan, Zara has been struggling a bit with the recent reading assignments. Could we schedule a brief call to discuss strategies?", date:"2026-01-20T09:15:00",read:true, branchId:"BR001"},
  {id:"MSG004",fromUserId:"USR006",fromName:"Mr. Khalid Khan",  toUserId:"USR010",toName:"Nadia Noor",         subject:"Re: Zara's reading assignments",     body:"Wa alaykum as-salam, of course. Zara is a bright student. I'll send some additional resources home this week. We can connect during PTC next month.",    date:"2026-01-20T11:30:00",read:true, branchId:"BR001"},
  {id:"MSG005",fromUserId:"USR002",fromName:"Principal Sarah Ahmed",toUserId:"USR009",toName:"Mohammad Ali",  subject:"Outstanding tuition balance",        body:"As-salamu alaykum, I wanted to follow up on Ahmed's tuition balance. Please contact our finance office at your earliest convenience. Thank you.",         date:"2026-01-25T09:00:00",read:false,branchId:"BR001"},
  {id:"MSG006",fromUserId:"USR009",fromName:"Mohammad Ali",     toUserId:"USR002",toName:"Principal Sarah Ahmed",subject:"Re: Outstanding tuition balance", body:"Wa alaykum as-salam, jazakallah for the reminder. I will come in this Friday to arrange a payment plan. Apologies for the delay.",                     date:"2026-01-25T14:00:00",read:true, branchId:"BR001"},
  {id:"MSG007",fromUserId:"USR005",fromName:"Ms. Aisha Hassan", toUserId:"USR002",toName:"Principal Sarah Ahmed",subject:"Lab equipment request",           body:"As-salamu alaykum Principal, I would like to request two additional microscopes for the science lab. We currently have 4 and need 6 for full class.",     date:"2026-01-28T08:30:00",read:true, branchId:"BR001"}
];

var SMS_AUDIT_LOG = [
  {id:"AUD001",userId:"USR002",userName:"Principal Sarah Ahmed",action:"STUDENT_ENROLLED",  resource:"Student",  resourceId:"STU011",details:"Enrolled new student: Ibrahim Chaudhry (7th Grade)",              timestamp:"2026-01-10T09:15:00",branchId:"BR001",ipAddress:"192.168.1.10"},
  {id:"AUD002",userId:"USR002",userName:"Principal Sarah Ahmed",action:"CLASS_CREATED",     resource:"Class",    resourceId:"CLS005",details:"Created class: Islamic Studies (Ms. Maryam Siddiqui)",            timestamp:"2026-01-08T11:30:00",branchId:"BR001",ipAddress:"192.168.1.10"},
  {id:"AUD003",userId:"USR005",userName:"Ms. Aisha Hassan",     action:"ATTENDANCE_MARKED", resource:"Attendance",resourceId:"CLS001",details:"Marked attendance for Mathematics 7 — 2026-01-17 (1 absent)",  timestamp:"2026-01-17T08:10:00",branchId:"BR001",ipAddress:"192.168.1.22"},
  {id:"AUD004",userId:"USR002",userName:"Principal Sarah Ahmed",action:"PAYMENT_RECORDED",  resource:"Expense",  resourceId:"EXP001",details:"Payment of $2,400.00 recorded for Ahmed Ali",                     timestamp:"2026-01-05T14:20:00",branchId:"BR001",ipAddress:"192.168.1.10"},
  {id:"AUD005",userId:"USR002",userName:"Principal Sarah Ahmed",action:"ANNOUNCEMENT_POSTED",resource:"Announcement",resourceId:"ANN001",details:"Posted announcement: School closed — Winter Storm",          timestamp:"2026-01-18T07:30:00",branchId:"BR001",ipAddress:"192.168.1.10"},
  {id:"AUD006",userId:"USR004",userName:"Fatima Malik",         action:"STUDENT_CHECKED_IN", resource:"Attendance",resourceId:"STU007",details:"Checked in late arrival: Adam Karimi (8th Grade) at 8:47 AM",  timestamp:"2026-01-21T08:47:00",branchId:"BR001",ipAddress:"192.168.1.30"},
  {id:"AUD007",userId:"USR002",userName:"Principal Sarah Ahmed",action:"TEACHER_ADDED",     resource:"Teacher",  resourceId:"TCH003",details:"Added new teacher: Ms. Maryam Siddiqui (Islamic Studies dept)",   timestamp:"2026-08-01T10:00:00",branchId:"BR001",ipAddress:"192.168.1.10"},
  {id:"AUD008",userId:"USR006",userName:"Mr. Khalid Khan",      action:"ATTENDANCE_MARKED", resource:"Attendance",resourceId:"CLS004",details:"Marked attendance for English 5 — 2026-01-23 (1 absent)",      timestamp:"2026-01-23T10:05:00",branchId:"BR001",ipAddress:"192.168.1.23"}
];

var SMS_SCHOOL_YEARS = [
  {id:"SY001",schoolId:"SCH001",name:"2026-2027",startDate:"2026-08-17",endDate:"2027-06-03",status:"active",semesters:[{name:"Semester 1",start:"2026-08-17",end:"2026-12-18"},{name:"Semester 2",start:"2027-01-05",end:"2027-06-03"}],isCurrent:true,closedAt:null},
  {id:"SY002",schoolId:"SCH001",name:"Summer 2026",startDate:"2026-06-08",endDate:"2026-07-30",status:"closed",semesters:[{name:"Summer Term",start:"2026-06-08",end:"2026-07-30"}],isCurrent:false,closedAt:"2026-07-30T17:00:00"},
  {id:"SY003",schoolId:"SCH002",name:"2026-2027",startDate:"2026-08-17",endDate:"2027-06-03",status:"active",semesters:[{name:"Semester 1",start:"2026-08-17",end:"2026-12-18"},{name:"Semester 2",start:"2027-01-05",end:"2027-06-03"}],isCurrent:true,closedAt:null}
];


// Year-specific enrollment records. Student profiles stay permanent while enrollment changes each year.
var SMS_ENROLLMENTS = SMS_STUDENTS.map(function(student, idx) {
  return {
    id: "ENR" + String(idx + 1).padStart(3, "0"),
    studentId: student.id,
    schoolId: student.schoolId,
    branchId: student.branchId,
    schoolYearId: student.schoolId === "SCH002" ? "SY003" : "SY001",
    gradeId: student.gradeId,
    grade: student.grade,
    status: "Enrolled",
    enrolledAt: "2026-08-17",
    rolloverSourceId: null
  };
});

var SMS_YEAR_ARCHIVES = [
  {
    id:"ARC001", schoolId:"SCH001", schoolYearId:"SY002", schoolYearName:"Summer 2026",
    closedAt:"2026-07-30T17:00:00", closedBy:"Platform Demo",
    summary:{students:18,classes:6,graduates:0,notReturning:1,attendanceRecords:84,gradeRecords:61},
    notes:"Summer term archived successfully. Records remain read-only in the demo archive."
  }
];

var SMS_APPLICATIONS = [
  {id:"APP001",schoolId:"SCH001",branchId:"BR001",studentName:"Amina Rahman",gradeRequested:"6th Grade",guardianName:"Samir Rahman",guardianEmail:"samir@example.com",submittedAt:"2026-08-25",status:"Review",documents:3,notes:"Placement assessment requested."},
  {id:"APP002",schoolId:"SCH001",branchId:"BR001",studentName:"Bilal Khan",gradeRequested:"3rd Grade",guardianName:"Nadia Khan",guardianEmail:"nadia@example.com",submittedAt:"2026-08-29",status:"Accepted",documents:4,notes:"Ready for enrollment."},
  {id:"APP003",schoolId:"SCH001",branchId:"BR002",studentName:"Sara Mahmood",gradeRequested:"9th Grade",guardianName:"Faisal Mahmood",guardianEmail:"faisal@example.com",submittedAt:"2026-09-01",status:"Testing",documents:2,notes:"Math and English placement testing pending."}
];

var SMS_INVITATIONS = [
  {id:"INV001",schoolId:"SCH001",email:"newteacher@example.com",role:"teacher",status:"Pending",sentAt:"2026-09-02",expiresAt:"2026-09-09"}
];

var SMS_PTC_SLOTS = [
  {id:"PTC001",teacherId:"TCH001",teacherName:"Ms. Aisha Hassan", branchId:"BR001",date:"2026-09-21",time:"10:00 AM",duration:15,booked:false},
  {id:"PTC002",teacherId:"TCH001",teacherName:"Ms. Aisha Hassan", branchId:"BR001",date:"2026-09-21",time:"10:15 AM",duration:15,booked:true, bookedBy:"PAR001"},
  {id:"PTC003",teacherId:"TCH001",teacherName:"Ms. Aisha Hassan", branchId:"BR001",date:"2026-09-21",time:"10:30 AM",duration:15,booked:false},
  {id:"PTC004",teacherId:"TCH002",teacherName:"Mr. Khalid Khan",  branchId:"BR001",date:"2026-09-22",time:"9:00 AM", duration:15,booked:false},
  {id:"PTC005",teacherId:"TCH002",teacherName:"Mr. Khalid Khan",  branchId:"BR001",date:"2026-09-22",time:"9:15 AM", duration:15,booked:true, bookedBy:"PAR002"},
  {id:"PTC006",teacherId:"TCH003",teacherName:"Ms. Maryam Siddiqui",branchId:"BR001",date:"2026-09-23",time:"1:00 PM",duration:15,booked:false}
];
