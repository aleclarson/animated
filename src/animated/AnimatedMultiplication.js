/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */
'use strict';

var Interpolation = require('Interpolation');
var isNumber = require('isNumber');

var AnimatedInterpolation = require('./AnimatedInterpolation');
var AnimatedWithChildren = require('./AnimatedWithChildren');
var AnimatedValue = require('./AnimatedValue');
var Animated = require('./Animated');

import type { InterpolationConfigType } from 'Interpolation';

class AnimatedMultiplication extends AnimatedWithChildren {
  _a: Animated;
  _b: Animated;

  constructor(a: Animated | number, b: Animated | number) {
    super();
    this._a = isNumber(a) ? new AnimatedValue(a) : a;
    this._b = isNumber(b) ? new AnimatedValue(b) : b;
  }

  __getValue(): number {
    return this._a.__getValue() * this._b.__getValue();
  }

  interpolate(config: InterpolationConfigType): AnimatedInterpolation {
    return new AnimatedInterpolation(this, Interpolation.create(config));
  }

  __attach(): void {
    this._a.__addChild(this);
    this._b.__addChild(this);
  }

  __detach(): void {
    this._a.__removeChild(this);
    this._b.__removeChild(this);
  }
}

module.exports = AnimatedMultiplication;
