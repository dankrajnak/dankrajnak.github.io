'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PerspectiveSquare = function () {
    function PerspectiveSquare(canvas, leftTopCorner, boxWidth) {
        _classCallCheck(this, PerspectiveSquare);

        this._canvas = canvas;
        this._context = this._canvas.getContext('2d');
        this._originalSquare = [leftTopCorner, [leftTopCorner[0] + boxWidth, leftTopCorner[1]], [leftTopCorner[0] + boxWidth, leftTopCorner[1] + boxWidth], [leftTopCorner[0], leftTopCorner[1] + boxWidth]];
        this._squareCenter = [leftTopCorner[0] + boxWidth / 2, leftTopCorner[1] + boxWidth / 2];
        //Deep copy
        this._square = this._originalSquare.map(function (point) {
            return point.slice();
        });
        this._boxWidth = boxWidth;
        this._leftTopCorner = leftTopCorner;

        //Public attributes
        this.depth = 100; //Depth of perspective
        this.lineColor = 'black';
        this.background = 'white';
        this.lineWeight = 3;
        this.maxSquareDisplacement = 60; //Max front square moves away from the vanishPoint.
    }

    _createClass(PerspectiveSquare, [{
        key: 'drawSquare',
        value: function drawSquare(vanishPoint) {
            var _this = this;

            var canvasWidth = this._canvas.width;
            var canvasHeight = this._canvas.height;
            this._context.clearRect(0, 0, canvasWidth, canvasHeight, this.background);
            this._context.fillStyle = this.background;
            this._context.fillRect(0, 0, canvasWidth, canvasHeight);
            this._context.lineWidth = this.lineWeight;
            this._context.strokeStyle = this.lineColor;

            //Move square
            var displacementVector = [0, 0];
            var squareDisplacement = Math.min(this._euclideanDistance(this._squareCenter, vanishPoint), this.maxSquareDisplacement);

            displacementVector = this._distanceDownLine(this._squareCenter, vanishPoint, squareDisplacement);
            displacementVector[0] -= this._squareCenter[0];
            displacementVector[1] -= this._squareCenter[1];

            for (var i = 0; i < 4; i++) {
                this._square[i][0] = this._originalSquare[i][0] - displacementVector[0];
                this._square[i][1] = this._originalSquare[i][1] - displacementVector[1];
            }

            /*---- Calculate second square -----*/
            var secondSquare = [];
            if (this._euclideanDistance(vanishPoint, this._square[0]) < this.depth) {
                for (var _i = 0; _i < 4; _i++) {
                    secondSquare.push(vanishPoint);
                }
            } else {
                secondSquare.push(this._distanceDownLine(this._square[0], vanishPoint, this.depth));
                secondSquare.push([this._calculateIntersection(this._square[1], vanishPoint, true, secondSquare[0][1]), secondSquare[0][1]]);
                secondSquare.push([secondSquare[1][0], this._calculateIntersection(this._square[2], vanishPoint, false, secondSquare[1][0])]);
                secondSquare.push([this._calculateIntersection(this._square[3], vanishPoint, true, secondSquare[2][1]), secondSquare[2][1]]);

                //Draw second square
                this._context.beginPath();
                this._context.moveTo(secondSquare[secondSquare.length - 1][0], secondSquare[secondSquare.length - 1][1]);
                secondSquare.forEach(function (point) {
                    return _this._context.lineTo(point[0], point[1]);
                });
                this._context.stroke();
                this._context.closePath();
            }
            this._square.forEach(function (point, index) {
                //I'm not sure what this first part does.
                _this._context.beginPath();
                _this._context.moveTo(point[0], point[1]);
                _this._context.lineTo(secondSquare[index][0], secondSquare[index][1]);
                _this._context.stroke();
                _this._context.closePath();

                //Draw dash lines to second square
                _this._context.beginPath();
                _this._context.moveTo(secondSquare[index][0], secondSquare[index][1]);
                _this._context.setLineDash([0, 4, _this.lineWeight, 4]);
                _this._context.lineTo(vanishPoint[0], vanishPoint[1]);
                _this._context.stroke();
                _this._context.closePath();
                _this._context.setLineDash([]);
            });
            //Draw first square
            this._drawSquareOnContext();
        }
    }, {
        key: 'resize',
        value: function resize(leftTopCorner, boxWidth) {
            this._originalSquare = [leftTopCorner, [leftTopCorner[0] + boxWidth, leftTopCorner[1]], [leftTopCorner[0] + boxWidth, leftTopCorner[1] + boxWidth], [leftTopCorner[0], leftTopCorner[1] + boxWidth]];
            this._squareCenter = [leftTopCorner[0] + boxWidth / 2, leftTopCorner[1] + boxWidth / 2];
            //Deep copy
            this._square = this._originalSquare.map(function (point) {
                return point.slice();
            });
            this._boxWidth = boxWidth;
            this._leftTopCorner = leftTopCorner;
        }
    }, {
        key: '_drawSquareOnContext',
        value: function _drawSquareOnContext() {
            var _this2 = this;

            this._context.beginPath();
            this._context.moveTo(this._square[this._square.length - 1][0], this._square[this._square.length - 1][1]);
            this._square.forEach(function (point) {
                return _this2._context.lineTo(point[0], point[1]);
            });
            this._context.stroke();
            this._context.closePath;
        }
    }, {
        key: '_calculateIntersection',
        value: function _calculateIntersection(pointA, pointB, horizontal, intLine) {
            /* Calculates the intersection between a given line and a horizontal or vertical line. */
            if (horizontal) {
                //Using two points form of the line
                //x = (x2-x1)(y-y1)/(y2-y1)+x1
                return (pointB[0] - pointA[0]) * (intLine - pointA[1]) / (pointB[1] - pointA[1]) + pointA[0];
            } else {
                //Using two points form of the line
                //y = (y2 -y1)(x-x1)/(x2-x1)+y1
                return (pointB[1] - pointA[1]) * (intLine - pointA[0]) / (pointB[0] - pointA[0]) + pointA[1];
            }
        }
    }, {
        key: '_distanceDownLine',
        value: function _distanceDownLine(pointA, pointB, distance) {
            /* Returns a point the given distance down the line specified */

            //Similar triangles
            var A = pointB[1] - pointA[1];
            var B = pointB[0] - pointA[0];
            var C = this._euclideanDistance(pointA, pointB);

            var x = B - B * (C - distance) / C;
            var y = A - A * (C - distance) / C;

            return [pointA[0] + x, pointA[1] + y];
        }
    }, {
        key: '_euclideanDistance',
        value: function _euclideanDistance(pointA, pointB) {
            //sqrt(a^2+b^2)
            return Math.sqrt(Math.pow(pointA[0] - pointB[0], 2) + Math.pow(pointA[1] - pointB[1], 2));
        }
    }, {
        key: 'boxWidth',
        get: function get() {
            return this._boxWidth;
        }
    }, {
        key: 'leftTopCorner',
        get: function get() {
            return this._leftTopCorner;
        }
    }]);

    return PerspectiveSquare;
}();
//Author: Daniel Krajnak


var Typewriter = function () {
    /**
    Makes it look like the supplied texts are being typed into the element.
    
    The typewriter performs operations works asynchronously.  Think of each method as adding
    a number of operations to a "delay sequence" or queue.  Therefore, please DON'T code things like:
    
    while(true){
        typewriter.typeNextText()
        typeWriter.deleteAllCharacters();
    }
    
    The delay sequence would get HUGE.  Not good. Use typewriter.play().  
    If you want to get your hands dirty and monitor the delaySequence, it's provided
    as a get-only property.
    
    Params:
        texts = an array of strings to be typed.
        el = the html element in which the texts should be typed.
        errorProbability? = the probability that a given character will be mistyped.
     
    Properties:
        isTyping
            Returns a boolean.  True if the typewriter is currently typing, false if otherwise.
        
        delaySequence
            Returns the a deep copy of the current delaysequence: a queue containing all operations and their delays.
    
    Public methods:
        Just a note about delays:
            DelayBase = number of milliseconds, on average, typing a character, deleting a character, or pausing will take
            DelayVariance = number of milliseconds the delay will vary randomly around the base.  Must be <= base.
            
        pause(delayBase?, delayVariance?)
            Adds a pause for a specified number of milliseconds.
        
        deleteCharacter(delayBase?, delayVariance?)
            Deletes a character from the displayed text.  If there's no characters left, it won't do anything
            (you're welcome).
        
        deleteCharacters(numCharacters, delayBase?, delayVariance?)
            Deletes the given numberOfCharacters.  If numberOfCharacters is longer than the typed text,
            this method will just delete the typed text (you're welcome).
            
        deleteAllCharacters(delayBase?, delayVariance?)
            Deletes all currently display characters.
        
        play(playParamObject?)
            Plays through the texts—types next text, pauses, deletes it, pauses, repeat.
            
        stop(immediately?)
            Stops the typewriter from playing.  If immediately is false or not supplied, the typewriter will
            finish typing and deleting the current text.  If immediately is true, it will stop immediately.
            
        typeCharacter(character?, delayBase?, delayVariance?)
            Types the next character with a delay that varies randomly within the given variance
            around the base delay.  If no character is supplied, types the next character in texts.
            Returns false if there's not a character to be typed, otherwise returns true.
        
        typeNextText(delayBase?, delayVariance?)
            Types the next full text.  Note: does not delete the previous text first.
    
    Everything else is private.  No touching.  
        
    */

    function Typewriter(texts, el) {
        var errorProbability = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : .03;

        _classCallCheck(this, Typewriter);

        this._texts = texts;
        this._el = el;

        //Probability that a character will be mistyped
        this.errorProbability = errorProbability;

        //Current text displayed in the element.
        this._currentText = el.innerHTML;

        //Used to manage delays in adding characters.
        this._delaySequence = [];
        this._delaySequenceRunning = false;

        //Length of currentText after all delays in the delay sequence run.
        this._lengthAfterDelay = 0;

        //Used in play() to rotate through texts
        this._play = false;
        this._stopImmediately = false;

        //Which text in this._texts we're on.
        this._textIndex = 0;

        //Text to type next (used for play and typeNextText)
        this._textToType = this._texts[0].split("");

        //Constants
        this._DEFAULT_TYPE_DELAY_BASE = 150;
        this._DEFAULT_TYPE_DELAY_VARIANCE = 50;
        this._DEFAULT_DELETE_DELAY_BASE = 80;
        this._DEFAULT_DELETE_DELAY_VARIANCE = 10;
        this._DEFAULT_PAUSE_AMOUNT = 2000;

        this._playParamaters;
    }

    _createClass(Typewriter, [{
        key: 'pause',


        //Public Methods:
        value: function pause() {
            var pauseAmount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this._DEFAULT_PAUSE_AMOUNT;
            var variance = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            this._delay(function () {}, pauseAmount, variance);
            return this;
        }
    }, {
        key: 'deleteAllCharacters',
        value: function deleteAllCharacters() {
            var delayBase = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this._DEFAULT_DELETE_DELAY_BASE;
            var delayVariance = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._DEFAULT_DELETE_DELAY_VARIANCE;

            var length = this._lengthAfterDelay;
            for (var i = 0; i < length; i++) {
                this.deleteCharacter(delayBase, delayVariance);
            }
            return this;
        }
    }, {
        key: 'deleteCharacter',
        value: function deleteCharacter() {
            var _this3 = this;

            var delayBase = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this._DEFAULT_DELETE_DELAY_BASE;
            var delayVariance = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._DEFAULT_DELETE_DELAY_VARIANCE;

            this._lengthAfterDelay = Math.max(this._lengthAfterDelay - 1, 0);
            this._delay(function () {
                if (_this3._currentText.length == 0) return false;
                _this3._currentText = _this3._currentText.substr(0, _this3._currentText.length - 1);
                _this3._displayCurrentText();
            }, delayBase, delayVariance);
            return this;
        }
    }, {
        key: 'deleteCharacters',
        value: function deleteCharacters(numCharacters) {
            var delayBase = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._DEFAULT_DELETE_DELAY_BASE;
            var delayVariance = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this._DEFAULT_DELETE_DELAY_VARIANCE;

            for (var i = 0; i < numCharacters; i++) {
                this.deleteCharacter(delayBase, delayVariance);
            }
            return this;
        }
    }, {
        key: 'play',
        value: function play() {
            var pause = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this._DEFAULT_PAUSE_AMOUNT;
            var pauseVariance = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
            var typeDelayBase = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this._DEFAULT_TYPE_DELAY_BASE;
            var typeDelayVariance = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : this._DEFAULT_TYPE_DELAY_VARIANCE;
            var deleteDelayBase = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : this._DEFAULT_DELETE_DELAY_BASE;
            var deleteDelayVariance = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : this._DEFAULT_DELETE_DELAY_VARIANCE;

            this._playParams = {
                pause: pause,
                pauseVariance: pauseVariance,
                typeDelayBase: typeDelayBase,
                typeDelayVariance: typeDelayVariance,
                deleteDelayBase: deleteDelayBase,
                deleteDelayVariance: deleteDelayVariance
            };
            this._play = true;
            if (!this._delaySequenceRunning) {
                this._executeNextDelay();
            }
            return this;
        }
    }, {
        key: 'stop',
        value: function stop() {
            var immediately = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            this._play = false;
            if (immediately) {
                this._stopImmediately = true;
                this._delaySequenceRunning = false; //Added here so that isTyping will update immediately.
            }
            return this;
        }
    }, {
        key: 'typeCharacter',
        value: function typeCharacter() {
            var character = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

            var _this4 = this;

            var delayBase = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._DEFAULT_TYPE_DELAY_BASE;
            var delayVariance = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this._DEFAULT_TYPE_DELAY_VARIANCE;

            if (character == null) {
                if (this._textToType.length > 0) {
                    character = this._textToType.unshift();
                } else {
                    return false;
                }
            }
            this._lengthAfterDelay++;

            //Maybe make a mistake
            if (Math.random() <= this.errorProbability) {
                var mistake = this._getMistakeCharacter(character);
                this._lengthAfterDelay++;
                this._delay(function () {
                    if (mistake) _this4._currentText = _this4._currentText.concat(mistake);
                    _this4._displayCurrentText();
                });
                this.pause(200, 100);
                this.deleteCharacters(1);
            }
            this._delay(function () {
                _this4._currentText = _this4._currentText.concat(character);
                _this4._displayCurrentText();
            }, delayBase, delayVariance);
            return this;
        }
    }, {
        key: 'typeNextText',
        value: function typeNextText() {
            var _this5 = this;

            var delayBase = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this._DEFAULT_TYPE_DELAY_BASE;
            var delayVariance = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._DEFAULT_TYPE_DELAY_VARIANCE;

            this._textToType = this._texts[this._textIndex].split("");
            this._textIndex = (this._textIndex + 1) % this._texts.length;
            this._textToType.forEach(function (character) {
                _this5.typeCharacter(character, delayBase, delayVariance);
            });
            return this;
        }

        /*      Private Members     */

    }, {
        key: '_delay',
        value: function _delay(afterDelay, delayBase) {
            var delayVariance = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

            this._delaySequence.push({
                function: afterDelay,
                delay: delayBase + Math.random() * delayVariance - delayVariance / 2
            });
            if (!this._delaySequenceRunning) this._executeNextDelay();
        }
    }, {
        key: '_displayCurrentText',
        value: function _displayCurrentText() {
            this._el.innerHTML = this._currentText;
        }
    }, {
        key: '_executeNextDelay',
        value: function _executeNextDelay() {
            var _this6 = this;

            if (this._stopImmediately) {
                this._stopImmediately = false;
            } else {
                this._delaySequenceRunning = true;
                if (this._delaySequence.length > 0) {
                    var nextDelay = this._delaySequence.shift();
                    setTimeout(function () {
                        nextDelay.function();
                        _this6._executeNextDelay();
                    }, nextDelay.delay);
                } else {
                    if (this._play) {
                        this.typeNextText(this._playParams.typeDelayBase, this._playParams.typeDelayVariance);
                        this.pause(this._playParams.pause, this._playParams.pauseVariance);
                        this.deleteAllCharacters(this._playParams.deleteDelayBase, this._playParams.deleteDelayVariance);
                        this.pause(this._playParams.pause, this._playParams.pauseVariance);
                        this._executeNextDelay();
                    } else {
                        this._delaySequenceRunning = false;
                    }
                }
            }
        }
    }, {
        key: '_getMistakeCharacter',
        value: function _getMistakeCharacter(character) {
            var keyboard = ['qwertyuiop[', 'asdfghjkl;', 'zxcvbnm,'];
            var uppercase = character.toUpperCase() == character;
            var isLetter = 'abcdefghijklmnopqrstuvwxyz'.indexOf(character.toLowerCase()) != -1;

            if (isLetter) {
                /*With a 90% chance, if the character is uppercase, make the
                mistake character the lowercase version of the uppercase.
                If it's lowercase, reverse the probability.*/
                var chanceOfCaseMistake = uppercase ? .9 : .1;
                if (Math.random() <= chanceOfCaseMistake) {
                    return uppercase ? character.toLowerCase() : character.toUpperCase();
                }
                //Otherwise make a big finger mistake
                for (var i = 0; i < keyboard.length; i++) {
                    var index = keyboard[i].indexOf(character.toLowerCase());
                    if (index != -1) {
                        switch (index) {
                            case 0:
                                return keyboard[i][1];

                            case keyboard[i].length - 1:
                                return keyboard[i].length - 2;

                            default:
                                return Math.random() <= .5 ? keyboard[i][index - 1] : keyboard[i][index + 1];
                        }
                    }
                }
            }

            //Handle special characters
            //TODO: this doesn't handle ' ' (space) very well... or at all.
            var specialCharacters = ['1234567890-=', 'p[]\\', 'l;\'', 'm,./'];
            var specialCharactersShift = ['!@#$%^&*()_+', 'P{}|', 'L:\"', 'M<>?'];

            for (var _i2 = 0; _i2 < specialCharactersShift.length; _i2++) {
                var shiftedIndex = specialCharactersShift[_i2].indexOf(character);
                if (shiftedIndex -= -1) {
                    //It's shifted, so with a 90% chance, make a shift mistake.  Otherwise, big finger mistake.
                    if (Math.random() <= .9) {
                        return specialCharacters[_i2][shiftedIndex];
                    }
                    switch (shiftedIndex) {
                        case 0:
                            return specialCharactersShift[_i2][1];

                        case specialCharactersShift[_i2].length - 1:
                            return specialCharactersShift[_i2][specialCharactersShift[_i2].length - 2];

                        default:
                            return Math.random() <= .5 ? specialCharactersShift[_i2][shiftedIndex - 1] : specialCharactersShift[_i2][shiftedIndex + 1];
                    }
                }
            }

            for (var _i3 = 0; _i3 < specialCharacters.length; _i3++) {
                var _index = specialCharactersShift[_i3].indexOf(character);
                if (_index -= -1) {
                    //It's not shifted, so with a 10% chance, make a shift mistake.  Otherwise, big finger mistake.
                    if (Math.random() <= .1) {
                        return specialCharactersShift[_i3][_index];
                    }
                    switch (_index) {
                        case 0:
                            return specialCharactersShift[_i3][1];

                        case specialCharactersShift[_i3].length - 1:
                            return specialCharactersShift[_i3][specialCharactersShift[_i3].length - 2];

                        default:
                            return Math.random() <= .5 ? specialCharactersShift[_i3][_index - 1] : specialCharactersShift[_i3][_index + 1];
                    }
                }
            }

            //As a default, just return the given character.
            if (character) return character;
            //Or a space if that character is undefined.
            return ' ';
        }
    }, {
        key: 'isTyping',
        get: function get() {
            return this._delaySequenceRunning;
        }
    }, {
        key: 'delaySequence',
        get: function get() {
            /*Just a fun little note:
            No need for a lock here because, though Javascript is asynchronous, it's based on
            an event loop model which guarantees this function won't be interrupted while it's
            coping the delay sequence */
            var copy = [];
            this._delaySequence.forEach(function (delay) {
                return copy.push(Object.assign({}, delay));
            });
            return copy;
        }
    }]);

    return Typewriter;
}();

var Wanderer = function () {
    function Wanderer(width, height) {
        var leftCorner = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [0, 0];

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
    }

    _createClass(Wanderer, [{
        key: 'startWandering',
        value: function startWandering(callBack, time) {
            var delay = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
            var from = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : this._getNewPoint();

            this._wandering = true;
            this._delay = delay;
            this.wanderToFrom(this._getNewPoint(), from, time, callBack);
        }
    }, {
        key: 'stopWandering',
        value: function stopWandering() {
            var immediately = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            this._wandering = false;
            if (immediately) {
                window.cancelAnimationFrame(this._animationFrame);
                this._wanderToFromStart = null;
            }
        }
    }, {
        key: 'wanderToFrom',
        value: function wanderToFrom(to, from, time, callback) {
            var _this7 = this;

            this._alpha = Math.random() * 3 + 2 | 0; //Randomly pick new alpha for easing function
            this._distanceFromToToFrom = this._euclideanDistance(to, from);
            this._animationFrame = window.requestAnimationFrame(function (timeStep) {
                return _this7._step(to, from, time, callback, timeStep);
            });
        }
    }, {
        key: '_step',
        value: function _step(to, from, totalTime, callback, timeStep) {
            var _this8 = this;

            if (!this._wanderToFromStart) this._wanderToFromStart = timeStep;

            var progress = timeStep - this._wanderToFromStart;
            callback(this._interpolate(to, from, Math.min(1, progress / totalTime)));
            if (progress < totalTime) this._animationFrame = window.requestAnimationFrame(function (newTimeStep) {
                return _this8._step(to, from, totalTime, callback, newTimeStep);
            });else {
                this._wanderToFromStart = null;
                //If wandering, wander from this point to a new one
                if (this._wandering) {
                    if (this._delay > 0) {
                        setTimeout(function () {
                            return _this8.wanderToFrom(_this8._getNewPoint(), to, totalTime, callback);
                        }, this._delay);
                    } else {
                        this.wanderToFrom(this._getNewPoint(), to, totalTime, callback);
                    }
                }
            }
        }
    }, {
        key: '_interpolate',
        value: function _interpolate(to, from, t) {
            return this._distanceDownLine(from, to, this._distanceFromToToFrom * this._easeInOut(t));
        }
    }, {
        key: '_easeInOut',
        value: function _easeInOut(t) {
            //easing function = t^a/(t^a+(1-t)^a).
            return Math.pow(t, this._alpha) / (Math.pow(t, this._alpha) + Math.pow(1 - t, this._alpha));
        }
    }, {
        key: '_distanceDownLine',
        value: function _distanceDownLine(pointA, pointB, distance) {
            /* Returns a point the given distance down the line specified */

            //Similar triangles
            var A = pointB[1] - pointA[1];
            var B = pointB[0] - pointA[0];
            if (A == 0 && B == 0) return pointA;
            var C = this._euclideanDistance(pointA, pointB);

            var x = B - B * (C - distance) / C;
            var y = A - A * (C - distance) / C;

            return [pointA[0] + x, pointA[1] + y];
        }
    }, {
        key: '_getNewPoint',
        value: function _getNewPoint() {
            return [this.leftCorner[0] + Math.random() * this.width, this.leftCorner[1] + Math.random() * this.height];
        }
    }, {
        key: '_euclideanDistance',
        value: function _euclideanDistance(pointA, pointB) {
            //sqrt(a^2+b^2)
            return Math.sqrt(Math.pow(pointA[0] - pointB[0], 2) + Math.pow(pointA[1] - pointB[1], 2));
        }
    }]);

    return Wanderer;
}();

var typewriterText = ["Can websites be a form of art?", "Let's build something cool.", "Scroll down to see more.", "Can websites be a form of art?", "Wait, you\'re still reading?", "Well, I\'m flattered.", "Thanks for riding it out to the end", "You should check out the song...", "\'Jungle\' by Tash Sultana", "Hopefully you like it!", "Hope you have a great day :)"];

var typewriter = new Typewriter(typewriterText, document.getElementById('typewriter'));
setTimeout(function () {
    return typewriter.play();
}, 500);

var canvas = document.getElementById('perspective');

var container = document.querySelector('.banner');
container.setAttribute('style', 'height: ' + window.innerHeight + 'px');

var width = canvas.clientWidth,
    height = canvas.clientHeight;
canvas.setAttribute('width', width);
canvas.setAttribute('height', height);

var perspective = new PerspectiveSquare(canvas, [width * .4, height * .4], width * .2);

//For smaller screens
if (width < 430) perspective.depth = 40;

perspective.lineWeight = 2;
perspective.background = '#111'; //dark grey
perspective.lineColor = '#CCB255'; //gold

console.log(perspective.leftTopCorner);

//Ok, this is a mess.  Need to add some functionality to wanderer to abstract away these calculations.
var wanderLeftTopCorner = [Math.max(0, perspective.leftTopCorner[0] - perspective.boxWidth), Math.max(0, perspective.leftTopCorner[1] - perspective.boxWidth)];
var wanderer = new Wanderer(Math.min(perspective.boxWidth * 3, width - wanderLeftTopCorner[0]), Math.min(perspective.boxWidth * 3, height - wanderLeftTopCorner[1]), wanderLeftTopCorner);

//Magic numbers.  Sorry.  2000 = transition time, 500 = delay.
wanderer.startWandering(function (pos) {
    return perspective.drawSquare(pos);
}, 2000, 500);

container.addEventListener('mouseover', function (event) {
    return wanderer.stopWandering(true);
});
container.addEventListener('mousemove', function (event) {
    return perspective.drawSquare([event.pageX, event.pageY]);
});
container.addEventListener('mouseout', function (event) {
    return wanderer.startWandering(function (pos) {
        return perspective.drawSquare(pos);
    }, 2000, 500, [event.pageX, event.pageY]);
});

window.addEventListener('resize', function () {
    width = canvas.clientWidth, height = canvas.clientHeight;
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);
    perspective.resize([width * .4, height * .4], width * .2);
    if (width < 430) perspective.depth = 40;else {
        perspective.depth = 100;
    }
    container.setAttribute('style', 'height: ' + window.innerHeight + 'px');

    wanderer.stopWandering(true);
    var wanderer = new Wanderer(Math.min(perspective.boxWidth * 3, width - wanderLeftTopCorner[0]), Math.min(perspective.boxWidth * 3, height - wanderLeftTopCorner[1]), wanderLeftTopCorner);

    //Magic numbers.  Sorry.  2000 = transition time, 500 = delay.
    wanderer.startWandering(function (pos) {
        return perspective.drawSquare(pos);
    }, 2000, 500);
});