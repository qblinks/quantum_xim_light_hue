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
 * get the hue api token
 *
 * @param {string} qblinks_token qblinks dev account access token
 * @param {function} tokenCb callback of this function
 */
function get_hue_token(qblinks_token, set, tokenCb) {
  const options = {
    method: 'GET',
    url: `${process.env.auth_url}/token/hue/${set}`,
    headers: {
      authorization: `Bearer ${qblinks_token}`,
    },
    formData: {} };
  request(options, (error, response, body) => {
    if (error) throw new Error(error);
    const contact = JSON.parse(body);
    tokenCb(contact);
  });
}

/**
 * refresh hue access_token
 *
 * @param {string} qblinks_token qblinks dev account access token
 * @param {function} refCb callback of this function
 */
function refresh_hue_token(qblinks_token, set, refCb) {
  const options = {
    method: 'POST',
    url: `${process.env.auth_url}/refresh_token/hue/${set}`,
    headers: {
      authorization: `Bearer ${qblinks_token}`,
    },
  };
  // console.log(options);
  request(options, (error, response, body) => {
    if (error) throw new Error(error);
    const contact = JSON.parse(body);
    refCb(contact);
  });
}

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
  console.log(bridgesOptions);
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
  callback_options.xim_content = {};
  get_hue_token(callback_options.quantum_token,
    callback_options.xim_channel_set, (token_result) => {
      if (token_result.result === 'false') {
        callback_options.result.err_no = 1;
        callback_options.result.err_msg = 'havent token';
        callback(callback_options);
      }
      callback_options.xim_content.hue_access_token = token_result.access_token;
      get_bridge(callback_options.xim_content.hue_access_token, (briCb) => {
        if (briCb === 0) {
          refresh_hue_token(callback_options.quantum_token,
            callback_options.xim_channel_set, (ref) => {
              callback_options.xim_content.hue_access_token = ref.access_token;
              callback_options.result.err_no = 112;
              callback_options.result.err_msg = 'Refresh Access Token';
              callback(callback_options);
            });
        } else {
          callback_options.xim_content.bridgeid = briCb;
          callback_options.result.err_no = 0;
          callback_options.result.err_msg = 'ok';
          callback(callback_options);
        }
      });
    });
}

/**
 * functions exporting
 */
module.exports = authenticate;
