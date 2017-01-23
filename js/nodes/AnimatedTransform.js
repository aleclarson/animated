var Animated, AnimatedMap, AnimatedValue, NativeAnimated, Type, assertType, isDev, isType, type;

assertType = require("assertType");

isType = require("isType");

isDev = require("isDev");

Type = require("Type");

NativeAnimated = require("../NativeAnimated");

AnimatedValue = require("./AnimatedValue");

AnimatedMap = require("./AnimatedMap");

Animated = require("./Animated");

type = Type("AnimatedTransform");

type.inherits(AnimatedMap);

type.definePrototype({
  __isAnimatedTransform: true
});

type.overrideMethods({
  __detachAnimatedValues: function() {
    return this.__detachAllValues();
  },
  __getNonNativeValues: function() {
    throw Error("AnimatedTransform cannot be partially native!");
  },
  __getAllValues: function() {
    var animatedValues, index, key, ref, ref1, ref2, transform, transforms, value;
    transforms = [];
    ref = this.__values;
    for (key in ref) {
      value = ref[key];
      ref1 = key.split("."), index = ref1[0], key = ref1[1];
      transforms[index] = transform = {};
      transform[key] = value;
    }
    animatedValues = this.__animatedValues;
    for (key in animatedValues) {
      value = animatedValues[key];
      ref2 = key.split("."), index = ref2[0], key = ref2[1];
      transforms[index] = transform = {};
      transform[key] = value.__getValue();
    }
    return transforms;
  },
  __attachNewValues: function(transforms) {
    var i, index, len, transform;
    assertType(transforms, Array);
    for (index = i = 0, len = transforms.length; i < len; index = ++i) {
      transform = transforms[index];
      this.__attachValue(transform, index);
    }
  },
  __attachValue: function(transform, index) {
    var key, value;
    if (!isType(transform, Object)) {
      return;
    }
    for (key in transform) {
      value = transform[key];
      key = index + "." + key;
      if (value instanceof Animated) {
        this.__attachAnimatedValue(value, key);
      } else {
        this.__values[key] = value;
      }
    }
  },
  __getNativeConfig: function() {
    var animatedValues, index, key, nodeTag, property, ref, ref1, ref2, transforms, value;
    transforms = [];
    type = "static";
    ref = this.__values;
    for (key in ref) {
      value = ref[key];
      ref1 = key.split("."), index = ref1[0], property = ref1[1];
      transforms[index] = {
        type: type,
        property: property,
        value: value
      };
    }
    type = "animated";
    animatedValues = this.__animatedValues;
    for (key in animatedValues) {
      value = animatedValues[key];
      ref2 = key.split("."), index = ref2[0], property = ref2[1];
      nodeTag = value.__getNativeTag();
      transforms[index] = {
        type: type,
        property: property,
        nodeTag: nodeTag
      };
    }
    isDev && NativeAnimated.validateTransform(transforms);
    return {
      type: "transform",
      transforms: transforms
    };
  }
});

module.exports = type.build();

//# sourceMappingURL=map/AnimatedTransform.map
