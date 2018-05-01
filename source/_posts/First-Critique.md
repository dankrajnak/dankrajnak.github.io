---
title: First Critique
date: 2018-04-12 23:42:05
tags:
description: I think I'm going to simplify my project a bit
---

I've spent the better part of the last few days building [this website](https://heartfelt-installation.azurewebsites.net).  I encountered a lot of problems, and it's still not done, but, for now, the website is capable of recording, streaming, and encoding audio from a device to a database.  The really cool thing about this is that it's all done simultaneously.  While your phone or computer is recording your audio, it is simultaneously sending it to the web-server which is processing it and streaming it to a database.  To show you just all the different steps that went into this, here's a brief rundown of what I did.  I may write a quick tutorial for this in the future.  I ended up having to do a lot of scavenging around the internet to figure everything out.

## Stage 1 — Listing the messages on the website
About three weeks ago, I started work on the website.  I already had implemented a message service in Node.js which was able to upload, delete, and list messages.  I needed to write a server to provide this service.  Fittingly, I wrote the server with Node.js and Express.
It looked something like this:

```
//Get root
app.get('/', (req, res)=>{

    messageService.createContainer().then(() =>{
      messageService.list().then((lis) => {
        // Message names are stored as the number of miliseconds since
        // January 1st, 1970 to when the message was created.  We can use this
        //  to sort them based on their creation time.
        lis.data.entries.sort((a, b)=>{
          return parseInt(b.name.slice(0, -4)) - parseInt(a.name.slice(0, -4));
        });
        let messages = lis.data.entries.map((entry, index)=> ({
            name: `Message ${lis.data.entries.length - index}`,
            link: messageService.getUri(entry.name).uri
          }));
        res.render('index', {messages: messages});
      });
    });
});
```
Message objects are sent as objects to an ejs template.  Additionally, a shared access token is generated for each message.  Pretty cool.

## Stage 2 — Recording Messages
Audio recording and processing on websites has come a long way.  It's now possible to make `getUserMedia` requests to gain access to the microphone or camera.  Then, an `AudioContext` can be created to stream, save, and process audio.  Now, I have a feeling I did this in kind of a dumb way.  I added a `scriptProcessor` to `AudioContext` which sends that data to a `BinarySend` service I coded.  Looking back, what should probably have happened is passing an audio stream into `BinarySend` instead of implementing my own stream (as we'll see later).

I also tried utilizing `recorder.js`, which can  encode audio to the `.wav` format.  Instead, I moved this encoding to the server and (with the huge help of some online tutorials).

This audio is streamed to the web server using Web Sockets.  Originally, I tried to just use the native Web Socket API on the client side, and the `ws` node package on the server side.  The webserver then would encode the audio to a `.wav` file using the `wav` node package and then stream that file to the database.

## Stage 3 — Putting it all online
I had to change a ton to put this all online.  I deployed this using Azure.  In order for my web app to start, the file `build/app/server/index.js` needed to be run.  Additionally all requests for static resources needed to be directed to my `build/public` folder.  While Microsoft had a tutorial on how to deploy a basic web app, they had no documentation on how a node app is actually run by azure.  I had to figure this out using other tutorials.  Eventually I came across `Kudu`, which is the engine which Azure uses to run a node app when it's deployed using Git.  With the help of a tutorial which I will try to find and link to later, I created a few extra files—`web.config`, `.deployment`, `deploy.cmd`, to customize the deployment.  This worked, and after adding my credentials to my blob service as a environment variable, my website was running online without errors.

However, I realized that web sockets could not work in quite the same way on Azure's servers as they had on my computer.  The biggest problem was that in my implementation, it was necessary that the web sockets connect to server on a separate port.  This was not possible with Azure.  So, I reimplemented both the client and server side to use `Socket.io`—a really robust web sockets library. I also had to use `socket.io-stream` to send a stream over the web sockets.  

After I had finished implementing this, I was able to create a web socket connection with the server.  However, when the audio was written to file on the web server, it was not shared amongst all instances of the web app.  So, when the web server went to send the file to the database, it couldn't find it.  I needed to find some way to stream the file directly to the database without creating a file.  Luckily, Microsoft offers this capability as part of their blob service.  So, after some refactoring, I was able to stream directly to the service.

## What still needs to be done:
On some connections, messages are cut short.  I have a feeling this has to do with a temporary disconnection from the web socket.  The server assumes that the audio is finished and ends the stream to the database.  I will have to implement a way to handle this.  I have a few ideas, but it will definitely take some tinkering.

It might be good to put a reCAPTCHA on the record button, so that it would not be possible for a bot to record a bunch of messages.

The website also needs to be slightly redesigned.  It looks ok right now, but it could be a lot better.

Because this took so long, I'm having to simplify my project a bit.  I don't think I'll have time to add the phone.  So, the hardware-component of the project will be a raspberry pi which will download and queue the messages and play them through a set of headphones.
