import { TEMPORARY_FILE_NAME } from "./defaults";
import commandLineArgs from "command-line-args";
import https from "https";
import fs from "fs";
import { ClientRequest } from "http";

const options: commandLineArgs.CommandLineOptions = commandLineArgs([
    { name: "verbose", alias: "v", type: Boolean },
    { name: "map", alias: "m", type: String, multiple: true },
    { name: "url", type: String, defaultOption: true }
]);

const temporaryFile: fs.WriteStream = fs.createWriteStream(TEMPORARY_FILE_NAME);
const request: ClientRequest = https.get(options["url"], function(response) {
   response.pipe(temporaryFile);

   temporaryFile.on("finish", () => {
       temporaryFile.close();
   });
});