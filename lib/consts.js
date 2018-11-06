/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
 * Copyright (c) 2018 Joyent, Inc.
 */

'use strict';

var child_process = require('child_process');

// This will blow up if something goes wrong. That's what we want.
var MOCKCLOUD_ROOT = process.env.MOCKCLOUD_ROOT ||
    child_process.execSync('/usr/sbin/mdata-get mockcloudRoot',
    {encoding: 'utf8'}).trim();
var SERVER_ROOT = MOCKCLOUD_ROOT + '/servers';


module.exports = {
    MOCKCLOUD_ROOT: MOCKCLOUD_ROOT,
    SERVER_ROOT: SERVER_ROOT
};
