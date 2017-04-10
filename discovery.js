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
    url: `https://api.meethue.com/v1/bridges/${bridgeid}`,
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
  callback_options.result = {};
  if (!options.xim_content.hue_access_token || !options.xim_content.bridgeid) {
    callback_options.result.err_no = 2;
    callback_options.result.err_msg = 'no token';
    callback(callback_options);
  } else {
    callback_options.list = [];
    callback_options.groups = [];
    callback_options.xim_content.lights = [];
    get_list_and_state(options.xim_content.hue_access_token,
    options.xim_content.bridgeid, (result) => {
      if (result === false || result.code === '404' || result.fault || result.code === '109') {
        callback_options.result.err_no = 1;
        callback_options.result.err_msg = 'fail';
        callback(callback_options);
      } else {
        callback_options.xim_content.lights = {};
        Object.keys(result.lights).forEach((key) => {
          const light = {};
          light.device_name = result.lights[key].name;
          light.device_id = key;
          light.light_type = 'color';
          light.infrared_support = false;
          light.native_toggle_support = false;
          light.light_status = {};
          light.light_status.hue = parseInt((result.lights[key].state.hue * 360) / 65534, 10);
          light.light_status.saturation = parseInt((result.lights[key].state.sat * 100) / 254, 10);
          light.light_status.brightness = parseInt((result.lights[key].state.bri * 100) / 254, 10);
          light.light_status.onoff = result.lights[key].state.on;
          callback_options.xim_content.lights[key] = light;
          callback_options.list.push(light);
        });
        if (typeof result.groups !== 'undefined') {
          Object.keys(result.groups).forEach((groupkey) => {
            const group = {};
            group.group_name = result.groups[groupkey].name;
            group.group_id = parseInt(groupkey, 10) + 90000;
            group.light_status = {};
            group.light_status.onoff = true;
            callback_options.xim_content.lights[group.group_id] = group;
            callback_options.xim_content.lights[parseInt(groupkey, 10) + 90000] = group;
            delete group.light_status;
            callback_options.groups.push(group);
          });
        }
        callback_options.result.err_no = 0;
        callback_options.result.err_msg = 'ok';
        callback(callback_options);
      }
    });
  }
}

/**
 * functions exporting
 */
module.exports = discovery;
