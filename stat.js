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
 * get the list of connected HUE lights within the bridge
 *
 * @param {string} hue_access_token Philips Hue account access token
 * @param {string} bridgeid bridge id of the authenticated bridge
 * @param {string} hue_username obtained hue username
 * @param {function} get_state_cb callback of this function
 */
function get_state(hue_access_token, bridgeid, id, get_state_callback) {
  const get_state_options = {
    method: 'GET',
    url: `https://api.meethue.com/v1/bridges/${bridgeid}/lights/${id}`,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${hue_access_token}`,
    },
  };
  request(get_state_options, (error, response, body) => {
    if (error) throw new Error(error);
    const contact = JSON.parse(body);
    get_state_callback(contact);
  });
}


 /**
  * Get the stat
  *
  * @param {object} options object created from xim_instance() with the additional
  *                 options added by xim_authenticate, refer to corresponding
  *                 documents for the details
  * @param {function} callback to be used by the XIM driver
  */
function stat(options, callback) {
  // this is an empty function to be implemented or a place holder
  const callback_option = options;
  callback_option.result = {};
  callback_option.list = [];
  if (!options.xim_content.hue_access_token || !options.xim_content.bridgeid) {
    callback_option.result.err_no = 2;
    callback_option.result.err_msg = 'no token';
    callback(callback_option);
  }
  get_state(options.xim_content.hue_access_token, options.xim_content.bridgeid,
    options.device_id, (result) => {
      if (result.code === '404' || result.fault || result.code === '109') {
        callback_option.result.err_no = 1;
        callback_option.result.err_msg = 'fail';
        callback(callback_option);
      }
      const light = {};
      light.device_name = result.name;
      light.device_id = options.device_id;
      light.light_type = 'color';
      light.infrared_support = false;
      light.native_toggle_support = false;
      light.light_status = {};
      light.light_status.hue = parseInt((result.state.hue * 360) / 65534, 10);
      light.light_status.saturation = parseInt((result.state.sat * 100) / 254, 10);
      light.light_status.brightness = parseInt((result.state.bri * 100) / 254, 10);
      light.light_status.onoff = result.state.on;
      callback_option.list.push(light);
      callback_option.result = {};
      callback_option.result.err_no = 0;
      callback_option.result.err_msg = 'ok';
      callback(callback_option);
    });
}


/**
 * functions exporting
 */
module.exports = stat;
