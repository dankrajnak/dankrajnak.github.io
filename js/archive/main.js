"use strict";

var typewriterText = ["Blog.", "This is the blog.", "You are reading my blog.", "Why are you reading my blog?", "Stop reading my blog"];

var typewriter = new Typewriter(typewriterText, document.getElementById("typewriter"));
setTimeout(function () {
    return typewriter.play();
}, 500);