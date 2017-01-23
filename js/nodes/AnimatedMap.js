var Animated, AnimatedMap, AnimatedStyle, AnimatedValue, AnimatedWithChildren, Event, NativeAnimated, Type, assertType, isType, type;

assertType = require("assertType");

isType = require("isType");

Event = require("Event");

Type = require("Type");

AnimatedWithChildren = require("./AnimatedWithChildren");

NativeAnimated = require("../NativeAnimated");

AnimatedStyle = require("./AnimatedStyle");

AnimatedValue = require("./AnimatedValue");

Animated = require("./Animated");

type = Type("AnimatedMap");

type.inherits(AnimatedWithChildren);

type.defineFrozenValues({
  didSet: function() {
    return Event();
  }
});

type.defineValues(function() {
  return {
    __values: {},
    __animatedValues: {}
  };
});

type.definePrototype({
  __isAnimatedMap: true
});

type.defineMethods({
  attach: function(newValues) {
    this.__detachAnimatedValues(newValues);
    this.__attachNewValues(newValues);
    this.__isNative && this.__connectNativeValues();
  }
});

type.overrideMethods({
  __getValue: function() {
    return this.__getAllValues();
  },
  __updateChildren: function(value) {
    this.__super(arguments);
    return this.didSet.emit(value);
  }
});

type.defineHooks({
  __getAllValues: function() {
    var animatedValue, key, ref, value, values;
    values = {};
    ref = this.__values;
    for (key in ref) {
      value = ref[key];
      values[key] = (animatedValue = this.__animatedValues[key]) ? animatedValue.__getValue() : value;
    }
    return values;
  },
  __getNonNativeValues: (function() {
    var isNative;
    isNative = function(animatedValue) {
      if (!animatedValue.__isNative) {
        return false;
      }
      if (!animatedValue.__isAnimatedMap) {
        return true;
      }
      return animatedValue.__isAnimatedTransform;
    };
    return function() {
      var animatedValue, key, ref, value, values;
      values = {};
      ref = this.__values;
      for (key in ref) {
        value = ref[key];
        if (animatedValue = this.__animatedValues[key]) {
          if (!isNative(animatedValue)) {
            values[key] = animatedValue.__getValue();
          }
        } else {
          values[key] = value;
        }
      }
      return values;
    };
  })(),
  __attachNewValues: function(newValues) {
    var key, value;
    assertType(newValues, Object);
    for (key in newValues) {
      value = newValues[key];
      this.__attachValue(value, key);
    }
  },
  __attachValue: function(value, key) {
    var map;
    if (value instanceof Animated) {
      this.__attachAnimatedValue(value, key);
      return;
    }
    if (isType(value, Object)) {
      map = this.__animatedValues[key] || AnimatedMap({});
      map.attach(value);
      this.__attachAnimatedValue(map, key);
      return;
    }
    this.__values[key] = value;
  },
  __attachAnimatedValue: function(animatedValue, key) {
    if (this.__animatedValues[key]) {
      return;
    }
    this.__values[key] = void 0;
    this.__animatedValues[key] = animatedValue;
    animatedValue.__addChild(this, key);
  },
  __connectNativeValues: function() {
    var animatedValues, key, nativeTags, value;
    animatedValues = this.__animatedValues;
    nativeTags = [];
    for (key in animatedValues) {
      value = animatedValues[key];
      if (!value.__isNative) {
        continue;
      }
      nativeTags.push(value.__getNativeTag());
    }
    if (nativeTags.length) {
      NativeAnimated.connectAnimatedNodes(nativeTags, this.__getNativeTag());
    }
  },
  __detachAllValues: function() {
    var animatedValue, key, ref;
    ref = this._animatedValues;
    for (key in ref) {
      animatedValue = ref[key];
      animatedValue.__removeChild(this);
    }
    this.__values = {};
    this.__animatedValues = {};
  },
  __detachAnimatedValue: function(animatedValue, newValue) {
    if (animatedValue.__isAnimatedMap) {
      if (newValue != null) {
        animatedValue.__detachAnimatedValues(newValue);
        return;
      }
      animatedValue.__detachAllValues();
    } else {
      if (animatedValue === newValue) {
        return;
      }
    }
    animatedValue.__removeChild(this);
    return delete this.__animatedValues[key];
  },
  __detachAnimatedValues: function(newValues) {
    var animatedValues, key, value;
    assertType(newValues, Object);
    animatedValues = this.__animatedValues;
    for (key in animatedValues) {
      value = animatedValues[key];
      this.__detachAnimatedValue(value, newValues[key]);
    }
  }
});

module.exports = AnimatedMap = type.build();

//# sourceMappingURL=map/AnimatedMap.map
