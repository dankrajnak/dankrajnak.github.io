let typewriterText = ["Can websites be a form of art?", "Let's build something cool.", "Scroll down to see more.",
                      "Can websites be a form of art?", "Wait, you\'re still reading?", "Well, I\'m flattered.",
                      "Thanks for riding it out to the end", "You should check out the song...",  "\'Jungle\' by Tash Sultana",
                      "Hopefully you like it!",  "Hope you have a great day :)"
                     ]

let typewriter = new Typewriter(typewriterText, document.getElementById('typewriter'));
setTimeout(()=>typewriter.play(), 500);

let canvas = document.getElementById('perspective');

let container = document.querySelector('.banner');
container.setAttribute('style', `height: ${window.innerHeight}px`);

let width = canvas.clientWidth, height = canvas.clientHeight;
canvas.setAttribute('width', width);
canvas.setAttribute('height', height);

let perspective = new PerspectiveSquare(canvas, [width*.4, height*.4], width*.2);

//For smaller screens
if(width<430)
    perspective.depth = 40;

perspective.lineWeight = 2;
perspective.background = '#111'; //dark grey
perspective.lineColor = '#CCB255'; //gold

//Ok, this is a mess.  Need to add some functionality to wanderer to abstract away these calculations.
let wanderLeftTopCorner = [Math.max(0, perspective.leftTopCorner[0]-perspective.boxWidth), Math.max(0, perspective.leftTopCorner[1] - perspective.boxWidth)];
let wanderer = new Wanderer(Math.min(perspective.boxWidth*3, width-wanderLeftTopCorner[0]),
                            Math.min(perspective.boxWidth*3, height-wanderLeftTopCorner[1]),
                            wanderLeftTopCorner);

//Magic numbers.  Sorry.  2000 = transition time, 500 = delay.
wanderer.startWandering((pos) => perspective.drawSquare(pos), 2000, 500);

container.addEventListener('mouseover', event=> wanderer.stopWandering(true));
container.addEventListener('mousemove', event => {
    wanderer.stopWandering(true);
    perspective.drawSquare([event.pageX, event.pageY]);
});
container.addEventListener('mouseout', event => {
    wanderer.startWandering(pos=>perspective.drawSquare(pos), 2000, 500, [event.pageX, event.pageY])
});


window.addEventListener('resize', ()=>{
    width = canvas.clientWidth, height = canvas.clientHeight;
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);
    perspective.resize([width*.4, height*.4], width*.2);
    if(width<430)
        perspective.depth = 40;
    else{
        perspective.depth = 100;
    }
    container.setAttribute('style', `height: ${window.innerHeight}px`);

    wanderer.stopWandering(true);
    let wanderer = new Wanderer(Math.min(perspective.boxWidth*3, width-wanderLeftTopCorner[0]),
                            Math.min(perspective.boxWidth*3, height-wanderLeftTopCorner[1]),
                            wanderLeftTopCorner);

    //Magic numbers.  Sorry.  2000 = transition time, 500 = delay.
    wanderer.startWandering((pos) => perspective.drawSquare(pos), 2000, 500);

});
