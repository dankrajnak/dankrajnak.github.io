"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Wanderer = (function () {
    function Wanderer(width, height) {
        var leftCorner = arguments[2] === undefined ? [0, 0] : arguments[2];

        _classCallCheck(this, Wanderer);

        this.width = width;
        this.height = height;
        this.leftCorner = leftCorner;
        this._wanderToFromStart = null;
        this._animationFrame;
        this._wandering = false;
        this._alpha = 3; //Parameter of easing function
        this._distanceFromToToFrom; //Fun one to name
        this._delay;
        console.log("WANDER");
    }

    _createClass(Wanderer, {
        startWandering: {
            value: function startWandering(callBack, time) {
                var delay = arguments[2] === undefined ? 0 : arguments[2];
                var from = arguments[3] === undefined ? this._getNewPoint() : arguments[3];

                this._wandering = true;
                this._delay = delay;
                this.wanderToFrom(this._getNewPoint(), from, time, callBack);
            }
        },
        stopWandering: {
            value: function stopWandering() {
                var immediately = arguments[0] === undefined ? false : arguments[0];

                this._wandering = false;
                if (immediately) {
                    window.cancelAnimationFrame(this._animationFrame);
                    this._wanderToFromStart = null;
                }
            }
        },
        wanderToFrom: {
            value: function wanderToFrom(to, from, time, callback) {
                var _this = this;

                this._alpha = Math.random() * 3 + 2 | 0; //Randomly pick new alpha for easing function
                this._distanceFromToToFrom = this._euclideanDistance(to, from);
                this._animationFrame = window.requestAnimationFrame(function (timeStep) {
                    return _this._step(to, from, time, callback, timeStep);
                });
            }
        },
        _step: {
            value: function _step(to, from, totalTime, callback, timeStep) {
                var _this = this;

                if (!this._wanderToFromStart) this._wanderToFromStart = timeStep;

                var progress = timeStep - this._wanderToFromStart;
                callback(this._interpolate(to, from, Math.min(1, progress / totalTime)));
                if (progress < totalTime) this._animationFrame = window.requestAnimationFrame(function (newTimeStep) {
                    return _this._step(to, from, totalTime, callback, newTimeStep);
                });else {
                    this._wanderToFromStart = null;
                    //If wandering, wander from this point to a new one
                    if (this._wandering) {
                        if (this._delay > 0) {
                            setTimeout(function () {
                                return _this.wanderToFrom(_this._getNewPoint(), to, totalTime, callback);
                            }, this._delay);
                        } else {
                            this.wanderToFrom(this._getNewPoint(), to, totalTime, callback);
                        }
                    }
                }
            }
        },
        _interpolate: {
            value: function _interpolate(to, from, t) {
                return this._distanceDownLine(from, to, this._distanceFromToToFrom * this._easeInOut(t));
            }
        },
        _easeInOut: {
            value: function _easeInOut(t) {
                //easing function = t^a/(t^a+(1-t)^a).
                return Math.pow(t, this._alpha) / (Math.pow(t, this._alpha) + Math.pow(1 - t, this._alpha));
            }
        },
        _distanceDownLine: {
            value: function _distanceDownLine(pointA, pointB, distance) {
                /* Returns a point the given distance down the line specified */

                //Similar triangles
                var A = pointB[1] - pointA[1];
                var B = pointB[0] - pointA[0];
                if (A == 0 && B == 0) {
                    return pointA;
                }var C = this._euclideanDistance(pointA, pointB);

                var x = B - B * (C - distance) / C;
                var y = A - A * (C - distance) / C;

                return [pointA[0] + x, pointA[1] + y];
            }
        },
        _getNewPoint: {
            value: function _getNewPoint() {
                return [this.leftCorner[0] + Math.random() * this.width, this.leftCorner[1] + Math.random() * this.height];
            }
        },
        _euclideanDistance: {
            value: function _euclideanDistance(pointA, pointB) {
                //sqrt(a^2+b^2)
                return Math.sqrt(Math.pow(pointA[0] - pointB[0], 2) + Math.pow(pointA[1] - pointB[1], 2));
            }
        }
    });

    return Wanderer;
})();