let typewriterText = [
    'Blog.',
    'This is the blog.',
    'You are reading my blog.',
    'Why are you reading my blog?',
    'Stop reading my blog'];



let typewriter = new Typewriter(typewriterText, document.getElementById("typewriter"));
setTimeout(()=> typewriter.play(), 500);
