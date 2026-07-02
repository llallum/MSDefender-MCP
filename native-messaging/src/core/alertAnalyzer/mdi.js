import { BASE_URL, ENDPOINTS } from "../endpoints.js";

export class MDIClass{

    constructor(httpClient){
        this.httpClient = httpClient;
    }

    async getAlertContext(alertId){

        const endpoint = BASE_URL + ENDPOINTS.MDI_ALERT_CONTEXT.replace("{alertId}", alertId);
        const {body} = await this.httpClient.get(endpoint);
        return body;
    }

    async getAlertStory(alertId){

        const endpoint = BASE_URL + ENDPOINTS.MDI_ALERT_STORY.replace("{alertId}", alertId);
        const {body} = await this.httpClient.get(endpoint);
        return body;
    }

    async getMDIAlertData(alertId){

        const endpoint = BASE_URL + ENDPOINTS.MDI_ALERT_DATA.replace("{alertId}", alertId);

        const {body} = await this.httpClient.get(endpoint);

        return body;
    }

    async getMDIAlertTimeline(alertId){

        
    }

    async searchMDIdentity(SearchText="", pageSize = 20, filter){
        const endpoint = BASE_URL + ENDPOINTS.MDI_IDENTIY_SEARCH;

        const jsonBody = {
            PageSize: pageSize,
            SearchText: SearchText,
            Skip: 0,
            SortBy: { 
                Field: "RepresentableName", 
                Order: "Asc"
            }
        };
        const filterConditions = {};
        if (filter){
            if (filter.accountEnabled != null){ //[true, false]
                filterConditions.AccountEnabled = {eq: filter.accountEnabled};
            }
            if (filter.identityProvider != null){   //["ActiveDirectory", "AzureActiveDirectory"]
                filterConditions.IdentityProvider = {setHasElement: filter.identityProvider};
            }
            if (filter.tags != null){       //["SENSITIVE", "HONEYTOKEN"]
                filterConditions.Tags = {has: filter.tags};
            }
            if (filter.identityType != null){       // ["User", "ServiceAccount"]
                filterConditions.IdentityType = {eq: filter.identityType};
            }
            if (filter.primaryIdentityProvider != null){
                filterConditions.PrimaryIdentityProvider = {eq: filter.primaryIdentityProvider};
            }
        }

        jsonBody.Filter = filterConditions;

        const res = await this.httpClient.post(endpoint, jsonBody);
        return res;
    }

    async searchMDIdentityByRadiusUserId(radiusUserId){
        const endpoint = BASE_URL + ENDPOINTS.MDI_IDENTITY_RADIUS_SEARCH;
        
        const jsonBody = {
            PageSize: 20,
            userId: radiusUserId
        }
        const res = await this.httpClient.post(endpoint, jsonBody);
        return res;
    }

    async getActiveDirectoryServiceAccounts(displayName="", filter, skip=0, pageSize=20){
        const endpoint = BASE_URL + ENDPOINTS.MDI_IDENTITY_SVC_ACCOUNTS;

        const json_body = {
            IncludeAccountActivity : true,
            PageSize: pageSize,
            Skip: skip,
            Sid: displayName,
            DisplayName: displayName
        }

        const filterConditions = {};
        if (filter){
            if (filter.adServiceAccountType != null) {
                filterConditions.AdServiceAccountType = {eq: filter.adServiceAccountType}; // ["gMSA", "sMSA", "User"]
            }
            if (filter.authProtocols != null) {
                filterConditions.AuthProtocols = {setHasElement: filter.authProtocols};
            }
        }

        json_body.Filters = filterConditions;

        const res = await this.httpClient.post(endpoint, json_body);
        return res;
    }

}

export async function analyzeMDIAlert(alertId, httpClient){

    const mdi = new MDIClass(httpClient);
    const alertData = await mdi.getMDIAlertData(alertId);
    const alertStory = await mdi.getAlertStory(alertId);
    const alertContext = await mdi.getAlertContext(alertId);

    return {
        success: true, 
        body: {
            data: alertData,
            story: alertStory,
            context: alertContext
        }
    };
}