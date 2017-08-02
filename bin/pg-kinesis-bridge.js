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
		action: "append",
		help: 'PostgreSQL channel name'
	});
	parser.addArgument([ '-s', '--streamName' ], {
		required: true,
		action: "append",
		help: 'Kinesis stream name'
	});
	args = parser.parseArgs();
}

let pkb = new pg_kinesis_bridge.PgKinesisBridge();
args.streamName.forEach((streamName) => pkb.addStream(streamName));
args.channel.forEach((channel) => pkb.addChannel(channel));
pkb.connect()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	});
