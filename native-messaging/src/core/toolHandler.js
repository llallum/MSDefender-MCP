import { __log, saveToJson } from "../utils/utils.js";
import {getDefender, setInMemoryHeaders} from "../server/child.js";
import {broadcastToMCP} from "../utils/pipeServer.js"
//import { nativeMessages } from "../utils/browserMessages.js";


let SOURCE = "toolHandler.js";

export const CHILD_MESSAGE_HANDLER = {
    "ping": async (args) => {
        __log(`[toolHandler.js] Received a message: ${args.type}`);
        return { source: SOURCE, type: "pong", data: Date.now()} ;
    },
    "session_data": async(args) => {
        __log(`[toolHandler.js] Received a message: ${args.type}`);
        if (args.data){
            setInMemoryHeaders(args.data);
            await saveToJson('defender.json', args.data);
            return {source: SOURCE, type: "session_data", data: "Headers set in memory"};
        }
        return {source: SOURCE, type: "session_data", data: "Null headers"};
    },

    "get_defender_incidents": async (args) => {
        __log(`[toolHandler.js] Called a function: ${JSON.stringify(args)}`);
        const defender = await getDefender();
        const incidents = await defender.getIncidents(
            args.lookBackInDays || 1,
            args.severity || [],
            args.pageIndex || 1,
            args.fromDate || "",
            args.toDate || "",
            args.pageSize || 30,
            args.machineIds || [],
            args.url || "",
            args.ipAddress || "",
            args.sha256 || "",
            );
        return {
            source: SOURCE, 
            type: "incidents_result", 
            msg: `total number of incidents ${Array.isArray(incidents) ? incidents.length : 0}`, 
            data: incidents};
    },
    "get_defender_incident_by_id": async (args) => {
        const defender = await getDefender();
        const result = await defender.getIncidentById(args.incidentId);
        return {
            source: SOURCE, 
    //        type: "incident_by_id_result", 
            msg: `incident details for id ${args.incidentId}`, 
            data: result?.body ?? null};
    },
    "update_defender_incident_status": async (args) => {
        const defender = await getDefender();
        const update_status = await defender.updateIncidentStatus(
            args.assignedTo,
            args.incidentIds, 
            args.severity,
            args.status,
            args.classification,
            args.determination,
            args.resolvingComment
        );
        return {
            source: SOURCE, 
    //        type: "updated_incident_status_result",
            msg: `updated status for incident`,
            data: update_status
        }
    },

    "set_defender_incident_comment": async (args) => {
        const defender = await getDefender();
        const incidentComment = await defender.updateIncidentComment(args.incidentIds, args.comment);
        return {
            source: SOURCE,
    //        type: "updated_incident_comment",
            msg: `Feedback comments for incident/s ${args.incidentIds}`,
            data: incidentComment
        }
    }
    ,
    "get_defender_incident_audit_logs": async (args) => {
        const defender = await getDefender();
        const auditLogs = await defender.getIncidentAuditHistory(args.incidentId, args.pageSize || 100);
        return {
            source: SOURCE, 
    //        type: "audit_logs_result", 
            msg: `audit logs for incident id ${args.incidentId}`, 
            data: auditLogs};
    },
    "get_defender_associated_alerts_count": async (args) => {
        const defender = await getDefender();
        const count = await defender.getAssociatedAlertsCount(args.incidentIds, args.lookBackInDays, args.status);

        return {
            source: SOURCE, 
    //        type: "associated_alerts_count_result",
            msg: `the total count of alerts in incident ID ${args.incidentIds}`,
            data: count
        }
    },
    "get_defender_associated_alerts": async (args) => {
        const defender = await getDefender();
        const associatedAlerts = await defender.getAssociatedAlerts(args.incidentId, args.lookBackInDays || 1, args.pageNumber || 1, args.pageSize || 100);
        return {
            source: SOURCE, 
    //        type: "associated_alerts_result", 
            msg: `associated alerts for incident id ${args.incidentId}`, 
            data: associatedAlerts};
    },
    "set_defender_alert_comment": async(args) => {
        const defender = await getDefender();
        const alertComments = await defender.updateAlertComment(args.alertId, args.comment);
        return {
            source: SOURCE,
    //        type: "updated_alert_comment_result",
            msg: `updated alert comments for the alert ID ${args.alertId}`,
            data: alertComments
        }
    },
    "link_alert_to_incident": async(args) => {
        const defender = await getDefender();
        const linkResult = await defender.linkAlertToIncident(args.alertIds, args.incidentId, args.comment, args.linkReason);
        return {
            source: SOURCE,
    //        type: "link_alert_to_incident_result",
            msg: `link alert/s ${args.alertIds} to incident ID ${args.incidentId}`,
            data: linkResult
        }
    },
    "get_defender_hunting_query_schemas": async () => {
        const defender = await getDefender();
        const schemas = await defender.getHuntingQuerySchema();

        return {
            source: SOURCE,
    //        type: "hunting_query_schemas_result",
            msg: `hunting query schemas for the available tables and their status`,
            data: schemas
        };
    },
    "get_defender_table_documentation": async(args) => {
        const defender = await getDefender();
        const tableInfo = await defender.getTableDocumentation(args.tableName);

        return {
            source: SOURCE,
    //        type: "table_documentation_result",
            msg: `table documentation for ${args.tableName}`,
            data: tableInfo
        };

    },
    "run_defender_hunting_query": async (args) => {
        const defender = await getDefender();
        const queryResults = await defender.runHuntingQuery(args.query, args.startTime, args.endTime, args.maxRecordCount || 10);
        return {
            source: SOURCE, 
    //        type: "hunting_query_results", 
            msg: `results for hunting query`, 
            data: queryResults};
    },

    "get_azure_datalake_workspaces": async (args)=> {
        const defender = await getDefender();
        const databases = await defender.getAzureDataLakeWorkspaces();

        return {
            source: SOURCE,
            msg: 'list of databases for Azure DataLake Exploration',
            data: databases
        }
    },
    "get_azure_datalake_db_entities": async (args)=> {
        const defender = await getDefender();
        const dbEntities = await defender.getAzureDatalakeDatabaseEntities();

        return {
            source: SOURCE,
            msg: 'details of the databases, including the tables available in each workspaces',
            data: dbEntities
        }
    },
    "run_azure_datalake_hunting_query": async (args) => {
        const defender = await getDefender();
        const queryResults = await defender.runHuntingQueryAzureDataLake( args.workspace, args.query, args.startTime, args.endTime);
        return {
            source: SOURCE, 
     //       type: "hunting_query_azure_datalake_results", 
            msg: `results for hunting query in azure datalake`, 
            data: queryResults};
    },
    "get_defender_alert_info": async (args) => {
        const defender = await getDefender();
        let analysisResults = null;
        try {
            analysisResults = await defender.getAlertInfoById(args.alertId);
        } catch (err){
            analysisResults = err;
        }
        
        return {
            source: SOURCE, 
    //        type: "analyze_alert_result", 
            msg: `analysis results for alert id ${args.alertId}`, 
            data: analysisResults};
    },
    "get_device_info_by_senseMachineId": async (args) => {
        const defender = await getDefender();
        const deviceInfo = await defender.getDeviceInfoBySenseMachineId(args.senseMachineId);
        return {
            source: SOURCE, 
    //        type: "device_info_result", 
            msg: `device info for machine id ${args.senseMachineId}`, 
            data: deviceInfo};
    },
    "get_associated_devices_by_incident_id" : async (args) => {
        __log(`[toolHandler.js] called get_associated_devices_by_incident_id`)
        const defender = await getDefender();
        const {body} = await defender.getAssociatedDevicesByIncidentId(args.incidentId, args.pageIndex, args.pageSize);
        var deviceList = [];
        if (body?.length > 0) {
            deviceList = (await Promise.all(
                body.map(async(x) => {
                    const {SenseMachineId} = x;
                    try {
                         return await defender.getDeviceInfoBySenseMachineId(SenseMachineId);
                    } catch {
                        return null;
                    }

                })
            )).filter(item=> item != null);
        }
        //console.log(deviceList);
        return {
            source: SOURCE, 
        //    type: "associated_devices_result",
            msg: `device info for the list of devices associated with ${args.incidentId}`,
            data: deviceList
        }
    },
    "search_device_timeline" : async(args) => {
        const defender = await getDefender();

        const progress=(p, total, message)=>{
            broadcastToMCP({
                type: "progress",
                requestId: args.requestId, 
                progress: p,
                total,
                message          
                })
            }

        progress(0, 100, "Initializing timeline request...");
        await new Promise(r => setTimeout(r, 1000));

        progress(25, 100, "Sending request to Defender API...");
        await new Promise(r => setTimeout(r, 1000));

        progress(50, 100, "Waiting for Defender response...");
        await new Promise(r => setTimeout(r, 1000));

        progress(60, 100, "Waiting for Defender response...");
        await new Promise(r => setTimeout(r, 2000));        
        progress(70, 100, "Waiting for Defender response...");
        await new Promise(r => setTimeout(r, 1000));            
        const timeline = await defender.getDeviceTimeline(
            args.search,
            args.senseMachineId, 
            args.fromDate, 
            args.toDate, 
            args.machineDnsName, 
            args.eventsGroups, 
            args.senseClientVersion, 
            args.markedEventsOnly, 
            args.dataTypes, 
            args.pageSize,
            args.nextToken
        );

        progress(100, 100, "completed");

        return {
            source: SOURCE,
        //    type: "raw_device_timeline_result",
            msg: `Raw device timeline from the device ${args.senseMachineId} within ${args.fromDate} and ${args.toDate}`,
            data: timeline
        }
    },

    "download_raw_device_timeline" : async(args) => {
        const defender = await getDefender();
        const timeline = await defender.getRawDeviceTimeline(
            args.search,
            args.senseMachineId, 
            args.fromDate, 
            args.toDate, 
            args.machineDnsName, 
            args.eventsGroups, 
            args.senseClientVersion, 
            args.markedEventsOnly, 
            args.dataTypes,
        //    args.reportIdForScrolling, 
            args.pageSize,
            args.requestId
        );
        return {
            source: SOURCE,
            //type: "chunked_device_timeline_result",
            msg: `Chunked device timeline from the device ${args.senseMachineId} within ${args.fromDate} and ${args.toDate}`,
            data: timeline
        }
    },

    "init_duckdb": async(args) => {
        __log(`[toolHandler.js] called init_duckdb`);
        const defender = await getDefender();
        __log(`[toolHandler.js] Initializing duckdb`);
        const duckDB = await defender.mdeClass.duckDBInit();
        
        return {
            source: SOURCE,
            msg: `DuckDB initialized : ${duckDB ? 'Success' : 'Failed'}`,
            data: duckDB
        }
    },

    "create_duckdb_table": async(args) => {
        const defender = await getDefender();
        __log(`[toolHandler.js] create_duckdb_table called.`);
        const result = await defender.mdeClass.createTableFromLogs(args.senseMachineId, args.dedup);

        return {
            source: SOURCE,
            msg: `DuckDB created a table '${args.senseMachineId}'`,
            data: result
        }
    },
    
    "get_raw_table_summary": async(args) => {
        const defender = await getDefender();
        const result = await defender.mdeClass.getRawTableSummary(args.senseMachineId);

        return {
            source: SOURCE,
            msg: `DuckDB summary of the table '${args.senseMachineId}'`,
            data: result
        }
    },

    "run_sql_query": async(args)=> {
        const defender = await getDefender();
        const result = await defender.mdeClass.runSqlQuery(args.sql);

        return {
            source: SOURCE,
            msg: `DuckDB sql query result`,
            data: result
        }
    },

    "mark_device_timeline_event": async(args) => {

        const defender = await getDefender();
        const markStatus = await defender.markDeviceTimelineEvent(
            args.senseMachineId, 
            args.actionTimestamp, 
            args.actionType, 
            args.alertId, 
            args.isMarked, 
            args.reportId);

        return {
            source: SOURCE,
     //       type: "mark_event_status_result",
            msg: `${args.isMarked ? "Marked" : "Unmarked"} the event with reportId ${args.reportId} and actionType ${args.actionType} from device ${args.senseMachineId}.`,
            data: markStatus
        }
    },

    "get_device_inventory_by_category" : async(args) => {

        const defender = await getDefender();
        const deviceInventories = await defender.getDeviceInventories(args.filter, args.lookingBackInDays);

        return {
            source: SOURCE,
    //        type: "devices_inventory_result",
            msg: `device inventories based on the categories for the past ${args.lookingBackInDays} days`,
            data: deviceInventories
        }
    },
    "get_device_software_inventory" : async(args) => {

        const defender = await getDefender();
        const softwareInventories = await defender.getSoftwareInventoryByDeviceId(args.senseMachineId, args.pageIndex, args.pageSize);
        return {
            source: SOURCE,
    //        type: "software_inventory_result",
            msg: `software inventories for device ID ${args.senseMachineId}`,
            data: softwareInventories
        }
    },
    "get_device_missing_kbs" : async(args) => {
        const defender = await getDefender();
        const missingKbs = await defender.mdeClass.getDeviceMissingKBs(args.senseMachineId, args.pageIndex, args.pageSize);
        return {
            source: SOURCE,
    //        type: "device_missing_kbs_result",
            msg: `missing KBs for device ID ${args.senseMachineId}`,
            data: missingKbs
        }
    },
    "get_device_response_permissions" : async(args) => {
        const defender = await getDefender();
        const responsePermissions = await defender.mdeClass.getResponsePermissions(args.senseMachineId, args.tenantIds);
        return {
            source: SOURCE,
    //        type: "device_response_permissions_result",
            msg: `response permissions for device ID ${args.senseMachineId}`,
            data: responsePermissions
        }
    },

    "run_av_scan": async(args) => {
        const defender = await getDefender();
        const scan = await defender.mdeClass.runAVScan(
            args.senseMachineId, 
            args.osPlatform, 
            args.senseClientVersion, 
            args.quickScan, 
            args.comment
        );
        //senseMachineId, osPlatform, senseClientVersion, quickScan=true, comment
        return {
            source: SOURCE,
            msg: `AV scanning request to device ${args.senseMachineId}`,
            data: scan
        }
    },
    "get_action_response_status": async(args)=> {
        const defender = await getDefender();
        const status = await defender.mdeClass.getActionCenterStatus(args.senseMachineId, args.tenantIds);
 
        return {
            source: SOURCE,
            msg: `Response actions status on device ${args.senseMachineId}`,
            data: status
        }
    },

    "submit_email_to_analysis": async(args) => {
        const defender = await getDefender();
        const mailStatus = await defender.mdoClass.reportEmailViaNetworkMessageId(args.networkMessageId, args.recipient, args.category, args.reason, args.confidenceLevel, args.submitter, args.tenantId);
        
        return {
            source: SOURCE,
            msg: `email submission status for the email with NetworkMessageId ${args.networkMessageId}`,
            data: mailStatus
        }
    },

    "msgraph_get_user_group" : async(args) => {
        const defender = await getDefender();
        const result  = await defender.msGraph.getUserGroups(args.userId, args.select);
        return {
            source: SOURCE,
            msg: `list of groups where user ${args.userId} is currently belong`,
            data: result
        };

    },
    "msgraph_get_user_ca_policies": async(args) => {
        const defender = await getDefender();

        const result = await defender.msGraph.getUserConditionalAccessPolicies(args.userId);

        return {
            source: SOURCE,
            msg: `list of conditional access policies for the user ${args.userId}`,
            data: result
        }
    },

    "msgraph_get_users" : async(args) => {
        const defender = await getDefender();
        const {body} = await defender.getUsers(args.select, args.filter, args.top, args.skipToken);

        let skipToken = null;
        try {
            let nextLink = body["@odata.nextLink"];
            if (nextLink) {
                const url = new URL(nextLink);
                skipToken = url.searchParams.get("$skiptoken");
            }
        } catch(e) {
            throw e;
        }

        return {
            source: SOURCE,
     //       type: "msgraph_users_result",
            msg: `msgraph users search result`,
            data: {
                users: body.value,
                skipToken: skipToken
            }
        }
    },
    "msgraph_get_groups" : async(args) => {
        const defender = await getDefender();
        const {body} = await defender.getGroups(args.select, args.filter, args.top, args.skipToken);
        let skipToken = null;
        try {
            if (body["@odata.nextLink"]) {
                const url = new URL(body["@odata.nextLink"]);
                skipToken = url.searchParams.get("$skiptoken");
            }
        } catch(e){}

        return {
            source: SOURCE,
     //       type: "msgraph_groups_result",
            msg: `msgraph groups search result`,
            data: {
                groups: body.value,
                skipToken: skipToken
            }
        }        
    },
    "msgraph_get_user_authentication_methods": async(args) => {

        const defender = await getDefender();
        const authMethods = await defender.getUserAuthenticationMethods(args.userId);
        return {
            source: SOURCE,
       //     type: "user_authentication_methods_result",
            msg: `authentication methods for user ID ${args.userId}`,
            data: authMethods
        }
    },
    "get_threat_analytics": async(args) => {
        const defender = await getDefender();
        const threatAnalytics = await defender.getThreatAnalytics(args.search, args.category, args.tags, args.createdOn, args.lastUpdatedOn);
        return {
            source: SOURCE,
     //       type: "threat_analytics_result",
            msg: `threat analytics data`,
            data: threatAnalytics
        }
    },
    "get_threat_analytics_report_by_id" : async(args) => {
        const defender = await getDefender();
        const report = await defender.getThreatAnalyticsById(args.reportId);
        const overview = await defender.getThreatAnalyticsOverviewById(args.reportId);
        return {
            source: SOURCE,
    //        type: "threat_analytics_report_result",
            msg: `threat analytics report details for report ID ${args.reportId}`,
            data: {
                report: report,
                overview: overview
            }
        }
    },
    "search_mdi_identities": async(args) => {
        const defender = await getDefender();
        const results = await defender.searchMDIdentities(args.searchText, args.pageSize, args.filter);
        return {
            source: SOURCE,
   //         type: "mdi_identity_search_result",
            msg: `results for MDI identity search with search text ${args.searchText}`,
            data: results
        }
    },
    "search_mdi_identity_by_radius_user_id": async(args) => {
        const defender = await getDefender();
        const results = await defender.searchMDIdentityByRadiusUserId(args.radiusUserId);
        return {
            source: SOURCE,
    //        type: "mdi_identity_radius_search_result",
            msg: `results for MDI identity search by radius user id ${args.radiusUserId}`,
            data: results
        }
    },
    "get_mdi_service_accounts_list" : async(args) => {
        const defender = await getDefender();
        const results = await defender.getADSvcAccounts(args.displayName, args.filter, args.skip, args.pageSize);

        return {
            source: SOURCE,
//type: "mdi_service_accounts_result",
            msg: `results for MDI Active Directory service accounts`,
            data: results,
        }
    },
    "get_url_overview_information" : async (args) => {
        const defender = await getDefender();
        const results = await defender.getURLOverviewInformation(args.urlDomain);
        return {
            source: SOURCE,
     //       type: "url_overview_result",
            msg: `overview information for URL/domain ${args.urlDomain}`,
            data: results
        }
    },
    "sec4ai_get_local_agents" : async(args) => {

        const defender = await getDefender();
        const results = await defender.listLocalAIAgents(args.searchText, args.groupBy, args.pageSize, args.nextToken);

        return {
            source: SOURCE,
     //       type: "local_agent_lists_result",
            msg: `List of installed local agents`,
            data: results
        }
    },
    "sec4ai_get_local_agent_info" : async(args) => {

        const defender = await getDefender();
        const results = await defender.getLocalAIAgentInfo(args.agentId);

        return {
            source: SOURCE,
    //        type: "local_agent_info_result",
            msg: `Local AI Agent with ID ${args.agentId}`,
            data: results
        }

    }
}
