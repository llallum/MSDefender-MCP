import { sendMessage, encodeMessage , getMessage} from "../utils/nativeMessaging.js";
const {  dirname,  filename, url } = import.meta;
const { exit, argv: args } = process;
import path from 'path';
import { fork } from "child_process";
import net from "net";
import { EmailSubmissionCategory, EmailSubmissionConfidenceLevel, EmailSubmissionReason } from "../core/sources/enums.js";

let PIPE_NAME = '\\\\.\\pipe\\defender-mcp';
let SOURCE = "test.js";
export const runChildProcess = () => {
  const child = fork(path.resolve('./native-messaging/src/server/child.js'), [], {
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
                | where AccountUpn contains \"exampleuser\"
                | sort by Timestamp desc
                | limit 1`;


//subprocess.send({source:SOURCE, type: "get_device_info_by_senseMachineId", senseMachineId: "0000000000000000000000000000000000000a"});

//subprocess.send({source:SOURCE, type: "analyze_alert", alertId: "fa00000000-0000-0000-0000-000000000000"});

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
    99999
  ],
  "assignedTo": "analyst@example.com",
  "status": "InProgress",
  "severity": "Informational"
}
) */

/* await subprocess.send({
  type: "get_device_inventory",
}) */

/* await subprocess.send({
  type: "get_software_inventory_by_device_id",
  deviceId: "0000000000000000000000000000000000000b"
}) */

/* await subprocess.send({
  type: "get_devices_by_incident_id",
  incidentId: 99999,
  pageSize: 50
}) */

/* await subprocess.send({
  type: "get_device_info_by_id_or_hostname",
  senseMachineId: "0000000000000000000000000000000000000b"
}) */

/* await subprocess.send({
  type: "analyze_alert",
  alertId: "fa00000000-0000-0000-0000-000000000001"
});
 */
/* await subprocess.send({
  type: "mark_device_timeline_event",
  senseMachineId: "0000000000000000000000000000000000000b",
  actionTimestamp: "2026-06-02T10:21:37.4187938Z",
  actionType: "OneCyber",
  isMarked: true,
  reportId: 51429
}) */


/* await subprocess.send({
  type: "update_incident_status",
  "assignedTo": "analyst@example.com",
  "incidentIds": [
    99999
  ],
  "status": "Resolved",
  "classification": "TruePositive",
  "determination": "Phishing",
  "severity": "Informational",
  "resolvingComment": "Confirmed True Positive — Phishing. Example resolving comment describing remediation and impact assessment."
});
 */

/* await subprocess.send({
  type: "get_incident_by_id",
  incidentId: 99999
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
  type: "get_defender_alert_info", alertId: "fa00000000-0000-0000-0000-000000000000"
}) */

/* await subprocess.send({
  type: "msgraph_get_user_authentication_methods",
  userId: "00000000-0000-0000-0000-000000000000"
}) */


/* await subprocess.send({
  type: "search_mdi_identity_by_radius_user_id",
  radiusUserId: "User_00000000-0000-0000-0000-000000000000_00000000-0000-0000-0000-000000000000"
})
 */


/* await subprocess.send({
  type: "get_threat_analytics_report_by_id",
  reportId: "00000000-0000-0000-0000-000000000000"
})
 */

/* await subprocess.send({
  type: "get_threat_analytics"
}) */

//(args.senseMachineId, args.fromDate, args.toDate, args.machineDnsName, args.eventsGroup, args.senseClientVersion, args.markedEventsOnly, args.dataTypes, args.pageSize);


/* await subprocess.send({
  source: SOURCE,
  type: "get_chunked_device_timeline", 
  senseMachineId: "0000000000000000000000000000000000000b",
  machineDnsName: "example-host-01",
  senseClientVersion: "",
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
  senseMachineId: "0000000000000000000000000000000000000c",
  machineDnsName: "example-host-02",
  senseClientVersion: "",
  eventsGroups: [],
  dataTypes: [],
  pageSize: 999,
  fromDate: "2026-03-01T08:17:16.2322164Z",
  toDate: "2026-06-12T08:17:16.2322164Z",
  }
) */

console.log("Message sent to child process.");

/* subprocess.send({type: "run_defender_hunting_query", query:"EntraIdSignInEvents\n| where Timestamp > ago(7d)\n| where AccountUpn == \"testuser@example.com\"\n| project Timestamp, ActionType, AccountUpn, IPAddress, Country, DeviceName, Application, ErrorCode, ConditionalAccessStatus, UserAgent\n| order by Timestamp desc",startTime:"2026-06-04T00:00:00Z",endTime:"2026-06-08T23:59:59Z","maxRecordCount":20}); */

// subprocess.send({type: "get_device_missing_kbs",  "deviceId": "0000000000000000000000000000000000000d"})

/* subprocess.send({
  type: "submit_email_to_analysis",
  networkMessageId: "00000000-0000-0000-0000-000000000000",
 // recipient: ['user1@example.com', 'user2@example.com'],
  category: EmailSubmissionCategory.Phishing,
  reason: EmailSubmissionReason.FN,
  confidenceLevel: EmailSubmissionConfidenceLevel.High,
  tenantId: "00000000-0000-0000-0000-000000000000"
}) */

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
  "senseMachineId": "0000000000000000000000000000000000000e",
            "machineDnsName": "example-host-03.example.com",
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

/*   await subprocess.send({
    type: 'init_duckdb'
  });

    await new Promise(resolve => setTimeout(resolve, 10000));

  await subprocess.send({
    type: 'create_duckdb_table',
    senseMachineId: '0000000000000000000000000000000000000f'
  });

  await new Promise(resolve => setTimeout(resolve, 10000));

    await subprocess.send({
    type: 'raw_table_summary',
    senseMachineId: '0000000000000000000000000000000000000f'
  });

  await new Promise(resolve => setTimeout(resolve, 10000));

  await subprocess.send({
    type: 'run_sql_query',
    sql: 'SHOW ALL TABLES;'
  });   */


/* await subprocess.send({
  type: "link_alert_to_incident",
  alertIds: ["fa00000000-0000-0000-0000-000000000002"],
  incidentId: 99999,
  comment: "test",
  linkReason: ["SameCampaign"]
}) */

/* await subprocess.send({
  type: "update_alert_comment",
  alertId: "fa00000000-0000-0000-0000-000000000002",
  comment: "test"
}) */

/* await subprocess.send({
  type: "get_defender_associated_alerts_count",
  incidentId: 99999
}) */

/* await subprocess.send({
  type: "get_audit_logs",
  incidentId: 99999
}) */

/* await subprocess.send({
  type: "update_incident_comment",
  incidentIds: [99999],
  comment: "test"
})
 */
/* await subprocess.send({
  type: "get_url_overview_information",
  urlDomain: "www.google.com"
}) */

  //{"senseMachineId":"0000000000000000000000000000000000000f","fromDate":"2026-05-26T21:00:00.000Z","toDate":"2026-05-27T03:02:00.000Z","pageSize":50,"senseClientVersion":"10.8821.26200.8390"
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
  agentId: "00000000-0000-0000-0000-000000000000"
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
  alertId: "da00000000-0000-0000-0000-000000000000_1"
}); */
