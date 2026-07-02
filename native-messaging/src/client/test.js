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
                | where AccountUpn contains \"llallum\"
                | sort by Timestamp desc
                | limit 1`;

subprocess.send({type: "run_hunting_query", query:"AlertInfo\n| where IncidentId == 98020\n| project Timestamp, AlertId, Title, Severity, Category, AttackTechniques, ServiceSource, DetectionSource",startTime:"2026-06-04T00:00:00Z",endTime:"2026-06-08T23:59:59Z","maxRecordCount":20});
 */
//subprocess.send({source:SOURCE, type: "get_device_info_by_senseMachineId", senseMachineId: "6dc3069652b7456051aa21e6f178e6082e0baf03"});

//subprocess.send({source:SOURCE, type: "analyze_alert", alertId: "fa309d5b78-df0f-ee65-ce79-08dea5fc68db"});

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
    97515
  ],
  "assignedTo": "llallum.victoria@ph.verizon.com",
  "status": "InProgress",
  "severity": "Informational"
}
) */

/* await subprocess.send({
  type: "get_device_inventory",
}) */

/* await subprocess.send({
  type: "get_software_inventory_by_device_id",
  deviceId: "3059cf0727709059bf9c9fa5e30309adc269fe33"
}) */

/* await subprocess.send({
  type: "get_devices_by_incident_id",
  incidentId: 97647,
  pageSize: 50
}) */

/* await subprocess.send({
  type: "get_device_info_by_id_or_hostname",
  senseMachineId: "3059cf0727709059bf9c9fa5e30309adc269fe33"
}) */

/* await subprocess.send({
  type: "analyze_alert",
  alertId: "fad237ba40-919b-b8ff-9000-08deb74c6c90"
});
 */
/* await subprocess.send({
  type: "mark_device_timeline_event",
  senseMachineId: "3059cf0727709059bf9c9fa5e30309adc269fe33",
  actionTimestamp: "2026-06-02T10:21:37.4187938Z",
  actionType: "OneCyber",
  isMarked: true,
  reportId: 51429
}) */


/* await subprocess.send({
  type: "update_incident_status",
  "assignedTo": "llallum.victoria@ph.verizon.com",
  "incidentIds": [
    97513
  ],
  "status": "Resolved",
  "classification": "TruePositive",
  "determination": "Phishing",
  "severity": "Informational",
  "resolvingComment": "Confirmed True Positive — Phishing. Two phishing emails (ittrend-mlmg@innovation.co.jp via shanon-services.com relay, IP 18.182.251.219) were delivered to n.tsukamoto64 and k.maruyama48 on 2026-05-21 and quarantined by ZAP (FingerPrintMatch) before any user interaction. Both messages fully remediated. No endpoint compromise, no credential theft, no successful click-through. A third user (t.nishi27) clicked SafeLinks-wrapped URLs from the same campaign — SafeLinks blocked click-through in both instances. Safe to close."
});
 */

/* await subprocess.send({
  type: "get_incident_by_id",
  incidentId: 98062
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
  type: "search_mdi_identities", searchText: "llallum"
}) */

/* await subprocess.send({
  type: "msgraph_get_user_authentication_methods",
  userId: "e4a62ec1-5081-455d-aabe-f077eab3fda6"
}) */


/* await subprocess.send({
  type: "search_mdi_identity_by_radius_user_id",
  radiusUserId: "User_bcf2d2a2-2dee-419b-971f-21e5170fbf84_c54bca7f-96de-4471-afed-4d50312c68af"
})
 */


/* await subprocess.send({
  type: "get_threat_analytics_report_by_id",
  reportId: "9c9d47df-6a8e-412f-90a7-df7590207049"
})
 */

/* await subprocess.send({
  type: "get_threat_analytics"
}) */

//(args.senseMachineId, args.fromDate, args.toDate, args.machineDnsName, args.eventsGroup, args.senseClientVersion, args.markedEventsOnly, args.dataTypes, args.pageSize);


/* await subprocess.send({
  source: SOURCE,
  type: "get_chunked_device_timeline", 
  senseMachineId: "3059cf0727709059bf9c9fa5e30309adc269fe33", //"606bd521c39713cb53847df7d28c2b196c56f8b0",
  machineDnsName: "kgc02-yuwadee",//"kdcl-gaogongde",
  senseClientVersion: "", //"10.8821.26200.8390",
  eventsGroups: [],
  dataTypes: [],
  pageSize: 999,
  fromDate: "2026-03-01T08:17:16.2322164Z",
  toDate: "2026-03-02T08:17:16.2322164Z",
  }
)
 */
/* await subprocess.send({
  source: SOURCE,
  type: "get_chunked_device_timeline", 
  senseMachineId: "5a6da42d9037abd6b88ada8dc42c1836c09b8da9", //"606bd521c39713cb53847df7d28c2b196c56f8b0",
  machineDnsName: "hts01-jwan",//"kdcl-gaogongde",
  senseClientVersion: "", //"10.8821.26200.8390",
  eventsGroups: [],
  dataTypes: [],
  pageSize: 999,
  fromDate: "2026-03-01T08:17:16.2322164Z",
  toDate: "2026-06-12T08:17:16.2322164Z",
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
  "senseMachineId": "5fe419c38ac9a74bf13a81125752a942df1d2e69",
            "machineDnsName": "mnplpdm02v.uswater.com",
            "senseClientVersion": "10.8821.17763.8755",
            "fromDate": "2026-06-17T13:55:00.000Z",
            "toDate": "2026-06-17T14:05:00.000Z",
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
    senseMachineId: '606bd521c39713cb53847df7d28c2b196c56f8b0'
  });

  await new Promise(resolve => setTimeout(resolve, 10000));

    await subprocess.send({
    type: 'raw_table_summary',
    senseMachineId: '606bd521c39713cb53847df7d28c2b196c56f8b0'
  });

  await new Promise(resolve => setTimeout(resolve, 10000));

  await subprocess.send({
    type: 'run_sql_query',
    sql: 'SHOW ALL TABLES;'
  });  


/* await subprocess.send({
  type: "link_alert_to_incident",
  alertIds: ["fa716070f6-6036-9659-9800-08dec13dba8a"],
  incidentId: 97923,
  comment: "test",
  linkReason: ["SameCampaign"]
}) */

/* await subprocess.send({
  type: "update_alert_comment",
  alertId: "fa716070f6-6036-9659-9800-08dec13dba8a",
  comment: "test"
}) */

/* await subprocess.send({
  type: "get_defender_associated_alerts_count",
  incidentId: 97923
}) */

/* await subprocess.send({
  type: "get_audit_logs",
  incidentId: 97923
}) */

/* await subprocess.send({
  type: "update_incident_comment",
  incidentIds: [97923],
  comment: "test"
})
 */
/* await subprocess.send({
  type: "get_url_overview_information",
  urlDomain: "www.google.com"
}) */

  //{"senseMachineId":"606bd521c39713cb53847df7d28c2b196c56f8b0","fromDate":"2026-05-26T21:00:00.000Z","toDate":"2026-05-27T03:02:00.000Z","pageSize":50,"senseClientVersion":"10.8821.26200.8390"
//process.exit(0)


/* await subprocess.send({
  type: "get_mdi_service_accounts_list",
  filter: {},
  displayName: ""
}) */


/* await subprocess.send({
  type: "list_local_agents",
    nextToken: "eyJzIjpbIkNoYXRHUFQgRGVza3RvcCJdLCJpZCI6IjA0ZjZjMmNmLTJmYmQtNGIxOS1iMDM1LTQ3OWI3MmNmYThiMCIsInNrIjoiTmFtZSIsInNkIjoiYXNjIiwiZmgiOiJlNWVhM2NiZSIsInNoIjoiIn0="
}) */


/* await subprocess.send({
  type: "get_local_agent_info",
  agentId: "79d71b03-0eea-417e-ad13-29769bad172a"
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
  alertId: "da438c1356-7a1f-4042-8905-f6287392686e_1"
}); */
