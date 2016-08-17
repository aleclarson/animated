var Animation, Nan, Type, assertType, assertTypes, cancelAnimationFrame, emptyFunction, isType, requestAnimationFrame, type;

require("isDev");

emptyFunction = require("emptyFunction");

assertTypes = require("assertTypes");

assertType = require("assertType");

isType = require("isType");

Type = require("Type");

Nan = require("Nan");

requestAnimationFrame = require("./inject/requestAnimationFrame").get();

cancelAnimationFrame = require("./inject/cancelAnimationFrame").get();

type = Type("Animation");

type.defineOptions({
  isInteraction: Boolean.withDefault(true),
  captureFrames: Boolean.withDefault(false)
});

type.defineValues(function(options) {
  return {
    startTime: null,
    startValue: null,
    _state: 0,
    _isInteraction: options.isInteraction,
    _animationFrame: null,
    _previousAnimation: null,
    _onUpdate: null,
    _onEnd: null,
    _frames: options.captureFrames ? [] : void 0,
    _captureFrame: !options.captureFrames ? emptyFunction : void 0
  };
});

type.defineGetters({
  isPending: function() {
    return this._state === 0;
  },
  isActive: function() {
    return this._state === 1;
  },
  isDone: function() {
    return this._state === 2;
  }
});

type.defineHooks({
  __computeValue: null,
  __didStart: function() {
    return this._requestAnimationFrame();
  },
  __didEnd: emptyFunction,
  __didUpdate: emptyFunction,
  __captureFrame: emptyFunction
});

type.defineMethods({
  start: function(config) {
    if (!this.isPending) {
      return;
    }
    this._state += 1;
    assertTypes(config, {
      startValue: Number,
      onUpdate: Function,
      onEnd: Function
    });
    this.startTime = Date.now();
    this.startValue = config.startValue;
    this._onUpdate = config.onUpdate;
    this._onEnd = config.onEnd;
    if (config.previousAnimation instanceof Animation) {
      this._previousAnimation = config.previousAnimation;
    }
    this.__didStart();
    this._captureFrame();
  },
  stop: function() {
    return this._stop(false);
  },
  finish: function() {
    return this._stop(true);
  },
  _stop: function(finished) {
    if (this.isDone) {
      return;
    }
    this._state += 1;
    this._cancelAnimationFrame();
    this.__didEnd(finished);
    return this._onEnd(finished);
  },
  _requestAnimationFrame: function() {
    if (!this._animationFrame) {
      this._animationFrame = requestAnimationFrame(this._recomputeValue);
    }
  },
  _cancelAnimationFrame: function() {
    if (this._animationFrame) {
      cancelAnimationFrame(this._animationFrame);
      this._animationFrame = null;
    }
  },
  _captureFrame: function() {
    var frame;
    frame = this.__captureFrame();
    assertType(frame, Object);
    return this._frames.push(frame);
  }
});

type.defineBoundMethods({
  _recomputeValue: function() {
    var value;
    this._animationFrame = null;
    if (this.isDone) {
      return;
    }
    value = this.__computeValue();
    if (Nan.test(value)) {
      throw TypeError("Unexpected NaN value!");
    }
    if (!isType(value, Number)) {
      throw TypeError("'__computeValue' must return a Number!");
    }
    this._onUpdate(value);
    this.__didUpdate(value);
    if (this.isDone) {
      return;
    }
    this._requestAnimationFrame();
    this._captureFrame();
  }
});

module.exports = Animation = type.build();

//# sourceMappingURL=map/Animation.map