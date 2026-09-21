const roleSearch=document.querySelector("#roleSearch");
const roleStatusFilter=document.querySelector("#roleStatusFilter");
const roleTableBody=document.querySelector("#roleTableBody");
const emptyState=document.querySelector("#emptyState");

const addRoleBtn=document.querySelector("#addRoleBtn");
const roleModal=document.querySelector("#roleModal");
const modalTitle=document.querySelector("#modalTitle");
const closeModalBtn=document.querySelector("#closeModalBtn");
const cancelModalBtn=document.querySelector("#cancelModalBtn");
const roleForm=document.querySelector("#roleForm");

const confirmOverlay=document.querySelector("#confirmOverlay");
const confirmMessage=document.querySelector("#confirmMessage");
const cancelDeleteBtn=document.querySelector("#cancelDeleteBtn");
const confirmDeleteBtn=document.querySelector("#confirmDeleteBtn");

const totalTemplates=document.querySelector("#totalTemplates");
const activeTemplates=document.querySelector("#activeTemplates");
const inactiveTemplates=document.querySelector("#inactiveTemplates");
const archivedTemplates=document.querySelector("#archivedTemplates");

const permissionsGrid=document.querySelector(".permissions-grid");

let roleTemplates=JSON.parse(localStorage.getItem("smsRoleTemplates"))||[];
let rolePendingDelete=null;
let rolePendingEdit=null;


const ALL_PERMISSIONS=[
  {key:"dashboard.view",label:"Dashboard View",module:"Dashboard"},

  {key:"organizations.view",label:"View Organizations",module:"Organizations"},
  {key:"organizations.create",label:"Create Organizations",module:"Organizations"},
  {key:"organizations.edit",label:"Edit Organizations",module:"Organizations"},
  {key:"organizations.delete",label:"Delete Organizations",module:"Organizations"},

  {key:"branches.view",label:"View Branches",module:"Branches"},
  {key:"branches.create",label:"Create Branches",module:"Branches"},
  {key:"branches.edit",label:"Edit Branches",module:"Branches"},
  {key:"branches.delete",label:"Delete Branches",module:"Branches"},

  {key:"users.view",label:"View Users",module:"Users"},
  {key:"users.create",label:"Create Users",module:"Users"},
  {key:"users.edit",label:"Edit Users",module:"Users"},
  {key:"users.delete",label:"Delete Users",module:"Users"},
  {key:"users.assign_roles",label:"Assign Roles",module:"Users"},
  {key:"users.reset_password",label:"Reset Passwords",module:"Users"},
  {key:"users.deactivate",label:"Deactivate Users",module:"Users"},

  {key:"students.view_all",label:"View All Students",module:"Students"},
  {key:"students.view_assigned",label:"View Assigned Students",module:"Students"},
  {key:"students.create",label:"Create Students",module:"Students"},
  {key:"students.edit",label:"Edit Students",module:"Students"},
  {key:"students.delete",label:"Delete Students",module:"Students"},
  {key:"students.promote",label:"Promote Students",module:"Students"},
  {key:"students.withdraw",label:"Withdraw Students",module:"Students"},
  {key:"students.transfer",label:"Transfer Students",module:"Students"},
  {key:"students.view_self",label:"View Own Student Profile",module:"Students"},

  {key:"parents.view_all",label:"View All Parents",module:"Parents"},
  {key:"parents.view_assigned",label:"View Assigned Parents",module:"Parents"},
  {key:"parents.create",label:"Create Parents",module:"Parents"},
  {key:"parents.edit",label:"Edit Parents",module:"Parents"},
  {key:"parents.delete",label:"Delete Parents",module:"Parents"},
  {key:"parents.link_students",label:"Link Parents to Students",module:"Parents"},
  {key:"parents.view_self",label:"View Own Parent Profile",module:"Parents"},

  {key:"staff.view_all",label:"View All Staff",module:"Staff"},
  {key:"staff.view_assigned",label:"View Assigned Staff",module:"Staff"},
  {key:"staff.create",label:"Create Staff",module:"Staff"},
  {key:"staff.edit",label:"Edit Staff",module:"Staff"},
  {key:"staff.delete",label:"Delete Staff",module:"Staff"},
  {key:"staff.assign",label:"Assign Staff",module:"Staff"},

  {key:"classes.view",label:"View Classes",module:"Classes"},
  {key:"classes.create",label:"Create Classes",module:"Classes"},
  {key:"classes.edit",label:"Edit Classes",module:"Classes"},
  {key:"classes.delete",label:"Delete Classes",module:"Classes"},
  {key:"classes.assign_teacher",label:"Assign Teachers",module:"Classes"},
  {key:"classes.view_assigned",label:"View Assigned Classes",module:"Classes"},
  {key:"classes.view_self",label:"View Own Classes",module:"Classes"},

  {key:"attendance.view_all",label:"View All Attendance",module:"Attendance"},
  {key:"attendance.view_assigned",label:"View Assigned Attendance",module:"Attendance"},
  {key:"attendance.view_self",label:"View Own Attendance",module:"Attendance"},
  {key:"attendance.take",label:"Take Attendance",module:"Attendance"},
  {key:"attendance.edit",label:"Edit Attendance",module:"Attendance"},
  {key:"attendance.approve",label:"Approve Attendance",module:"Attendance"},

  {key:"grades.view_all",label:"View All Grades",module:"Grades"},
  {key:"grades.view_assigned",label:"View Assigned Grades",module:"Grades"},
  {key:"grades.view_self",label:"View Own Grades",module:"Grades"},
  {key:"grades.enter",label:"Enter Grades",module:"Grades"},
  {key:"grades.edit",label:"Edit Grades",module:"Grades"},
  {key:"grades.finalize",label:"Finalize Grades",module:"Grades"},
  {key:"report_cards.publish",label:"Publish Report Cards",module:"Grades"},

  {key:"assignments.view",label:"View Assignments",module:"Assignments"},
  {key:"assignments.create",label:"Create Assignments",module:"Assignments"},
  {key:"assignments.edit",label:"Edit Assignments",module:"Assignments"},
  {key:"assignments.delete",label:"Delete Assignments",module:"Assignments"},
  {key:"assignments.grade",label:"Grade Assignments",module:"Assignments"},
  {key:"assignments.view_self",label:"View Own Assignments",module:"Assignments"},
  {key:"assignments.submit_self",label:"Submit Own Assignments",module:"Assignments"},

  {key:"announcements.view",label:"View Announcements",module:"Announcements"},
  {key:"announcements.create",label:"Create Announcements",module:"Announcements"},
  {key:"announcements.edit",label:"Edit Announcements",module:"Announcements"},
  {key:"announcements.delete",label:"Delete Announcements",module:"Announcements"},
  {key:"announcements.publish",label:"Publish Announcements",module:"Announcements"},

  {key:"admissions.view",label:"View Admissions",module:"Admissions"},
  {key:"admissions.create",label:"Create Admissions",module:"Admissions"},
  {key:"admissions.edit",label:"Edit Admissions",module:"Admissions"},
  {key:"admissions.approve",label:"Approve Admissions",module:"Admissions"},
  {key:"admissions.reject",label:"Reject Admissions",module:"Admissions"},

  {key:"billing.view",label:"View Billing",module:"Billing"},
  {key:"billing.create_invoice",label:"Create Invoices",module:"Billing"},
  {key:"billing.edit_invoice",label:"Edit Invoices",module:"Billing"},
  {key:"billing.collect_payment",label:"Collect Payments",module:"Billing"},
  {key:"billing.refund",label:"Refund Payments",module:"Billing"},
  {key:"billing.view_reports",label:"View Billing Reports",module:"Billing"},
  {key:"billing.view_self",label:"View Own Billing",module:"Billing"},

  {key:"documents.view_all",label:"View All Documents",module:"Documents"},
  {key:"documents.view_assigned",label:"View Assigned Documents",module:"Documents"},
  {key:"documents.view_self",label:"View Own Documents",module:"Documents"},
  {key:"documents.upload",label:"Upload Documents",module:"Documents"},
  {key:"documents.edit",label:"Edit Documents",module:"Documents"},
  {key:"documents.delete",label:"Delete Documents",module:"Documents"},

  {key:"health.view",label:"View Health Records",module:"Health"},
  {key:"health.edit",label:"Edit Health Records",module:"Health"},

  {key:"library.view",label:"View Library",module:"Library"},
  {key:"library.manage",label:"Manage Library",module:"Library"},

  {key:"transportation.view",label:"View Transportation",module:"Transportation"},
  {key:"transportation.manage",label:"Manage Transportation",module:"Transportation"},

  {key:"discipline.view",label:"View Discipline",module:"Discipline"},
  {key:"discipline.create",label:"Create Discipline Records",module:"Discipline"},
  {key:"discipline.edit",label:"Edit Discipline Records",module:"Discipline"},
  {key:"discipline.resolve",label:"Resolve Discipline Records",module:"Discipline"},

  {key:"messages.view",label:"View Messages",module:"Messages"},
  {key:"messages.send_all",label:"Send Messages to All",module:"Messages"},
  {key:"messages.send_assigned",label:"Send Messages to Assigned",module:"Messages"},

  {key:"audit_logs.view",label:"View Audit Logs",module:"Audit"},
  {key:"sessions.view",label:"View Sessions",module:"Audit"},
  {key:"sessions.revoke",label:"Revoke Sessions",module:"Audit"},
  {key:"security.manage",label:"Manage Security",module:"Security"},
  {key:"compliance.manage",label:"Manage Compliance",module:"Compliance"},

  {key:"settings.view",label:"View Settings",module:"Settings"},
  {key:"settings.edit",label:"Edit Settings",module:"Settings"},
  {key:"integrations.view",label:"View Integrations",module:"Integrations"},
  {key:"integrations.manage",label:"Manage Integrations",module:"Integrations"}
];

const ROLE_PERMISSION_TEMPLATES = {
  super_admin: ALL_PERMISSIONS.map((permission) => permission.key),

  org_admin: [
    "dashboard.view",
    "organizations.view",
    "organizations.edit",
    "branches.view",
    "branches.create",
    "branches.edit",
    "users.view",
    "users.create",
    "users.edit",
    "users.assign_roles",
    "users.reset_password",
    "students.view_all",
    "students.create",
    "students.edit",
    "parents.view_all",
    "parents.create",
    "parents.edit",
    "parents.link_students",
    "staff.view_all",
    "staff.create",
    "staff.edit",
    "staff.assign",
    "classes.view",
    "classes.create",
    "classes.edit",
    "classes.assign_teacher",
    "attendance.view_all",
    "attendance.edit",
    "attendance.approve",
    "grades.view_all",
    "grades.edit",
    "grades.finalize",
    "report_cards.publish",
    "assignments.view",
    "announcements.view",
    "announcements.create",
    "announcements.publish",
    "billing.view",
    "documents.view_all",
    "documents.upload",
    "audit_logs.view",
    "settings.view"
  ],

  principal: [
    "dashboard.view",
    "students.view_all",
    "students.edit",
    "parents.view_all",
    "staff.view_all",
    "classes.view",
    "classes.edit",
    "classes.assign_teacher",
    "attendance.view_all",
    "attendance.edit",
    "attendance.approve",
    "grades.view_all",
    "grades.edit",
    "grades.finalize",
    "report_cards.publish",
    "announcements.view",
    "announcements.create",
    "announcements.publish",
    "discipline.view",
    "discipline.create",
    "discipline.edit",
    "messages.view",
    "messages.send_all"
  ],

  front_office: [
    "dashboard.view",
    "students.view_all",
    "students.create",
    "students.edit",
    "parents.view_all",
    "parents.create",
    "parents.edit",
    "parents.link_students",
    "staff.view_all",
    "classes.view",
    "attendance.view_all",
    "attendance.take",
    "attendance.edit",
    "announcements.view",
    "announcements.create",
    "admissions.view",
    "admissions.create",
    "admissions.edit",
    "billing.view",
    "documents.view_all",
    "documents.upload",
    "messages.view",
    "messages.send_assigned"
  ],

  teacher: [
    "dashboard.view",
    "students.view_assigned",
    "parents.view_assigned",
    "classes.view_assigned",
    "attendance.view_assigned",
    "attendance.take",
    "attendance.edit",
    "grades.view_assigned",
    "grades.enter",
    "grades.edit",
    "assignments.view",
    "assignments.create",
    "assignments.edit",
    "assignments.grade",
    "announcements.view",
    "documents.view_assigned",
    "messages.view",
    "messages.send_assigned"
  ],

  student: [
    "dashboard.view",
    "students.view_self",
    "classes.view_self",
    "attendance.view_self",
    "grades.view_self",
    "assignments.view_self",
    "assignments.submit_self",
    "announcements.view",
    "billing.view_self",
    "documents.view_self",
    "messages.view"
  ],

  parent: [
    "dashboard.view",
    "parents.view_self",
    "students.view_assigned",
    "attendance.view_assigned",
    "grades.view_assigned",
    "assignments.view",
    "announcements.view",
    "billing.view_self",
    "documents.view_assigned",
    "messages.view",
    "messages.send_assigned"
  ]
};

const DEFAULT_ROLE_TEMPLATES=[
  {
    name:"Super Admin",
    roleKey:"super_admin",
    scope:"global",
    status:"active",
    description:"Full platform access across everything.",
    permissions:ALL_PERMISSIONS.map(permission=>permission.key)
  },
  {
    name:"Organization Admin",
    roleKey:"organization_admin",
    scope:"organization",
    status:"active",
    description:"Manages one organization and its branches, staff, students, and records.",
    permissions:[
      "dashboard.view",
      "organizations.view",
      "organizations.edit",
      "branches.view",
      "branches.create",
      "branches.edit",
      "users.view",
      "users.create",
      "users.edit",
      "users.assign_roles",
      "users.reset_password",
      "students.view_all",
      "students.create",
      "students.edit",
      "students.promote",
      "students.withdraw",
      "students.transfer",
      "parents.view_all",
      "parents.create",
      "parents.edit",
      "parents.link_students",
      "staff.view_all",
      "staff.create",
      "staff.edit",
      "staff.assign",
      "classes.view",
      "classes.create",
      "classes.edit",
      "classes.assign_teacher",
      "attendance.view_all",
      "attendance.edit",
      "attendance.approve",
      "grades.view_all",
      "grades.edit",
      "grades.finalize",
      "report_cards.publish",
      "assignments.view",
      "announcements.view",
      "announcements.create",
      "announcements.edit",
      "announcements.publish",
      "admissions.view",
      "admissions.create",
      "admissions.edit",
      "admissions.approve",
      "admissions.reject",
      "billing.view",
      "billing.view_reports",
      "documents.view_all",
      "documents.upload",
      "documents.edit",
      "health.view",
      "library.view",
      "transportation.view",
      "discipline.view",
      "messages.view",
      "messages.send_all",
      "audit_logs.view",
      "settings.view",
      "integrations.view"
    ]
  },
  {
    name:"Principal",
    roleKey:"principal",
    scope:"branch",
    status:"active",
    description:"Full campus-level academic and operational access.",
    permissions:[
      "dashboard.view",
      "branches.view",
      "users.view",
      "users.create",
      "users.edit",
      "users.assign_roles",
      "users.reset_password",
      "students.view_all",
      "students.create",
      "students.edit",
      "students.promote",
      "students.withdraw",
      "students.transfer",
      "parents.view_all",
      "parents.create",
      "parents.edit",
      "parents.link_students",
      "staff.view_all",
      "staff.create",
      "staff.edit",
      "staff.assign",
      "classes.view",
      "classes.create",
      "classes.edit",
      "classes.assign_teacher",
      "attendance.view_all",
      "attendance.edit",
      "attendance.approve",
      "grades.view_all",
      "grades.edit",
      "grades.finalize",
      "report_cards.publish",
      "assignments.view",
      "announcements.view",
      "announcements.create",
      "announcements.edit",
      "announcements.publish",
      "admissions.view",
      "admissions.edit",
      "admissions.approve",
      "billing.view",
      "documents.view_all",
      "documents.upload",
      "documents.edit",
      "health.view",
      "library.view",
      "transportation.view",
      "discipline.view",
      "discipline.create",
      "discipline.edit",
      "discipline.resolve",
      "messages.view",
      "messages.send_all",
      "audit_logs.view",
      "settings.view"
    ]
  },
  {
    name:"Front Office",
    roleKey:"front_office",
    scope:"branch",
    status:"active",
    description:"Handles student lookup, parent contact info, attendance, admissions, and front desk tasks.",
    permissions:[
      "dashboard.view",
      "students.view_all",
      "students.create",
      "students.edit",
      "parents.view_all",
      "parents.create",
      "parents.edit",
      "parents.link_students",
      "staff.view_all",
      "classes.view",
      "attendance.view_all",
      "attendance.take",
      "attendance.edit",
      "announcements.view",
      "announcements.create",
      "admissions.view",
      "admissions.create",
      "admissions.edit",
      "billing.view",
      "documents.view_all",
      "documents.upload",
      "documents.edit",
      "health.view",
      "messages.view",
      "messages.send_assigned"
    ]
  },
  {
    name:"Registrar",
    roleKey:"registrar",
    scope:"branch",
    status:"active",
    description:"Manages enrollment, records, transfers, withdrawals, and official student documents.",
    permissions:[
      "dashboard.view",
      "students.view_all",
      "students.create",
      "students.edit",
      "students.promote",
      "students.withdraw",
      "students.transfer",
      "parents.view_all",
      "parents.create",
      "parents.edit",
      "parents.link_students",
      "classes.view",
      "attendance.view_all",
      "grades.view_all",
      "documents.view_all",
      "documents.upload",
      "documents.edit",
      "admissions.view",
      "admissions.create",
      "admissions.edit",
      "admissions.approve",
      "admissions.reject",
      "messages.view",
      "messages.send_assigned"
    ]
  },
  {
    name:"Finance Admin",
    roleKey:"finance_admin",
    scope:"branch",
    status:"active",
    description:"Handles invoices, payments, and finance reporting.",
    permissions:[
      "dashboard.view",
      "students.view_all",
      "parents.view_all",
      "billing.view",
      "billing.create_invoice",
      "billing.edit_invoice",
      "billing.collect_payment",
      "billing.refund",
      "billing.view_reports",
      "documents.view_all",
      "documents.upload",
      "messages.view",
      "messages.send_assigned"
    ]
  },
  {
    name:"Teacher",
    roleKey:"teacher",
    scope:"assigned_only",
    status:"active",
    description:"Assigned-class access only for attendance, grades, assignments, and parent communication.",
    permissions:[
      "dashboard.view",
      "students.view_assigned",
      "parents.view_assigned",
      "classes.view_assigned",
      "attendance.view_assigned",
      "attendance.take",
      "attendance.edit",
      "grades.view_assigned",
      "grades.enter",
      "grades.edit",
      "assignments.view",
      "assignments.create",
      "assignments.edit",
      "assignments.grade",
      "announcements.view",
      "documents.view_assigned",
      "documents.upload",
      "messages.view",
      "messages.send_assigned"
    ]
  },
  {
    name:"Assistant Teacher",
    roleKey:"assistant_teacher",
    scope:"assigned_only",
    status:"active",
    description:"Supports the assigned teacher with attendance and classroom work.",
    permissions:[
      "dashboard.view",
      "students.view_assigned",
      "parents.view_assigned",
      "classes.view_assigned",
      "attendance.view_assigned",
      "attendance.take",
      "grades.view_assigned",
      "assignments.view",
      "assignments.grade",
      "announcements.view",
      "documents.view_assigned",
      "messages.view",
      "messages.send_assigned"
    ]
  },
  {
    name:"Student",
    roleKey:"student",
    scope:"self_only",
    status:"active",
    description:"Can only access personal academic and school information.",
    permissions:[
      "dashboard.view",
      "students.view_self",
      "classes.view_self",
      "attendance.view_self",
      "grades.view_self",
      "assignments.view_self",
      "assignments.submit_self",
      "announcements.view",
      "billing.view_self",
      "documents.view_self",
      "messages.view"
    ]
  },
  {
    name:"Parent / Guardian",
    roleKey:"parent_guardian",
    scope:"own_children_only",
    status:"active",
    description:"Can only access their own children records, grades, attendance, billing, and announcements.",
    permissions:[
      "dashboard.view",
      "parents.view_self",
      "students.view_assigned",
      "attendance.view_assigned",
      "grades.view_assigned",
      "assignments.view",
      "announcements.view",
      "billing.view_self",
      "documents.view_assigned",
      "messages.view",
      "messages.send_assigned"
    ]
  }
];

function saveRoleTemplates(){
  localStorage.setItem("smsRoleTemplates",JSON.stringify(roleTemplates));
}

function capitalize(value){
  return value.charAt(0).toUpperCase()+value.slice(1);
}

function renderPermissionOptions(){
  if(!permissionsGrid){
    return;
  }

  permissionsGrid.innerHTML="";

  let currentModule="";

  ALL_PERMISSIONS.forEach(permission=>{
    if(permission.module!==currentModule){
      currentModule=permission.module;

      const moduleTitle=document.createElement("div");
      moduleTitle.className="permission-module-title";
      moduleTitle.textContent=currentModule;
      permissionsGrid.appendChild(moduleTitle);
    }

    const label=document.createElement("label");
    label.className="permission-item";
    label.innerHTML=`
      <input type="checkbox" value="${permission.key}">
      <span>${permission.label}</span>
    `;
    permissionsGrid.appendChild(label);
  });
}

function getCheckedPermissions(){
  const checked=document.querySelectorAll('.permission-item input[type="checkbox"]:checked');
  return [...checked].map(input=>input.value);
}

function setCheckedPermissions(permissions){
  const allPermissionInputs=document.querySelectorAll('.permission-item input[type="checkbox"]');

  allPermissionInputs.forEach(input=>{
    input.checked=permissions.includes(input.value);
  });
}

function clearCheckedPermissions(){
  const allPermissionInputs=document.querySelectorAll('.permission-item input[type="checkbox"]');

  allPermissionInputs.forEach(input=>{
    input.checked=false;
  });
}

function seedDefaultRoles(){
  if(roleTemplates.length>0){
    return;
  }

  roleTemplates=DEFAULT_ROLE_TEMPLATES;
  saveRoleTemplates();
}

function updateSummaryCards(){
  totalTemplates.textContent=roleTemplates.length;
  activeTemplates.textContent=roleTemplates.filter(role=>role.status==="active").length;
  inactiveTemplates.textContent=roleTemplates.filter(role=>role.status==="inactive").length;
  archivedTemplates.textContent=roleTemplates.filter(role=>role.status==="archived").length;
}

function getFilteredRoles(){
  const searchValue=roleSearch.value.trim().toLowerCase();
  const selectedStatus=roleStatusFilter.value;

  return roleTemplates.filter(role=>{
    const searchableText=`
      ${role.name}
      ${role.roleKey}
      ${role.scope}
      ${role.status}
      ${role.description}
      ${role.permissions.join(" ")}
    `.toLowerCase();

    const matchesSearch=searchableText.includes(searchValue);
    const matchesStatus=selectedStatus==="all"||role.status===selectedStatus;

    return matchesSearch&&matchesStatus;
  });
}

function renderRoles(){
  const filteredRoles=getFilteredRoles();

  roleTableBody.innerHTML="";

  if(filteredRoles.length===0){
    emptyState.classList.remove("hidden");
  }else{
    emptyState.classList.add("hidden");
  }

  filteredRoles.forEach((role,index)=>{
    const row=document.createElement("tr");

    row.innerHTML=`
      <td>${role.name}</td>
      <td>${role.roleKey}</td>
      <td><span class="scope-badge">${capitalize(role.scope.replaceAll("_"," "))}</span></td>
      <td><span class="permissions-count">${role.permissions.length} permission${role.permissions.length===1?"":"s"}</span></td>
      <td><span class="status ${role.status}">${capitalize(role.status)}</span></td>
      <td class="actions-cell">
        <button
          class="table-btn edit-role-btn"
          data-edit-index="${index}"
          type="button">
          Edit
        </button>

        <button
          class="table-btn delete-role-btn"
          data-delete-index="${index}"
          type="button">
          Delete
        </button>
      </td>
    `;

    roleTableBody.appendChild(row);
  });

  attachEditEvents();
  attachDeleteEvents();
  updateSummaryCards();
}

function openModal(){
  roleModal.classList.remove("hidden");
}

function closeModal(){
  roleModal.classList.add("hidden");
  roleForm.reset();
  clearCheckedPermissions();
  rolePendingEdit=null;
  modalTitle.textContent="Add Role Template";
}

function openDeleteConfirm(role){
  rolePendingDelete=role;
  confirmMessage.innerHTML=`Are you sure you want to delete <strong>${role.name}</strong>?`;
  confirmOverlay.classList.remove("hidden");
}

function closeDeleteConfirm(){
  confirmOverlay.classList.add("hidden");
  rolePendingDelete=null;
}

function attachEditEvents(){
  const editButtons=document.querySelectorAll(".edit-role-btn");

  editButtons.forEach(button=>{
    button.addEventListener("click",()=>{
      const filteredRoles=getFilteredRoles();
      const index=Number(button.dataset.editIndex);
      const role=filteredRoles[index];

      if(!role){
        return;
      }

      rolePendingEdit=role;
      modalTitle.textContent="Edit Role Template";
      openModal();

      document.querySelector("#roleName").value=role.name;
      document.querySelector("#roleKey").value=role.roleKey;
      document.querySelector("#roleScope").value=role.scope;
      document.querySelector("#roleStatus").value=role.status;
      document.querySelector("#roleDescription").value=role.description||"";

      setCheckedPermissions(role.permissions||[]);
    });
  });
}

function attachDeleteEvents(){
  const deleteButtons=document.querySelectorAll(".delete-role-btn");

  deleteButtons.forEach(button=>{
    button.addEventListener("click",()=>{
      const filteredRoles=getFilteredRoles();
      const index=Number(button.dataset.deleteIndex);
      const role=filteredRoles[index];

      if(!role){
        return;
      }

      openDeleteConfirm(role);
    });
  });
}

if(addRoleBtn){
  addRoleBtn.addEventListener("click",()=>{
    modalTitle.textContent="Add Role Template";
    openModal();
  });
}

if(closeModalBtn){
  closeModalBtn.addEventListener("click",closeModal);
}

if(cancelModalBtn){
  cancelModalBtn.addEventListener("click",closeModal);
}

if(roleSearch){
  roleSearch.addEventListener("input",renderRoles);
}

if(roleStatusFilter){
  roleStatusFilter.addEventListener("change",renderRoles);
}

if(roleForm){
  roleForm.addEventListener("submit",e=>{
    e.preventDefault();

    const newRole={
      name:document.querySelector("#roleName").value.trim(),
      roleKey:document.querySelector("#roleKey").value.trim().toLowerCase().replace(/\s+/g,"_"),
      scope:document.querySelector("#roleScope").value,
      status:document.querySelector("#roleStatus").value,
      description:document.querySelector("#roleDescription").value.trim(),
      permissions:getCheckedPermissions()
    };

    if(!newRole.name||!newRole.roleKey){
      alert("Please fill in the required fields.");
      return;
    }

    if(newRole.permissions.length===0){
      alert("Please select at least one permission.");
      return;
    }

    const duplicateRoleKey=roleTemplates.some(role=>{
      if(rolePendingEdit&&role.roleKey===rolePendingEdit.roleKey){
        return false;
      }

      return role.roleKey.toLowerCase()===newRole.roleKey.toLowerCase();
    });

    if(duplicateRoleKey){
      alert("That Role Key already exists.");
      return;
    }

    if(rolePendingEdit){
      const index=roleTemplates.findIndex(role=>role.roleKey===rolePendingEdit.roleKey);

      if(index!==-1){
        roleTemplates[index]=newRole;
      }
    }else{
      roleTemplates.push(newRole);
    }

    saveRoleTemplates();
    renderRoles();
    closeModal();
  });
}

if(cancelDeleteBtn){
  cancelDeleteBtn.addEventListener("click",closeDeleteConfirm);
}

if(confirmDeleteBtn){
  confirmDeleteBtn.addEventListener("click",()=>{
    if(!rolePendingDelete){
      return;
    }

    roleTemplates=roleTemplates.filter(role=>role.roleKey!==rolePendingDelete.roleKey);
    saveRoleTemplates();
    renderRoles();
    closeDeleteConfirm();
  });
}

window.addEventListener("click",e=>{
  if(e.target===roleModal){
    closeModal();
  }

  if(e.target===confirmOverlay){
    closeDeleteConfirm();
  }
});

// ================================
// Quick Role Template Buttons
// ================================

const templateButtons = document.querySelectorAll(".template-btn");

templateButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.classList.contains("clear-permissions")) {
      clearCheckedPermissions();
      return;
    }

    const templateKey = button.dataset.template;
    const selectedPermissions = ROLE_PERMISSION_TEMPLATES[templateKey] || [];

    setCheckedPermissions(selectedPermissions);
  });
});

renderPermissionOptions();
seedDefaultRoles();
renderRoles();