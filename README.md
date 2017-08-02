# pg-kinesis-bridge

A daemon that will [listen](https://www.postgresql.org/docs/current/static/sql-listen.html) to a PostgreSQL notification channel and send the data to an [AWS Kinesis Stream](https://aws.amazon.com/kinesis/streams/).

## Installation

Install with `npm` or [`yarn`](https://yarnpkg.com/):

```sh
npm install -g pg-kinesis-bridge
```


## Usage

```
usage: pg-kinesis-bridge [-h] -c CHANNEL -s STREAMNAME

Listen for events from PostgreSQL and send them to AWS Kinesis

Optional arguments:
  -h, --help            Show this help message and exit.
  -c CHANNEL, --channel CHANNEL
                        PostgreSQL channel name
  -s STREAMNAME, --streamName STREAMNAME
                        Kinesis stream name
```

The libraries used by pg-kinesis-bridge respect the normal environment variables used by postgres clients and aws clients.
This can be used as a simple way to pass configuration. e.g.

```sh
PGHOST=localhost PGPORT=1234 PGDATABASE=postgres AWS_PROFILE=work AWS_SDK_LOAD_CONFIG=y pg-kinesis-bridge -c CHANNEL -s STREAMNAME
```


## Similar Projects

  - [pg-amqp-bridge](https://github.com/subzerocloud/pg-amqp-bridge) to send postgres notifications to [RabbitMQ](http://www.rabbitmq.com/) or services such as [Azure Event Hub](https://azure.microsoft.com/en-us/services/event-hubs/)
  - [postgresql-to-amqp](https://github.com/FGRibreau/postgresql-to-amqp) an alternative for AMQP
  - [pgsql-listen-exchange](https://github.com/gmr/pgsql-listen-exchange) an alternative for AMQP
  - [skeeter](https://github.com/SpiderOak/skeeter) to send postgres notifications to [0MQ](http://zeromq.org/)
  - [pg-bridge](https://github.com/matthewmueller/pg-bridge) for [AWS SNS](https://aws.amazon.com/sns/) or webhooks
  - [postgrest-ws](https://github.com/diogob/postgrest-ws) for websockets
  - [postgresql2websocket](https://github.com/frafra/postgresql2websocket) for websockets


## Implementation Notes

The PostgreSQL notification channel name is used as the Kinesis `PartitionKey`.
