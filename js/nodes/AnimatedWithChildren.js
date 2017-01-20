// Generated by CoffeeScript 1.11.1
var Animated, NativeAnimated, Type, type;

Type = require("Type");

NativeAnimated = require("../NativeAnimated");

Animated = require("./Animated");

type = Type("AnimatedWithChildren");

type.inherits(Animated);

type.defineFrozenValues(function() {
  return {
    _children: [],
    _childKeys: []
  };
});

type.overrideMethods({
  __getChildren: function() {
    return this._children;
  },
  __addChild: function(child, key) {
    this.__isNative && child.__markNative();
    this._children.push(child);
    this._childKeys.push(key);
    if (this._children.length === 0) {
      this.__attach();
    }
  },
  __updateChildren: function(value) {
    var child, children, i, index, key, len, update;
    children = this.__getChildren();
    for (index = i = 0, len = children.length; i < len; index = ++i) {
      child = children[index];
      if (child.__isAnimatedTransform) {
        update = child.__getAllValues();
      } else {
        key = this._childKeys[index];
        update = {};
        update[key] = value;
      }
      child.__updateChildren(update);
    }
  },
  __removeChild: function(child) {
    var index;
    index = this._children.indexOf(child);
    if (index < 0) {
      return;
    }
    if (this.__isNative && child.__isNative) {
      NativeAnimated.disconnectAnimatedNodes(this.__getNativeTag(), child.__getNativeTag());
    }
    this._children.splice(index, 1);
    this._childKeys.splice(index, 1);
    if (this._children.length === 0) {
      this.__detach();
    }
  },
  __markNative: function() {
    var child, children, i, index, len;
    if (this.__isNative) {
      return;
    }
    this.__isNative = true;
    children = this._children;
    for (index = i = 0, len = children.length; i < len; index = ++i) {
      child = children[index];
      child.__markNative();
    }
  }
});

module.exports = type.build();
