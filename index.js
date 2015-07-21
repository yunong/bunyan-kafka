'use strict';

var events = require('events');
var util = require('util');

var assert = require('assert-plus');
var bunyan = require('bunyan');
var kafka = require('kafka-node');

/**
 * KafkaStream. This is a bunyan plugin that will write your bunyan records to
 * a Kafka stream.
 *
 * @param {Object} opts options object.
 * @param {Object} opts.kafka kafka-node options object.
 * @param {Object} [opts.log] optional bunyan logger.
 *
 * @fires error if there's an error with the stream.
 * @fires ready when the stream is ready to be used.
 * @returns {undefined}
 */
function KafkaStream(opts) {
    assert.object(opts, 'opts');
    assert.object(opts.kafka, 'opts.kafka');
    assert.string(opts.kafka.connectionString, 'opts.kafka.connectionString');
    assert.string(opts.topic, 'opts.topic');
    assert.optionalObject(opts.log, 'opts.log');

    events.EventEmitter.call(this);

    var self = this;

    if (!opts.log) {
        this._log = bunyan.createLogger({
            name: 'bunyan-kafka',
            level: process.env.LOG_LEVEL || bunyan.WARN
        });
    } else {
        this._log = opts.log.childLogger({
            component: 'bunyan-kafka'
        });
    }

    this._topic = opts.topic;

    this._client = new kafka.Client(opts.kafka.connectionString,
                                    opts.kafka.clientId, opts.kafka.zkOptions);
    this._producer = new kafka.HighLevelProducer(self._client);

    self._producer.on('error', function (err) {
        self._log.warn(err, 'kafka error');

        if (self.listeners('error').length !== 0) {
            self.emit('error', err);
        }
    });

    self._producer.on('ready', function () {
        self._log.info('kafka ready');
        self.emit('ready');
    });
}

util.inherits(KafkaStream, events.EventEmitter);

module.exports = KafkaStream;

KafkaStream.prototype.write = function write(record) {
    var self = this;
    var payload = [{
        topic: self._topic,
        messages: record
    }];

    self._log.trace({payload: payload}, 'sending payload to kafka');
    self._producer.send(payload, function (err, data) {
        if (err) {
            self._log.warn({err: err, data: data},
                           'unable to send log to Kafka');

            if (self.listeners('error').length !== 0) {
                self.emit('error', err, data);
            }
        }
    });
};
