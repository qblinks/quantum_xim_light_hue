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

const merge = require('merge');

 /**
  * Deactivate this channel
  *
  * @param {object} options object created from xim_instance() with the additional
  *                 options to perform xim_authenticate, refer to corresponding
  *                 documents for the details
  * @param {function} callback to be used by the XIM driver
  */
function unlink(options, callback) {
  const output = merge({}, options);
  output.result = {
    err_no: 0,
    err_msg: 'ok',
  };
  callback(output);
}

/**
 * functions exporting
 */
module.exports = unlink;
