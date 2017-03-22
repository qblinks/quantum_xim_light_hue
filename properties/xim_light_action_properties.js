/*
 * Copyright (c) 2017
 * Qblinks Incorporated ('Qblinks').
 * All rights reserved.
 *
 * The information contained herein is confidential and proprietary to
 * Qblinks. Use of this information by anyone other than authorized employees
 * of Qblinks is granted only under a written non-disclosure agreement,
 * expressly prescribing the scope and manner of such use.
 */

module.exports = {
  xim_content: {
    $isOptional: true,
    $skip: true,
  },
  xim_type: {
    $in: [
      'light',
    ],
  },
  xim_channel: {
    $in: [
      'lifx',
      'hue',
      'smartthings',
    ],
  },
  xim_channel_set: {
    $isPositiveIntegerOrZero: true,
    $minValue: 0,
    $maxValue: 2,
  },
  quantum_token: {
    $minLength: 1,
    $: {
      $notEmptyString: true,
    },
  },
  device_id: {
  },
  light_action: {
    short_color_code: {
      $isOptional: true,
      $in: [
        'red',
        'orange',
        'yellow',
        'green',
        'blue',
        'cyan',
        'purple',
        'white',
        'pink',
      ],
    },
    rgb: {
      $isOptional: true,
      $matchRegExp: '^#([0-9]|[A-F]|[a-f]){6}$',
    },
    hue: {
      $isOptional: true,
      $isPositiveIntegerOrZero: true,
      $minValue: 0,
      $maxValue: 360,
    },
    saturation: {
      $isOptional: true,
      $isPositiveIntegerOrZero: true,
      $minValue: 0,
      $maxValue: 100,
    },
    brightness: {
      $isOptional: true,
      $isPositiveIntegerOrZero: true,
      $minValue: 0,
      $maxValue: 100,
    },
    kelvin: {
      $isOptional: true,
      $isPositiveIntegerOrZero: true,
      $minValue: 2500,
      $maxValue: 9000,
    },
    onoff: {
      $isOptional: true,
      $in: [
        true,
        false,
      ],
    },
    toggle: {
      $isOptional: true,
      $in: [
        true,
      ],
    },
  },
  locale: {
    $minLength: 1,
    $isOptional: true,
    $: {
      $notEmptyString: true,
    },
  },
};
