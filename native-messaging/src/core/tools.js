export const TOOLS = [
    {
        name: "get_defender_incidents",
        description: "Get Microsoft Defender XDR incidents. It has the capability to search for incidents based on time range or number of days to look back, severities, machineIds, IP address, URL and hashes. It can also use pagination. The severities starts with Informational (32), Low(64), Medium(128) and High(256).",
        inputSchema: {
            type: "object",
            properties: {
                lookBackInDays: { type: "number", description: "The number of days to look back for incidents, default is 1"},
                severity: {type: "array", description: "The severities of alerts to be displayed. The severities are 32 - Informational, 64 - Low, 128 - Medium and 256 - High respectively.", default: [256,128,64]},
                pageIndex: {type: "number",  description: "The current page index that is viewable", default: 1},
                fromDate: {type: "string", description: "Starting date of search. If fromDate is used, toDate parameter is required too. Example: 2026-05-07T02:54:44.106Z", default: ""},
                toDate: {type: "string", description: "Ending date of the search", default: ""},
                pageSize: {type: "number", description: "The size of data that is viewable" , default: 30},
                machineIds: {type: "array", description: "The list of machine IDs that are in 40 hexadecimal characters", default: []},
                url: {type: "string", description: "The URL to filter the incidents with URL related alerts. It can be a full URL or just the domain. For example, both www.contoso.com and contoso.com are acceptable.", default: ""},
                ipAddress: {type: "string", description: "The IP address to filter the incidents with IP address related alerts. It can be in IPv4 or IPv6 format. ", default: ""},
                sha256: {type: "string", description: "The SHA256 hash value to filter the incidents with file hash related alerts. It is in 64 hexadecimal characters.", default: ""}
            }

            /*
            args.lookBackInDays || 1,
            args.pageIndex || 1,
            args.fromDate || "",
            args.toDate || "",
            args.pageSize || 30,
            args.machineIds || [],
            args.url || "",
            args.ipAddress || "",
            args.sha256 || "", 
            */
        },
     //   childMessageType: "get_incidents",
        // childResultType: "incidents_result",
        buildPayload: (args) => ({
            lookBackInDays: args.lookBackInDays || 1,
            severity: args.severity || [],
            pageIndex: args.pageIndex || 1,
            fromDate: args.fromDate || "",
            toDate: args.toDate || "",
            pageSize: args.pageSize || 30,
            machineIds: args.machineIds || [],
            url: args.url || "",
            ipAddress: args.ipAddress || "",
            sha256: args.sha256 || ""
        })
    }, 
    {
        name: "get_defender_incident_by_id",
        description: "Get Microsoft Defender Incident details by ID",
        inputSchema: {
            type: "object",
            properties: {
                incidentId: {type: "number", description: "The ID of the incident to retrieve details for"}
            }
        },
   //     childMessageType: "get_incident_by_id",
        // childResultType: "incident_by_id_result",
        buildPayload: (args) => ({
            incidentId: args.incidentId
        })
    },
    {
        name: "get_defender_incident_audit_logs",
        description: "Get Microsoft Defender Incident Audit Logs for a give incident ID",
        inputSchema: {
            type: "object",
            properties: {
                incidentId: {type: "number", description: "The ID of the incident to retrieve audit logs for"},
                pageSize: {type: "number", description: "Number of audit log entiries to be displayed per page, default is 100", default: 100}
            }
        },
     //   childMessageType: "get_audit_logs",
        // childResultType: "audit_logs_result",
        buildPayload: (args) => ({
            incidentId: args.incidentId,
            pageSize: args.pageSize || 100
        })
    }, 
/*     {
        name: "get_defender_associated_alerts_count",
        description: "Get the number of alerts associated in an Incident in Microsoft Defender with the given incident ID",
        inputSchema: {
            type: "object",
            properties: {
                incidentIds: {type: "array", description: "The list of the incident IDs to be retrieved of the count of alerts"},
                lookBackInDays: {type: "number", description: "The number of days to be searched", default: 7},
                status: {type: "array", description: "The filter for the search and it can be New, InProgress or Resolved", default: ["New", "InProgress"]}
            }
        }, 
     //   childMessageType: "get_defender_associated_alerts_count",
        // childResultType: "associated_alerts_cnt_result",
        buildPayload: (args) => ({
            incidentIds : args.incidentIds,
            lookBackInDays: args.lookBackInDays || 7,
            status: args.status || ["New", "InProgress"],
        })
    }, */
    {
        name: "get_defender_associated_alerts",
        description: "Get Microsoft Defender Incident Associated Alerts for a given incident ID",
        inputSchema: {
            type: "object",
            properties: {
                incidentId: {type: "number", description: "The ID of the incident to retrieve associated alerts for"},
                lookBackInDays: { type: "number", default: 1 },
                pageNumber: {type: "number", description: "The page number of results to retrieve, default is 1", default: 1},
                pageSize: {type: "number", description: "Number of associated alerts to be displayed per page, default is 100", default: 100},
            }
        },
    //    childMessageType: "get_associated_alerts",
        // childResultType: "associated_alerts_result",
        buildPayload: (args) => ({
            incidentId: args.incidentId,
            lookBackInDays: args.lookBackInDays || 1,
            pageNumber: args.pageNumber || 1,
            pageSize: args.pageSize || 100
        })
    }, 
    {
        name: "update_defender_incident_status",
        description: "Update Microsoft Defender Incident status for a given incident ID",
        inputSchema: {
            type: "object",
            properties: {
                assignedTo: {type: "string", description: "The email of the user to whom the incident will be assigned. It is an email address if it is currently assigned and blank if it is unassigned. To update the assignee, provide the email address of the new assignee. To unassign, provide an empty string."},
                incidentIds: {type: "array", description: "The list of the incident IDs to be updated of the status"},
                severity: {type: "string", description: "The severity to be set in the incident. It can be Low, Medium, High or Informational. The severity can be acquired from incident information. Severity value is required."},
                status: {type: "string", description: "The status to be set in the incident. It can be Active, New, InProgress, Resolved, Hidden. The status can be acquired from incident information. Status value is required."},
                classification: {type: "string", description: "The classification to be set in the incident. It can be NotSet, Unknown, FalsePositive, TruePositive or BenignPositive"},
                determination: {type: "string", description: "The determination to be set in the incident. It can be Apt, Malware, SecurityPersonnel, SecurityTesting, UnwantedSoftware, Other, MultiStagedAttack, CompromisedUser, Phishing, MaliciousUserActivity, Clean, InsufficientData, ConfirmedUserActivity or LineOfBusinessApplication"},
                resolvingComment: {type: "string", description: "The comment to be added when the incident is resolved. It is required when the status is being updated to Resolved"}
            }
        },
    //    childMessageType: "update_incident_status",
        // childResultType: "updated_incident_status_result",
        buildPayload: (args) => ({
            assignedTo: args.assignedTo || "",
            incidentIds: args.incidentIds,
            severity: args.severity,
            status: args.status || "Active",
            classification: args.classification,
            determination: args.determination,
            resolvingComment: args.resolvingComment || ""
        })

    },
    {
        name: "set_defender_alert_comment",
        description: "Set a comment in an alert ID in Microsoft Defender Alert",
        inputSchema: {
            type: "object",
            properties: {
                alertId: {type: "string", description: "The alert ID where the comment will be added"},
                comment: {type: "string", description: "The comment that will be added in the alerts comment section. Text comments only"}
            }
        },
    //    childMessageType: "update_alert_comment",
        // childResultType: "updated_alert_comment_result",
        buildPayload: (args) => ({
            alertId: args.alertId,
            comment: args.comment
        })
    }, 
    {
        name: "link_alert_to_incident",
        description: `Link an alert to an incident in Microsoft Defender by providing the alert ID/s and the target incident ID where it will be linked to. It also supports adding comment and reason for linking the alert to the incident. The linking reasons can be the following: 
            SameThreatSource
            SimilarTTPsOrBehavior
            SameActor
            SameCampaign
            SharedIndicators
            SameAsset
            NetworkProximity
            EventCasualSequence - Event sequence
            TemporalProximity  - If activity have similarity in timeframe
            LateralMovementPath 
        `,
        inputSchema: {
            type: "object",
            properties: {
                alertIds: {type: "array", description: "The list of alert IDs to be linked to the incident"},
                incidentId: {type: "number", description: "The ID of the incident where the alerts will be linked to"},
                comment: {type: "string", description: "The comment that will be added for linking the alert to the incident. Text comments only."},
                linkReason: {type: "string", description: "The reason for linking the alert to the incident. It can be SameThreatSource, SimilarTTPsOrBehavior, SameActor, SameCampaign, SharedIndicators, SameAsset, NetworkProximity, EventCasualSequence, TemporalProximity or LateralMovementPath"}
            }
        },
      //  childMessageType: "link_alert_to_incident",
        // childResultType: "link_alert_to_incident_result",
        buildPayload: (args) => ({
            alertIds: args.alertIds,
            incidentId: args.incidentId,
            comment: args.comment || "",
            linkReason: args.linkReason || "SameThreatSource"
        })
    },
    {
        name: "get_defender_hunting_query_schemas",
        description: "Get Table schemas available in Defender Advanced Hunting",
        inputSchema: {
            type: "object",
        },
    //    childMessageType: "get_hunting_query_schemas",
        // childResultType: "hunting_query_schemas_result",
        buildPayload: ()=>({})
    },
    {
        name: "get_defender_table_documentation",
        description: "Get the documentation of specific table in Defender. It contains examples queries, schema and etc.",
        inputSchema: {
            type: "object",
            properties: {
                tableName: {type: "string", desription: "Table name in Defender. Available tables can be found in get_defender_hunting_query_schemas"}
            },
        },
    //    childMessageType: "get_table_documentation",
        // childResultType: "table_documentation_result",
        buildPayload: (args)=> ({
            tableName: args.tableName
        }
        )
    },
    {
        name: "run_defender_hunting_query",
        description: "Using KQL to run a hunting query in Microsoft Defender",
        inputSchema: {
            type: "object",
            properties: {
                query: {type: "string", description: "The KQL query to be run in Microsoft Defender Hunting"},
                startTime: {type: "string", description: "The start time for the hunting query in ISO format, default is 7 days ago from current time"},
                endTime: {type: "string", description: "The end time for the hunting query in ISO format, default is current time"},
                maxRecordCount: {type: "number", description: "The maximum number of records to be returned from the hunting query, default is 10", default: 10}
            }
        },
    //    childMessageType: "run_hunting_query",
        // childResultType: "hunting_query_results",
        buildPayload: (args) => ({
            query: args.query,
            startTime: args.startTime,
            endTime: args.endTime,
            maxRecordCount: args.maxRecordCount || 10
        })
    }, 
    {
        name: "get_azure_datalake_workspaces",
        description: "This will retrieve the list of DataLake Workspaces (Databases) that can be used Azure DataLake Hunting",
        inputSchema: {
            type: "object"
        },
        buildPayload: () => ({})
    }, 
    {
        name: "get_azure_datalake_db_entities",
        description: "This wil retrieve the list of tables available for each database. The list of tables contains custom log sources from 3rd-party including the other Microsoft Sentinel logs.",
        inputSchema: {
            type: "object"
        },
        buildPayload: ()=> ({})
    },
    {
        name: "run_azure_datalake_hunting_query",
        description: `Using KQL to run a hunting query in Microsoft Defender with Azure Data Lake as data source. The tables and schema in Azure Data Lake is different from Microsoft Defender Advanced Hunting. `,
        inputSchema: {
            type: "object",
            properties: {
                workspace: {type: "array", description: `The workspace name where the KQL is being run. The workspace name is the combination of name and GUID concatenated with dash '-' except for the default database which only uses 'default' as database name and no GUID is needed. (eg. prd-a-uswest-ws-11059f44-58dd-4240-9986-20bfcca4d02e where name is prd-a-uswest-ws and GUID of 11059f44-58dd-4240-9986-20bfcca4d02e.)`, default:['default']},
                query: {type: "string", description: "The KQL query to be run in Microsoft Defender Hunting"},
                startTime: {type: "string", description: "The start time for the hunting query in ISO format, default is past 3 days ago from current time and using more than these might took a lot of time to response"},
                endTime: {type: "string", description: "The end time for the hunting query in ISO format, default is current time"}
            }
        },
   //     childMessageType: "run_hunting_query_azure_datalake",
        // childResultType: "hunting_query_azure_datalake_results",
        buildPayload: (args) => ({
            workspace: args.workspace,
            query: args.query,
            startTime: args.startTime,
            endTime: args.endTime
        })
    },
    {
        name: "get_defender_alert_info", 
        description: "Query detailed information about a specific alert by its ID. Returns full alert details including MITRE ATT&CK techniques and categories, investigation state, classification, determination, and full description. Use this tool when alert-level detail beyond what list/summary tools provide is needed.",
        inputSchema: {
            type: "object",
            properties: {
                alertId: {type: "string", description: "The ID of the alert to be analyzed"}
            }   
        },
    //    childMessageType: "analyze_alert",
        // childResultType: "analyze_alert_result",
        buildPayload: (args) => ({
            alertId: args.alertId
        })
    }, {
        name: "get_associated_devices_by_incident_id", 
        description: "Retrieve associated devices of an incident by incidentId.",
        inputSchema: {
            type: "object",
            properties: {
                incidentId: {type: "number", description: "The ID of the incident where the details will be retrieve"},
                pageIndex: {type: "number", description: "The current page index of the result", default: 1},
                pageSize: {type: "number", description: "The size of page to be retrieved of", default: 30}
            }
        },
    //    childMessageType: "get_devices_by_incident_id",
        // childResultType: "associated_devices_result",
        buildPayload: (args) => ({
            incidentId: args.incidentId,
            pageIndex: args.pageIndex || 1,
            pageSize: args.pageSize || 30
        })
    }, {
        name: "get_device_inventory_by_category",
        description: "Retrieve the total number of inventories by category.",
        inputSchema: {
            type: "object",
            properties: {
                filter: {type: "array", description: "The categories filter which is in array, it can be the following NetworkDevice, Endpoint, IoT, Medical, OT, BMS and Unknown", default: []},
                lookingBackInDays: {type: "number", description: "The number of days to look back for device inventory, default is 30", default: 30}
            }
        },
    //    childMessageType: "get_device_inventory",
        // childResultType: "devices_inventory_result",
        buildPayload: (args) => ({
            filter: args.filter || [],
            lookingBackInDays: args.lookingBackInDays || 30
        })
    }, 
    {
        name: "search_device_timeline",
        description: `Retrieves the raw device timeline of a device for the past 6 months. 
        This is an alternative to KQL as KQL only retrives data for the past 30 days for any device activities (hot storage).
        Using eventsGroups is important here as it might result to large BLOB of data and might overwhelm the LLM, so filtering is important. The time window should be narrow too but if large window time is required, it must uses the pagination. Date range must not be larger than 7 days when dates looking in data older than 30 days. It would take much time so it is needs progressToken.
        `,
        inputSchema: {
            type: "object",
            properties: {
                search : {type: "string", description: "Keyword for the search, it must be a one word that better suites for the investigation, such as process, IP address, etc.", default: ""},
                senseMachineId: {type: "string", description: "The sense machine ID of the device to be retrieved. It is 40 hexadecimal characters. If not 40 hexadecimal characters, which is can be retrieved from the device information."},
                fromDate: {type: "string", description: "Required starting date of search and uses an ISO format. Example: 2026-05-07T02:54:44.106Z"},
                toDate: {type: "string", description: "Required ending date of search and uses an ISO format. Example: 2026-05-07T02:54:44.106Z"}, 
                machineDnsName: {type: "string", description: "DNS host name of the device. It can be retrieved from the device info"},
                eventsGroups: {type: "array", description: "Events filter. The events should be filtered to ensure that it not overwhelm the LLM. The event groups can be any of the following: ExploitGuard, AlertsRelatedEvents, AntiVirus, AppGuard, AppControl, Files, Firewall, Network, Processes, Registry, ResponseActions, ScheduledTask, SmartScreen, Other, UserActivity", default: []},
                senseClientVersion: {type: "string", description: "The senseClientversion of the device being investigated. Can be found in the device info", default: ""},
                markedEventsOnly: {type: "boolean", description: "The flag that will only results of only the marked events in the timeline. It may contain the alerts or the flagged events manually by the analyst", default: false},
                dataTypes: {type: "array", description: "It may contain Events or Techniques. The events is the raw events while the techniques contains summarize events including the description of an activity.", default: []},
                pageSize: {type: "number", description: "The size of data to be retrieved. Use 200 but if the query takes a lot of time to response, use lower number.", default: 200},
                reportIdForScrolling: {type: "number", description: "The report ID for scrolling in timeline retrieval.", default: null},
                nextToken: {type: "string", description: "The token for pagination. This is used for retrieving subsequent pages of results.", default: ""}
//                requestId: {type: "string", description: "requestId"}
            } //senseMachineId, fromDate, toDate, machineDnsName, eventsGroups, senseClientVersion, pageSize
        },
      //  childMessageType: "get_device_timeline",
        // childResultType: "raw_device_timeline_result",
        buildPayload: (args) => ({
            search: args.search || "",
            senseMachineId: args.senseMachineId,
            fromDate: args.fromDate,
            toDate: args.toDate,
            machineDnsName: args.machineDnsName || "",
            eventsGroups: args.eventsGroups || [],
            senseClientVersion: args.senseClientVersion || "",
            markedEventsOnly: args.markedEventsOnly || false,
            dataTypes: args.dataTypes || [],
            pageSize: args.pageSize || 50,
            reportIdForScrolling: args.reportIdForScrolling || null,
            nextToken: args.nextToken || "",
//            requestId: args.requestId
        })
    }, 
    {
        name: "download_raw_device_timeline",
        description: "This will download the raw device timeline and stores the raw json as parquet and uses the DuckDB as its engine for query.",
        inputSchema: {
            type: "object",
            properties: {
                search : {type: "string", description: "Keyword for the search, it must be a one word that better suites for the investigation, such as process, IP address, etc.", default: ""},
                senseMachineId: {type: "string", description: "The sense machine ID of the device to be retrieved. It is 40 hexadecimal characters. If not 40 hexadecimal characters, which is can be retrieved from the device information."},
                fromDate: {type: "string", description: "Required starting date of search and uses an ISO format. Example: 2026-05-07T02:54:44.106Z"},
                toDate: {type: "string", description: "Required ending date of search and uses an ISO format. Example: 2026-05-07T02:54:44.106Z"}, 
                machineDnsName: {type: "string", description: "DNS host name of the device. It can be retrieved from the device info"},
                eventsGroups: {type: "array", description: "Events filter. The events should be filtered to ensure that it not overwhelm the LLM. The event groups can be any of the following: ExploitGuard, AlertsRelatedEvents, AntiVirus, AppGuard, AppControl, Files, Firewall, Network, Processes, Registry, ResponseActions, ScheduledTask, SmartScreen, Other, UserActivity", default: []},
                senseClientVersion: {type: "string", description: "The senseClientversion of the device being investigated. Can be found in the device info", default: ""},
                markedEventsOnly: {type: "boolean", description: "The flag that will only results of only the marked events in the timeline. It may contain the alerts or the flagged events manually by the analyst", default: false},
                dataTypes: {type: "array", description: "It may contain Events or Techniques. The events is the raw events while the techniques contains summarize events including the description of an activity.", default: []},
                pageSize: {type: "number", description: "The size of data to be retrieved. Use 200 but if the query takes a lot of time to response, use lower number.", default: 200},
    //            reportIdForScrolling: {type: "number", description: "The report ID for scrolling in timeline retrieval.", default: null},
        //            nextToken: {type: "string", description: "The token for pagination. This is used for retrieving subsequent pages of results.", default: ""}               
            }
        },
   //     childMessageType: "download_raw_device_timeline",
        buildPayload: (args) => ({
            search: args.search || "",
            senseMachineId: args.senseMachineId,
            fromDate: args.fromDate,
            toDate: args.toDate,
            machineDnsName: args.machineDnsName || "",
            eventsGroups: args.eventsGroups || [],
            senseClientVersion: args.senseClientVersion || "",
            markedEventsOnly: args.markedEventsOnly || false,
            dataTypes: args.dataTypes || [],
            pageSize: args.pageSize || 50,
//            reportIdForScrolling: args.reportIdForScrolling || null,
//            nextToken: args.nextToken || "",
//            requestId: args.requestId
        })        
    }, 
    {
        name: "init_duckdb",
        description: `This initialize the instance of DuckDB and it is required first before able querying device timeline using SQL queries.`,
        inputSchema: {
            type: "object"
        },
   //     childMessageType: "init_duckdb",
        buildPayload: () => ({}),
    }, 
    {
        name: "create_duckdb_table",
        description: `This creates a table for the device timeline of a device. The table is named using the senseMachineId. The duckDb should be initialized first.`,
        inputSchema: {
            type: "object",
            properties: {
                senseMachineId: {type: "string", description: "The senseMachineId of the device. It is 40 hexadecimal characters, which will serves as the table name for the current device timeline logs"},
                dedup: {type: "boolean", description: "Enabling this will remove the duplicates", default: false}
            }
        },
   //     childMessageType: "create_duckdb_table",
        buildPayload: (args)=> ({
            senseMachineId: args.senseMachineId,
            dedup: args.dedup || false
        })
    },
    {
        name: "get_raw_table_summary",
        description: `This returns the summary metadata of the created table named under the senseMachineId. The duckDb should be initialized first.`,
        inputSchema: {
            type: "object",
            properties: {
                senseMachineId: {type: "string", description: "The senseMachineId of the device. It is 40 hexadecimal characters, which will serves as the table name for the current device timeline logs"}
            }
        },
     //   childMessageType: "raw_table_summary",
        buildPayload: (args)=> ({
            senseMachineId: args.senseMachineId
        })
    }, 
    {
        name: "run_sql_query",
        description: `This allows to execute an SQL query on the DuckDB instance. Initialize duckDB first.`,
        inputSchema: {
            type: "object",
            properties: {
                sql: {type: "string", description: "The SQL query compatible to DuckDB. Default shows all tables.", default: `SHOW ALL TABLES`}
            }
        },
  //      childMessageType: "run_sql_query",
        buildPayload: (args)=> ({
            sql: args.sql
        })
    },
    {
        name: "mark_device_timeline_event",
        description: `This allows to mark or unmark an event in device timeline especially if the event is noteworthy and related to a malicious activity.`,
        inputSchema: {
            type: "object",
            properties: {
                senseMachineId: {type: "string", description: "The sense machine ID of the device to be retrieved. It is 40 hexadecimal characters. If not 40 hexadecimal characters, which is can be retrieved from the device information."},
                actionTimestamp: {type: "string", description: "The specific timestamp of an event in device timeline in ISO string format"},
                actionType: {type: "string", description: "The actionType of an specific event that will be marked or unmarked"},
                alertId: {type: "string", description: "The alertId where the event will be link", default: ""},
                isMarked: {type: "boolean", description: "Flag whether the event will be marked or not", default: false},
                reportId: {type: "number", description: "The reportId number of the event that will be marked. This can be found in the event"}  
            },
        },
    //    childMessageType: "mark_device_timeline_event",
        // childResultType: "mark_event_status_result",
        buildPayload: (args) => ({
            senseMachineId: args.senseMachineId,
            actionTimestamp: args.actionTimestamp,
            actionType: args.actionType,
            alertId: args.alertId,
            isMarked: args.isMarked || false,
            reportId: args.reportId,
        })

    },
    {
        name: "set_defender_incident_comment",
        description: "Set an incident comment in Microsoft Defender for the given incident IDs",
        inputSchema: {
            type: "object",
            properties: {
                incidentIds: {type: "array", description: "The list of incident IDs that will be updated with comment. It can be an array of numbers or strings", default: []},
                comment: {type: "string", description: "The comment that will set to the alerts. Text or HTML are also allowed."}
            }
        },
   //     childMessageType: "update_incident_comment",
        // childResultType: "updated_incident_comment",
        buildPayload: (args) => ({
            incidentIds: args.incidentIds || [],
            comment: args.comment
        })
    },
    {
        name: "get_device_info_by_senseMachineId",
        description: "Retrieve device information in Microsoft Defender by providing senseMachineId. SenseMachineId is 40 hexadecimal characters.",
        inputSchema: {
            type: "object",
            properties: {
                senseMachineId: {
                    type: "string", 
                    description: `The sense machine ID of the device to be retrieved. It is 40 hexadecimal characters. `,
                    pattern: "^[a-fA-F0-9]{40}$"    
                },
                }
        },
     //   childMessageType: "get_device_info_by_id_or_hostname",
        // childResultType: "device_info_result",
        buildPayload: (args) => ({
            senseMachineId: args.senseMachineId || ""
        })
    }, 
    {
        name: "get_device_software_inventory",
        description: "Retrieve software inventory of a device by device ID.",
        inputSchema: {
            type: "object",
            properties: {
                senseMachineId: {type: "string", description: "The ID of the device where the software inventory details will be retrieved. It is 40 hexadecimal characters."},
                pageIndex: {type: "number", description: "The current page index of the result", default: 1},
                pageSize: {type: "number", description: "The size of page to be retrieved of", default: 100}
            }  
        },
   //     childMessageType: "get_software_inventory_by_device_id",
        // childResultType: "software_inventory_result",
        buildPayload: (args) => ({
            senseMachineId: args.senseMachineId,
            pageIndex: args.pageIndex || 1,
            pageSize: args.pageSize || 100
        })
    }, 
    {
        name: "get_device_missing_kbs", 
        description: "Retrieve missing KBs of a device by device ID.",
        inputSchema: {
            type: "object",
            properties: {
                senseMachineId: {type: "string", description: "The ID of the device where the missing KBs details will be retrieved. It is 40 hexadecimal characters."},
                pageIndex: {type: "number", description: "The current page index of the result", default: 1},
                pageSize: {type: "number", description: "The size of page to be retrieved of", default: 100}
            }
        },
   //     childMessageType: "get_missing_kbs_by_device_id", 
        // childResultType: "missing_kbs_result",
        buildPayload: (args) => ({
            senseMachineId: args.senseMachineId,
            pageIndex: args.pageIndex || 1,
            pageSize: args.pageSize || 100
        })
    },
    {   name: "get_device_response_permissions",
        description: "Retrieve the response permissions of a device by device ID.",
        inputSchema: {
            type: "object",
            properties: {
                senseMachineId: {type: "string", description: "The ID of the device where the response permissions will be retrieved. It is 40 hexadecimal characters."},
                tenantIds: {type: "string", description: "The IDs of the tenants for which to retrieve response permissions, separated by commas.", default: ''}
            },
        },
    //    childMessageType: "get_response_permissions_by_device_id",   
        // childResultType: "response_permissions_result",
        buildPayload: (args) => ({
            senseMachineId: args.senseMachineId,
            tenantIds: args.tenantIds || ''
        })
    },
    {
        name: "run_av_scan",
        description: "Run the Antivirus scan on the endpoint. It can be a quick or full scanning.",
        inputSchema: {
            type: "object",
            properties: {
                senseMachineId: {type: "string", description: "The ID of the device where the response permissions will be retrieved. It is 40 hexadecimal characters."},
                osPlatform: {type: "string", description: "OS Platform can be found in the device information"},
                senseClientVersion: {type: "string", description: "The senseClientversion of the device being investigated. Can be found in the device info", default: ""},
                quickScan: {type: "boolean", description: "If True, the AV scan will perform a quick AV and if false, it will perform a Full AV Scanning"},
                comment: {type: "string", description: "The comment of the requestor."}
            }
        },
        //senseMachineId, osPlatform, senseClientVersion, quickScan=true, comment
        buildPayload: (args)=> ({
            senseMachineId: args.senseMachineId,
            osPlatform: args.osPlatform,
            senseClientVersion: args.senseClientVersion,
            quickScan: args.quickScan || false,
            comment: args.comment || 'Performing AV Scanning',
        })
    },
    {
        name: "get_action_response_status",
        description: "This will retrieve the current status of response actions made on the device. This will include the status of AV scanning, collection of investigation package, initiate automated investigation, device isolation, restrict app execution and other response available in get_device_response_permissions tool.",
        inputSchema: {
            type: "object",
            properties: {
                senseMachineId: {type: "string", description: "The ID of the device where the response permissions will be retrieved. It is 40 hexadecimal characters."},
                tenantIds: {type: "string", description: "GUID of the current tenant. It can be blank if not multitenant.", default: ''}
            }
        },
        buildPayload: (args)=> ({
            senseMachineId: args.senseMachineId,
            tenantIds: args.tenantIds | ''
        })
    },
    {
        name: "submit_email_to_analysis",
        description: "Submit the email to Microsoft for further analysis and determines if the current verdict is False Positive or False Negative. It will soon have an option to block all the emails from the sender or domain in a definite time.",
        inputSchema: {
            type: "object",
            properties: {
                networkMessageId: {type: "string", description: "NetworkMessageId of the email."},
                category: {type: "number", description: "The values can be any of the following: NotJunk (0), Spam (1), Phishing (2) or Malware (3)."},
                reason: {type: "number", description: "The reason of submission. It can be an False Negative (1) or False Positive (2)."},
                confidenceLevel: {type: "number", description: "It can be Low (0) or High (1)"},
                submitter: {type: "string", description: "The email of the submitter", default: ''},
                tenantId: {type: "string", description: "The tenantId of the organization.", pattern: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'}
            },
            required: ["networkMessageId", "category", "reason", "confidenceLevel", "tenantId"]
        },
        buildPayload : (args) => ({
            networkMessageId: args.networkMessageId,
            category: args.category,
            reason: args.reason,
            confidenceLevel: args.confidenceLevel,
            submitter: args.submitter || '',
            tenantId: args.tenantId
        })
    },
    {
        name: "msgraph_get_users",
        description: "Search users in Microsoft Graph with specific filter and selected properties",
        inputSchema: {
            type: "object",
            properties: {
                select: {type: "array", description: "The list of properties to be selected for the users, default is empty which means all properties will be selected"},
                filter: {type: "string", description: "The filter to be applied in the search for users, default is empty which means no filter will be applied"},
                top: {type: "number", description: "The maximum number of users to be returned from the search, default is 10", default: 10},
                skipToken: {type: "string", description: "The skip token for pagination in Microsoft Graph API, default is empty which means it will start from the first page"}
            }
        },
    //    childMessageType: "msgraph_get_users",
        // childResultType: "msgraph_users_result",
        buildPayload: (args) => ({
            select: args.select || [],
            filter: args.filter || "",
            top: args.top || 10,
            skipToken: args.skipToken || ""
        })

    }, 
    {
        name: "msgraph_get_user_group",
        description: "Get the list of groups where the user is currently belong using MSGraph API Proxy.",
        inputSchema: {
            type: "object",
            properties: {
                userId: {type: "string", description: "The GUID of the user in MSGraph or Entra."},
                select: {type: "array", description: "The list of keys or properties of group that will be retrieved.", default: []}
            }
        },
        buildPayload: (args)=> ({
            userId: args.userId,
            select: args.select
        })
    }, 
    {
        name: "msgraph_get_user_ca_policies",
        description: "This will retrieve the user's conditional access policies using MSGraph API Proxy.",
        inputSchema: {
            type: "object",
            properties: {
                userId: {type: "string", description: "The GUID of the user in MSGraph or Entra."},
            }
        },
        buildPayload: (args)=> ({
            userId: args.userId,
        })        
    },
    {
        name: "msgraph_get_groups",
        description: "Search groups in Microsoft Graph with specific filter and selected properties",
        inputSchema: {
            type: "object",
            properties: {
                select: {type: "array", description: "The list of properties to be selected for the groups, default is empty which means all properties will be selected"},
                filter: {type: "string", description: "The filter to be applied in the search for groups, default is empty which means no filter will be applied"},
                top: {type: "number", description: "The maximum number of groups to be returned from the search, default is 10", default: 10},
                skipToken: {type: "string", description: "The skip token for pagination in Microsoft Graph API, default is empty which means it will start from the first page"}
            }
        },
   //     childMessageType: "msgraph_get_groups",
        // childResultType: "msgraph_groups_result",
        buildPayload: (args) => ({
            select: args.select || [],
            filter: args.filter || "",
            top: args.top || 10,
            skipToken: args.skipToken || ""
        })
    },
    {
        name: "msgraph_get_user_authentication_methods",
        description: "Get a user's authentication methods in Microsoft Graph API by user ID in GUID format",
        inputSchema: {
            type: "object",
            properties: {
                userId: {type: "string", description: "The ID of the user whose authentication methods will be retrieved. It is a GUID."}
            }
        },
   //     childMessageType: "msgraph_get_user_authentication_methods",
        // childResultType: "user_authentication_methods_result",
        buildPayload: (args) => ({
            userId: args.userId
        })
    }, 
    {
        name: "get_threat_analytics",
        description: "Retrieve threat analytics data from Microsoft Defender",
        inputSchema: {
            type: "object",
            properties: {
                search: {type: "string", description: "The search keyword to filter the threat analytics data, default is empty which means no search filter will be applied"},
                category: {type: "array", description: "The category filter for threat analytics data, it can be Malware, Phishing, Vulnerability, Outbreak or All. Default is All which means no category filter will be applied. Any of the following values are allowed: Report,Actor,Core Threat,Technique,Tool,Vulnerability,OSINT", default: ""},
                tags: {type: "array", description: "The tags filter for threat analytics data, it can be any relevant tags for filtering the threat analytics data. Default is empty which means no tags filter will be applied. Any of the following values are allowed: Ransomware,Phishing,TrackedActor,CVE where TrackedActor refers to Activity group, CVE for Vulnerabilities", default: []},
                createdOn: {type: "string", description: "The creation date of the threat analytics report in ISO format, default is empty which means it will retrieve all threat analytics data regardless of creation date. It must be in ISO 8601 format.", default: ""},
                lastUpdatedOn: {type: "string", description: "The last updated date of the threat analytics report in ISO format, default is empty which means it will retrieve all threat analytics data regardless of last updated date. It must be in ISO 8601 format.", default: ""},
            }
        },
   //     childMessageType: "get_threat_analytics",
        // childResultType: "threat_analytics_result",
        buildPayload: (args) => ({
            search: args.search || "",
            category: args.category || "",
            tags: args.tags || [],
            createdOn: args.createdOn || "",
            lastUpdatedOn: args.lastUpdatedOn || ""
        })
    },
    {
        name: "get_threat_analytics_report_by_id",
        description: "Retrieve detailed and complete threat analytics report from Microsoft Defender by report ID",
        inputSchema: {
            type: "object",
            properties: {
                reportId: {type: "string", description: "The ID of the threat analytics report to retrieve details for. It is a GUID."}     
            }
        },
  //      childMessageType: "get_threat_analytics_report_by_id",
        // childResultType: "threat_analytics_report_result",
        buildPayload: (args) => ({
            reportId: args.reportId
         })
    },
    {
        name: "search_mdi_identities",
        description: "Search for identities in Microsoft Defender Identity (MDI) with specific filter conditions and selected properties",
        inputSchema: {
            type: "object",
            properties: {
                searchText: {type: "string", description: "The search text to be used for searching identities in MDI, default is empty which means no search text will be applied"},
                pageSize: {type: "number", description: "The maximum number of identities to be returned from the search, default is 20", default: 20},
                filter: {type: "object", description: 
                    `The filter conditions to be applied in the search for identities in MDI. It can contain the following properties: accountEnabled which is a boolean value to filter enabled or disabled accounts, identityProvider which is an array of identity providers to filter such as ActiveDirectory or AzureActiveDirectory, tags which is an array of tags to filter such as SENSITIVE or HONEYTOKEN, identityType which is the type of the identity to filter such as User or ServiceAccount. 
                        Default is empty which means no filter will be applied.
                        Example of filters or any combinations of them: 
                        {
                            accountEnabled: [true, false],
                            identityProvider: ["ActiveDirectory", "AzureActiveDirectory"],
                            tags: ["SENSITIVE", "HONEYTOKEN"],
                            identityType: ["User", "ServiceAccount"],
                            primaryIdentityProvider: ["AzureActiveDirectory", "Okta", "Ping", "CyberArkIdentity", "SailPoint", "SaaSAccount"]
                        }
                    `}
        }
        },
    //    childMessageType: "search_mdi_identities",
        // childResultType: "mdi_identity_search_result",
        buildPayload: (args) => ({
            searchText: args.searchText || "",
            pageSize: args.pageSize || 20,
            filter: args.filter || {}
        })
    }, 
    {
        name: "search_mdi_identity_by_radius_user_id",
        description: "Search for identities in Microsoft Defender Identity (MDI) by radius user ID with specific filter conditions and selected properties",
        inputSchema: {
            type: "object",
            properties: {
                radiusUserId: {type: "string", description: 
                    `The radius user ID to be used for searching identities in MDI, default is empty which means no search text will be applied. 
                     Radius User ID is a cross-provider identity lookup key used to query the Radius API — Microsoft Defender XDR's internal identity correlation service.
                     The radius user ID can be obtained using search_mdi_identities tool and selecting the radiusUserId property, 
                     or it can be obtained from the alert context of an alert that has an identity with the format of User_{TenantId}_{UserId} where TenantId and UserId are both in GUID format.`},
            }
        },
    //    childMessageType: "search_mdi_identity_by_radius_user_id",
        // childResultType: "mdi_identity_radius_search_result",
        buildPayload: (args) => ({
            radiusUserId: args.radiusUserId || ""
        })
    }, 
    {
        name: "get_mdi_service_accounts_list",
        description: "Get Active Directory service accounts from MS Defender XDR Identities",
        inputSchema: {
            type: "object",
            properties: {
                //args.displayName, args.filter, args.skip, args.pageSize
                displayName: {type: "string", description: "Display name filter or strings to search", default: ""},
                filter: {type: "object", description: "AD service accounts types filter. ", default: {}},
                skip: {type: "number", description: "Skip number. Just ignore it." , default: 0},
                pageSize: {type: "number", description: "Number of page to be displayed", default: 25}
            }
        },
    //    childMessageType: "get_mdi_service_accounts_list",
        // childResultType: "mdi_service_accounts_result",
        buildPayload: (args) => ({
            displayName: args.displayName || "", 
            filter: args.filter, 
            skip: args.skip || 0, 
            pageSize: args.pageSize || 25
        })
    },    
    {
        name: "get_url_overview_information",
        description: "Get URL information such as Domain information, including creation, expiration, name, registrant, date updated, original URL if the URL is a redirect, and other relevant information in Microsoft Defender. IP address is not allowed here.",
        inputSchema: {
            type: "object",
            properties: {
                urlDomain: {type: "string", description: "The URL or domain to be retrieved for overview information. It can be a full URL or just the domain. For example, both www.contoso.com and contoso.com are acceptable."}
            }
        },
    //    childMessageType: "get_url_overview_information",
        // childResultType: "url_overview_result",
        buildPayload: (args) => ({
            urlDomain: args.urlDomain
        })
    },
    {
        name: "sec4ai_get_local_agents",
        description: "Get the list of local AI agents installed in the system. This include the details of the device, AI clients such as Copilot, Claude and etc.",
        inputSchema: {
            type: "object",
            properties: {
                searchText: {type: "string", description: "The search text filter.", default: ""},
                groupBy: {type: "string", description: "The result will be group based on the key name. It can be DeviceId, AgentName, or UserId, the default is blank", default: ""},
                pageSize: {type: "number", description: "The size of data that is viewable" , default: 30},
                nextToken: {type: "string", description: "The token for pagination. This is used for retrieving subsequent pages of results.", default: ""}
            }
        },
    //    childMessageType: "list_local_agents",
        // childResultType: "local_agent_lists_result",
        buildPayload: (args) => ({
            searchText: args.searchText,
            groupBy: args.groupBy,
            pageSize: args.pageSize,
            nextToken: args.nextToken,
        })

    },
    {
        name: "sec4ai_get_local_agent_info",
        description: "Get the detail of the agent installed in the device using agentId that can be retrieved from list of of agents tool with id key.",
        inputSchema: {
            type: "object",
            properties: {
                agentId: {type: "string", description: "The id of an agent in GUID format."}
            }
        },
    //    childMessageType: "get_local_agent_info",
        // childResultType: "local_agent_info_result",
        buildPayload: (args) => ({
            agentId: args.agentId
        })
    }
];

export const TOOLS_BY_NAME = Object.fromEntries(TOOLS.map(t => [t.name, t]));

