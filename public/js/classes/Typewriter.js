"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

//Author: Daniel Krajnak

var Typewriter = (function () {
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
        var errorProbability = arguments[2] === undefined ? 0.03 : arguments[2];

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

    _createClass(Typewriter, {
        isTyping: {
            get: function () {
                return this._delaySequenceRunning;
            }
        },
        delaySequence: {
            get: function () {
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
        },
        pause: {

            //Public Methods:
            value: function pause() {
                var pauseAmount = arguments[0] === undefined ? this._DEFAULT_PAUSE_AMOUNT : arguments[0];
                var variance = arguments[1] === undefined ? 0 : arguments[1];

                this._delay(function () {}, pauseAmount, variance);
                return this;
            }
        },
        deleteAllCharacters: {
            value: function deleteAllCharacters() {
                var delayBase = arguments[0] === undefined ? this._DEFAULT_DELETE_DELAY_BASE : arguments[0];
                var delayVariance = arguments[1] === undefined ? this._DEFAULT_DELETE_DELAY_VARIANCE : arguments[1];

                var length = this._lengthAfterDelay;
                for (var i = 0; i < length; i++) {
                    this.deleteCharacter(delayBase, delayVariance);
                }
                return this;
            }
        },
        deleteCharacter: {
            value: function deleteCharacter() {
                var _this = this;

                var delayBase = arguments[0] === undefined ? this._DEFAULT_DELETE_DELAY_BASE : arguments[0];
                var delayVariance = arguments[1] === undefined ? this._DEFAULT_DELETE_DELAY_VARIANCE : arguments[1];

                this._lengthAfterDelay = Math.max(this._lengthAfterDelay - 1, 0);
                this._delay(function () {
                    if (_this._currentText.length == 0) return false;
                    _this._currentText = _this._currentText.substr(0, _this._currentText.length - 1);
                    _this._displayCurrentText();
                }, delayBase, delayVariance);
                return this;
            }
        },
        deleteCharacters: {
            value: function deleteCharacters(numCharacters) {
                var delayBase = arguments[1] === undefined ? this._DEFAULT_DELETE_DELAY_BASE : arguments[1];
                var delayVariance = arguments[2] === undefined ? this._DEFAULT_DELETE_DELAY_VARIANCE : arguments[2];

                for (var i = 0; i < numCharacters; i++) {
                    this.deleteCharacter(delayBase, delayVariance);
                }
                return this;
            }
        },
        play: {
            value: function play() {
                var pause = arguments[0] === undefined ? this._DEFAULT_PAUSE_AMOUNT : arguments[0];
                var pauseVariance = arguments[1] === undefined ? 0 : arguments[1];
                var typeDelayBase = arguments[2] === undefined ? this._DEFAULT_TYPE_DELAY_BASE : arguments[2];
                var typeDelayVariance = arguments[3] === undefined ? this._DEFAULT_TYPE_DELAY_VARIANCE : arguments[3];
                var deleteDelayBase = arguments[4] === undefined ? this._DEFAULT_DELETE_DELAY_BASE : arguments[4];
                var deleteDelayVariance = arguments[5] === undefined ? this._DEFAULT_DELETE_DELAY_VARIANCE : arguments[5];

                this._playParams = {
                    pause: pause,
                    pauseVariance: pauseVariance,
                    typeDelayBase: typeDelayBase,
                    typeDelayVariance: typeDelayVariance,
                    deleteDelayBase: deleteDelayBase,
                    deleteDelayVariance: deleteDelayVariance };
                this._play = true;
                if (!this._delaySequenceRunning) {
                    this._executeNextDelay();
                }
                return this;
            }
        },
        stop: {
            value: function stop() {
                var immediately = arguments[0] === undefined ? false : arguments[0];

                this._play = false;
                if (immediately) {
                    this._stopImmediately = true;
                    this._delaySequenceRunning = false; //Added here so that isTyping will update immediately.
                }
                return this;
            }
        },
        typeCharacter: {
            value: function typeCharacter() {
                var _this = this;

                var character = arguments[0] === undefined ? null : arguments[0];
                var delayBase = arguments[1] === undefined ? this._DEFAULT_TYPE_DELAY_BASE : arguments[1];
                var delayVariance = arguments[2] === undefined ? this._DEFAULT_TYPE_DELAY_VARIANCE : arguments[2];

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
                    (function () {
                        var mistake = _this._getMistakeCharacter(character);
                        _this._lengthAfterDelay++;
                        _this._delay(function () {
                            if (mistake) _this._currentText = _this._currentText.concat(mistake);
                            _this._displayCurrentText();
                        });
                        _this.pause(200, 100);
                        _this.deleteCharacters(1);
                    })();
                }
                this._delay(function () {
                    _this._currentText = _this._currentText.concat(character);
                    _this._displayCurrentText();
                }, delayBase, delayVariance);
                return this;
            }
        },
        typeNextText: {
            value: function typeNextText() {
                var _this = this;

                var delayBase = arguments[0] === undefined ? this._DEFAULT_TYPE_DELAY_BASE : arguments[0];
                var delayVariance = arguments[1] === undefined ? this._DEFAULT_TYPE_DELAY_VARIANCE : arguments[1];

                this._textToType = this._texts[this._textIndex].split("");
                this._textIndex = (this._textIndex + 1) % this._texts.length;
                this._textToType.forEach(function (character) {
                    _this.typeCharacter(character, delayBase, delayVariance);
                });
                return this;
            }
        },
        _delay: {

            /*      Private Members     */

            value: function _delay(afterDelay, delayBase) {
                var delayVariance = arguments[2] === undefined ? 0 : arguments[2];

                this._delaySequence.push({
                    "function": afterDelay,
                    delay: delayBase + Math.random() * delayVariance - delayVariance / 2
                });
                if (!this._delaySequenceRunning) this._executeNextDelay();
            }
        },
        _displayCurrentText: {
            value: function _displayCurrentText() {
                this._el.innerHTML = this._currentText;
            }
        },
        _executeNextDelay: {
            value: function _executeNextDelay() {
                var _this = this;

                if (this._stopImmediately) {
                    this._stopImmediately = false;
                } else {
                    this._delaySequenceRunning = true;
                    if (this._delaySequence.length > 0) {
                        (function () {
                            var nextDelay = _this._delaySequence.shift();
                            setTimeout(function () {
                                nextDelay["function"]();
                                _this._executeNextDelay();
                            }, nextDelay.delay);
                        })();
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
        },
        _getMistakeCharacter: {
            value: function _getMistakeCharacter(character) {
                var keyboard = ["qwertyuiop[", "asdfghjkl;", "zxcvbnm,"];
                var uppercase = character.toUpperCase() == character;
                var isLetter = "abcdefghijklmnopqrstuvwxyz".indexOf(character.toLowerCase()) != -1;

                if (isLetter) {
                    /*With a 90% chance, if the character is uppercase, make the
                    mistake character the lowercase version of the uppercase.
                    If it's lowercase, reverse the probability.*/
                    var chanceOfCaseMistake = uppercase ? 0.9 : 0.1;
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
                                    return Math.random() <= 0.5 ? keyboard[i][index - 1] : keyboard[i][index + 1];
                            }
                        }
                    }
                }

                //Handle special characters
                //TODO: this doesn't handle ' ' (space) very well... or at all.
                var specialCharacters = ["1234567890-=", "p[]\\", "l;'", "m,./"];
                var specialCharactersShift = ["!@#$%^&*()_+", "P{}|", "L:\"", "M<>?"];

                for (var i = 0; i < specialCharactersShift.length; i++) {
                    var shiftedIndex = specialCharactersShift[i].indexOf(character);
                    if (shiftedIndex -= -1) {
                        //It's shifted, so with a 90% chance, make a shift mistake.  Otherwise, big finger mistake.
                        if (Math.random() <= 0.9) {
                            return specialCharacters[i][shiftedIndex];
                        }
                        switch (shiftedIndex) {
                            case 0:
                                return specialCharactersShift[i][1];

                            case specialCharactersShift[i].length - 1:
                                return specialCharactersShift[i][specialCharactersShift[i].length - 2];

                            default:
                                return Math.random() <= 0.5 ? specialCharactersShift[i][shiftedIndex - 1] : specialCharactersShift[i][shiftedIndex + 1];
                        }
                    }
                }

                for (var i = 0; i < specialCharacters.length; i++) {
                    var index = specialCharactersShift[i].indexOf(character);
                    if (index -= -1) {
                        //It's not shifted, so with a 10% chance, make a shift mistake.  Otherwise, big finger mistake.
                        if (Math.random() <= 0.1) {
                            return specialCharactersShift[i][index];
                        }
                        switch (index) {
                            case 0:
                                return specialCharactersShift[i][1];

                            case specialCharactersShift[i].length - 1:
                                return specialCharactersShift[i][specialCharactersShift[i].length - 2];

                            default:
                                return Math.random() <= 0.5 ? specialCharactersShift[i][index - 1] : specialCharactersShift[i][index + 1];
                        }
                    }
                }

                //As a default, just return the given character.
                if (character) {
                    return character;
                } //Or a space if that character is undefined.
                return " ";
            }
        }
    });

    return Typewriter;
})();