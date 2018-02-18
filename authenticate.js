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
 * Get default Bridge ID
 *
 * @param {object} event Input data object
 * @param {string} event.hue_access_token Philips Hue account access token
 * @returns {object} output.bridgeId Bridge ID get from meehue
 */
function getBridgeId(event) {
  return new Promise((resolve, reject) => {
    const output = merge({}, event);
    const hueAccessToken = output.hueAccessToken || '';

    const options = {
      method: 'GET',
      url: 'https://api.meethue.com/v2/bridges',
      headers: {
        authorization: `Bearer ${hueAccessToken}`,
      },
    };
    request(options, (error, response, body) => {
      if (error) {
        reject(output);
      } else {
        try {
          const data = JSON.parse(body);
          console.log('data:', data);
          if (data[0] && data[0].id) {
            output.bridgeId = data[0].id;
            resolve(output);
          } else {
            reject(output);
          }
        } catch (err) {
          reject(output);
        }
      }
    });
  });
}

/**
 * Link Button
 *
 * @param {object} event Input data object
 * @param {string} event.hue_access_token Philips Hue account access token
 * @param {string} event.bridgeId Bridge ID
 * @returns {object}
 */
function linkButton(event) {
  return new Promise((resolve, reject) => {
    const output = merge({}, event);
    const hueAccessToken = output.hueAccessToken || '';
    const bridgeId = output.bridgeId || '';

    const options = {
      method: 'PUT',
      url: `https://api.meethue.com/v2/bridges/${bridgeId}/0/config`,
      headers: {
        authorization: `Bearer ${hueAccessToken}`,
      },
      json: {
        linkbutton: true,
      },
    };
    request(options, (error, response, body) => {
      console.log('body:', body);
      if (error) {
        console.error('error:', error);
        reject(output);
      } else {
        resolve(output);
      }
    });
  });
}

/**
 * Get Username
 *
 * @param {object} event Input data object
 * @param {string} event.hue_access_token Philips Hue account access token
 * @param {string} event.hue_access_token Philips Hue account access token
 * @returns {object} output.bridgeId Bridge ID get from meehue
 */
function getUserName(event) {
  return new Promise((resolve, reject) => {
    const output = merge({}, event);
    const hueAccessToken = output.hueAccessToken || '';
    const bridgeId = output.bridgeId || '';

    const options = {
      method: 'POST',
      url: `https://api.meethue.com/v2/bridges/${bridgeId}`,
      headers: {
        authorization: `Bearer ${hueAccessToken}`,
      },
      json: {
        devicetype: 'tracMo',
      },
    };
    request(options, (error, response, body) => {
      console.log('body:', body);
      if (body && body[0] && body[0].success && body[0].success.username) {
        output.userName = body[0].success.username;
        resolve(output);
      } else {
        if (error) {
          console.error('error:', error);
        }

        if (body) {
          console.error('body:', body);
        }
        reject(output);
      }
    });
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

  const input = {
    hueAccessToken: callback_options.xim_content.access_token,
  };

  callback_options.xim_content.hue_access_token = callback_options.xim_content.access_token;
  getBridgeId(input)
  .then(linkButton)
  .then(getUserName)
  .then((data) => {
    console.log('data:', data);
    callback_options.xim_content.bridgeid = data.bridgeId;
    callback_options.xim_content.userName = data.userName;
    callback_options.result.err_no = 0;
    callback_options.result.err_msg = 'ok';
    callback(callback_options);
  })
  .catch((error) => {
    console.error('error:', error);
    callback_options.result.err_no = 112;
    callback_options.result.err_msg = 'Refresh Access Token';
    callback(callback_options);
  });
}

/**
 * functions exporting
 */
module.exports = authenticate;
