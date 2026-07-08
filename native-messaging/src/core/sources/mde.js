import { BASE_URL as BASE_URL, ENDPOINTS} from "../endpoints.js";
import { timelineStorage } from "../../utils/timelineStorage.js";
import { log , __log} from "../../utils/utils.js";
import { json } from "node:stream/consumers";
import { broadcastToMCP } from "../../utils/pipeServer.js";
import { DuckDatabase } from "../../utils/duckdbClient.js";

export class MDEClass {

    constructor(httpClient){
        this.httpClient = httpClient;
        this.timelineStorage = timelineStorage;
        this.duckDB = null;
    }

    async appendTimeline(args){

        await this.timelineStorage.appendEvents(args.Items);
    }

    async getDeviceTimeline(
        search,
        senseMachineId, 
        fromDate, 
        toDate, 
        machineDnsName="", 
        eventsGroups=[], 
        senseClientVersion="", 
        markedEventsOnly, 
        dataTypes=[], 
        pageSize=200,
       // reportIdForScrolling = null,
        nextToken = "",){

        const device_timeline = BASE_URL + ENDPOINTS.MDE_DEVICE_TIMELINE.replace("{senseMachineId}", senseMachineId);

        const params = {
            generateIdentityEvents: true,
            includeIdentityEvents: true,
            supportMdiOnlyEvents: true,
            doNotUseCache: false,
            fromDate: fromDate,
            toDate: toDate,
            pageSize: pageSize,
        }

    //    if (reportIdForScrolling) params.ReportIdForScrolling = reportIdForScrolling;

        if (nextToken !== "") {
            const searchParams = new URLSearchParams(nextToken);
            params.fromDate = searchParams.get("fromDate");
            params.toDate = searchParams.get("toDate");
            if (searchParams.get("ReportIdForScrolling")) {
                params.ReportIdForScrolling = searchParams.get("ReportIdForScrolling");
                params.IsScrollingForward = true; 
            }
            //True if you want to scroll forward, false for backward. For the initial request, this value doesn't matter. You can set it to either true or false.
        }

        

        if (search) params.search = search;
        if (machineDnsName) params.machineDnsName = machineDnsName;
        if (senseClientVersion) params.senseClientVersion = senseClientVersion;
        if (markedEventsOnly) params.markedEventsOnly = markedEventsOnly;

        const search_params = new URLSearchParams(params);        
        if (eventsGroups.length > 0) eventsGroups.forEach(x => search_params.append("eventsGroups", x));
        if (dataTypes.length > 0) dataTypes.forEach(x => search_params.append("dataTypes", x));

        const url = new URL(device_timeline);
        url.search = search_params.toString();

 //       console.log(url.search);

        try {
            __log(`Requesting device timeline from MDE API for machine ${senseMachineId} from ${fromDate} to ${toDate}...`);
            const res = await this.httpClient.get(url);
            return res;
        } catch(err){
//            throw err;
//            console.log(err);
            return {success: err.ok, status: err.status , body: err?.statusText || String(err)};
        }

    }

    async getRawDeviceTimeline(
        search="", 
        senseMachineId, 
        fromDate, 
        toDate,  
        machineDnsName, 
        eventsGroups=[], 
        senseClientVersion="", 
        markedEventsOnly=false, 
        dataTypes=[],
      //  reportIdForScrolling = null,
        pageSize=999,
        requestId
    ){

        __log('[mde.js] called getRawDeviceTimeline');


        const progress=(p, total, message)=>{
            __log(message);
            broadcastToMCP({
                type: "progress",
                requestId: requestId, 
                progress: p,
                total,
                message          
                })
            }

        let startingDate = new Date(fromDate);
        
        let endingDate = new Date(toDate);
        endingDate.setUTCHours(23,59,59,999);

        let tempDay = new Date(startingDate);
        let nextToken = "";

        startingDate.setUTCHours(0,0,0,0);
        tempDay.setUTCDate(startingDate.getUTCDate());
        tempDay.setUTCHours(23,59,59,999);

        const startTime = Date.now();
        const MAX_EXPECTED_MS = 60000;
        let pageCount = 0;
        let noResult = 0;
        do {

            const elapsedTime = Date.now() - startTime;
            const pct = Math.min(99, Math.floor((elapsedTime / MAX_EXPECTED_MS)* 100))

            progress(pct, 100, `Fetching timeline page ${pageCount + 1}...`);

            __log(startingDate.toISOString(), tempDay.toISOString());
            __log(nextToken);

            const result = await this.getDeviceTimeline(
                search,
                senseMachineId,
                startingDate.toISOString(),
                tempDay.toISOString(),
                machineDnsName,
                eventsGroups,
                senseClientVersion,
                markedEventsOnly,
                dataTypes,
                pageSize,
            //    reportIdForScrolling,
                nextToken
            );
            pageCount++;
    //        console.log(Object.keys(result));
    //        console.log(`Retrieved ${result.Items.length} events from MDE for machine ${senseMachineId} from ${startingDate.toISOString()} to ${tempDay.toISOString()}.`);
        // console.log(result);
            if (!result?.success) {
                __log(`getDeviceTimeline error: ${result.body}`);
                return result;
    //            return {success: result.ok, status: result.status , message: result?.statusText || String(result)};
    //            break;
            };
            let {body} = result;
            if (Array.isArray(body.Items)) {
        //       console.log(`${fromDate.toISOString()} - ${toDate.toISOString()} : Retrieve ${result.Items.length}`);
                if (body.Items.length == 0 ) {
                    __log("No events in this date range, moving to the next date range.");
                    noResult++;
                    if (noResult > 15){
                        __log(`No results for ${noResult} consecutive queries. Stopping the query`);
                        break;
                    }
                } else {
                    try {
                        __log("Appending events to storage...");
                        await timelineStorage.appendEvents(senseMachineId,body.Items, fromDate, toDate);
                    } catch(err){
                        __log(`Error appending events to storage: ${err?.body || String(err)}`);
                    }     
                }

                
        /*         if (result.Items.length == 0 || results.Items.length < pageSize) {
                    console.log("No more events in this date range, moving to the next date range.");
                    startingDate.setDate(startingDate.getDate() + 1);
                    break;
                } */
            } else break;

            nextToken = body?.Next;
            
            if (!nextToken) {
                __log("No more data to retrieve, ending timeline retrieval.");
                break;
            }
    //        console.log(nextToken);

            const searchParams = new URLSearchParams(nextToken);
            let _fromDate = searchParams.get("fromDate");
            let _toDate = searchParams.get("toDate");
            let reportId = searchParams.get("ReportIdForScrolling");

            startingDate = new Date(_fromDate);
    //        toDate = searchParams.get("toDate");
            tempDay = new Date(_toDate);
            if (startingDate > endingDate) {
                __log("Reached the end of the requested date range, ending timeline retrieval.");
                break;
            }
            
    //        await new Promise(resolve => setTimeout(resolve, 3000));

    /*         await new Promise(resolve =>
                setTimeout(resolve, Math.floor(Math.random() * 2000) + 5000)
            ); */

        } while (startingDate < endingDate) 

        progress(100, 100, `Finished retrieving the raw logs`);

        __log("Finished retrieving timeline data.");
        return {success: true, status: 0, body: "Finished retrieving timeline data."};
    }

    async duckDBInit(){
        if (!this.duckDB){
            __log(`DuckDB initialized`);
            try {
                this.duckDB = new DuckDatabase();
                await this.duckDB.init();
                await this.duckDB.connect();

            }
            catch(err){
                this.duckDB = null;
                __log("Failed to initialize DuckDB");
                return false;
            }
        }
        return true;
    }

    async createTableFromLogs(senseMachineId, dedup=false){
        if (await this.duckDBInit()){
            try {
                const table = await this.duckDB.createTableFromSource(senseMachineId, dedup);

                return table;
            } catch(err){
                __log(err)
                return err;
            }
        }
    }

    async getRawTableSummary(senseMachineId){
        if (await this.duckDBInit()){
            try {
                const summary = await this.duckDB.describeTable(senseMachineId);
                return summary;
            } catch (err){
                __log(err);
                return err;
            }
        }
    }

    async runSqlQuery(sql){
        if (await this.duckDBInit()){
            try {
                const result = await this.duckDB.runsql(sql);
                return result;
            } catch(err){
                __log(err);
                return err;
            }
        }
    }

    async markEvent(senseMachineId, actionTimestamp, actionType, alertId="", isMarked = false, reportId){

        const mark_event = BASE_URL + ENDPOINTS.MDE_DEVICE_MARK_EVENT.replace("{senseMachineId}", senseMachineId);

        if (alertId === "") alertId = null; 

        const json_body = {
            actionTimeIsoString: actionTimestamp,
            actionType: actionType,
            alertId: alertId,
            isMarked: isMarked,
            machineId : senseMachineId,
            reportId : reportId
        }

        const searchParam = new URLSearchParams({machineId: senseMachineId}).toString();

        const url = new URL(mark_event);
        url.search = searchParam;

        try {
            const res = await this.httpClient.post(url, json_body);
            return res;
        } catch(err){
            return {success: false, status: err.status , body: err?.statusText || String(err)};
        }
    }

    async getDeviceSoftwareInventory(senseMachineId, pageIndex=1, pageSize=100){
        //Product Code CPE
        //available = isNormalized eq true
        //notAvailable = isNormalized eq false
        //Weaknesses
        //has weaknesses - weaknesses gt 0 and productNeverMatched eq false
        //no known weaknesses - weaknesses eq 0 and productNeverMatched eq false
        //not available - productNeverMatched eq true
        //Threats
        //exploit is available - ThreatInfo/HasExploit eq true
        //exploit is verified - ThreatInfo/IsExploitVerified eq true
        //this exploit is part of an exploit kit - ThreatInfo/IsInExploitKit eq true

        const endpoint = BASE_URL + ENDPOINTS.DEVICE_SOFTWARE_INVENTORY.replace("{senseMachineId}", senseMachineId);

        const params = {
            pageIndex: pageIndex,
            pageSize: pageSize,
            $orderBy: "isNormalized desc",
            filter: `(ProductCategory ne 'Component')`
        };
        try {
            let { body } = await this.httpClient.get(endpoint, params, {"api-version": "1.0"});
            return body;   
        } catch(err){
            return {success: false, status: err.status , body: err?.statusText || String(err)};
        }

    }

    async getDeviceInventoryByCategory(filter=[], lookingBackInDays = 30){

        const endpoint = BASE_URL + ENDPOINTS.DEVICE_TOTAL_INVENTORY;

        const deviceCategories = ["NetworkDevice", "Endpoint", "IoT", "Medical", "OT", "BMS", "Unknown"];
        const exclusionStates = "included";
        //const lookingBackInDays = 30;
        const params = {
            deviceCategories : filter,
            exclusionStates : exclusionStates,
            lookingBackInDays : lookingBackInDays
        }
        try{
            const {body} = await this.httpClient.get(endpoint, params);
            return body;
        } catch(err){
            return {success: false, status: err.status , body: err?.statusText || String(err)};
        }
    }

    async getDeviceMissingKBs(senseMachineId, pageIndex=1, pageSize=100){
     
        const endpoint = BASE_URL + ENDPOINTS.DEVICE_MISSING_KBS.replace("{senseMachineId}", senseMachineId);

        const params = {
            pageIndex: pageIndex,
            pageSize: pageSize,
            $orderby: 'productFixId desc'
        };

 //       const url = `${endpoint}?pageIndex=${params.pageIndex}&pageSize=${params.pageSize}&$orderby=${encodeFilter(params.$orderby)}`;

        try{
            
            const {body} = await this.httpClient.get(endpoint, params, {"api-version": "1.0"});
            return body;
        } catch(err){
            return {success: false, status: err.status , body: err?.statusText || String(err)};
        }
    }

    async getResponsePermissions(senseMachineId, tenantIds=''){

        const endpoint = BASE_URL + ENDPOINTS.DEVICE_RESPONSE_PERMISSIONS;

        const params = {
            machineId: senseMachineId,
            tenantIds: tenantIds
        }

        try{
            const {body} = await this.httpClient.get(endpoint, params);
            return body;
        } catch(err){
            return {success: false, status: err.status , body: err?.statusText || String(err)};
        }

    }

        //Params = {ScanType: "Quick"}
        //Type = "ScanRequest"
    async runAVScan(senseMachineId, osPlatform, senseClientVersion, quickScan=true, comment) {

        const endpoint = BASE_URL + ENDPOINTS.DEVICE_RESPONSE_ACTIONS;

        const perm = await this.getResponsePermissions(senseMachineId);

        const scanPerm = perm?.Permissions?.find(p=> p.Type === 'ScanRequest');

        if (!scanPerm || scanPerm.Result !== 0){
            return {
               success: false,
               body: `Current user is not permitted to run AV scans on device ${senseMachineId}`,
            }
        }

        const json_body = {
            MachineId: senseMachineId,
            RequestorComment: comment,
            OsPlatform: osPlatform,
            SenseClientVersion: senseClientVersion,
            //ExternalId : externalId,
            //RequestSource: requestSource,
            Params: {
                ScanType: quickScan ? 'Quick' : 'Full'
            },
            Type: 'ScanRequest',
            //tenantIds
        }
        try {
            const {body} = await this.httpClient.post(endpoint, json_body);
            return body;
        } catch(err){
            return {success: false, status: err.status , body: err?.statusText || String(err)};
        }
    }

    async getActionCenterStatus(senseMachineId, tenantIds=''){

        const request_page = BASE_URL + ENDPOINTS.DEVICE_RESPONSE_STATUS;

        const params = {
            machineId : senseMachineId,
            tenantIds : tenantIds
        }
        try {
            const result = await this.httpClient.get(request_page, params);
            return result;

        } catch(err){
            return {success: false, status: err.status , body: err?.statusText || String(err)};
        } 
    }

    /*
    filter : {
            name: {op: "In", value: [...names]},
            deviceType: {op : "In", value: [...deviceTypes]},
            accountDomain: {op: "In", value: [...accountDomains]},
            deviceName: {op: "Contains" || "StartsWith" || "EndsWith" || "Equals", value: ""},
            accountName: {op: "Contains" || "StartsWith" || "EndsWith" || "Equals", value: ""},
            version: {op: "In", value: [versions]},
            osPlatform: {op: "In", value: [platforms]},
            lastUpdatedDateTime: {start: startTime, end: endTime}
        }
    */
    async listLocalAIAgents(searchText = "", groupBy="", pageSize = 25, nextToken = ""){

        const ai_endpoint = BASE_URL + ENDPOINTS.LIST_LOCAL_AGENTS;

        const json_body = {
            searchText: searchText,
            filters: [], 
            pageSize: pageSize,
//            sort: {key: "name", direction: "Ascending"}
        };

        //sort : {key: "name", direction: "Ascending"}
/*         if (Array.isArray(filter) && filter.length > 0) {
            
        } */
        if (groupBy) json_body.groupBy = groupBy;

        if (nextToken !== "") json_body.continuationToken = nextToken;

        const res = await this.httpClient.post(ai_endpoint, json_body);
        
        return res;
    }  

    async getLocalAgentInfo(agentId){

        const agent_info = BASE_URL + ENDPOINTS.LOCAL_AGENT_DETAILS;
        const info = await this.httpClient.post(agent_info, {id: agentId});

        return info;
    }

    async getAlertStory(alertId) {
        let alertStory = BASE_URL + ENDPOINTS.MDE_ALERT_STORY.replace("{alertId}", alertId);
        
        try {
            const result = await this.httpClient.get(alertStory);
            return result;
        } catch(err){
            return {success: false, status: err.status , body: err?.statusText || String(err)};
        }
    }
}

export async function analyzeMDEAlert(alertId, httpClient){

/*     let pattern = /^(da[\w\d]{8}(-[\w\d]{4}){3}-[\w\d]{10,}(_\d*)?|da[\w\d]{18}_-?\w\d{4,})$/;
    if (alertId.match(pattern) == null)
        throw new Error("Invalid alert ID format"); */

    const mdeInstance = new MDEClass(httpClient);
    
    return await mdeInstance.getAlertStory(alertId);

}