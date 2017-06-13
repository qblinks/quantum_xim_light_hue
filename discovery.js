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
      if (body === 'Gateway Timeout') {
        get_state_callback(121);
      } else {
        get_state_callback(false);
      }
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
    if (!options.xim_content.hue_access_token) {
      callback_options.result.err_no = 113;
      callback_options.result.err_msg = 'No Access Token';
      callback(callback_options);
    } else if (!options.xim_content.bridgeid) {
      callback_options.result.err_no = 120;
      callback_options.result.err_msg = 'Invalid Bridge ID';
      callback(callback_options);
    } else {
      callback_options.result.err_no = 900;
      callback_options.result.err_msg = 'Unknown Error';
      callback(callback_options);
    }
  } else {
    callback_options.list = [];
    callback_options.groups = [];
    callback_options.xim_content.lights = [];
    get_list_and_state(options.xim_content.hue_access_token,
    options.xim_content.bridgeid, (result) => {
      if (result === false || result === 121 || result.code === '404' || result.fault || result.code === '109') {
        if (result.fault && result.fault.detail && result.fault.detail.errorcode === 'keymanagement.service.access_token_expired') {
          callback_options.result.err_no = 112;
          callback_options.result.err_msg = 'Refresh Access Token';
        } else if (result.fault && result.fault.detail && result.fault.detail.errorcode === 'keymanagement.service.invalid_access_token') {
          callback_options.result.err_no = 110;
          callback_options.result.err_msg = 'Invalid Access Token';
        } else if (result === 121) {
          callback_options.result.err_no = 121;
          callback_options.result.err_msg = 'Bridge Timeout';
        } else {
          console.log(result);
          callback_options.result.err_no = 900;
          callback_options.result.err_msg = 'Unknow Error';
        }
        callback(callback_options);
      } else {
        callback_options.xim_content.lights = {};
        Object.keys(result.lights).forEach((key) => {
          const light = {};
          light.device_name = result.lights[key].name;
          light.device_id = `${key}`;
          light.is_group = false;
          if (result.lights[key].type === 'Dimmable light' ||
              result.lights[key].type === 'Dimmable plug-in unit') {
            light.light_type = 'dimmer';
          } else if (result.lights[key].type === 'On/Off light') {
            light.light_type = 'white';
          } else if (result.lights[key].type === 'Color temperature light') {
            light.light_type = 'color';
          } else {
            light.light_type = 'color';
          }
          light.infrared_support = false;
          light.native_toggle_support = false;
          light.light_status = {};
          if (light.light_type === 'color' && result.lights[key].type !== 'Color temperature light' && result.lights[key].type !== 'On/Off plug-in unit') {
            light.light_status.hue = parseInt((result.lights[key].state.hue * 360) / 65534, 10);
            light.light_status.saturation =
              parseInt((result.lights[key].state.sat * 100) / 254, 10);

            if (isNaN(light.light_status.hue)) {
              console.log(result.lights[key]);
            }
          }

          if (result.lights[key].type !== 'On/Off light') {
            light.light_status.brightness =
              parseInt((result.lights[key].state.bri * 100) / 254, 10);
          }

          light.light_status.onoff = result.lights[key].state.on;
          callback_options.xim_content.lights[key] = light;

          if (result.lights[key].type !== 'On/Off plug-in unit') {
            callback_options.list.push(light);
          }
        });
        if (typeof result.groups !== 'undefined') {
          Object.keys(result.groups).forEach((groupkey) => {
            const group = {};
            const group_id = parseInt(groupkey, 10) + 90000;
            group.group_name = result.groups[groupkey].name;
            group.group_id = `${group_id}`;
            group.light_status = {};
            group.light_status.onoff = true;
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
