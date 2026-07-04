import path from "node:path";
import {glob} from "glob";
import { table } from "node:console";
import { access , mkdir, readdir} from "node:fs/promises";
import duckdb, { DuckDBConnection, DuckDBInstance } from "@duckdb/node-api";
import { fileURLToPath } from "url";
import { __log } from "./utils.js";
import { read } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let SOURCE = path.relative(process.cwd(), fileURLToPath(import.meta.url));

export class DuckDatabase {

    constructor (options = {}){
        this.dbFile = options.file || ":memory:";
        this.instance = null;
        this.connection = null;
        this.cacheDirectory = path.join(__dirname, '../duckdb/timelines/');
//        console.log(duckdb.version());
//        console.log(duckdb.configurationOptionDescriptions());
    }

    async init(){
        if (!this.instance) {
            this.instance = await DuckDBInstance.create(this.dbFile);
        }
//        const connection = await DuckDBConnection.create();
//        const instance = await DuckDBInstance.create();
    }

    async connect(){
        if (!this.instance){
            await this.init();
        }
        if (!this.connection){
            this.connection = await DuckDBConnection.create(this.instance, {                
            });
        }
    }
    
    async disconnect(){
        try {
            if (this.connection){
                await this.connection.close();
                this.connection = null;
            }
        }
        finally{
            if (this.instance){
                await this.instance.close();
                this.instance = null;
            }
        }

    }

    async runsql(sql, params=[]){
        if (!this.connection)
            throw new Error(`DuckDatabase: Not connected to database.`);

        const result = await this.connection.runAndReadAll(sql);

        // getRowObjectsJson() converts all DuckDB types to JSON-safe primitives:
        // - STRUCT → plain JS object  (avoids DuckDB wrapper objects)
        // - LIST/ARRAY → plain JS array
        // - BIGINT/HUGEINT → string   (avoids JSON.stringify crash)
        // - TIMESTAMP/DATE/UUID → string
        // Returns array of named-column objects, ready for JSON.stringify / MCP transport
        return result.getRowObjectsJson();
    }

    async createParquetFromJsonl(tableName, outputFileName='timeline.parquet'){
        await this.connect();

        const fPath =  path.join(this.cacheDirectory, tableName, 'jsonl', '*.jsonl');
        const dPath = path.join(this.cacheDirectory, tableName, 'parquet', outputFileName);

        await mkdir(path.join(this.cacheDirectory, tableName, 'parquet'), {recursive: true});

        const sql = `
            COPY (
                SELECT * 
                FROM read_ndjson('${fPath}',
                union_by_name = true,
                ignore_errors = true
                )
            )
            TO '${dPath}'
            (FORMAT PARQUET);
            `;
        
        return this.runsql(sql);
    }

    async createTableFromParquet(tableName, parquetName='timeline.parquet'){
        await this.connect();
        let sourcePath = path.join(this.cacheDirectory, tableName, 'parquet', parquetName);

        const sql = `CREATE OR REPLACE TABLE '${tableName}' AS SELECT * FROM read_parquet('${sourcePath}')`;

        return this.runsql(sql);
    }

    async exportTableToParquet(tableName, parquetName='timeline.parquet'){

        await this.connect();

        let destinationPath = path.join(this.cacheDirectory, tableName, 'parquet', parquetName);
        
        const sql = `
            COPY '${tableName}'
            TO '${destinationPath}'
            (FORMAT PARQUET)
        `;

        return this.runsql(sql);
    }

    async createTableFromJsonl(tableName, jsonlName='*.jsonl'){
        await this.connect();

        let sourcePath = path.join(this.cacheDirectory, tableName, 'jsonl', jsonlName);

        const sql = `CREATE OR REPLACE TABLE '${tableName}' 
                        AS SELECT * 
                        FROM read_ndjson('${sourcePath}', 
                            union_by_name = true, 
                            ignore_errors = true)`;

        return this.runsql(sql);
    }

    async createTableFromSource(tableName, dedupTable=false){
        
        const pattern = '*.jsonl';
        const directory= path.join(this.cacheDirectory, tableName, 'jsonl');

        await mkdir(directory, {recursive: true});
        try{

            let table = null;

            const files = await readdir(directory);
            if (files.some(x => x.endsWith('.jsonl'))){
                await this.createParquetFromJsonl(tableName);
                table = await this.createTableFromJsonl(tableName);
            }
            if (dedupTable)
                return this.dedupTable(tableName);
            return table;

        } catch(err){
            __log(`Error in describing the table '${tableName}' : ${err.message}`)
            return {source: SOURCE, type: 'error', message: `Error in describing the table '${tableName}' : ${err.message}`};
        }
    }

    async describeTable(tableName){

        try {
            const schema = await this.runsql(`DESCRIBE '${tableName}'`);
       //     const column_names = tableDescription.map(x => x.column_name);

            const actionTypeCounts = await this.runsql(`
                SELECT
                    ActionType,
                    COUNT(*) AS Count
                FROM '${tableName}'
                GROUP BY ActionType
                ORDER BY Count DESC;
                `);

            let count = await this.runsql(
                `SELECT COUNT(*) AS Count 
                FROM '${tableName}'`
                );

            count = count[0]?.Count || 0;

            let recordCount = await this.runsql(
                `SELECT 
                    DATE(ActionTime) AS record_date,
                    COUNT(*) AS count
                 FROM '${tableName}'
                 GROUP BY 
                    record_date
                 ORDER BY 
                    record_date DESC,
                    count DESC
                `
            )
            
            return {tableName, count, schema, actionTypeCounts, recordCount};
        } catch(err){
            __log(`Error: ${err.message}`);
        }
    }

    async dedupTable(tableName){
        await this.connect();

        const sql = `
                    CREATE OR REPLACE TABLE '${tableName}' AS 
                        SELECT *
                        FROM (
                            SELECT *, 
                            ROW_NUMBER() OVER (
                                PARTITION BY 
                                    ReportId, 
                                    Machine.MachineId,
                                    ActionTime 
                                ORDER BY ActionTime DESC)
                                AS rn
                                FROM '${tableName}'
                                ) t
                        WHERE rn = 1` ; 
        
        return await this.runsql(sql);
    }

/*     async createTimelineView(tableName='timeline', sources=[]){

        let source = sources.map(x=> {
        return (`SELECT * FROM "${x}"\n`)
        }  )

        let sql = `CREATE OR REPLACE VIEW "${tableName}" AS \n${source.join('UNION ALL\n')};`;
        console.log(sql);
        return this.runsql(sql);
    } */
}


/* const db = new DuckDatabase();

    await db.init();
    await db.connect();

    const tableName = 'f92ddbef891334d7918c25c277e4db65f5d96984';

    await db.createTableFromSource(tableName);

    const abc = await db.runsql("SELECT\n  ActionTimeIsoString,\n  RemoteEndpoint.IPAddress AS RemoteIP,\n  RemoteEndpoint.Port AS RemotePort,\n  RemoteEndpoint.Url AS RemoteUrl,\n  RemoteEndpoint.Protocol AS Protocol,\n  LocalEndpoint.IPAddress AS LocalIP,\n  LocalEndpoint.Port AS LocalPort,\n  InitiatingProcess.ImageFile.FullPath AS InitiatingProcessPath,\n  InitiatingProcess.CommandLine AS InitiatingCommandLine,\n  InitiatingProcess.User.AccountName AS InitiatingUser\nFROM \"f92ddbef891334d7918c25c277e4db65f5d96984\"\nWHERE ActionType = 'ConnectionSuccess'\nORDER BY ActionTimeIsoString ASC")

    console.log(abc); */
/* 
const db = new DuckDatabase();
try {

    await db.init();
    await db.connect();

    const tableName = '606bd521c39713cb53847df7d28c2b196c56f8b0';

    let table  = (await db.createTableFromSource(tableName))?.[0];

    console.log(table);

 // table = await db.dedupTable(tableName);

//  console.log(table);

    const des = await db.describeTable(tableName);

    console.log(des);

    const result3 = await db.createTableFromParquet('3d94f40086b973b71697822075e2931f27fbc40f');

//    await db.createTimelineView('timeline', ['606bd521c39713cb53847df7d28c2b196c56f8b0', '3d94f40086b973b71697822075e2931f27fbc40f'])


    const firstRow = await db.runsql(`
        DESCRIBE
        SELECT
            Machine.MachineId,
            Machine.Name,
            CAST(ActionTime AS TIMESTAMP) AS ActionTime,
            ActionType,
            Process.CommandLine,
            HiddenDetails,
            RemoteEndpoint.Url,
            RemoteEndpoint.IPAddress,
            RemoteEndpoint.Port,
            RemoteEndpoint.Protocol,
            LocalEndpoint,
        FROM '${tableName}'
        WHERE ActionType = 'ConnectionSuccess'
        ;
    `);

    const firstRow1 = await db.runsql(`
        SELECT
            Machine.MachineId AS MachineId,
            Machine.Name AS HostName,
            ActionTime,
            ActionType,
            Process.CommandLine AS CommandLine,
            HiddenDetails,
            RemoteEndpoint.Url AS Url,
            RemoteEndpoint.IPAddress AS IPAddress,
            RemoteEndpoint.Port AS Port,
            RemoteEndpoint.Protocol AS Protocol,
            LocalEndpoint,
        FROM '${tableName}'
        WHERE ActionType = 'ConnectionSuccess'
        ;
    `);


const actionSummary = await db.runsql(`
    SELECT
        ActionType,
        COUNT(*) AS Count
    FROM '${tableName}'
    GROUP BY ActionType
    ORDER BY Count DESC;
`);

const describe = await db.runsql(`describe '${tableName}'`);

const tables = await db.runsql('SHOW ALL TABLES');

//await db.createTimelineView(tableName='timelineView', sources=['606bd521c39713cb53847df7d28c2b196c56f8b0', '3d94f40086b973b71697822075e2931f27fbc40f'])

console.log(firstRow);

} catch(err){
    console.log(err.message);
    throw err;

}
 */


/* {
  "sql": "SELECT\n  ActionTimeIsoString,\n  RemoteEndpoint.IPAddress AS RemoteIP,\n  RemoteEndpoint.Port AS RemotePort,\n  RemoteEndpoint.Url AS RemoteUrl,\n  RemoteEndpoint.Protocol AS Protocol,\n  LocalEndpoint.IPAddress AS LocalIP,\n  LocalEndpoint.Port AS LocalPort,\n  InitiatingProcess.ImageFile.FullPath AS InitiatingProcessPath,\n  InitiatingProcess.CommandLine AS InitiatingCommandLine,\n  InitiatingProcess.User.AccountName AS InitiatingUser\nFROM \"f92ddbef891334d7918c25c277e4db65f5d96984\"\nWHERE ActionType = 'ConnectionSuccess'\nORDER BY ActionTimeIsoString ASC"
} */