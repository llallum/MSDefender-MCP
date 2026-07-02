/**
 * Microsoft Defender Alert Type GUIDs
 * These GUIDs are used to categorize and identify specific alert types
 * across Microsoft Defender for Office 365, Endpoint, Identity, and Cloud
 */

// ============================================================================
// MICROSOFT DEFENDER FOR OFFICE 365 ALERT TYPES
// ============================================================================

/**
 * Office 365 Email Alert Types
 * These are the known alert type GUIDs for email-related alerts
 */
const OFFICE365_ALERT_TYPES = {
  // User Actions
  USER_COMPROMISED_MANUAL_ALERT: "845686e4-f843-42cf-36d7-08d8e2eca19c",
  EMAIL_INVESTIGATION_MANUAL_ALERT: "cfb0af3a-7410-445c-a872-45f95c45f0de",
  ADMIN_REMEDIATION_MANUAL_ALERT: "39c5b427-a54f-4c38-a799-8541c5a105a8",
  
  // URL-based Threats
  LOOKBACK_CLICK_ALERT: "a74bb32a-541b-47fb-adfd-f8c62ce3d59b",
  CLICKTHROUGH_CLICK_ALERT: "5453b67e-6c81-4a46-b96c-08d97b58d4ac",
  
  // Zero-hour Auto Purge (ZAP) Alerts
  ZAP_URL_ALERT: "8e6ba277-ef39-404e-aaf1-294f6d9a2b88",
  ZAP_FILE_ALERT: "4b1820ec-39dc-45f3-abf6-5ee80df51fd2",
  GENERIC_ZAP_ALERT: "b8f6b088-5487-4c70-037c-08d8d71a43fe",
  FAILED_ZAP_ALERT: "663e723a-4a74-47d9-9690-9638f0d496af",
  CAMPAIGN_ZAP_ALERT: "c8522cbb-9368-4e25-4ee9-08d8d899dfab",
};

/**
 * Alert Type to Title Mapping
 * Maps known GUIDs to their corresponding alert titles
 */
const ALERT_TYPE_TITLES = {
  // Office 365
  [OFFICE365_ALERT_TYPES.CLICKTHROUGH_CLICK_ALERT]: "A potentially malicious URL click was detected",
  [OFFICE365_ALERT_TYPES.ZAP_URL_ALERT]: "Email messages containing malicious URL removed after delivery​",
  [OFFICE365_ALERT_TYPES.ZAP_FILE_ALERT]: "Email messages containing malicious file removed after delivery​",
  [OFFICE365_ALERT_TYPES.GENERIC_ZAP_ALERT]: "Email messages removed after delivery​",
  [OFFICE365_ALERT_TYPES.CAMPAIGN_ZAP_ALERT]: "Email messages from a campaign removed after delivery​",
};

/**
 * Alert Title to Type Mapping (Reverse lookup)
 * Maps alert titles to their corresponding GUIDs
 */
const ALERT_TITLE_TO_TYPE = {
  // Office 365 - Email Threats
  "A potentially malicious URL click was detected": OFFICE365_ALERT_TYPES.CLICKTHROUGH_CLICK_ALERT,
  "Email messages containing malicious URL removed after delivery​": OFFICE365_ALERT_TYPES.ZAP_URL_ALERT,
  "Email messages containing malicious file removed after delivery​": OFFICE365_ALERT_TYPES.ZAP_FILE_ALERT,
  "Email messages removed after delivery​": OFFICE365_ALERT_TYPES.GENERIC_ZAP_ALERT,
  "Email messages from a campaign removed after delivery​": OFFICE365_ALERT_TYPES.CAMPAIGN_ZAP_ALERT,
  
  // User Reported Emails (GUIDs to be discovered)
  "Email reported by user as malware or phish": null, // GUID needed
  "Email reported by user as junk": null, // GUID needed
  "Email reported by user as not junk": null, // GUID needed
  
  // Admin Actions
  "Admin Submission Result Completed": null, // GUID needed
  "Administrative action submitted by an Administrator": OFFICE365_ALERT_TYPES.ADMIN_REMEDIATION_MANUAL_ALERT,
  
  // Failed Remediation
  "Messages containing malicious entity not removed after delivery": OFFICE365_ALERT_TYPES.FAILED_ZAP_ALERT,
};

// ============================================================================
// MICROSOFT DEFENDER FOR ENDPOINT ALERT TYPES
// ============================================================================

/**
 * Endpoint Alert Categories
 * Categorized by MITRE ATT&CK framework
 */
const ENDPOINT_ALERT_TYPES = {
  // Malware
  MALWARE_WINRING0: null, // Multiple variants
  MALWARE_EGAIRTIGADO: null,
  MALWARE_INJUKE: null,
  MALWARE_FAKELOGIN: null,
  MALWARE_MADEBA: null,
  MALWARE_BUTERAT: null,
  
  // Unwanted Software
  UNWANTED_THROTTLESTOP: null,
  UNWANTED_FRPROXY: null,
  UNWANTED_SOFTCNAPP: null,
  UNWANTED_VIGUA: null,
  
  // Execution
  SUSPICIOUS_POWERSHELL: null,
  SUSPICIOUS_PROCESS_POWERSHELL: null,
  
  // Defense Evasion
  ETW_FUNCTION_PATCH: null,
  REFLECTIVE_DLL_LOADING: null,
  
  // Persistence
  SUSPICIOUS_MACRO_DOCUMENT: null,
  
  // Credential Access
  CREDENTIAL_PHISHING_DOMAIN: null,
  
  // Command and Control
  CUSTOM_NETWORK_INDICATOR: null,
  
  // Collection
  LOCAL_EMAILS_COLLECTED: null,
  
  // Suspicious Activity
  MONITORED_KEYSTROKES: null,
  ROGUE_WIFI_CONNECTION: null,
  
  // Network Protection
  SUSPICIOUS_CONNECTION_BLOCKED: null,
};

// ============================================================================
// MICROSOFT DEFENDER FOR IDENTITY ALERT TYPES
// ============================================================================

const IDENTITY_ALERT_TYPES = {
  DCSYNC_ATTACK: null,
  OAUTH_DEVICE_CODE_ANOMALY: null,
};

// ============================================================================
// AZURE AD IDENTITY PROTECTION ALERT TYPES
// ============================================================================

const AAD_IDENTITY_PROTECTION_TYPES = {
  PASSWORD_SPRAY: null,
  UNFAMILIAR_SIGNIN_PROPERTIES: null,
};

// ============================================================================
// MICROSOFT DEFENDER FOR CLOUD ALERT TYPES
// ============================================================================

const CLOUD_ALERT_TYPES = {
  BRUTE_FORCE_ATTEMPT: null,
  UNUSUAL_DATA_CENTER_LOGIN: null,
  UNUSUAL_DOMAIN_LOGIN: null,
};

// ============================================================================
// MICROSOFT DEFENDER FOR CLOUD APPS ALERT TYPES
// ============================================================================

const CLOUD_APPS_ALERT_TYPES = {
  UNOFFICIAL_CLOUD_STORAGE: null,
};

// ============================================================================
// MICROSOFT DEFENDER XDR ALERT TYPES
// ============================================================================

const XDR_ALERT_TYPES = {
  USER_ACCESSED_QUARANTINED_EMAIL_LINK: null,
};

// ============================================================================
// ALERT CATEGORIZATION
// ============================================================================

/**
 * Alert Severity Levels
 */
const ALERT_SEVERITY = {
  INFORMATIONAL: "Informational",
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

/**
 * MITRE ATT&CK Categories
 */
const MITRE_CATEGORIES = {
  INITIAL_ACCESS: "InitialAccess",
  EXECUTION: "Execution",
  PERSISTENCE: "Persistence",
  PRIVILEGE_ESCALATION: "PrivilegeEscalation",
  DEFENSE_EVASION: "DefenseEvasion",
  CREDENTIAL_ACCESS: "CredentialAccess",
  DISCOVERY: "Discovery",
  LATERAL_MOVEMENT: "LateralMovement",
  COLLECTION: "Collection",
  COMMAND_AND_CONTROL: "CommandAndControl",
  EXFILTRATION: "Exfiltration",
  IMPACT: "Impact",
};

/**
 * Other Alert Categories
 */
const OTHER_CATEGORIES = {
  MALWARE: "Malware",
  UNWANTED_SOFTWARE: "UnwantedSoftware",
  SUSPICIOUS_ACTIVITY: "SuspiciousActivity",
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get alert type GUID from title
 * @param {string} title - Alert title
 * @returns {string|null} Alert type GUID or null if not found
 */
function getAlertTypeFromTitle(title) {
  return ALERT_TITLE_TO_TYPE[title] || null;
}

/**
 * Get alert title from type GUID
 * @param {string} alertType - Alert type GUID
 * @returns {string|null} Alert title or null if not found
 */
function getTitleFromAlertType(alertType) {
  return ALERT_TYPE_TITLES[alertType] || null;
}

/**
 * Check if alert type is known
 * @param {string} alertType - Alert type GUID
 * @returns {boolean} True if alert type is known
 */
function isKnownAlertType(alertType) {
  return Object.values(OFFICE365_ALERT_TYPES).includes(alertType);
}

/**
 * Get all known alert type GUIDs
 * @returns {string[]} Array of all known alert type GUIDs
 */
function getAllKnownAlertTypes() {
  return [
    ...Object.values(OFFICE365_ALERT_TYPES),
    ...Object.values(ENDPOINT_ALERT_TYPES).filter(v => v !== null),
    ...Object.values(IDENTITY_ALERT_TYPES).filter(v => v !== null),
    ...Object.values(AAD_IDENTITY_PROTECTION_TYPES).filter(v => v !== null),
    ...Object.values(CLOUD_ALERT_TYPES).filter(v => v !== null),
    ...Object.values(CLOUD_APPS_ALERT_TYPES).filter(v => v !== null),
    ...Object.values(XDR_ALERT_TYPES).filter(v => v !== null),
  ];
}

/**
 * Categorize alert by service source
 * @param {string} serviceSource - Service source name
 * @returns {string} Category name
 */
function categorizeByServiceSource(serviceSource) {
  const categories = {
    "Microsoft Defender for Office 365": "Email & Office 365",
    "Microsoft Defender for Endpoint": "Endpoint",
    "Microsoft Defender for Identity": "Identity",
    "AAD Identity Protection": "Azure AD Identity",
    "Microsoft Defender for Cloud": "Cloud Infrastructure",
    "Microsoft Defender for Cloud Apps": "Cloud Apps",
    "Microsoft Defender XDR": "Cross-Domain",
  };
  return categories[serviceSource] || "Unknown";
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Alert Type Constants
  OFFICE365_ALERT_TYPES,
  ENDPOINT_ALERT_TYPES,
  IDENTITY_ALERT_TYPES,
  AAD_IDENTITY_PROTECTION_TYPES,
  CLOUD_ALERT_TYPES,
  CLOUD_APPS_ALERT_TYPES,
  XDR_ALERT_TYPES,
  
  // Mappings
  ALERT_TYPE_TITLES,
  ALERT_TITLE_TO_TYPE,
  
  // Categories
  ALERT_SEVERITY,
  MITRE_CATEGORIES,
  OTHER_CATEGORIES,
  
  // Helper Functions
  getAlertTypeFromTitle,
  getTitleFromAlertType,
  isKnownAlertType,
  getAllKnownAlertTypes,
  categorizeByServiceSource,
};
