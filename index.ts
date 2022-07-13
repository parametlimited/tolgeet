import commandLineArgs from "command-line-args";

const options: commandLineArgs.CommandLineOptions = commandLineArgs([
    { name: 'verbose', alias: 'v', type: Boolean },
    { name: 'map', alias: 'm', type: String, multiple: true },
    { name: 'url', type: String, defaultOption: true }
]);