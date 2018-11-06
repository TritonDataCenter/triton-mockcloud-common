/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
 * Copyright (c) 2018 Joyent, Inc.
 */

'use strict';

var fs = require('fs');
var path = require('path');

var assert = require('assert-plus');
var uuidv4 = require('uuid/v4');
var vasync = require('vasync');

var consts = require('./consts');
var SERVER_ROOT = consts.SERVER_ROOT;


function _mkdirP(dir, callback) {
    fs.mkdir(dir, function _onMkdir(err) {
        // only return when error is not EEXIST (which is fine)
        if (err && err.code !== 'EEXIST') {
            callback(err);
            return;
        }

        callback();
    });
}

/*
 * Creates dirs:
 *
 *  SERVER_ROOT/<server_uuid>/agents
 *  SERVER_ROOT/<server_uuid>/agents/<agent_name>
 *
 * if they don't exist. Then, reads the file:
 *
 *  SERVER_ROOT/<server_uuid>/agents/<agent_name>/instance_uuid
 *
 * if that exists. If it does not exist, a new instance uuid is generated and
 * written to the file.
 *
 *  callback(err, instanceUuid);
 *
 * is then called with instanceUuid being usable only when err is not undefined.
 *
 */
function getAgentInstanceId(opts, callback) {
    assert.object(opts, 'opts');
    assert.string(opts.agentName, 'opts.agentName');
    assert.uuid(opts.serverUuid, 'opts.serverUuid');

    var agent_dir;
    var agents_dir = path.join(SERVER_ROOT, opts.serverUuid, 'agents');
    var agent_inst_file;
    var instanceUuid;

    agent_dir = path.join(agents_dir, opts.agentName);
    agent_inst_file = path.join(agent_dir, 'instance_uuid');

    vasync.pipeline({
        funcs: [
            function mkAgentsDir(_, cb) {
                _mkdirP(agents_dir, cb);
            },
            function mkAgentDir(_, cb) {
                _mkdirP(agent_dir, cb);
            },
            function readInstanceFile(_, cb) {
                fs.readFile(agent_inst_file, function onData(err, data) {
                    if (err) {
                        if (err.code !== 'ENOENT') {
                            cb(err);
                            return;
                        }
                    } else {
                        instanceUuid = data.toString().trim();
                    }

                    cb();
                });
            },
            function writeInstanceFile(_, cb) {
                if (instanceUuid !== undefined) {
                    // already had one when we read above.
                    cb();
                    return;
                }

                instanceUuid = uuidv4();
                fs.writeFile(agent_inst_file, instanceUuid + '\n', cb);
            }
        ]
    }, function _onPipeline(err) {
        callback(err, instanceUuid);
    });
}

module.exports = {
    getAgentInstanceId: getAgentInstanceId
};
