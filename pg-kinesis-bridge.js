const pg = require("pg");
const AWS = require("aws-sdk");

const PgKinesisBridge = exports.PgKinesisBridge = function(pg_config, kinesis_config) {
	this.pgclient = new pg.Client(pg_config);
	this.kinesis = new AWS.Kinesis(kinesis_config);
	this.streams = {}; /* map from streamName to SequenceNumber */
	this.channels = {};
	this.connected = false;
};

PgKinesisBridge.prototype._onputfail = function(err) {
	console.error(err, err.stack);
};

PgKinesisBridge.prototype._onnotify = function(msg) {
	for (let streamName in this.streams) {
		let params = {
			StreamName: streamName,
			PartitionKey: msg.channel,
			Data: msg.payload,
			SequenceNumberForOrdering: this.streams[streamName]
		};

		this.kinesis.putRecord(params, (function(err, data) {
			if (err) {
				this._onputfail(err);
			} else {
				this.streams[streamName] = data.SequenceNumber;
			}
		}).bind(this));
	}
};

const escape_sql_identifier = function(s) {
	/* Produce a "quoted identifier" https://www.postgresql.org/docs/current/static/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS */
	/* Quoted identifiers can contain any character, except the character with code zero. (To include a double quote, write two double quotes.) */
	if (typeof s != "string" || s.length < 1 || s.indexOf("\0") != -1) throw Error("invalid identifier");
	s = s.replace('"', '""');
	return '"' + s + '"'
};

PgKinesisBridge.prototype._listen = function(channel) {
	return this.pgclient.query('LISTEN ' + escape_sql_identifier(channel));
};

PgKinesisBridge.prototype.addChannel = function(channel) {
	this.channels[channel] = true;
	if (this.connected) {
		return this._listen(channel).then(() => void 0);
	} else {
		/* return already resolved promise */
		return Promise.resolve();
	}
};

PgKinesisBridge.prototype.addStream = function(streamName, SequenceNumber) {
	this.streams[streamName] = (SequenceNumber || null);
};

PgKinesisBridge.prototype.connect = function() {
	/* Set up DB connection */
	let promise = this.pgclient.connect()
		.then(() => {
			this.pgclient.on("notification", this._onnotify.bind(this));
			this.connected = true;
		})
	/* Subscribe to channels */
		.then(() => this.pgclient.query("begin"));
	for (let channel in this.channels) {
		promise = promise.then(() => this._listen(channel));
	}
	return promise.then(() => this.pgclient.query("commit"));
};
