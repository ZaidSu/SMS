const SMSAudit = {
  storageKey: "smsAuditLogs",

  getCurrentUser() {
    return JSON.parse(localStorage.getItem("smsCurrentUser")) || {
      name: "Super Admin",
      role: "Super Admin",
      email: "superadmin@sms.com",
      organizationId: "GLOBAL",
      organizationName: "Global Platform",
      branchId: "GLOBAL",
      branchName: "All Branches"
    };
  },

  getLogs() {
    return JSON.parse(localStorage.getItem(this.storageKey)) || [];
  },

  saveLogs(logs) {
    localStorage.setItem(this.storageKey, JSON.stringify(logs));
  },

  log(data = {}) {
    const currentUser = this.getCurrentUser();
    const logs = this.getLogs();

    const newLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),

      actorName: data.actorName || currentUser.name || "Unknown User",
      actorRole: data.actorRole || currentUser.role || "Unknown Role",
      actorEmail: data.actorEmail || currentUser.email || "No email",

      organizationId:
        data.organizationId || currentUser.organizationId || "GLOBAL",
      organizationName:
        data.organizationName || currentUser.organizationName || "Global Platform",

      branchId:
        data.branchId || currentUser.branchId || "GLOBAL",
      branchName:
        data.branchName || currentUser.branchName || "All Branches",

      action: data.action || "Unknown Action",
      category: data.category || "general",

      targetType: data.targetType || "N/A",
      targetName: data.targetName || "N/A",

      riskLevel: data.riskLevel || "low",
      details: data.details || "No details provided."
    };

    logs.unshift(newLog);
    this.saveLogs(logs);
  },

  clearLogs() {
    localStorage.removeItem(this.storageKey);
  }
};