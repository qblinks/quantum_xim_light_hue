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
    $isOptional: true,
    $minLength: 1,
    $: {
      $notEmptyString: true,
    },
  },
  list: {
    $isOptional: true,
    $: {
      device_name: {
        $notEmptyString: true,
      },
      device_id: {
      },
      light_type: {
        $isOptional: true,
        $in: [
          'color',
          'white',
          'dimmer',
          'mono',
        ],
      },
      infrared_support: {
        $isOptional: true,
        $in: [
          true,
          false,
        ],
      },
      native_toggle_support: {
        $isOptional: true,
        $in: [
          true,
          false,
        ],
      },
      light_status: {
        $isOptional: true,
        icon_url: {
          $isOptional: true,
          $notEmptyString: true,
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
        infrared: {
          $isOptional: true,
          $in: [
            true,
            false,
          ],
        },
        onoff: {
          $isOptional: true,
          $in: [
            true,
            false,
          ],
        },
        connected: {
          $isOptional: true,
          $in: [
            true,
            false,
          ],
        },
      },
      action_result: {
        $isOptional: true,
      },
    },
  },
  groups: {
    $isOptional: true,
    $: {
      group_name: {
        $notEmptyString: true,
      },
      group_id: {
      },
    },
  },
  locale: {
    $minLength: 1,
    $isOptional: true,
    $: {
      $notEmptyString: true,
    },
  },
  result: {
    $isOptional: true,
    err_no: {
      $isPositiveIntegerOrZero: true,
    },
    err_msg: {
      $isOptional: true,
    },
  },
};
