// ================================
// Super Admin API Helper
// Later replace API_BASE_URL with your backend URL.
// ================================

const API_BASE_URL = "http://localhost:5000/api";

async function apiRequest(endpoint, fallbackData = null) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("API request failed");
    }

    return await response.json();
  } catch (error) {
    console.warn(`Using fallback data for ${endpoint}:`, error.message);
    return fallbackData;
  }
}

// Dashboard
async function getDashboardSummary() {
  return apiRequest("/super-admin/dashboard-summary", {
    totalOrganizations: 0,
    totalBranches: 0,
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    billingDue: 0,
    securityStatus: "Healthy"
  });
}

async function getRecentOrganizations() {
  return apiRequest("/super-admin/organizations/recent", []);
}

async function getImportantAlerts() {
  return apiRequest("/super-admin/alerts", []);
}

async function getRecentActivityLogs() {
  return apiRequest("/super-admin/audit-logs/recent", []);
}