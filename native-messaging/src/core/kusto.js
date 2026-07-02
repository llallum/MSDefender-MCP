
import { Client as KustoClient , KustoConnectionStringBuilder} from 'azure-kusto-data';
import { DataFormat, FieldTransformation, IngestClient, IngestionMappingKind, IngestionProperties, JsonColumnMapping } from 'azure-kusto-ingest';
import { ClientRequestProperties } from 'azure-kusto-data';
import { DeviceCodeCredential } from '@azure/identity';
import { v4 as uuidv4 } from 'uuid';
import * as consts from "./consts.js";
import { Readable } from 'node:stream';


class KustoIngestion {
    constructor(kcsbQueryStr, kcsbIngestStr, tenantId){
        this.kcsbQueryStr = kcsbQueryStr;
        this.kcsbIngestStr = kcsbIngestStr;
        this.tenantId = tenantId;
        this.kcsbQueryClient = null;
        this.kcsbIngestClient = null;
    }

    async initKcsbQuery(){
        try {
            this.kcsbQueryClient = new KustoClient(KustoConnectionStringBuilder.withAadDeviceAuthentication(
                this.kcsbQueryStr, this.tenantId,
                (info) => {
                    process.send({source: "child", type: "deviceCode", message: info})
                }
            ))
        } catch(e){
            process.send(e);
        }
    }

    async initKcsbIngest(){
        const ingestProps = new IngestionProperties({
            database: "Incidents",
            table: "Test1",
            format: DataFormat.JSON,
            ingestionMappingColumns: [
                JsonColumnMapping.withPath("Root", "$.test"),
                JsonColumnMapping.withPath("Best", "$.best"),
            ]
        });
        const kcsb = KustoConnectionStringBuilder.withAadDeviceAuthentication(
            this.kcsbIngestStr, this.tenantId,
            (info) => {
                //console.log(info);
                process.send({source: "child", type: "deviceCode", message: info})
            }
        
        );
        try{
            this.kcsbIngestClient = new IngestClient(kcsb, ingestProps);
            const readable = Readable.from(JSON.stringify({test: 12353, best: 'wazzup'}));
            await this.kcsbIngestClient.ingestFromStream(readable, null);
        }catch(e){
            //console.log(e);
            process.send({"Error from initKcsbIngest" : e});
        }

    }

    async query(){
        try{
            const q = `
            AuditHistory
            | extend a = parse_json(Items)
            | project a
            | evaluate  bag_unpack(a)
            `
            ////| project IncidentId=toint(a.IncidentId), Status=toint(a.Status), LastEventTime=tostring(a.LastEventTime)
            process.send(q)
            var tableResults = await this.kcsbQueryClient.execute("Incidents", q);
            for (const i in tableResults.primaryResults[0]._rows){
                process.send(tableResults.primaryResults[0]._rows[i]);
           }
        } 
        catch(e){
            process.send(e);
        }
    }

    async ingestTest() {
        try {
            const ingestProps = IngestionProperties(
                database="Incidents",
                table= "Test",
                format= DataFormat.JSON,)

        }catch(e){
            process.send(e);
        }
    }

}

const kustoIngestion = new KustoIngestion(consts.CLUSTER_QUERY_STRING, consts.CLUSTER_INGESTION_STRING, consts.TENANT_ID);

//await kustoIngestion.initKcsbQuery();
//await kustoIngestion.initKcsbIngest();

export default kustoIngestion;
