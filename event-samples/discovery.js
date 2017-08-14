/*
 * Copyright (c) 2017
 * Qblinks Incorporated ("Qblinks").
 * All rights reserved.
 *
 * The information contained herein is confidential and proprietary to
 * Qblinks. Use of this information by anyone other than authorized employees
 * of Qblinks is granted only under a written non-disclosure agreement,
 * expressly prescribing the scope and manner of such use.
 */

'use strict';

const xim_config = require('../.xim_config.js');

const my_quantum_token = xim_config.quantum_token;

module.exports = {
  method: 'discovery',
  xim_type: 'light',
  xim_channel: 'hue',
  xim_channel_set: 0,
  quantum_token: my_quantum_token,
};
