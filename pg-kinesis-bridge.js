const pg = require("pg");
const AWS = require("aws-sdk");

const escape_sql_identifier = function(s) {
	/* Produce a "quoted identifier" https://www.postgresql.org/docs/current/static/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS */
	/* Quoted identifiers can contain any character, except the character with code zero. (To include a double quote, write two double quotes.) */
	if (s.indexOf("\0") != -1) throw Error("invalid identifier");
	s = s.replace('"', '""');
	return '"' + s + '"'
};

exports.run = function(pg_config, kinesis_config, channel, streamName, SequenceNumber) {
	const client = new pg.Client(pg_config);
	const kinesis = new AWS.Kinesis(kinesis_config);

	const onnotify = function(msg) {
		let params = {
			StreamName: streamName,
			PartitionKey: msg.channel,
			Data: msg.payload,
			SequenceNumberForOrdering: SequenceNumber
		};

		kinesis.putRecord(params, function(err, data) {
			if (err) {
				console.error(err, err.stack);
			} else {
				SequenceNumber = data.SequenceNumber;
			}
		});
	};

	/* Set up DB connection */
	return client.connect()
		.then(() => {
			client.on("notification", onnotify);

			/* Subscribe to channel(s) */
			return client.query('LISTEN ' + escape_sql_identifier(channel));
		});
};
