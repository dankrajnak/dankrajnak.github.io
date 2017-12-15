//Author: Daniel Krajnak
class Typewriter {
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


    constructor(texts, el, errorProbability = .03) {

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
    
    get isTyping(){
        return this._delaySequenceRunning;
    }
    
    get delaySequence(){
        /*Just a fun little note:
        No need for a lock here because, though Javascript is asynchronous, it's based on
        an event loop model which guarantees this function won't be interrupted while it's
        coping the delay sequence */
        let copy = [];
        this._delaySequence.forEach((delay) => copy.push(Object.assign({}, delay)));
        return copy;
    }

    //Public Methods:
    pause(pauseAmount = this._DEFAULT_PAUSE_AMOUNT, variance = 0) {
        this._delay(() => {}, pauseAmount, variance);
        return this;
    }

    deleteAllCharacters(delayBase = this._DEFAULT_DELETE_DELAY_BASE, delayVariance = this._DEFAULT_DELETE_DELAY_VARIANCE) {
        let length = this._lengthAfterDelay;
        for (let i = 0; i < length; i++) {
            this.deleteCharacter(delayBase, delayVariance);
        }
        return this;
    }

    deleteCharacter(delayBase = this._DEFAULT_DELETE_DELAY_BASE, delayVariance = this._DEFAULT_DELETE_DELAY_VARIANCE) {
        this._lengthAfterDelay = Math.max(this._lengthAfterDelay - 1, 0);
        this._delay(() => {
            if (this._currentText.length == 0) return false;
            this._currentText = this._currentText.substr(0, this._currentText.length - 1);
            this._displayCurrentText();
        }, delayBase, delayVariance);
        return this;
    }


    deleteCharacters(numCharacters, delayBase = this._DEFAULT_DELETE_DELAY_BASE, delayVariance = this._DEFAULT_DELETE_DELAY_VARIANCE) {
        for (let i = 0; i < numCharacters; i++) {
            this.deleteCharacter(delayBase, delayVariance);
        }
        return this;
    }

    play(pause = this._DEFAULT_PAUSE_AMOUNT, pauseVariance = 0,
        typeDelayBase = this._DEFAULT_TYPE_DELAY_BASE, typeDelayVariance = this._DEFAULT_TYPE_DELAY_VARIANCE,
        deleteDelayBase = this._DEFAULT_DELETE_DELAY_BASE, deleteDelayVariance = this._DEFAULT_DELETE_DELAY_VARIANCE) {
        this._playParams = {
            pause: pause,
            pauseVariance: pauseVariance,
            typeDelayBase: typeDelayBase,
            typeDelayVariance: typeDelayVariance,
            deleteDelayBase: deleteDelayBase,
            deleteDelayVariance: deleteDelayVariance,
        }
        this._play = true;
        if (!this._delaySequenceRunning) {
            this._executeNextDelay()
        }
        return this;
        
    }

    stop(immediately = false) {
        this._play = false;
        if (immediately) {
            this._stopImmediately = true;
            this._delaySequenceRunning = false; //Added here so that isTyping will update immediately.
        }
        return this;
    }

    typeCharacter(character = null, delayBase = this._DEFAULT_TYPE_DELAY_BASE, delayVariance = this._DEFAULT_TYPE_DELAY_VARIANCE) {
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
            let mistake = this._getMistakeCharacter(character);
            this._lengthAfterDelay++;
            this._delay(() => {
                this._currentText = this._currentText.concat(mistake);
                this._displayCurrentText();
            });
            this.pause(200, 100);
            this.deleteCharacters(1);
        }
        this._delay(() => {
            this._currentText = this._currentText.concat(character);
            this._displayCurrentText();
        }, delayBase, delayVariance);
        return this;
    }

    typeNextText(delayBase = this._DEFAULT_TYPE_DELAY_BASE, delayVariance = this._DEFAULT_TYPE_DELAY_VARIANCE) {
        this._textToType = this._texts[this._textIndex].split("");
        this._textIndex = (this._textIndex + 1) % this._texts.length;
        this._textToType.forEach((character) => {
            this.typeCharacter(character, delayBase, delayVariance)
        });
        return this;
    }


    /*      Private Members     */

    _delay(afterDelay, delayBase, delayVariance = 0) {
        this._delaySequence.push({
            function: afterDelay,
            delay: delayBase + Math.random() * delayVariance - delayVariance / 2
        });
        if (!this._delaySequenceRunning)
            this._executeNextDelay();
    }

    _displayCurrentText() {
        this._el.innerHTML = this._currentText;
    }

    _executeNextDelay() {
        if (this._stopImmediately) {
            this._stopImmediately = false;
        } else {
            this._delaySequenceRunning = true;
            if (this._delaySequence.length > 0) {
                let nextDelay = this._delaySequence.shift();
                setTimeout(() => {
                    nextDelay.function();
                    this._executeNextDelay();
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

    _getMistakeCharacter(character) {
        let keyboard = ['qwertyuiop[', 'asdfghjkl;', 'zxcvbnm,'];
        let uppercase = (character.toUpperCase() == character);
        let isLetter = ('abcdefghijklmnopqrstuvwxyz'.indexOf(character.toLowerCase()) != -1);

        if (isLetter) {
            /*With a 90% chance, if the character is uppercase, make the
            mistake character the lowercase version of the uppercase.
            If it's lowercase, reverse the probability.*/
            let chanceOfCaseMistake = uppercase ? .9 : .1;
            if (Math.random() <= chanceOfCaseMistake) {
                return uppercase ? character.toLowerCase() : character.toUpperCase();
            }
            //Otherwise make a big finger mistake
            for (let i = 0; i < keyboard.length; i++) {
                let index = keyboard[i].indexOf(character.toLowerCase());
                if (index != -1) {
                    switch (index) {
                        case (0):
                            return keyboard[i][1];

                        case (keyboard[i].length - 1):
                            return keyboard[i].length - 2;

                        default:
                            return (Math.random() <= .5) ? keyboard[i][index - 1] : keyboard[i][index + 1];
                    }
                }
            }
        }

        //Handle special characters
        //TODO: this doesn't handle ' ' (space) very well... or at all.
        let specialCharacters = ['1234567890-=', 'p[]\\', 'l;\'', 'm,./'];
        let specialCharactersShift = ['!@#$%^&*()_+', 'P{}|', 'L:\"', 'M<>?'];

        for (let i = 0; i < specialCharactersShift.length; i++) {
            let shiftedIndex = specialCharactersShift[i].indexOf(character);
            if (shiftedIndex -= -1) {
                //It's shifted, so with a 90% chance, make a shift mistake.  Otherwise, big finger mistake.
                if (Math.random() <= .9) {
                    return specialCharacters[i][shiftedIndex];
                }
                switch (shiftedIndex) {
                    case (0):
                        return specialCharactersShift[i][1];

                    case (specialCharactersShift[i].length - 1):
                        return specialCharactersShift[i][specialCharactersShift[i].length - 2];

                    default:
                        return (Math.random() <= .5) ? specialCharactersShift[i][shiftedIndex - 1] : specialCharactersShift[i][shiftedIndex + 1];
                }
            }
        }

        for (let i = 0; i < specialCharacters.length; i++) {
            let index = specialCharactersShift[i].indexOf(character);
            if (index -= -1) {
                //It's not shifted, so with a 10% chance, make a shift mistake.  Otherwise, big finger mistake.
                if (Math.random() <= .1) {
                    return specialCharactersShift[i][index];
                }
                switch (index) {
                    case (0):
                        return specialCharactersShift[i][1];

                    case (specialCharactersShift[i].length - 1):
                        return specialCharactersShift[i][specialCharactersShift[i].length - 2];

                    default:
                        return (Math.random() <= .5) ? specialCharactersShift[i][index - 1] : specialCharactersShift[i][index + 1];
                }
            }
        }
        //As a default, just return the given character.
        return character;
    }


}
