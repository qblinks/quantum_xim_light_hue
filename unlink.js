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

const request = require('request');

/**
 * delete meethue api token from qblinks xim database
 *
 * @param {string} qblinks_token qblinks dev account access token
 * @param {function} delCb callback of this function
 */
function disconnect(qblinks_token, delCb) {
  const options = {
    method: 'DELETE',
    url: `${process.env.auth_url}/token/hue`,
    headers: {
      Authorization: `Bearer ${qblinks_token}`,
    },
    formData: {},
  };
  request(options, (error, response, body) => {
    if (error) delCb(0);
    const contact = JSON.parse(body);
    delCb(contact);
  });
}

 /**
  * Deactivate this channel
  *
  * @param {object} options object created from xim_instance() with the additional
  *                 options to perform xim_authenticate, refer to corresponding
  *                 documents for the details
  * @param {function} callback to be used by the XIM driver
  */
function unlink(options, callback) {
  disconnect(options.quantum_token, (delCb) => {
    const result = delCb;
    result.result = {};
    if (delCb === 0) {
      result.result.err_no = 1;
      result.result.err_msg = 'fail';
      callback(result);
    }
    result.result.err_no = 0;
    result.result.err_msg = 'ok';
    callback(result);
  });
}

/**
 * functions exporting
 */
module.exports = unlink;
