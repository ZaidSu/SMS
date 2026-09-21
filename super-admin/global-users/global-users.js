const userSearch=document.querySelector("#userSearch");
const userStatusFilter=document.querySelector("#userStatusFilter");
const userTableBody=document.querySelector("#userTableBody");
const emptyState=document.querySelector("#emptyState");

const addUserBtn=document.querySelector("#addUserBtn");
const userModal=document.querySelector("#userModal");
const modalTitle=document.querySelector("#modalTitle");
const closeModalBtn=document.querySelector("#closeModalBtn");
const cancelModalBtn=document.querySelector("#cancelModalBtn");
const userForm=document.querySelector("#userForm");

const userRoleTemplate=document.querySelector("#userRoleTemplate");
const userScope=document.querySelector("#userScope");
const userOrganization=document.querySelector("#userOrganization");
const userBranch=document.querySelector("#userBranch");

const totalUsers=document.querySelector("#totalUsers");
const activeUsers=document.querySelector("#activeUsers");
const inactiveUsers=document.querySelector("#inactiveUsers");
const suspendedUsers=document.querySelector("#suspendedUsers");

const confirmOverlay=document.querySelector("#confirmOverlay");
const confirmMessage=document.querySelector("#confirmMessage");
const cancelDeleteBtn=document.querySelector("#cancelDeleteBtn");
const confirmDeleteBtn=document.querySelector("#confirmDeleteBtn");

let globalUsers=JSON.parse(localStorage.getItem("smsGlobalUsers"))||[];
let roleTemplates=JSON.parse(localStorage.getItem("smsRoleTemplates"))||[];
let organizations=JSON.parse(localStorage.getItem("smsOrganizations"))||[];
let branches=JSON.parse(localStorage.getItem("smsBranchIds"))||[];

let userPendingEdit=null;
let userPendingDelete=null;

function saveGlobalUsers(){
  localStorage.setItem("smsGlobalUsers",JSON.stringify(globalUsers));
}

function capitalizeWords(value){
  return value
    .split("_")
    .map(word=>word.charAt(0).toUpperCase()+word.slice(1))
    .join(" ");
}

function populateRoleTemplates(){
  userRoleTemplate.innerHTML='<option value="">Select role template</option>';

  roleTemplates.forEach(role=>{
    const option=document.createElement("option");
    option.value=role.roleKey;
    option.textContent=role.name;
    option.dataset.scope=role.scope;
    userRoleTemplate.appendChild(option);
  });
}

function populateOrganizations(){
  userOrganization.innerHTML='<option value="">Select organization</option>';

  organizations.forEach(org=>{
    const option=document.createElement("option");
    option.value=org.name;
    option.textContent=org.name;
    userOrganization.appendChild(option);
  });
}

function populateBranches(selectedOrganization=""){
  userBranch.innerHTML='<option value="">Select branch</option>';

  const filteredBranches=branches.filter(branch=>{
    if(!selectedOrganization){
      return true;
    }

    return branch.organization===selectedOrganization;
  });

  filteredBranches.forEach(branch=>{
    const option=document.createElement("option");
    option.value=branch.branchName;
    option.textContent=`${branch.branchName} (${branch.branchId})`;
    userBranch.appendChild(option);
  });
}

function updateSummaryCards(){
  totalUsers.textContent=globalUsers.length;
  activeUsers.textContent=globalUsers.filter(user=>user.status==="active").length;
  inactiveUsers.textContent=globalUsers.filter(user=>user.status==="inactive").length;
  suspendedUsers.textContent=globalUsers.filter(user=>user.status==="suspended").length;
}

function getFilteredUsers(){
  const searchValue=userSearch.value.trim().toLowerCase();
  const selectedStatus=userStatusFilter.value;

  return globalUsers.filter(user=>{
    const searchableText=`
      ${user.fullName}
      ${user.email}
      ${user.roleTemplateName}
      ${user.scope}
      ${user.organization}
      ${user.branch}
      ${user.status}
    `.toLowerCase();

    const matchesSearch=searchableText.includes(searchValue);
    const matchesStatus=selectedStatus==="all"||user.status===selectedStatus;

    return matchesSearch&&matchesStatus;
  });
}

function renderUsers(){
  userTableBody.innerHTML="";

  const filteredUsers=getFilteredUsers();

  if(filteredUsers.length===0){
    emptyState.classList.remove("hidden");
  }else{
    emptyState.classList.add("hidden");
  }

  filteredUsers.forEach((user,index)=>{
    const row=document.createElement("tr");

    row.innerHTML=`
      <td>${user.fullName}</td>
      <td>${user.email}</td>
      <td>${user.roleTemplateName}</td>
      <td><span class="scope-badge">${capitalizeWords(user.scope)}</span></td>
      <td>${user.organization||"-"}</td>
      <td>${user.branch||"-"}</td>
      <td><span class="status ${user.status}">${capitalizeWords(user.status)}</span></td>
      <td class="actions-cell">
        <button
          class="table-btn edit-user-btn"
          data-edit-index="${index}"
          type="button">
          Edit
        </button>

        <button
          class="table-btn delete-user-btn"
          data-delete-index="${index}"
          type="button">
          Delete
        </button>
      </td>
    `;

    userTableBody.appendChild(row);
  });

  attachEditEvents();
  attachDeleteEvents();
  updateSummaryCards();
}

function openModal(){
  userModal.classList.remove("hidden");
}

function closeModal(){
  userModal.classList.add("hidden");
  userForm.reset();
  userPendingEdit=null;
  modalTitle.textContent="Add Global User";
  populateRoleTemplates();
  populateOrganizations();
  populateBranches();
}

function openDeleteConfirm(user){
  userPendingDelete=user;
  confirmMessage.innerHTML=`Are you sure you want to delete <strong>${user.fullName}</strong>?`;
  confirmOverlay.classList.remove("hidden");
}

function closeDeleteConfirm(){
  confirmOverlay.classList.add("hidden");
  userPendingDelete=null;
}

function attachEditEvents(){
  const editButtons=document.querySelectorAll(".edit-user-btn");

  editButtons.forEach(button=>{
    button.addEventListener("click",()=>{
      const filteredUsers=getFilteredUsers();
      const index=Number(button.dataset.editIndex);
      const user=filteredUsers[index];

      if(!user){
        return;
      }

      userPendingEdit=user;
      modalTitle.textContent="Edit Global User";
      openModal();

      document.querySelector("#userFullName").value=user.fullName;
      document.querySelector("#userEmail").value=user.email;
      document.querySelector("#userRoleTemplate").value=user.roleTemplateKey;
      document.querySelector("#userScope").value=user.scope;
      document.querySelector("#userOrganization").value=user.organization||"";
      populateBranches(user.organization||"");
      document.querySelector("#userBranch").value=user.branch||"";
      document.querySelector("#userStatus").value=user.status;
      document.querySelector("#userPassword").value=user.password;
    });
  });
}

function attachDeleteEvents(){
  const deleteButtons=document.querySelectorAll(".delete-user-btn");

  deleteButtons.forEach(button=>{
    button.addEventListener("click",()=>{
      const filteredUsers=getFilteredUsers();
      const index=Number(button.dataset.deleteIndex);
      const user=filteredUsers[index];

      if(!user){
        return;
      }

      openDeleteConfirm(user);
    });
  });
}

function seedDefaultUsers(){
  if(globalUsers.length>0){
    return;
  }

  const hasSuperAdminRole=roleTemplates.find(role=>role.roleKey==="super_admin");

  if(!hasSuperAdminRole){
    return;
  }

  globalUsers=[
    {
      fullName:"Main Super Admin",
      email:"superadmin@sms.com",
      roleTemplateKey:"super_admin",
      roleTemplateName:"Super Admin",
      scope:"global",
      organization:"",
      branch:"",
      status:"active",
      password:"Temp12345!"
    }
  ];

  saveGlobalUsers();
}

if(addUserBtn){
  addUserBtn.addEventListener("click",()=>{
    userPendingEdit=null;
    modalTitle.textContent="Add Global User";
    populateRoleTemplates();
    populateOrganizations();
    populateBranches();
    openModal();
  });
}

if(closeModalBtn){
  closeModalBtn.addEventListener("click",closeModal);
}

if(cancelModalBtn){
  cancelModalBtn.addEventListener("click",closeModal);
}

if(userSearch){
  userSearch.addEventListener("input",renderUsers);
}

if(userStatusFilter){
  userStatusFilter.addEventListener("change",renderUsers);
}

if(userOrganization){
  userOrganization.addEventListener("change",()=>{
    populateBranches(userOrganization.value);
  });
}

if(userRoleTemplate){
  userRoleTemplate.addEventListener("change",()=>{
    const selectedRole=roleTemplates.find(role=>role.roleKey===userRoleTemplate.value);

    if(!selectedRole){
      return;
    }

    userScope.value=selectedRole.scope;
  });
}

if(userForm){
  userForm.addEventListener("submit",e=>{
    e.preventDefault();

    const selectedRole=roleTemplates.find(role=>role.roleKey===userRoleTemplate.value);

    if(!selectedRole){
      alert("Please select a role template.");
      return;
    }

    const newUser={
      fullName:document.querySelector("#userFullName").value.trim(),
      email:document.querySelector("#userEmail").value.trim().toLowerCase(),
      roleTemplateKey:selectedRole.roleKey,
      roleTemplateName:selectedRole.name,
      scope:document.querySelector("#userScope").value,
      organization:document.querySelector("#userOrganization").value,
      branch:document.querySelector("#userBranch").value,
      status:document.querySelector("#userStatus").value,
      password:document.querySelector("#userPassword").value.trim()
    };

    const duplicateEmail=globalUsers.some(user=>{
      if(userPendingEdit&&user.email===userPendingEdit.email){
        return false;
      }

      return user.email.toLowerCase()===newUser.email.toLowerCase();
    });

    if(duplicateEmail){
      alert("That email already exists.");
      return;
    }

    if(newUser.scope==="organization"&&!newUser.organization){
      alert("Please select an organization for this user.");
      return;
    }

    if(newUser.scope==="branch"&&(!newUser.organization||!newUser.branch)){
      alert("Please select both organization and branch for this user.");
      return;
    }

    const previousEmail=userPendingEdit?userPendingEdit.email:null;

    if(userPendingEdit){
      const index=globalUsers.findIndex(user=>user.email===userPendingEdit.email);

      if(index!==-1){
        globalUsers[index]=newUser;
      }

      userPendingEdit=null;
    }else{
      globalUsers.push(newUser);
    }

    saveGlobalUsers();
    if(window.SMS_SUPER_BRIDGE) SMS_SUPER_BRIDGE.syncGlobalUser(newUser,previousEmail);
    renderUsers();
    closeModal();
  });
}

if(cancelDeleteBtn){
  cancelDeleteBtn.addEventListener("click",closeDeleteConfirm);
}

if(confirmDeleteBtn){
  confirmDeleteBtn.addEventListener("click",()=>{
    if(!userPendingDelete){
      return;
    }

    const deletedEmail=userPendingDelete.email;
    globalUsers=globalUsers.filter(user=>user.email!==deletedEmail);
    saveGlobalUsers();
    if(window.SMS_SUPER_BRIDGE) SMS_SUPER_BRIDGE.removeGlobalUser(deletedEmail);
    renderUsers();
    closeDeleteConfirm();
  });
}

window.addEventListener("click",e=>{
  if(e.target===userModal){
    closeModal();
  }

  if(e.target===confirmOverlay){
    closeDeleteConfirm();
  }
});

populateRoleTemplates();
populateOrganizations();
populateBranches();
seedDefaultUsers();
renderUsers();