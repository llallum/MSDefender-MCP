import pkg from "lodash";
import {
    alertStatusType, 
    alertClassificationType, 
    alertDeterminationType, 
    groupedDetermination,
    severityValues
} from "../utils/incidentStatusValues.js";
const {sortBy} = pkg;
import { readJson, log, __log } from "../utils/utils.js";
import { ENDPOINTS , BASE_URL} from "./endpoints.js";
import { ALERT_ID_PATTERNS , determineSource} from "./sources/alertIdPatterns.js";
import { HttpClient } from "../utils/httpClient.js";
import { MDOClass} from "./sources/mdo.js";
import { MDEClass } from "./sources/mde.js";
import { MCASClass } from "./sources/mcas.js";
import { MDIClass} from "./sources/mdi.js";
import { AADClass } from "./sources/aad.js";
import MSGraph from "./sources/msgraph.js";
import { broadcastToMCP } from "../utils/pipeServer.js";
import { DuckDatabase } from "../utils/duckdbClient.js";


export class Defender {

    constructor(headers){
        this.headers = headers;
        this.httpClient = new HttpClient(this.getMergedHeaders());
        this.mdeClass = new MDEClass(this.httpClient);
        this.msGraph = new MSGraph(this.httpClient);
        this.mdiClass = new MDIClass(this.httpClient);
        this.mdoClass = new MDOClass(this.httpClient);
        this.mcasClass = new MCASClass(this.httpClient);
        
    }

    refreshSession(headers){
        __log(`[defender.js] called refreshSession`);
        this.headers = headers;
        this.httpClient.setHeaders(this.getMergedHeaders());

        return this;
    }

    get expired(){
        const cookies = this.headers.cookies;
        const session = cookies.find(c => c.name === "ai_session");
        if (!session || !session.expirationDate) return true;
        return Date.now() > session.expirationDate * 1000;

    }

    getMergedHeaders(){
        const headers = this.headers.headers;
        const cookies = this.headers.cookies;
        if (headers === null && cookies === null)
            return null;        
        const formattedCookies = cookies.map((cookie) => `${cookie.name}=${cookie.value}`);
        let xsrf_token = "";
        for(const counter in headers){
            if (headers[counter].name === "X-XSRF-TOKEN")
                xsrf_token = headers[counter].value;
        }

        const mergedHeaders = {
            "content-type": "application/json",
            "accept" : "application/json, text/plain, */*",
            "X-XSRF-TOKEN": xsrf_token,
            "cookie": formattedCookies.join('; '),
        };

        return mergedHeaders;
    }

    async getTenantId(){
        let tenantContext = "https://security.microsoft.com/apiproxy/mtp/sccManagement/mgmt/TenantContext";
        try {
            const json = await this.httpClient.get(tenantContext, {});
            const {AuthInfo: {TenantId}} = json.body;
            return TenantId;
        } catch (err) {
            log(err);
            return null;
        }
    }

    async getIncidents(
        lookBackInDays = 1,
        severity = [], 
        pageIndex = 1, 
        fromDate="", 
        toDate="", 
        pageSize = 50, 
        machineIds=[], 
        url= "", 
        ipAddress = "",
        sha256 = "",
        output= []) {
    //    var headers = this.getMergedHeaders();

        var json_body = {
            "isDexLicense":false, 
            "isStatusFilterEnable":false,
            "isUSXIncidentAssignmentEnabled":true,
            "pageSize":pageSize,
            "isMultipleIncidents":true,
            "alertStatus":["New","InProgress","Resolved"],
        //    "severity":[256,128,64,32],
        //    "lookBackInDays": lookBackInDays, //lookBackInDays.toString(),
            "pageIndex":pageIndex,
            "sortOrder": "Descending",
        //      "fromDate": "2024-08-29T14:38:59.974Z",
        //      "toDate": "2024-08-30T14:38:59.974Z"
        //      "sortByField":"lastUpdateTime"
        };

        if (severity.length > 0){
            json_body.severity = severity;
        }  

        if (Array.isArray(machineIds) && machineIds.length > 0) {
            const idPattern = /^[0-9a-f]{40}$/i;
            const validIds = machineIds.filter(id => typeof id === 'string' && idPattern.test(id));
            if (validIds.length > 0)
                json_body.machineIds = validIds;
        }

        if (url){
            json_body.url = url;
        }

        if (ipAddress){
            json_body.ipAddress = ipAddress;
        }

        if (sha256){
            json_body.sha256 = sha256;
        }

        if (fromDate && toDate){
            json_body.fromDate = fromDate;   //fromdate -> fromDate
            json_body.toDate = toDate;
        }
        else {
            json_body.lookBackInDays = lookBackInDays;  //.toString();
        }
        try {
            const {body: json} = await this.httpClient.post(BASE_URL + ENDPOINTS.INCIDENTS, json_body);

/*             const res = await fetch(BASE_URL + ENDPOINTS.INCIDENTS, {
            headers: headers,
            body: JSON.stringify(json_body),
            method: "POST",
            credentials: "include"
            });

            if (!res.ok)
                return null;

            var json = await res.json();   */          
            //logging(json)
            output.push(...json);

            if (json.length == pageSize) {
                return await this.getIncidents(lookBackInDays, severity, pageIndex+1, fromDate, toDate, pageSize, machineIds, url, ipAddress, sha256, output);
            } else return output

            } catch (err) {
                log(err)
                return output
            }
        }

    async getIncidentById(incidentId){
        let incident_details = BASE_URL + ENDPOINTS.INCIDENT_DETAILS.replace("{incidentId}", incidentId);

        try {
            const json = await this.httpClient.get(incident_details, {});
            return json;

        } catch(err){
            log(err);
            return {success: false, status: err?.status || 500, body: null};
        }
    }

    async updateIncidentStatus(assignedTo="", incidentIds=[], severity=null, status=null, classification="", determination="", resolvingComment=""){

        let incident_update = BASE_URL + ENDPOINTS.INCIDENT_UPDATE_STATUS;

        let url = new URL(incident_update);
        url.search = new URLSearchParams({tenantIds: null}).toString();

        const statusValue = alertStatusType[status];
        const severityValue = severityValues[severity];
        const classificationValue = alertClassificationType[classification];
        const determinationValue = alertDeterminationType[determination];

        if (incidentIds.length === 0 || !statusValue || !severityValue){
            log({"error": "Invalid input parameters for updating incident status"});
            return null;
        }

        let json_body = {
            "Ids": incidentIds,
            "Status": statusValue,
            "Severity": severityValue,
            "AssignedTo": assignedTo,
            "FeedbackSource": "WebPortal",
        };

        if (classification && determination) {
            json_body.Classification = classificationValue;
            json_body.Determination = determinationValue;
        }
        if (status === "Resolved" && resolvingComment) json_body.ResolvingComment = resolvingComment;


        try {
            const json = await this.httpClient.post(url, json_body);
            return json;
        } catch(err){
            log(err);
            return null;
        }

    }

    async updateIncidentComment(incidentIds=[], comment=""){
        let incident_comment = BASE_URL + ENDPOINTS.INCIDENT_UPDATE_COMMENT;

        let json_body = {
            Ids: incidentIds,
            Comment: comment
        }
        try {
            const json = await this.httpClient.post(incident_comment, json_body);
            return json;
        } catch(err){
            log(err);
            return null;
        }
    }

    async getAssociatedAlertsCount(incidentIds=[], lookBackInDays=30, status=["New", "InProgress", "Resolved"]){
        let alerts_count = BASE_URL + ENDPOINTS.ASSOCIATED_ALERTS_COUNT;

        let json_body = {
            incidentIds : incidentIds,
            daysAgo : lookBackInDays.toString(),
            shouldReturnAlertsLinkedBy : true,
            status : status
        }

        try {
            const json = await this.httpClient.post(alerts_count, json_body);
            return json;
        } catch(err){
            log(err);
            return null;
        }

    }

    async getAssociatedAlerts(incidentId, lookBackInDays=180, severity=[], status=[], pageNumber=1, pageSize=30){
        var headers = this.getMergedHeaders();
        var associated_alerts =  BASE_URL + ENDPOINTS.ASSOCIATED_ALERTS;

        let json_body = {
            "pageNumber": pageNumber,
            "pageSize": pageSize,
            "daysAgo": lookBackInDays,
            "IncidentIds": [incidentId.toString()],
            "sorByField": "lastEventTime",
            "order": "desc"
        };

        if (severity && severity.length > 0) json_body.severity = severity;
        if (status && status.length > 0) json_body.status = status;

        try {
            /* const res = await fetch(associated_alerts, 
                {
                    headers: headers,
                    body: JSON.stringify(json_body),
                    method: "POST",
                    credentials: "include"
                });
            const json = await res.json(); */
            const json =  await this.httpClient.post(associated_alerts, json_body);
            return json;
        } catch (err) {
            log(err)
        }

    }

    async updateAlertComment(alertId, comment=""){
        let alert_update = BASE_URL + ENDPOINTS.ALERT_UPDATE_COMMENT.replace('{alertId}', alertId);

        let params = {
            FeedBackSource : "WebPortal",
            comment: comment,
            type: "AlertUpdateRequest"
        };
        try {
            const result = await this.httpClient.patch(alert_update, params);
            return result;
        } catch(err){
            log(err);
            return null;
        }        
    }

    async linkAlertToIncident(alertIds=[], incidentId, comment="", linkReason=[]){
        let alert_link = BASE_URL + ENDPOINTS.ALERT_LINK_TO_INCIDENT;
        let json_body = {
            AlertIds: alertIds,
            Comment: comment, 
            FeedbackContent: {
                ClientFalseCorrelationEntities: [],
                ClientFalseCorrelationLinkTypes: [],
            },
            ClientNewLinkReasons: [linkReason],
            IncidentId: incidentId,
            ReturnOkIfAlertAlreadyLinkedToIncident: true
        }

        let newUrl = new URL(alert_link);
        newUrl.search = new URLSearchParams({newApi: true}).toString();

        try {
            const json = await this.httpClient.post(newUrl, json_body);
            return json;
        } catch (err) {
            log(err);
            return null;
        }
    }

    async getIncidentAuditHistory(incidentId, pageSize= 100, output=[]){
        let headers = this.getMergedHeaders();
        let audit_history = BASE_URL + ENDPOINTS.INCIDENT_AUDIT_HISTORY;

        let params = {
            entityType : 'IncidentEntity',
            id : incidentId,
            pageIndex: 1,
            pageSize: pageSize
        }

/*         let url = new URL(audit_history);
        url.search = new URLSearchParams(params).toString(); */

        try {
            /* const res = await fetch(url, 
            {
                headers: headers,
                method: "GET",
                credentials: "include"
            });  

            if (!res.ok)
                return null;
            const json = await res.json(); */
            const {body} = await this.httpClient.get(audit_history, params);
            let result = sortBy(body, 'auditId');

            output.push(...result);
            if (result.length==pageSize)
                return this.getIncidentAuditHistory(incidentId, pageSize, output);

            return output;

        } catch (err) {
            log({"error" : err})
            return null;
        }
    }

    async getHuntingQuerySchema(){
        
        const request_page = BASE_URL + ENDPOINTS.HUNTING_QUERY_SCHEMA;
        const result = await this.httpClient.get(request_page);
         
        return result;
    }

    async getTableDocumentation(tableName){

        const table_info = BASE_URL + ENDPOINTS.HUNTING_TABLE_DOCUMENTATION.replace('{tableName}', tableName);
        const result =  await this.httpClient.get(table_info);
        return result;
    }

    async runHuntingQuery(query, startTime , endTime, maxRecordCount=1){
        const request_page =  BASE_URL + ENDPOINTS.HUNTING_QUERY;
        const defaultEndTime = new Date();
        let defaultStartTime = new Date(defaultEndTime);
        defaultStartTime.setDate(defaultStartTime.getDate() - 7);

        startTime = startTime ?? defaultStartTime.toISOString();
        endTime = endTime ?? defaultEndTime.toISOString();

        if (!query) return null;
        if (!startTime) return null;

        if (!this.getMergedHeaders()) return null;

        const json_body = {
            QueryText : query,
            StartTime : startTime,
            EndTime : endTime,
            MaxRecordCount : maxRecordCount
        };

        try {
            const json = await this.httpClient.post(request_page, json_body, { "m-package": "hunting" });
            return json;

        } catch(err){
            log(err);
            return null;
        }
    }

    async getAzureDataLakeWorkspaces(){

        const request_page = BASE_URL + ENDPOINTS.SENTINEL_LIST_WORKSPACES;

        const params = {
            'api-version': '2024-07-01',
            includeAll: true,
            includeScopedActions: true
        }
        try{
            const res = await this.httpClient.get(request_page, params);
            return res;
        }catch(err){
            __log(err);
            return err;
        }
    }

    async getAzureDatalakeDatabaseEntities(){
       
        const request_page = BASE_URL + ENDPOINTS.SENTINEL_DATALAKE_ENTITIES;

        const json_body = {
            csl: '.show databases entities'
        }

        try{
            const res = await this.httpClient.post(request_page, json_body);
            return res;
        }catch(err){
            __log(err);
            return err;
        }
    }

    async runHuntingQueryAzureDataLake(workspace=['default'], query, startTime="", endTime=""){

        const request_page = BASE_URL + ENDPOINTS.HUNTING_QUERY_AZURE_DATALAKE;

        let db= workspace[0];
        if (!startTime || startTime === "") {
            let _end = new Date();
            let _start = new Date();
            _start.setDate(_end.getDate() - 3);
            startTime  = _start.toISOString();
            endTime = _end.toISOString();
        }

        if (workspace.length > 1) db = 'default';
    //    __log(db);
        const json_body = {
            csl : query,
            db : db,
            startTime : startTime,
            endTime : endTime,
            saveToQueryHistory : true,
            workspaces: workspace
        }

        const res = await this.httpClient.post(request_page, json_body);

        return res;
    }

    async getAssociatedDevicesByIncidentId(incidentId, pageIndex=1, pageSize=30){

        const incidentDevices = BASE_URL + ENDPOINTS.MTP_INCIDENT_DEVICES.replace('{incidentId}', incidentId);

        const params = {
            IncidentId : incidentId, 
            pageIndex : pageIndex,
            pageSize : pageSize,
            sortByField: "riskscore",
            sortOrder : "Ascending"
        };

        try {
            const res = await this.httpClient.get(incidentDevices, params);
            return res;
        } catch(err){
            return err;
        }
    }

    async getThreatAnalytics(search="", category=[], tags=[], createdOnFilter="", lastUpdatedOnFilter=""){
        
        const request_page = BASE_URL + ENDPOINTS.THREAT_ANALYTICS;
        try {
            const params = {"feature.ThreatAnalyticsAll1PReports": true};
            if (search){
                params.search = search;
            }
            if (category.length > 0){
                params.category = category.join(",");
            }
            if (tags.length > 0){
                params.tags = tags.join(",");
            }

            const {body} = await this.httpClient.get(request_page, params);
            
            let {Items} = body;
            if (Array.isArray(Items)){
                return Items
                    .filter(item => {
                        if (createdOnFilter && new Date(item.CreatedOn) < new Date(createdOnFilter)){
                            return false;
                        }
                        if (lastUpdatedOnFilter && new Date(item.LastUpdatedOn) < new Date(lastUpdatedOnFilter)){
                            return false;
                        }
                        return true;
                    })
                    .map(item => {
                        const {Id, DisplayName, LastUpdatedOn, CreatedOn, StartedOn, ReportType, ExposureSeverity} = item;
                        return {Id, DisplayName, LastUpdatedOn, CreatedOn, StartedOn, ReportType, ExposureSeverity};
                    });
            }
            return [];
        } catch(err){
            log(err);
            return null;
        }
    }

    async getThreatAnalyticsById(id){
        const request_page = BASE_URL + ENDPOINTS.THREAT_ANALYTICS;
        try {
            const params = {"feature.ThreatAnalyticsAll1PReports": true};

            const {body} = await this.httpClient.get(request_page, params);

            let {Items} = body;

            if (Array.isArray(Items)){
                const item = Items.find(i => i.Id === id);
                return item;
            }
            return null;
        } catch(err){
            log(err);
            return null;
        }
    }

    async getThreatAnalyticsOverviewById(id){
        const request_page = BASE_URL + ENDPOINTS.THREAT_ANALYTICS_OVERVIEW.replace("{reportId}", id);
        try {
            const params = {"feature.ThreatAnalyticsAll1PReports": true};
            const {body} = await this.httpClient.get(request_page, params);
            return body;
        } catch(err){
            log(err);
            return null;
        }
    }

    async getURLOverviewInformation(urlDomain){
        const request_page = BASE_URL + ENDPOINTS.URL_OVERVIEW;
        try {
            const params = {urlDomain: urlDomain};
            const res = await this.httpClient.get(request_page, params);
            return res;
        } catch(err){
            log(err);
            return null;
        }
    }

    async getDeviceInfoBySenseMachineId(senseMachineId){
        const request_page = BASE_URL + ENDPOINTS.DEVICE_INFO;

        let id = /[a-f0-9]{40}/;
        let idType = "SenseMachineId";
 //       if (!id.test(senseMachineId))
 //           idType = "Name";
        try {
            const {body} = await this.httpClient.get(request_page, {
                machineId: senseMachineId, 
                idType: idType,
                readFromCache: true,
                lookingBackIndays: 180,
                tenantIds: []
            });
            return body;
        } catch (err) {
            throw err;
        }
    }

    async getDeviceTimeline(
        search,
        senseMachineId,
        fromDate,
        toDate,
        machineDnsName,
        eventsGroups,
        senseClientVersion,
        markedEventsOnly,
        dataTypes,
        pageSize,
        nextToken
    ){

        const timeline = await this.mdeClass.getDeviceTimeline(
            search, 
            senseMachineId, 
            fromDate, 
            toDate, 
            machineDnsName, 
            eventsGroups, 
            senseClientVersion, 
            markedEventsOnly, 
            dataTypes, 
            pageSize, 
            nextToken
        );
//senseMachineId, fromDate, toDate, machineDnsName="", eventsGroups=[], senseClientVersion="", markedEventsOnly, pageSize=200, ){

        return timeline;
    }

    async getRawDeviceTimeline(
        search,
        senseMachineId,
        fromDate,
        toDate,
        machineDnsName,
        eventsGroups,
        senseClientVersion,
        markedEventsOnly,
        dataTypes,
        pageSize=900,
        requestId
    ){
        __log(`[defender.js] called getRawDeviceTimeline`);
        const progress=(p, total, message)=>{
            broadcastToMCP({
            type: "progress",
            requestId: requestId,
            progress: p,
            total,
            message
            })
        }

        try {
            const timeline = await this.mdeClass.getRawDeviceTimeline(
                search, 
                senseMachineId, 
                fromDate, 
                toDate, 
                machineDnsName, 
                eventsGroups, 
                senseClientVersion, 
                markedEventsOnly, 
                dataTypes, 
                pageSize,
                requestId
            );
            return timeline;

        } catch(err){
            log(err);
            return {success: false, status: "error", body: err?.body || err?.message || String(err)};
        }
    } 

    async markDeviceTimelineEvent(senseMachineId, actionTimestamp, actionType, alertId=null, isMarked = false, reportId){

        const status = await this.mdeClass.markEvent(senseMachineId, actionTimestamp, actionType, alertId, isMarked, reportId);

        return status;
    }

    async getMDEStory(alertId){

        let alertStory = BASE_URL + ENDPOINTS.MDE_ALERT_STORY.replace("{alertId}", alertId);
        
        const res = await this.httpClient.get(alertStory);
        return res;  
    }

    async getAlertInfoById(alertId){
        
        const source = determineSource(alertId);
        switch(source){
            case "MDO":
                // Call MDO-specific analysis functions or return relevant information
                return await this.mdoClass.getMDOAlertInfo(alertId);
            case "MDE":
                return await this.mdeClass.getAlertInfoById(alertId);
            case "MTP":
                return await this.mcasClass.getAlertInfoById(alertId);
            case "MDI":
                return await this.mdiClass.getAlertInfoById(alertId);
//                return await this.getMDEStory(alertId);
                // Add more cases for other sources as needed
            case "AAD":
                return await this.aadClass.getAlertInfoById(alertId);
            default:
                return {
                    success: false, 
                    body: `Alert ID ${alertId} does not match known patterns and is categorized as unknown.`};
        }
    }

    async getDeviceInventories(filter = [], lookingBackInDays=30){

        const res = await this.mdeClass.getDeviceInventoryByCategory(filter, lookingBackInDays);
        return res;
    }

    async getSoftwareInventoryByDeviceId(deviceId, pageIndex=1, pageSize=30){
        const res = await this.mdeClass.getDeviceSoftwareInventory(deviceId, pageIndex, pageSize);
        return res;
    }

    async getUsers(select=[], filter="", top=10, skipToken=""){

        const res = await this.msGraph.searchUsers(select, filter, top, skipToken);
        return res;
    }

    async getGroups(select=[], filter="", top=10, skipToken=""){
        const res = await this.msGraph.searchGroups(select, filter, top, skipToken);
        return res;
    }

    async getUserAuthenticationMethods(userId){
        const res = await this.msGraph.getUserAuthenticationMethods(userId);
        return res;
    }

    async searchMDIdentities(SearchText="", pageSize = 20, filter){

        const res = await this.mdiClass.searchMDIdentity(SearchText, pageSize, filter);
        return res;
    }

    async searchMDIdentityByRadiusUserId(radiusUserId){

        const res = await this.mdiClass.searchMDIdentityByRadiusUserId(radiusUserId);
        return res;
    }

    async getADSvcAccounts(displayName="", filter, skip=0, pageSize=20) {

        const {body: serviceAccounts} = await this.mdiClass.getActiveDirectoryServiceAccounts(displayName, filter, skip, pageSize);

        return serviceAccounts;

    }

    async listLocalAIAgents(searchText, groupBy, pageSize, nextToken){

        const {body: localAgents} = await this.mdeClass.listLocalAIAgents(searchText, groupBy, pageSize, nextToken);

        return localAgents;
    }

    async getLocalAIAgentInfo(agentId){

        const {body: agentInfo} = await this.mdeClass.getLocalAgentInfo(agentId);

        return agentInfo;
    }

}



/* if (typeof process.send != 'function'){
    const data = await readJson('./session/defender.json');
    const defender = new Defender(data)
    const incidents = await defender.getIncidents(3);
} */
