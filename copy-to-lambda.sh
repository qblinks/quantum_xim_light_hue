#!/bin/bash

tar cf - * | (cd ../ximDriver/quantum/xim/light/hue; tar xf - )
