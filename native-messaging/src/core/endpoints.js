

export const BASE_URL = "https://security.microsoft.com";

export const ENDPOINTS = {

    XDR_CONTEXT                 : "/apiproxy/mtp/sccManagement/mgmt/TenantContext",

    INCIDENTS                   : "/apiproxy/mtp/incidentQueue/incidents/alerts",
    INCIDENT_DETAILS            : "/apiproxy/mtp/incidentQueue/incidents/{incidentId}",
    INCIDENT_UPDATE_COMMENT     : "/apiproxy/mtp/incidents/addComment",
    ASSOCIATED_ALERTS           : '/apiproxy/mtp/alertsApiService/alerts',
    ASSOCIATED_ALERTS_COUNT     : '/apiproxy/mtp/alertsApiService/alerts/count',
    ALERT_UPDATE_COMMENT        : '/apiproxy/mtp/alertsApiService/alerts/{alertId}',
    ALERT_LINK_TO_INCIDENT      : '/apiproxy/mtp/alertsLinks/alerts/incidentLinks',
    INCIDENT_UPDATE_STATUS      : '/apiproxy/mtp/incidentUpdate/incidents',
    INCIDENT_AUDIT_HISTORY      : '/apiproxy/mtp/auditHistory/AuditHistory',
    HUNTING_QUERY               : "/apiproxy/mtp/huntingService/queryExecutor",
    HUNTING_QUERY_SCHEMA        : "/apiproxy/mtp/huntingService/schema",
    HUNTING_TABLE_DOCUMENTATION : "/apiproxy/hunting/huntingService/documentation/TableDocumentation/{tableName}",
    HUNTING_QUERY_AZURE_DATALAKE: "/apiproxy/securityplatform/lake/kql/v2/rest/query",
    THREAT_ANALYTICS            : "/apiproxy/mtp/threatAnalytics/outbreaks/outbreaksEnrichedDataMtp", 
    THREAT_ANALYTICS_OVERVIEW   : "/apiproxy/mtp/threatAnalytics/outbreaks/{reportId}/overview",
    THREAT_ANALYTICS_URL        : "/apiproxy/mtp/threatAnalyticsIndicators/stix/oneti/reputation/URL",

    URL_OVERVIEW                : "/apiproxy/mtp/useServiceBaseUrl/ine/entitypagesservice/urls/overview",
    URL_PREVALENCE              : "/apiproxy/mtp/cloudPivot/cloud/pivot/portal/url/device/prevalence",
    URL_TREND                   : "/apiproxy/mtp/cloudPivot/cloud/pivot/portal/url/device/trend",
    URL_DEVICE_DETAILS          : "/apiproxy/mtp/cloudPivot/cloud/pivot/portal/url/device/details",
    IP_OVERVIEW                 : "/apiproxy/mtp/huntingService/goHunt/IP",                                 //unused
    IP_STATS                    : "/apiproxy/mtp/entityPagesService/ips/IpStats",

    SIGNIN_AUDIT_LOGS           : "/apiproxy/msgraph/beta/auditLogs/signIns/",                              //unused
    MCAS_ALERT_DATA             : "/apiproxy/mtp/alertsApiService/alerts/",                                 //unused
    MCAS_APP_INFO               : "/apiproxy/m365appprotection/mapg-glsservice/compliance/apps",            //unused
    MCAS_ALERT_STORY            : "/apiproxy/mtp/alertsApiService/alerts/{alertId}",
    MCAS_TIMELINE               : "/apiproxy/mtp/huntingService/alerts/{alertId}/timeline",                 //unused

    AAD_ALERT_DATA              : "/apiproxy/mtp/alertsApiService/alerts/{alertId}",
    AAD_ALERT_CONTEXT           : "/apiproxy/mtp/alertsApiService/alerts/{alertId}/context",
    AAD_ALERT_STORY             : "/apiproxy/mtp/alertsApiService/alerts/{alertId}/story",                  //unused

    MDE_ALERT_DATA              : "/apiproxy/mtp/mdeAlertExperience/",
    MDE_ALERT_STORY             : "/apiproxy/mtp/mdeAlertExperience/{alertId}/story",
    MDE_DEVICE_TIMELINE         : "/apiproxy/mtp/mdeTimelineExperience/machines/{senseMachineId}/events/",
    MDE_DEVICE_MARK_EVENT       : "/apiproxy/mtp/markMachineTimelineEvent/machines/{senseMachineId}/eventMark",
    
    MDO_ALERT_DATA              : "/apiproxy/mtp/alertsApiService/alerts/{alertId}",
    MDO_EMAIL_QUERY_MSG         : "/api/QuarantineMessage/QueryMessage",
    MDO_EMAIL_URL_DATA          : "/apiproxy/di/Find/ThreatIntelMailUrlData",
    MDO_EMAIL_METADATA          : "/apiproxy/di/Find/MailMetaData",
    MDO_EMAIL_TIMELINE          : "/apiproxy/di/Find/EmailTimelineEvents",

    MTP_ALERT_DATA              : "/apiproxy/mtp/alertsApiService/alerts/",
    MTP_INCIDENT_DEVICES        : "/apiproxy/mtp/incidentDevices/incidents/{incidentId}/devices",
    MTP_ALERT_STORY             : "/apiproxy/mtp/alertsApiService/alerts/",
    MTP_GET_TIMELINE            : "/apiproxy/mtp/huntingService/alerts/",

    DEVICE_INFO                 : "/apiproxy/mtp/getMachine/machines",
    DEVICE_TOTAL_INVENTORY      : "/apiproxy/mtp/ndr/machines/deviceTotals",
    DEVICE_SOFTWARE_INVENTORY   : "/apiproxy/mtp/tvm/analytics/assets/{deviceId}/installations/",

    MSGRAPH_USERS               : "/apiproxy/msgraph/v1.0/users/",
    MSGRAPH_GROUPS              : "/apiproxy/msgraph/v1.0/groups/",
    MSGRAPH_AUTHENTICATION      : "/apiproxy/msgraph/beta/reports/authenticationMethods/userRegistrationDetails/{userId}",

    MDI_ALERT_DATA              : "/apiproxy/mtp/alertsApiService/alerts/{alertId}",
    MDI_ALERT_STORY             : "/apiproxy/mtp/alertsApiService/alerts/{alertId}/story",
    MDI_ALERT_CONTEXT           : "/apiproxy/mtp/alertsApiService/alerts/{alertId}/context", 
    MDI_IDENTIY_SEARCH          : "/apiproxy/mdi/identity/userapiservice/identities",   
    MDI_IDENTITY_SVC_ACCOUNTS   : "/apiproxy/mdi/identity/userapiservice/serviceAccounts",
    MDI_IDENTITY_RADIUS_SEARCH  : "/apiproxy/radius/api/radius/identities/accountsByUserId",

    LIST_LOCAL_AGENTS           : "/apiproxy/sec4ai/api/v1/inventory/list-local-agents",
    LOCAL_AGENT_DETAILS         : "/apiproxy/sec4ai/api/v1/inventory/local-agent-detail",
    LIST_AGENTS_FILTER          : "/apiproxy/sec4ai/api/v1/inventory/local-agents-filter-values"
}


