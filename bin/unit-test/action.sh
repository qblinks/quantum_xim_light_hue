#!/bin/bash

quantum-local -l index.js -h handler -e event-samples/action.js -t 15
quantum-local -l index.js -h handler -e event-samples/action-off.js -t 15
quantum-local -l index.js -h handler -e event-samples/action-toggle.js -t 15
quantum-local -l index.js -h handler -e event-samples/action-green.js -t 15
quantum-local -l index.js -h handler -e event-samples/action-yellow.js -t 15
quantum-local -l index.js -h handler -e event-samples/action-red.js -t 15
quantum-local -l index.js -h handler -e event-samples/action-off.js -t 15
