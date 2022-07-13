import { TEMPORARY_FILE_NAME, TEMPORARY_FOLDER_NAME } from "./defaults";
import commandLineArgs from "command-line-args";
import https from "https";
import fs from "fs";
import { ClientRequest } from "http";
import jszip from "jszip";

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
});

const request: ClientRequest = https.get(options["url"], function(response) {
   response.pipe(fileWriter);
});