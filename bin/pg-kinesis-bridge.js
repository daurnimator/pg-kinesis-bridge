#!/usr/bin/env node

const pg_kinesis_bridge = require("../pg-kinesis-bridge.js");

let args; {
	const argparse = require("argparse");
	const package_json = require("../package.json");
	const parser = new argparse.ArgumentParser({
		description: package_json.description,
		version: package_json.version,
		addHelp:true
	});
	parser.addArgument([ '-c', '--channel' ], {
		required: true,
		help: 'PostgreSQL channel name'
	});
	parser.addArgument([ '-s', '--streamName' ], {
		required: true,
		help: 'Kinesis stream name'
	});
	args = parser.parseArgs();
}

pg_kinesis_bridge.run(void 0, void 0, args.channel, args.streamName)
	.catch((e) => {
		console.error(e);
		process.exit(1);
	});
