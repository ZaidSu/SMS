const branchSearch=document.querySelector("#branchSearch");
const branchStatusFilter=document.querySelector("#branchStatusFilter");
const branchTableBody=document.querySelector("#branchTableBody");
const emptyState=document.querySelector("#emptyState");

const confirmOverlay=document.querySelector("#confirmOverlay");
const confirmMessage=document.querySelector("#confirmMessage");
const cancelDeleteBtn=document.querySelector("#cancelDeleteBtn");
const confirmDeleteBtn=document.querySelector("#confirmDeleteBtn");

const addBranchBtn=document.querySelector("#addBranchBtn");
const branchModal=document.querySelector("#branchModal");
const closeModalBtn=document.querySelector("#closeModalBtn");
const cancelModalBtn=document.querySelector("#cancelModalBtn");
const branchForm=document.querySelector("#branchForm");

const totalBranches=document.querySelector("#totalBranches");
const activeBranches=document.querySelector("#activeBranches");
const inactiveBranches=document.querySelector("#inactiveBranches");
const archivedBranches=document.querySelector("#archivedBranches");

let branches=JSON.parse(localStorage.getItem("smsBranchIds"))||[];
let branchPendingDelete=null;
let branchPendingEdit=null;

function saveBranches(){
  localStorage.setItem("smsBranchIds",JSON.stringify(branches));
}

function capitalize(value){
  return value.charAt(0).toUpperCase()+value.slice(1);
}

function updateSummaryCards(){
  totalBranches.textContent=branches.length;
  activeBranches.textContent=branches.filter(branch=>branch.status==="active").length;
  inactiveBranches.textContent=branches.filter(branch=>branch.status==="inactive").length;
  archivedBranches.textContent=branches.filter(branch=>branch.status==="archived").length;
}

function renderBranches(){
  const searchValue=branchSearch.value.trim().toLowerCase();
  const selectedStatus=branchStatusFilter.value;

  branchTableBody.innerHTML="";

  const filteredBranches=branches.filter(branch=>{
    const searchableText=`
      ${branch.organization}
      ${branch.branchId}
      ${branch.branchName}
      ${branch.city}
      ${branch.state}
      ${branch.status}
    `.toLowerCase();

    const matchesSearch=searchableText.includes(searchValue);
    const matchesStatus=selectedStatus==="all"||branch.status===selectedStatus;

    return matchesSearch&&matchesStatus;
  });

  if(filteredBranches.length===0){
    emptyState.classList.remove("hidden");
  }else{
    emptyState.classList.add("hidden");
  }

  filteredBranches.forEach((branch,index)=>{
    const row=document.createElement("tr");

    row.innerHTML=`
      <td>${branch.organization}</td>
      <td>${branch.branchId}</td>
      <td>${branch.branchName}</td>
      <td>${branch.city}</td>
      <td>${branch.state}</td>
      <td><span class="status ${branch.status}">${capitalize(branch.status)}</span></td>
      <td class="actions-cell">
        <button
          class="table-btn edit-branch-btn"
          data-edit-index="${index}"
          type="button">
          Edit
        </button>
        <button
          class="table-btn delete-branch-btn"
          data-delete-index="${index}"
          type="button">
          Delete
        </button>
      </td>
    `;

    branchTableBody.appendChild(row);
  });

  attachDeleteEvents();
  attachEditEvents();
  updateSummaryCards();
}

function openModal(){
  branchModal.classList.remove("hidden");
}

function closeModal(){
  branchModal.classList.add("hidden");
  branchForm.reset();
  branchPendingEdit=null;
}

function openDeleteConfirm(branch){
  branchPendingDelete=branch;
  confirmMessage.innerHTML=`Are you sure you want to delete <strong>${branch.branchId} — ${branch.branchName}</strong>?`;
  confirmOverlay.classList.remove("hidden");
}

function closeDeleteConfirm(){
  confirmOverlay.classList.add("hidden");
  branchPendingDelete=null;
}

function getFilteredBranches(){
  const searchValue=branchSearch.value.trim().toLowerCase();
  const selectedStatus=branchStatusFilter.value;

  return branches.filter(branch=>{
    const searchableText=`
      ${branch.organization}
      ${branch.branchId}
      ${branch.branchName}
      ${branch.city}
      ${branch.state}
      ${branch.status}
    `.toLowerCase();

    const matchesSearch=searchableText.includes(searchValue);
    const matchesStatus=selectedStatus==="all"||branch.status===selectedStatus;

    return matchesSearch&&matchesStatus;
  });
}

function attachDeleteEvents(){
  const deleteButtons=document.querySelectorAll(".delete-branch-btn");

  deleteButtons.forEach(button=>{
    button.addEventListener("click",()=>{
      const filteredBranches=getFilteredBranches();
      const filteredIndex=Number(button.dataset.deleteIndex);
      const branchToDelete=filteredBranches[filteredIndex];

      if(!branchToDelete){
        return;
      }

      openDeleteConfirm(branchToDelete);
    });
  });
}

function attachEditEvents(){
  const editButtons=document.querySelectorAll(".edit-branch-btn");

  editButtons.forEach(button=>{
    button.addEventListener("click",()=>{
      const filteredBranches=getFilteredBranches();
      const index=Number(button.dataset.editIndex);
      const branch=filteredBranches[index];

      if(!branch) return;

      openModal();

      document.querySelector("#branchOrganization").value=branch.organization;
      document.querySelector("#branchId").value=branch.branchId;
      document.querySelector("#branchName").value=branch.branchName;
      document.querySelector("#branchCity").value=branch.city;
      document.querySelector("#branchState").value=branch.state;
      document.querySelector("#branchStatus").value=branch.status;

      branchPendingEdit=branch;
    });
  });
}

if(addBranchBtn){
  addBranchBtn.addEventListener("click",openModal);
}

if(closeModalBtn){
  closeModalBtn.addEventListener("click",closeModal);
}

if(cancelModalBtn){
  cancelModalBtn.addEventListener("click",closeModal);
}

if(branchSearch){
  branchSearch.addEventListener("input",renderBranches);
}

if(branchStatusFilter){
  branchStatusFilter.addEventListener("change",renderBranches);
}

if(branchForm){
  branchForm.addEventListener("submit",e=>{
    e.preventDefault();

    const organizationName=document.querySelector("#branchOrganization").value.trim();
    const organizations=JSON.parse(localStorage.getItem("smsOrganizations"))||[];

    const organizationExists=organizations.some(
      org=>org.name.toLowerCase()===organizationName.toLowerCase()
    );

    if(!organizationExists){
      alert("Unable to create branch because the organization does not exist.");
      return;
    }

    const newBranch={
      organization:organizationName,
      branchId:document.querySelector("#branchId").value.trim(),
      branchName:document.querySelector("#branchName").value.trim(),
      city:document.querySelector("#branchCity").value.trim(),
      state:document.querySelector("#branchState").value.trim(),
      status:document.querySelector("#branchStatus").value
    };

    const duplicateBranchId=branches.some(branch=>{
      if(branchPendingEdit&&branch.branchId===branchPendingEdit.branchId){
        return false;
      }

      return branch.branchId.toLowerCase()===newBranch.branchId.toLowerCase();
    });

    if(duplicateBranchId){
      alert("That Branch ID already exists.");
      return;
    }

    if(branchPendingEdit){
      const index=branches.findIndex(
        branch=>branch.branchId===branchPendingEdit.branchId
      );

      if(index!==-1){
        branches[index]=newBranch;
      }

      branchPendingEdit=null;
    }else{
      branches.push(newBranch);
    }

    saveBranches();
    if(window.SMS_SUPER_BRIDGE) SMS_SUPER_BRIDGE.syncBranch(newBranch);
    renderBranches();
    closeModal();
  });
}

if(cancelDeleteBtn){
  cancelDeleteBtn.addEventListener("click",closeDeleteConfirm);
}

if(confirmDeleteBtn){
  confirmDeleteBtn.addEventListener("click",()=>{
    if(!branchPendingDelete){
      return;
    }

    branches=branches.filter(
      branch=>branch.branchId!==branchPendingDelete.branchId
    );

    saveBranches();
    renderBranches();
    closeDeleteConfirm();
  });
}

window.addEventListener("click",e=>{
  if(e.target===branchModal){
    closeModal();
  }

  if(e.target===confirmOverlay){
    closeDeleteConfirm();
  }
});

renderBranches();