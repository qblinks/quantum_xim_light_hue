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
const convert = require('color-convert');
const math = require('mathjs');

/**
 * HUE lights action function
 *
 * @param {string} hue_access_token Philips Hue account access token
 * @param {string} bridgeid bridge id of the authenticated bridge
 * @param {string} hue_username obtained hue username
 * @param {string} no the hue lights id
 * @param {string} actionbody the action request
 * @param {function} action_cb callback of this function
 */
function goaction(hue_access_token, bridgeid, no, actionbody, actionCb) {
  const options = {
    method: 'PUT',
    url: `https://api.meethue.com/v1/bridges/${bridgeid}/lights/${no}/state`,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${hue_access_token}` },
    json: true,
    body: actionbody,
  };
  if (no > 1000) {
    options.url = `https://api.meethue.com/v1/bridges/${bridgeid}/groups/${no - 1000}/action`;
  }
  request(options, (error, response, body) => {
    if (error) actionCb(false);
    if (body.fault || body.code === '404' || body.code === '109') {
      actionCb(false);
    }
    actionCb(true);
  });
}

/**
 * [hex_to_rgb description]
 * @param  {string} hexin [color hex string]
 * @return {object}      [return rgb array]
 */
function hex_to_rgb(hexin) {
  const rgb = [];
  let hex = hexin;
  hex = hex.substr(1);
  if (hex.length === 3) {
    hex = hex.replace(/(.)/g, '$1$1');
  }
  hex.replace(/../g, (color) => {
    rgb.push(parseInt(color, 0x10));
  });
  return rgb;
}

/**
 * [XY description]
 * @param {double} x [x]
 * @param {double} y [y]
 */
function XY(x, y) {
  this.x = x;
  this.y = y;
}

/**
 * [gamma_correction description]
 * @param  {[type]} value [description]
 * @return {[type]}       [description]
 */
function gamma_correction(value) {
  let result = value;
  if (value > 0.04045) {
    result = math.pow(((value + 0.055) / (1.0 + 0.055)), 2.4);
  } else {
    result = value / 12.92;
  }
  return result;
}

/**
 * [rgb_to_xy description]
 * @param  {int} red   [red]
 * @param  {int} green [green]
 * @param  {int} blue  [blue]
 */
function rgb_to_xy(red, green, blue) {
  const r = gamma_correction(red);
  const g = gamma_correction(green);
  const b = gamma_correction(blue);
  const X = (r * 0.4360747) + (g * 0.3850649) + (b * 0.0930804);
  const Y = (r * 0.2225045) + (g * 0.7168786) + (b * 0.0406169);
  const Z = (r * 0.0139322) + (g * 0.0971045) + (b * 0.7141733);
  let cx = X / (X + Y + Z);
  let cy = Y / (X + Y + Z);
  cx = isNaN(cx) ? 0.0 : cx;
  cy = isNaN(cy) ? 0.0 : cy;
  const xyPoint = new XY(cx, cy);
  return [xyPoint.x, xyPoint.y];
}

/**
 * [action description]
 * @param  {object} option Light action properties
 * @return {bool}        seccess or fail
 */
function action(option, callback) {
  const callback_option = option;
  const hue = {};
  let rgb = [];
  callback_option.xim_type = option.xim_type;
  callback_option.xim_channel = option.xim_channel;
  callback_option.xim_channel_set = option.xim_channel_set;
  callback_option.result = {};
  if (typeof option.xim_content === 'undefined' || typeof option.xim_content.hue_access_token === 'undefined' || typeof option.xim_content.bridgeid === 'undefined') {
    callback_option.result.err_no = 2;
    callback_option.result.err_msg = 'xim_content undefined or hue_access_token undefined or bridgeid undefined.';
    callback(callback_option);
  }
  // toggle
  if (typeof option.light_action.onoff !== 'undefined') {
    hue.on = option.light_action.onoff;
  } else if (typeof option.light_action.toggle !== 'undefined') {
    if (option.light_action.toggle) {
      if (typeof option.xim_content.lights[option.device_id] !== 'undefined') {
        const light = option.xim_content.lights[option.device_id];
        if (light.light_status.onoff) {
          hue.on = false;
        } else {
          hue.on = true;
        }
      }
    }
  }

  // color
  if (option.light_action.hue && option.light_action.brightness && option.light_action.saturation) {
    hue.hue = parseInt((option.light_action.hue * 65535) / 360, 10);
  } else if (option.light_action.rgb) {
    rgb = hex_to_rgb(option.light_action.rgb);
    hue.xy = rgb_to_xy(rgb[0], rgb[1], rgb[2]);
  } else if (option.light_action.short_color_code) {
    rgb = convert.keyword.rgb(option.light_action.short_color_code);
    hue.xy = rgb_to_xy(rgb[0], rgb[1], rgb[2]);
  }
  // brightness
  if (typeof option.light_action.brightness !== 'undefined') {
    hue.bri = parseInt((option.light_action.brightness * 255) / 100, 10);
  }
  // saturation
  if (typeof option.light_action.saturation !== 'undefined') {
    hue.sat = parseInt((option.light_action.saturation * 255) / 100, 10);
  }
  // http request
  goaction(option.xim_content.hue_access_token, option.xim_content.bridgeid,
    option.device_id, hue, (result) => {
      callback_option.result = {};
      if (result === false) {
        callback_option.result.err_no = 1;
        callback_option.result.err_msg = 'fail';
        callback(callback_option);
      }
      if (typeof option.xim_content !== 'undefined' && typeof hue.on !== 'undefined') {
        if (typeof callback_option.xim_content.lights[option.device_id].light_status !== 'undefined') {
          callback_option.xim_content.lights[option.device_id].light_status.onoff = hue.on;
        }
      }
      delete callback_option.light_action;
      delete callback_option.device_id;
      callback_option.result.err_no = 0;
      callback_option.result.err_msg = 'ok';
      callback(callback_option);
    });
}

/**
 * functions exporting
 */
module.exports = action;
