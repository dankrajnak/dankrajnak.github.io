---
title: Trying out the new format
date: 2018-01-25 17:13:48
tags:
description: I think I finished most of the formatting, so I just want to see how things look
---

> So, right now, I'm in the Architecture Library.  People won't remember what you say; they won't remember what you do, but they'll never forget the way you made them feel.

And I'm going to type a lot of stuff, because I want to see what a longer paragraph would look like.

```javascript
class Wanderer{

    constructor(width, height, leftCorner = [0, 0]){
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

    startWandering(callBack, time, delay = 0, from=this._getNewPoint()){
        this._wandering = true;
        this._delay = delay;
        this.wanderToFrom(this._getNewPoint(), from, time, callBack);
    }

    stopWandering(immediately=false){
        this._wandering = false;
        if(immediately){
            window.cancelAnimationFrame(this._animationFrame);
            this._wanderToFromStart = null;
        }
    }

    wanderToFrom(to, from, time, callback){
        this._alpha = (Math.random()*3+2) | 0; //Randomly pick new alpha for easing function
        this._distanceFromToToFrom = this._euclideanDistance(to, from);
        this._animationFrame = window.requestAnimationFrame((timeStep)=>this._step(to, from, time, callback, timeStep));
    }

    _step(to, from, totalTime, callback, timeStep){
        if(!this._wanderToFromStart) this._wanderToFromStart = timeStep;

        let progress = timeStep - this._wanderToFromStart;
        callback(this._interpolate(to, from, Math.min(1, progress/totalTime)));
        if(progress < totalTime)
            this._animationFrame = window.requestAnimationFrame((newTimeStep) => this._step(to, from, totalTime, callback, newTimeStep))
        else{
            this._wanderToFromStart = null;
            //If wandering, wander from this point to a new one
            if(this._wandering){
                if(this._delay > 0){
                    setTimeout(()=>this.wanderToFrom(this._getNewPoint(), to, totalTime, callback), this._delay);
                }
                else{
                    this.wanderToFrom(this._getNewPoint(), to, totalTime, callback);
                }
            }
        }
    }

    _interpolate(to, from, t){
        return this._distanceDownLine(from, to, this._distanceFromToToFrom*this._easeInOut(t));
    }

    _easeInOut(t) {
        //easing function = t^a/(t^a+(1-t)^a).
        return Math.pow(t, this._alpha)/(Math.pow(t, this._alpha)+Math.pow(1-t, this._alpha));
	}

    _distanceDownLine(pointA, pointB, distance) {
        /* Returns a point the given distance down the line specified */

        //Similar triangles
        const A = pointB[1] - pointA[1];
        const B = pointB[0] - pointA[0];
        if(A==0&&B==0) return pointA;
        const C = this._euclideanDistance(pointA, pointB);


        const x = B - B * (C - distance) / C;
        const y = A - A * (C - distance) / C;

        return [pointA[0] + x, pointA[1] + y];
    }

    _getNewPoint(){
        return [this.leftCorner[0]+Math.random()*this.width, this.leftCorner[1]+Math.random()*this.height];
    }

    _euclideanDistance(pointA, pointB) {
        //sqrt(a^2+b^2)
        return Math.sqrt(Math.pow(pointA[0] - pointB[0], 2) + Math.pow(pointA[1] - pointB[1], 2));
    }
}
```

### So, Here's something from Hamlet

I have of late, but wherefore I know not, lost all my mirth, forgone all customs of exercise and indeed it goes so heavily with my disposition that this heavenly frame, the Earth, seems to me a sterile promontory.  This most excellent canopy, the air, look you, this brave o'erhanging firmament, this majestic roof fretted with golden fire... why it appears to me no other than a foul and pestilent congregation of vapours.

What a piece of work is a man?  How noble in reason, how infinite in faculty?  In form and moving, how express, and admirable?  In action, how like an angel, in apprehension, how like a god?  The beauty of the world, the paragon of animals, and yet, to me, what is this quintessence of dust?

Man delights not me.
