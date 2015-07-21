'use strict';

var assert = require('chai').assert;
var bunyan = require('bunyan');
var kafka = require('kafka-node');
var uuid = require('uuid');

var KafkaStream = require('../index.js');

var TOPIC = 'bunyan-kafka-test' + uuid.v4();
var CONN_STR = 'localhost:2181';
var KAFKA_CLIENT;
var CONSUMER;
var PRODUCER;
var LOGGER;

describe('bunyan-kafka-test', function () {
    before(function (done) {
        this.timeout(10000);
        KAFKA_CLIENT = new kafka.Client(CONN_STR, 'bunyan-kafka-test');
        PRODUCER = new kafka.HighLevelProducer(KAFKA_CLIENT);
        PRODUCER.on('ready', function () {
            PRODUCER.createTopics([TOPIC], true, function (err) {
                assert.isNull(err, 'created topic');

                CONSUMER = new kafka.HighLevelConsumer(KAFKA_CLIENT,
                                                       [{ topic: TOPIC }]);
                LOGGER = bunyan.createLogger({
                    name: 'kafka-bunyan-test',
                    level: bunyan.TRACE
                });

                var kafkaStream = new KafkaStream({
                    kafka: {
                        connectionString: 'localhost:2181'
                    },
                    topic: TOPIC
                });
                kafkaStream.on('ready', function () {
                    LOGGER.addStream({
                        level: bunyan.INFO,
                        stream: kafkaStream
                    });
                    return done();
                });
            });
        });
    });

    it('should get emitted log via kafka', function (done) {
        var message = uuid.v4();
        CONSUMER.on('message', function (msg) {
            var pMsg = JSON.parse(msg.value);
            assert.equal(message, pMsg.msg,
                         'got correct log mesasge via kafka');
            return done();
        });
        LOGGER.info(message);
    });
});

