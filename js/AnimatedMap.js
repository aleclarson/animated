var Animated, Type, type;

Type = require("Type");

Animated = require("./Animated");

type = Type("AnimatedMap");

type.inherits(Animated);

type.defineArgs({
  values: Object.isRequired,
  onUpdate: Function.isRequired
});

type.defineFrozenValues(function(values, onUpdate) {
  return {
    _values: values,
    _onUpdate: onUpdate
  };
});

type.initInstance(function() {
  return this.__attach();
});

type.defineMethods({
  update: function() {
    return this._callback();
  }
});

type.overrideMethods({
  __getValue: function() {
    var key, ref, value, values;
    values = {};
    ref = this._values;
    for (key in ref) {
      value = ref[key];
      if (value instanceof Animated) {
        values[key] = value.__getValue();
      } else {
        values[key] = value;
      }
    }
    return values;
  },
  __getAnimatedValue: function() {
    var key, ref, value, values;
    values = {};
    ref = this._values;
    for (key in ref) {
      value = ref[key];
      if (!(value instanceof Animated)) {
        continue;
      }
      values[key] = value.__getAnimatedValue();
    }
    return values;
  },
  __attach: function() {
    var key, ref, value;
    ref = this._values;
    for (key in ref) {
      value = ref[key];
      if (!(value instanceof Animated)) {
        continue;
      }
      value.__addChild(this);
    }
  },
  __detach: function() {
    var key, ref, value;
    ref = this._values;
    for (key in ref) {
      value = ref[key];
      if (!(value instanceof Animated)) {
        continue;
      }
      value.__removeChild(this);
    }
  }
});

module.exports = type.build();

//# sourceMappingURL=map/AnimatedMap.map