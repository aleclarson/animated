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

var Animation = require('./Animation');
var RequestAnimationFrame = require('./injectable/RequestAnimationFrame');
var CancelAnimationFrame = require('./injectable/CancelAnimationFrame');

import type { AnimationConfig, EndCallback } from './Animation';

type DecayAnimationConfigSingle = AnimationConfig & {
  velocity: number;
  deceleration?: number;
  restSpeedThreshold?: number;
  restDisplacementThreshold?: number;
};

class DecayAnimation extends Animation {
  _startTime: number;
  _lastValue: number;
  _fromValue: number;
  _deceleration: number;
  _velocity: number;
  _restSpeedThreshold: number;
  _restDisplacementThreshold: number;
  _onUpdate: (value: number) => void;
  _animationFrame: any;

  constructor(
    config: DecayAnimationConfigSingle,
  ) {
    super();
    this._deceleration = config.deceleration !== undefined ? config.deceleration : 0.998;
    this._velocity = config.velocity;
    this._restSpeedThreshold = config.restSpeedThreshold !== undefined ? config.restSpeedThreshold : 0.01;
    this._restDisplacementThreshold = config.restDisplacementThreshold !== undefined ? config.restDisplacementThreshold : 0.1;
    this.__isInteraction = config.isInteraction !== undefined ? config.isInteraction : true;
  }

  start(
    fromValue: number,
    onUpdate: (value: number) => void,
    onEnd: ?EndCallback,
  ): void {
    this.__active = true;
    this._lastValue = fromValue;
    this._fromValue = fromValue;
    this._onUpdate = onUpdate;
    this.__onEnd = onEnd;
    this._startTime = Date.now();
    this._animationFrame = RequestAnimationFrame.current(this.onUpdate.bind(this));
  }

  onUpdate(): void {
    var elapsedTime = Date.now() - this._startTime;

    var kd = 1 - this._deceleration;
    var kv = Math.exp(elapsedTime * kd * -1);

    this._lastVelocity = this._velocity * kv;

    var value = this._fromValue + (this._velocity / kd) * (1 - kv);

    this._onUpdate(value);

    if (this._isResting()) {
      return this.__debouncedOnEnd({finished: true});
    }

    this._lastValue = value;
    if (this.__active) {
      this._animationFrame = RequestAnimationFrame.current(this.onUpdate.bind(this));
    }
  }

  stop(): void {
    this.__active = false;
    CancelAnimationFrame.current(this._animationFrame);
    this.__debouncedOnEnd({finished: false});
  }

  _isResting(): bool {
    return Math.abs(this._lastValue - value) < this._restDisplacementThreshold ||
      Math.abs(this._lastVelocity - velocity) < this._restSpeedThreshold;
  }
}

module.exports = DecayAnimation;
