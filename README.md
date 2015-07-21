# bunyan-kafka
This is a [bunyan](https://github.com/trentm/node-bunyan) plugin for Apache
[Kafka](https://kafka.apache.org/). It allows you to stream your bunyan logs to
Kafka. You can then forward the logs on to some other distributed processing
framework, such as Elasticsearch.

## Usage
Since the stream needs to connect to kafka, and thus we have to instantiate it
asynchronously and add the stream to the logger after the `ready` event has been
emitted.

```js
var KafkaStream = require('kafka-stream');
LOGGER = bunyan.createLogger({
    name: 'kafka-bunyan-test',
    level: bunyan.TRACE
});

var kafkaStream = new KafkaStream({
    kafka: {
        connectionString: 'localhost:2181'
    },
    topic: 'bunyan-kafka-topic'
});

kafkaStream.on('ready', function () {
    LOGGER.addStream({
        level: bunyan.INFO,
        stream: kafkaStream
    });

    // Now you can log
    LOGGER.info('Come on you target for faraway laughter, come on you stranger, you legend, you martyr, and shine!');
});

```

## Tests
You'll need to have kafka installed locally, with zookeeper running on
`localhost:2818`

# Contributions
Contributions are welcome, please run ```make``` to ensure tests, lint, and
style run cleanly.

# LICENSE
The MIT License (MIT)

Copyright (c) 2015 Yunong J Xiao

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
