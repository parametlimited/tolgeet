#!/usr/bin/env node

import https from "https";
import fs from "fs";
import { ClientRequest } from "http";
import commandLineArgs from "command-line-args";
import jszip from "jszip";
import resx from "resx";
import { flatten } from "flat";
import { TEMPORARY_FILE_NAME, TEMPORARY_FOLDER_NAME } from "./defaults";

const options: commandLineArgs.CommandLineOptions = commandLineArgs([
    { name: "verbose", alias: "v", type: Boolean },
    { name: "map", alias: "m", type: String, multiple: true },
    { name: "url", type: String, defaultOption: true }
]);

const fileWriter: fs.WriteStream = fs.createWriteStream(TEMPORARY_FILE_NAME);
fileWriter.on("finish", async () => {
    fileWriter.close();
    
    const fileBuffer: Buffer = fs.readFileSync(TEMPORARY_FILE_NAME);
    const archive: jszip = await (new jszip()).loadAsync(fileBuffer);

    fs.mkdirSync(TEMPORARY_FOLDER_NAME);
    for (let item of Object.values(archive.files)) {
        if (item.dir) {
            fs.mkdirSync(`${TEMPORARY_FOLDER_NAME}/${item.name}`);
        } else {
            fs.writeFileSync(
                `${TEMPORARY_FOLDER_NAME}/${item.name}`,
                Buffer.from(
                    await item.async("arraybuffer")));
        }
    }

    for (let map of options["map"]) {
        const [infile, outfile]: [string, string] = map.split(":");
        const indata = fs.readFileSync(`${TEMPORARY_FOLDER_NAME}/${infile}`);
        const translations: any = flatten(JSON.parse(indata.toString()));

        if(outfile.endsWith(".resx")) {
            resx.js2resx(translations, (err: Error, res: string) => {
                fs.writeFileSync(outfile, res);
            });
        } else if (outfile.endsWith(".json")) {
            fs.writeFileSync(outfile, JSON.stringify(translations, null, 2));
        }
    }

    fs.rmSync(TEMPORARY_FILE_NAME);
    fs.rmSync(TEMPORARY_FOLDER_NAME, { recursive: true });
});

const request: ClientRequest = https.get(options["url"], function(response) {
   response.pipe(fileWriter);
});