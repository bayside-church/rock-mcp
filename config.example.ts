// Example configuration for Rock MCP Server
// Copy this file to config.ts and update with your RockRMS API settings

interface RockAPIConfiguration {
  baseUrl: string;
  apiKey?: string;
  username?: string;
  password?: string;
  timeout?: number;
}

export const apiConfig: RockAPIConfiguration = {
  // RockRMS base URL - replace with your Rock instance URL
  baseUrl: "https://rock.yourdomain.com",

  // API Key for authentication (recommended)
  apiKey: "your_api_key_here",

  // Alternative: Username/Password authentication
  username: "your_username",
  password: "your_password",

  // Request timeout in milliseconds
  timeout: 30000,
};

// Environment variables that can be used instead:
// ROCK_API_BASE_URL - Your RockRMS instance URL
// ROCK_API_KEY - Your API key for authentication
// ROCK_API_USERNAME - Username for basic auth (if not using API key)
// ROCK_API_PASSWORD - Password for basic auth (if not using API key)

// Common RockRMS API endpoints you can use:
export const commonEndpoints = {
  // People endpoints
  people: "/api/People",
  peopleSearch: "/api/People/Search",

  // Group endpoints
  groups: "/api/Groups",
  groupMembers: "/api/GroupMembers",
  groupTypes: "/api/GroupTypes",

  // Campus endpoints
  campuses: "/api/Campuses",

  // Location endpoints
  locations: "/api/Locations",

  // Person endpoints
  personAttributes: "/api/PersonAttributes",
  personAttributeValues: "/api/PersonAttributeValues",

  // Financial endpoints
  financialAccounts: "/api/FinancialAccounts",
  financialTransactions: "/api/FinancialTransactions",

  // Attendance endpoints
  attendances: "/api/Attendances",
  attendanceOccurrences: "/api/AttendanceOccurrences",

  // Communication endpoints
  communications: "/api/Communications",
  communicationTemplates: "/api/CommunicationTemplates",

  // Pages endpoints
  pages: "/api/Pages",
};
