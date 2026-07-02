import { fileURLToPath } from "url";
import path from "node:path"
import { __log, log } from "./utils.js";
import {mkdir, appendFile} from "fs/promises";
import { createWriteStream } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let SOURCE = path.relative(process.cwd(), fileURLToPath(import.meta.url));

class TimelineStorage {

    constructor(baseDir){
        this.baseDir = baseDir;
    }

    async initialize(){
        await mkdir(this.baseDir, {recursive: true});
    }

    async appendEvents(senseMachineId,rawEvents, fromDate, toDate){
    //    console.log(__filename);
    //    console.log(__dirname);
        //console.log(`Appending ${rawEvents.length} events to timeline storage`);
        __log(`[timelineStorage.js] Appending ${rawEvents.length} events to timeline storage`)
        const devicePath = path.join(this.baseDir, senseMachineId, 'jsonl');

        __log(`[timelineStorage.js] Appending to ${devicePath}`);

        const startDateStr = new Date(fromDate).toISOString().split('T')[0];
        const endDateStr = new Date(toDate).toISOString().split('T')[0];

        await mkdir(devicePath, {recursive: true});
//        const filePath = path.join(devicePath, `${startDateStr}_${endDateStr}.jsonl`);
//        console.log(`Writing to file: ${filePath}`);

        const group = new Map();

        for (const event of rawEvents) {
            if (!event.ActionTime) continue;
            
            const date = new Date(event.ActionTime).toISOString().split('T')[0];
            
            if (!group.has(date)) {
                group.set(date, []);
            }
            group.get(date).push(event);

        }

        for (const [date, events] of group.entries()){

            const dateFilePath = path.join(devicePath, `${date}.jsonl`);
            console.log(`Writing ${events.length} events to file: ${dateFilePath}`);

            const content = events.map(e => JSON.stringify(e)).join('\n') + '\n';

            await appendFile(dateFilePath, content, 'utf8');
            console.log(`Finished writing ${events.length} events to file: ${dateFilePath}`);
        }
    }
}

export const timelineStorage = new TimelineStorage(path.join(__dirname, "../duckdb/timelines/"));
