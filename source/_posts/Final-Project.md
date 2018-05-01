---
title: Final Project
date: 2018-04-30 19:07:26
tags:
description: What I made for the exhibition
---
{% asset_img first.jpg "Image of the final project" %}

# It's finally done and I'm excited to share it.

As per my last post, I did have to trim the project down a bit.  As a result, I didn't get as much interaction with my piece as I would have liked... but if I got it all right on my first go, I wouldn't have learned anything, right? Since the last time I posted, I did a lot of work.  So, I want to share that with you first, then my installation and final reflections.


## IotMonitor
This was a pretty big endeavor. I created an application-independent node.js iot monitor. The code can be found [here](https://github.com/dankrajnak/AzureIoTNodeMonitor).  IoTMonitor can easily be integrated into any node application.  It connects a device with the Azure IoT Hub, and makes it easy to monitor and manage the application remotely.  So, using IoTMonitor, every time the device I installed finishes playing a message, it sends a message to Azure IoT Hub with the name of the message it just finished playing.  It also verifies that it was able to contact the server to download new messages, and sends the names of the messages it's getting ready to play.

With a bit more work, I'll be able to remotely turn the device off, and schedule it to wake up so that messages aren't constantly playing.  I'll also be able to update the code remotely, so if a bug is encountered, I can send out a quick patch without ever having to visit the exhibition.

## The Website
In addition to a simplification of the design, I also found a few ways to make the website a lot more reliable.  Most notably, I figured out why some messages were being cut short on mobile phones and some computers.  It wasn't because of a temporary disconnection from a websocket, *(although the code I wrote to solve that bug helped solve another bug—previously if someone was recording
a message and then closed the website prematurely, their incomplete message would still be stored)*. It was because audio was still being processed and hadn't been sent yet.  This chunk of unprocessed audio was especially large on slower devices, like phones, and on long messages.

I found a way to monitor and display how much audio still needed to be processed and sent to the server after a user pressed stop recording.  Previously, I had just been relying on people staying on the page for a bit after recording their message.

In addition, most browsers require that a server be communicating in https to utilize the microphone.  I also realized that many people trying to access the website were given an intimidating "WEBSITE NOT SECURE" warning when the server tried to send them the website them using http when they requested in https.  After a lot of tinkering, I found a way to route my website through a service called Cloudflare to provide https certification with minimal changes to the server.  I also re-routed all http traffic to use https so that no silent errors will occur when people try to record a message.  So far, so good.

# The Installation
I repurposed an old box to house the Raspberry Pi.  I cut a hole through the bottom, and fed the power and headphones cable through it.  The box came with a false bottom, so I placed all the tech below the false bottom, and attached a definition of *Sonder* on top, which I felt concisely captured the message of my installation.  I configured the pi to connect to OSU's Wifi and start the monitor and message player on start.  The only setup, then, is plugging it into the wall.  

Here's some pictures of what it looked like:

{% asset_img second.jpg "Image of the final project" %}

{% asset_img third.jpg "Image of the final project" %}

{% asset_img fourth.jpg "Image of the final project" %}

Unfortunately (and kinda funnily),  I dropped the box while I was installing it, so there's a slight chip next to the hinge.

# What I learned

Implementing this was not easy.  I ran into so many unforeseen problems, and spent most of my time iterating and adapting to new challenges.  I learned about websockets, node streams, the Azure IoT Suite, Azure Blob and App Services, and writing software for raspberry pis.  More importantly, I went through my first iteration of transforming an idea for an art piece into a physical installation.  I learned that creating an art and tech installation is hard and takes a lot of time, even for someone who has a pretty descent amount of experience programming.  I learned that it's incredibly important to think about how people will interact with your installation, and to test that as soon as possible—make prototypes, tell people about your idea, validate your assumptions.  I learned it's important to be really realistic about timeline and to allocate a lot of time for iterating, learning, and fixing mistakes.  I also learned that making something you care about is really, really fun.  I learned I liked doing this; and I learned, hopefully, that this won't be my last venture into new media.
