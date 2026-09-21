// ================================================================
// Super Admin <-> Core Demo Data Bridge
// Keeps the platform console and school portals on the same mock dataset.
// Supabase will replace this bridge with real relational tables.
// ================================================================
var SMS_SUPER_BRIDGE = (function(){
  "use strict";

  function orgsFromCore(){
    return (window.SMS_SCHOOLS||[]).map(function(s){
      return {name:s.name,orgId:s.id,branches:(window.SMS_BRANCHES||[]).filter(function(b){return b.schoolId===s.id;}).length,admin:(window.SMS_USERS||[]).find(function(u){return u.schoolId===s.id&&u.role==='school_admin';})?.displayName||'Unassigned',plan:s.plan||'standard',status:s.status||'active',billingDue:0};
    });
  }
  function branchesFromCore(){
    return (window.SMS_BRANCHES||[]).map(function(b){var s=(window.SMS_SCHOOLS||[]).find(function(x){return x.id===b.schoolId;});return {organization:s?s.name:b.schoolId,branchId:b.id,branchName:b.name,city:(b.address||'').split(',')[1]?.trim()||'',state:(b.address||'').split(',')[2]?.trim()?.split(' ')[0]||'',status:String(b.status||'active').toLowerCase()};});
  }
  function usersFromCore(){
    return (window.SMS_USERS||[]).filter(function(u){return u.role==='superadmin'||u.role==='school_admin'||u.role==='branch_admin'||u.role==='front_desk';}).map(function(u){var s=(window.SMS_SCHOOLS||[]).find(function(x){return x.id===u.schoolId;});var b=(window.SMS_BRANCHES||[]).find(function(x){return x.id===u.branchId;});return {fullName:u.displayName,email:u.email,roleTemplateKey:mapCoreRoleToTemplate(u.role),roleTemplateName:roleLabel(u.role),scope:u.role==='superadmin'?'global':u.branchId?'branch':'organization',organization:s?s.name:'',branch:b?b.name:'',status:'active',password:'DemoOnly!'};});
  }
  function studentsFromCore(){
    return (window.SMS_STUDENTS||[]).map(function(s){var school=(window.SMS_SCHOOLS||[]).find(function(x){return x.id===s.schoolId;});var branch=(window.SMS_BRANCHES||[]).find(function(x){return x.id===s.branchId;});return {studentId:s.id,fullName:s.fullName,organization:school?school.name:s.schoolId,branch:branch?branch.name:s.branchId,grade:s.grade,status:String(s.status||'Active').toLowerCase()};});
  }
  function staffFromCore(){
    return (window.SMS_TEACHERS||[]).map(function(t){var school=(window.SMS_SCHOOLS||[]).find(function(x){return x.id===t.schoolId;});var branch=(window.SMS_BRANCHES||[]).find(function(x){return x.id===t.branchId;});return {staffId:t.id,fullName:t.fullName,email:t.email,organization:school?school.name:t.schoolId,branch:branch?branch.name:t.branchId,role:'Teacher',status:String(t.status||'Active').toLowerCase()};});
  }
  function roleLabel(r){return {superadmin:'Super Admin',school_admin:'Organization Admin',branch_admin:'Principal / Branch Admin',front_desk:'Front Office'}[r]||r;}
  function mapCoreRoleToTemplate(r){return {superadmin:'super_admin',school_admin:'organization_admin',branch_admin:'principal',front_desk:'front_office',teacher:'teacher',parent:'parent_guardian'}[r]||r;}
  function mapTemplateToCoreRole(r){return {super_admin:'superadmin',organization_admin:'school_admin',principal:'branch_admin',front_office:'front_desk',registrar:'front_desk',finance_admin:'branch_admin',teacher:'teacher',parent_guardian:'parent'}[r]||null;}

  function seed(){
    if(!localStorage.getItem('smsOrganizations')) localStorage.setItem('smsOrganizations',JSON.stringify(orgsFromCore()));
    if(!localStorage.getItem('smsBranchIds')) localStorage.setItem('smsBranchIds',JSON.stringify(branchesFromCore()));
    if(!localStorage.getItem('smsGlobalUsers')) localStorage.setItem('smsGlobalUsers',JSON.stringify(usersFromCore()));
    if(!localStorage.getItem('smsStudents')) localStorage.setItem('smsStudents',JSON.stringify(studentsFromCore()));
    if(!localStorage.getItem('smsStaff')) localStorage.setItem('smsStaff',JSON.stringify(staffFromCore()));
  }

  function syncOrganization(org){
    if(!window.SMS_SCHOOLS) return;
    var existing=SMS_SCHOOLS.find(function(s){return s.id===org.orgId;});
    var data={id:org.orgId,name:org.name,address:existing?.address||'',phone:existing?.phone||'',email:existing?.email||'',website:existing?.website||'',status:org.status||'active',plan:org.plan||'standard',logoText:(org.name||'SC').split(/\s+/).map(function(w){return w[0];}).slice(0,3).join('').toUpperCase(),currentYear:existing?.currentYear||'2026-2027'};
    if(existing) Object.assign(existing,data); else SMS_SCHOOLS.push(data);
    if(window.SMS_DEMO_STORE) SMS_DEMO_STORE.save();
  }
  function removeOrganization(orgId){
    if(!window.SMS_SCHOOLS) return;
    SMS_SCHOOLS=SMS_SCHOOLS.filter(function(s){return s.id!==orgId;});
    SMS_BRANCHES=SMS_BRANCHES.filter(function(b){return b.schoolId!==orgId;});
    SMS_USERS=SMS_USERS.filter(function(u){return u.schoolId!==orgId;});
    if(window.SMS_DEMO_STORE) SMS_DEMO_STORE.save();
  }
  function syncBranch(branch){
    if(!window.SMS_BRANCHES) return;
    var school=SMS_SCHOOLS.find(function(s){return s.name===branch.organization||s.id===branch.organization;}); if(!school)return;
    var existing=SMS_BRANCHES.find(function(b){return b.id===branch.branchId;});
    var data={id:branch.branchId,schoolId:school.id,name:branch.branchName,address:[branch.city,branch.state].filter(Boolean).join(', '),phone:existing?.phone||'',email:existing?.email||'',status:branch.status==='inactive'?'Inactive':'Active',principalName:existing?.principalName||''};
    if(existing)Object.assign(existing,data);else SMS_BRANCHES.push(data);
    if(window.SMS_DEMO_STORE) SMS_DEMO_STORE.save();
  }
  function removeGlobalUser(email){
    if(!window.SMS_USERS)return;
    SMS_USERS=SMS_USERS.filter(function(u){return String(u.email||'').toLowerCase()!==String(email||'').toLowerCase();});
    if(window.SMS_DEMO_STORE)SMS_DEMO_STORE.save();
  }
  function syncGlobalUser(user,oldEmail){
    if(!window.SMS_USERS)return;
    var coreRole=mapTemplateToCoreRole(user.roleTemplateKey); if(!coreRole)return;
    var school=SMS_SCHOOLS.find(function(s){return s.name===user.organization;}); var branch=SMS_BRANCHES.find(function(b){return b.name===user.branch&&(!school||b.schoolId===school.id);});
    var existing=SMS_USERS.find(function(u){return u.email===(oldEmail||user.email);});
    var data={id:existing?.id||('USR-'+Date.now().toString(36)),username:(user.email||'user').split('@')[0].toLowerCase(),role:coreRole,schoolId:school?.id||null,branchId:branch?.id||null,displayName:user.fullName,email:user.email};
    if(existing)Object.assign(existing,data);else SMS_USERS.push(data);
    if(window.SMS_DEMO_STORE)SMS_DEMO_STORE.save();
  }
  seed();
  return {seed:seed,syncOrganization:syncOrganization,removeOrganization:removeOrganization,syncBranch:syncBranch,syncGlobalUser:syncGlobalUser,removeGlobalUser:removeGlobalUser};
})();
