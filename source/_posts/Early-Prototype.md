---
title: Early Prototype
date: 2018-03-20 10:40:22
tags:
description: A web server and raspberry pi program
---

Over the past week or so, I've been working on developing a small prototype of the art project I detailed in my last post.  After a bit of struggle, I set up a **raspberry-pi-zero-w** (*a small raspberry pi with wifi in the chip*) without a monitor.  I also set up a Microsfot Azure account.  They have a blob storage service which is perfect for storing the messages. I created a small program using Node.js to upload, download and delete messages from this service and installed it on my raspberry pi.  Now I have the capability to upload, download, and delete files from a raspberry pi to Microsoft's distributed servers.

I also created a web server using Node.js and Express.  Right now the only capability of the web server is to list the files in the `messages` container in the blob service.  It also creates a SAS (*Shared Access Signature*) token for each message, so that each listing on the website is linked to the file in the blob service.

## The Web Server and Website

Here's the general file structure:
```
-app
  -public
  -server
  -services
  -views
  index.js
-build
```

All the files in `app` are processed and copied into `build`.  Javascript is transpiled from es6 to es5 and minified, css is concatenated and minified.

The `public` folder contains static resources like css and client-side javascript.  It's serverd statically with express.

The `server` folder contains all the Node.js code to determine how the server responds to requests.

The `services` folder contains services used by the server.  Namely, it contains a `MessageService` which provides methods to upload, delete, list, and get links to messages.

The `views` folder contains all of the html for the website.  It's written with embedded javascript so it can easily include data from the server.

`index.js` is the starting point for webpack, which bundles static resources.

## Raspberry Pi

The program installed on the raspberry pi is just a command-line version fo the `MessageService` on the web server.  It's also written in javascript and run with node.js.
