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
const merge = require('merge');

/**
 * get the id of connected HUE  bridge
 *
 * @param {string} hue_access_token Philips Hue account access token
 * @param {function} briCb callback of this function
 */
function get_bridge(hue_access_token, briCb) {
  let idValue;
  const bridgesOptions = {
    method: 'GET',
    url: 'https://api.meethue.com/v2/bridges',
    headers: {
      authorization: `Bearer ${hue_access_token}`,
    },
  };
  request(bridgesOptions, (error, response, body) => {
    if (error) throw new Error(error);
    const contact = JSON.parse(body);
    console.log(body);
    // if get bridgeid return this id
    if (contact[0]) {
      idValue = contact[0].id;
    } else {
      idValue = 0;
    }
     // if fail return 0
    briCb(idValue);
  });
}

/**
 * [authenticate description]
 * @param  {oblect}   options  options object created from xim_instance() with the additional
 *                    options to perform xim_authenticate, refer to corresponding
 *                    documents for the details
 * @param  {Function} callback callback to be used by the XIM driver
 */
function authenticate(options, callback) {
  const callback_options = JSON.parse(JSON.stringify(options));
  callback_options.result = {};
  callback_options.xim_content = merge({}, options.xim_content);

  if (typeof callback_options.xim_content.access_token === 'undefined') {
    callback_options.result.err_no = 113;
    callback_options.result.err_msg = 'No Access Token';
    callback(callback_options);
    return;
  }

  callback_options.xim_content.hue_access_token = callback_options.xim_content.access_token;
  get_bridge(callback_options.xim_content.hue_access_token, (briCb) => {
    if (briCb === 0) {
      callback_options.result.err_no = 112;
      callback_options.result.err_msg = 'Refresh Access Token';
      callback(callback_options);
    } else {
      callback_options.xim_content.bridgeid = briCb;
      callback_options.result.err_no = 0;
      callback_options.result.err_msg = 'ok';
      callback(callback_options);
    }
  });
}

/**
 * functions exporting
 */
module.exports = authenticate;
