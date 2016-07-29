var Animation, Type, assertType, assertTypes, cancelAnimationFrame, emptyFunction, fromArgs, requestAnimationFrame, type;

require("isDev");

emptyFunction = require("emptyFunction");

assertTypes = require("assertTypes");

assertType = require("assertType");

fromArgs = require("fromArgs");

Type = require("Type");

requestAnimationFrame = require("./inject/requestAnimationFrame").get();

cancelAnimationFrame = require("./inject/cancelAnimationFrame").get();

type = Type("Animation");

type.defineOptions({
  isInteraction: Boolean.withDefault(true),
  captureFrames: Boolean.withDefault(false)
});

type.defineValues({
  startTime: null,
  startValue: null,
  _state: 0,
  _isInteraction: fromArgs("isInteraction"),
  _animationFrame: null,
  _previousAnimation: null,
  _onUpdate: null,
  _onEnd: null,
  _frames: function(options) {
    if (options.captureFrames) {
      return [];
    }
  },
  _captureFrame: function(options) {
    if (!options.captureFrames) {
      return emptyFunction;
    }
  }
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
    return this.__didEnd(finished);
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
    assertType(value, Number);
    this._onUpdate(value);
    this.__didUpdate(value);
    if (this.isDone) {
      return;
    }
    this._requestAnimationFrame();
    return this._captureFrame();
  }
});

module.exports = Animation = type.build();

//# sourceMappingURL=map/Animation.map
