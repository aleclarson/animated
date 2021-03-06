
{mutable} = require "Property"
{Number} = require "Nan"

emptyFunction = require "emptyFunction"
assertType = require "assertType"
Type = require "Type"

NativeAnimated = require "./NativeAnimated"
injected = require "./injectable"

type = Type "Animation"

type.trace()

type.defineStatics
  types: Object.create null

type.defineArgs ->

  types:
    fromValue: Number
    isInteraction: Boolean
    useNativeDriver: Boolean

  defaults:
    isInteraction: yes
    useNativeDriver: no

type.initInstance do ->
  hasWarned = no
  return (options) ->
    if options.useNativeDriver
      return if NativeAnimated.isAvailable or hasWarned
      options.useNativeDriver = no
      log.warn "Failed to load NativeAnimatedModule! Falling back to JS-driven animations."
      hasWarned = yes
    return

type.defineValues (options) ->

  startTime: null

  fromValue: options.fromValue ? null

  _state: 0

  _isInteraction: options.isInteraction

  _useNativeDriver: options.useNativeDriver

  _nativeTag: null

  _lastTime: null

  _animationFrame: null

  _previousAnimation: null

  _onUpdate: emptyFunction

  _onEnd: emptyFunction

  _onEndQueue: []

type.defineBoundMethods

  _recomputeValue: (time) ->

    @_animationFrame = null
    return if @isDone

    # Support browsers that don't pass a timestamp.
    if typeof time isnt "number"
      time = Date.now()
      @elapsedTime = time - @startTime

    else if @_lastTime
      @elapsedTime += time - @_lastTime

    else
      @elapsedTime = Date.now() - @startTime

    value = @__computeValue time
    value = Math.round(value * 1e3) / 1e3

    @__onAnimationUpdate value
    @_lastTime = time

    unless @isDone
      @_onUpdate value
      @_requestAnimationFrame()
      return

#
# Prototype
#

type.defineGetters

  isPending: -> @_state is 0

  isActive: -> @_state is 1

  isDone: -> @_state is 2

type.defineHooks

  __computeValue: null

  __onAnimationStart: (animated) ->
    if @_useNativeDriver
    then @_startNativeAnimation animated
    else @_requestAnimationFrame()

  __onAnimationUpdate: emptyFunction

  __onAnimationEnd: emptyFunction

  __getNativeConfig: ->
    throw Error "This animation type does not support native offloading!"

type.defineMethods

  start: (animated, onUpdate) ->
    assertType onUpdate, Function.Maybe

    return this unless @isPending
    @_state += 1

    if @_isInteraction
      id = @_createInteraction()

    if animation = animated._animation
      @_previousAnimation = animation
      animation.stop()

    if onUpdate
      onUpdate = animated.didSet onUpdate

    unless @_useNativeDriver
      @_onUpdate = (newValue) ->
        animated._updateValue newValue, no

    @_onEnd = (finished) =>
      @_onEnd = emptyFunction

      @_clearInteraction id
      @__onAnimationEnd finished
      animated._animation = null

      # Prevent further updates.
      @_onUpdate = emptyFunction
      onUpdate?.detach()
      if @_useNativeDriver
        NativeAnimated.removeUpdateListener animated

      @_flushEndQueue finished
      return

    animated._animation = this
    @_startAnimation animated
    return this

  stop: (finished = no) ->
    assertType finished, Boolean
    @_stopAnimation finished

  then: (onEnd) ->
    assertType onEnd, Function
    if queue = @_onEndQueue
      queue.push onEnd
    return this

  _requestAnimationFrame: (callback) ->
    @_animationFrame or @_animationFrame = injected.call "requestAnimationFrame", callback or @_recomputeValue

  _cancelAnimationFrame: ->
    if @_animationFrame
      injected.call "cancelAnimationFrame", @_animationFrame
      @_animationFrame = null
      return

  _startAnimation: (animated) ->

    if @fromValue?
    then animated._updateValue @fromValue, @_useNativeDriver
    else @fromValue = animated._value

    @startTime = Date.now()
    unless @_useNativeDriver
      mutable.define this, "elapsedTime", {value: 0}

    @__onAnimationStart animated
    return

  _startNativeAnimation: (animated) ->
    @_nativeTag = NativeAnimated.createAnimationTag()
    animated.__markNative()
    animatedTag = animated.__getNativeTag()
    animationConfig = @__getNativeConfig()
    NativeAnimated.addUpdateListener animated
    NativeAnimated.startAnimatingNode @_nativeTag, animatedTag, animationConfig, (data) =>
      unless @isDone
        @_state += 1
        @_onEnd data.finished
        return

  _stopAnimation: (finished) ->
    unless @isDone
      @_state += 1

      if @_nativeTag
      then NativeAnimated.stopAnimation @_nativeTag
      else @_cancelAnimationFrame()

      @_onEnd finished
      return

  _flushEndQueue: (finished) ->
    queue = @_onEndQueue
    @_onEndQueue = null
    for onEnd in queue
      onEnd finished
    return

  _assertNumber: (value) ->
    assertType value, Number
    return

  _createInteraction: ->
    return injected.get("InteractionManager").createInteractionHandle()

  _clearInteraction: (handle) ->
    if handle?
      injected.get("InteractionManager").clearInteractionHandle handle
      return

module.exports = Animation = type.build()
