import { sendMessage, encodeMessage , getMessage} from "../utils/nativeMessaging.js";
const {  dirname,  filename, url } = import.meta;
const { exit, argv: args } = process;
import path from 'path';
import { fork } from "child_process";
import net from "net";

let PIPE_NAME = '\\\\.\\pipe\\defender-mcp';
let SOURCE = "test.js";
export const runChildProcess = () => {
  const child = fork(path.resolve('./src/server/child.js'), [], {
    cwd: process.cwd(),
    detached: false,
    stdio: ['pipe', 'inherit', 'pipe', 'ipc'], // important: need 'ipc' for fork
    windowsHide: false,
  });

  child.on('message', (msg)=> {
    sendMessage(encodeMessage(msg));

  })
  child.on('error', msg=>{
    sendMessage(encodeMessage(msg));
  });
  
  return child;
};

let subprocess = runChildProcess();

/* const query = `IdentityInfo
                | where AccountUpn contains "<YOUR_UPN>"
                | sort by Timestamp desc
                | limit 1`;

subprocess.send({type: "run_hunting_query", query:"AlertInfo\n| where IncidentId == <INCIDENT_ID>\n| project Timestamp, AlertId, Title, Severity, Category, AttackTechniques, ServiceSource, DetectionSource",startTime:"2026-06-04T00:00:00Z",endTime:"2026-06-08T23:59:59Z","maxRecordCount":20});
 */
//subprocess.send({source:SOURCE, type: "get_device_info_by_senseMachineId", senseMachineId: "<SENSE_MACHINE_ID>"});

//subprocess.send({source:SOURCE, type: "analyze_alert", alertId: "<ALERT_ID>"});

//runHuntingQuery(query, startTime , endTime, maxRecordCount=1)

async function connectToPipe(retries= 5, delayMs= 1000){
  for (let i=0; i < retries; i++){
    try{
      const socket = await new Promise((resolve, reject)=> {
        const s = net.connect(PIPE_NAME);
        s.once('connect', ()=> resolve(s));
        s.once('error', ()=>reject(s));  
      })
      return socket;
    }catch(_){
      if (i < retries - 1) await new Promise(r => setTimeout(r, delayMs));
    }
  }
  return null;
}


/* await subprocess.send({
  type: "run_hunting_query_azure_datalake",
  query: "EntraGroups | summarize count()"
})
 */
/* await subprocess.send(
  {
  type: "update_incident_status",
 "incidentIds": [
    <INCIDENT_ID>
  ],
  "assignedTo": "<ANALYST_EMAIL>",
  "status": "InProgress",
  "severity": "Informational"
}
) */

/* await subprocess.send({
  type: "get_device_inventory",
}) */

/* await subprocess.send({
  type: "get_software_inventory_by_device_id",
  deviceId: "<SENSE_MACHINE_ID>"
}) */

/* await subprocess.send({
  type: "get_devices_by_incident_id",
  incidentId: <INCIDENT_ID>,
  pageSize: 50
}) */

/* await subprocess.send({
  type: "get_device_info_by_id_or_hostname",
  senseMachineId: "<SENSE_MACHINE_ID>"
}) */

/* await subprocess.send({
  type: "analyze_alert",
  alertId: "<ALERT_ID>"
});
 */
/* await subprocess.send({
  type: "mark_device_timeline_event",
  senseMachineId: "<SENSE_MACHINE_ID>",
  actionTimestamp: "<ISO_TIMESTAMP>",
  actionType: "OneCyber",
  isMarked: true,
  reportId: <REPORT_ID>
}) */


/* await subprocess.send({
  type: "update_incident_status",
  "assignedTo": "<ANALYST_EMAIL>",
  "incidentIds": [
    <INCIDENT_ID>
  ],
  "status": "Resolved",
  "classification": "TruePositive",
  "determination": "Phishing",
  "severity": "Informational",
  "resolvingComment": "<RESOLVING_COMMENT>"
});
 */

/* await subprocess.send({
  type: "get_incident_by_id",
  incidentId: <INCIDENT_ID>
}) */

/* await subprocess.send({
  type: "get_incidents",
  "lookBackInDays": 1,
  "pageSize": 10,
  "pageIndex": 1
}) */

//let pipe = await connectToPipe(5);
/* await subprocess.send({
  source: SOURCE,
  type: "msgraph_get_users",
  "select": [],
  "filter": "",
  top : 5,
  skipToken: ""
}) */

/* await subprocess.send({
  source: SOURCE,
  type: "msgraph_get_groups",
  "select": [],
  "filter": "",
  top : 5,
  skipToken: ""
}) */

/* await subprocess.send({
  type: "search_mdi_identities", searchText: "<SEARCH_TEXT>"
}) */

/* await subprocess.send({
  type: "msgraph_get_user_authentication_methods",
  userId: "<AAD_USER_ID>"
}) */


/* await subprocess.send({
  type: "search_mdi_identity_by_radius_user_id",
  radiusUserId: "<RADIUS_USER_ID>"
})
 */


/* await subprocess.send({
  type: "get_threat_analytics_report_by_id",
  reportId: "<REPORT_ID>"
})
 */

/* await subprocess.send({
  type: "get_threat_analytics"
}) */

//(args.senseMachineId, args.fromDate, args.toDate, args.machineDnsName, args.eventsGroup, args.senseClientVersion, args.markedEventsOnly, args.dataTypes, args.pageSize);


/* await subprocess.send({
  source: SOURCE,
  type: "get_chunked_device_timeline", 
  senseMachineId: "<SENSE_MACHINE_ID>",
  machineDnsName: "<MACHINE_DNS_NAME>",
  senseClientVersion: "<SENSE_CLIENT_VERSION>",
  eventsGroups: [],
  dataTypes: [],
  pageSize: 999,
  fromDate: "<FROM_DATE_ISO>",
  toDate: "<TO_DATE_ISO>",
  }
)
 */
/* await subprocess.send({
  source: SOURCE,
  type: "get_chunked_device_timeline", 
  senseMachineId: "<SENSE_MACHINE_ID>",
  machineDnsName: "<MACHINE_DNS_NAME>",
  senseClientVersion: "<SENSE_CLIENT_VERSION>",
  eventsGroups: [],
  dataTypes: [],
  pageSize: 999,
  fromDate: "<FROM_DATE_ISO>",
  toDate: "<TO_DATE_ISO>",
  }
) */

console.log("Message sent to child process.");
/*
            args.senseMachineId, 
            args.actionTimestamp, 
            args.actionType, 
            args.alertId, 
            args.isMarked, 
            args.reportId
*/

/*  await subprocess.send({
  source: SOURCE, 
  type: "download_raw_device_timeline",
  "senseMachineId": "<SENSE_MACHINE_ID>",
            "machineDnsName": "<MACHINE_DNS_NAME>",
            "senseClientVersion": "<SENSE_CLIENT_VERSION>",
            "fromDate": "<FROM_DATE_ISO>",
            "toDate": "<TO_DATE_ISO>",
            "dataTypes": [
                "Events"
            ],
            "eventsGroups": [
                "UserActivity"
            ],
            "search": "",
            "pageSize": 999
  });  */

  await subprocess.send({
    type: 'init_duckdb'
  });

    await new Promise(resolve => setTimeout(resolve, 10000));

  await subprocess.send({
    type: 'create_duckdb_table',
    senseMachineId: '<SENSE_MACHINE_ID>'
  });

  await new Promise(resolve => setTimeout(resolve, 10000));

    await subprocess.send({
    type: 'raw_table_summary',
    senseMachineId: '<SENSE_MACHINE_ID>'
  });

  await new Promise(resolve => setTimeout(resolve, 10000));

  await subprocess.send({
    type: 'run_sql_query',
    sql: 'SHOW ALL TABLES;'
  });  


/* await subprocess.send({
  type: "link_alert_to_incident",
  alertIds: ["<ALERT_ID>"],
  incidentId: <INCIDENT_ID>,
  comment: "test",
  linkReason: ["SameCampaign"]
}) */

/* await subprocess.send({
  type: "update_alert_comment",
  alertId: "<ALERT_ID>",
  comment: "test"
}) */

/* await subprocess.send({
  type: "get_defender_associated_alerts_count",
  incidentId: <INCIDENT_ID>
}) */

/* await subprocess.send({
  type: "get_audit_logs",
  incidentId: <INCIDENT_ID>
}) */

/* await subprocess.send({
  type: "update_incident_comment",
  incidentIds: [<INCIDENT_ID>],
  comment: "test"
})
 */
/* await subprocess.send({
  type: "get_url_overview_information",
  urlDomain: "www.google.com"
}) */

  //{"senseMachineId":"<SENSE_MACHINE_ID>","fromDate":"<FROM_DATE_ISO>","toDate":"<TO_DATE_ISO>","pageSize":50,"senseClientVersion":"<SENSE_CLIENT_VERSION>"
//process.exit(0)


/* await subprocess.send({
  type: "get_mdi_service_accounts_list",
  filter: {},
  displayName: ""
}) */


/* await subprocess.send({
  type: "list_local_agents",
    nextToken: "<NEXT_TOKEN>"
}) */


/* await subprocess.send({
  type: "get_local_agent_info",
  agentId: "<AGENT_ID>"
}) */

/* await subprocess.send({
  type: "get_hunting_query_schemas"
}) */

/* await subprocess.send({
  type: "get_table_documentation",
  tableName: "AIAgentsInfo"
}) */


  
// AAD Alert
/* await subprocess.send({
  type: "analyze_alert",
  alertId: "<ALERT_ID>"
}); */
