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
function get_list_and_state(hue_access_token, bridgeid, get_state_callback) {
  const get_state_options = {
    method: 'GET',
    url: `https://api.meethue.com/v1/bridges/${bridgeid}/lights`,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${hue_access_token}`,
    },
  };
  request(get_state_options, (error, response, body) => {
    if (error || body === 'Gateway Timeout') {
      get_state_callback(false);
    } else {
      const contact = JSON.parse(body);
      get_state_callback(contact);
    }
  });
}

/**
 * for xim interface
 * @param  {object}   option   input xim_content
 * @param  {Function} callback return light list
 */
function discovery(options, callback) {
  const callback_options = JSON.parse(JSON.stringify(options));
  callback_options.list = [];
  callback_options.xim_content.lights = {};
  if (!options.xim_content.hue_access_token || !options.xim_content.bridgeid) {
    callback_options.result.err_no = 2;
    callback_options.result.err_msg = 'no token';
  } else {
    callback_options.xim_content.lights = [];
    get_list_and_state(options.xim_content.hue_access_token,
    options.xim_content.bridgeid, (result) => {
      callback_options.result = {};
      if (result === false || result.code === '404' || result.fault || result.code === '109') {
        callback_options.result.err_no = 1;
        callback_options.result.err_msg = 'fail';
        callback(callback_options);
      }
      callback_options.xim_content.lights = {};
      Object.keys(result).forEach((key) => {
        const light = {};
        light.device_name = result[key].name;
        light.device_id = key;
        light.light_type = 'color';
        light.infrared_support = false;
        light.native_toggle_support = false;
        light.light_status = {};
        light.light_status.hue = parseInt((result[key].state.hue * 360) / 65534, 10);
        light.light_status.saturation = parseInt((result[key].state.sat * 100) / 254, 10);
        light.light_status.brightness = parseInt((result[key].state.bri * 100) / 254, 10);
        light.light_status.onoff = result[key].state.on;
        callback_options.xim_content.lights[key] = light;
        callback_options.list.push(light);
      });
      callback_options.result.err_no = 0;
      callback_options.result.err_msg = 'ok';
      callback(callback_options);
    });
  }
}

/**
 * functions exporting
 */
module.exports = discovery;
