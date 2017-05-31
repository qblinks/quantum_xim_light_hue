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

const xim_driver = {};
xim_driver.action = require('./action.js');
xim_driver.authenticate = require('./authenticate.js');
xim_driver.discovery = require('./discovery.js');
xim_driver.stat = require('./stat.js');
xim_driver.unlink = require('./unlink.js');

exports.handler = (event, context, callback) => {
  const method = event.method;
  const input = merge({}, event);

  delete input.method;

  let result_body = '{}';
  let result_statusCode = 200;

  const supportMethodMap = {
    authenticate: true,
    discovery: true,
    action: true,
    stat: true,
    unlink: true,
  };

  if (supportMethodMap[method]) {
    const type = event.xim_type;
    const channel = event.xim_channel;
    const set = event.xim_channel_set;

    if (type === undefined ||
      channel === undefined ||
      set === undefined
    ) {
      result_statusCode = 422;
      result_body = JSON.stringify({
        status: 'Failed',
        message: 'Unprocessable Entity',
      });
      const response = {
        statusCode: result_statusCode,
        body: result_body,
      };

      callback(null, response);
    } else if (!xim_driver[method]) {
      result_statusCode = 405;
      result_body = JSON.stringify({
        status: 'Falied',
        message: `Invalid XIM method: ${method}`,
      });
      const result_response = {
        statusCode: result_statusCode,
        body: result_body,
      };

      callback(null, result_response);
    } else {
      xim_driver[method](input, (options) => {
        const result_options = options;
        result_statusCode = 200;
        delete result_options.quantum_token;
        result_body = JSON.stringify(result_options);
        const result_response = {
          statusCode: result_statusCode,
          body: result_body,
        };

        callback(null, result_response);
      });
    }
  } else {
    result_statusCode = 405;
    result_body = JSON.stringify({
      status: 'Failed',
      message: 'Method Not Allowed',
    });
    const result_response = {
      statusCode: result_statusCode,
      body: result_body,
    };

    callback(null, result_response);
  }
};
