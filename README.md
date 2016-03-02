# pulper

Lightweight HTTP "kinda" Proxy via AMQP protocol

## Requirements

* [Node.JS](https://nodejs.org)
* Some AMQP server (tested only with [RabbitMQ](https://www.rabbitmq.com),
  but theoretically can work with others)

## Installation

    git clone https://github.com/maprox/pulper.git
    cd pulper
    npm install

## Run

    node .

In this case you will run *serviceA* on port *3000*.

There are some environment variables which you can modify if you want:

* **MODE** [*serviceA*] - which service you want to run 
    (*serviceA*, *serviceB* or *serviceC*)

* **PORT** [*3000*] - which port your service will listen
    (only for *serviceA*)

* **CALLBACK_URL** - url to which *serviceC* should send the answer from
    original destination. If empty, service looks for *X-CALLBACK-URL*
    header of the request message. (only for *serviceC*)

* **AMQP_EXCHANGE** [*proxy*] - exchange name in AMQP server.
    All messages will be published to this exchange.

* **AMQP_CONNECTION** [*amqp://guest:guest@127.0.0.1//*] - AMQP
    connection string

### Examples:

1. Run *serviceA* on port *8080*

        PORT=8080 node .

2. Run *serviceB* with different amqp settings

        MODE=serviceB AMQP_CONNECTION=amqp://admin:XsE390@rabbitmq// node .

3. Run *serviceC* with different *CALLBACK_URL*

        MODE=serviceC CALLBACK_URL=http://localhost:2909/?id=%uid% node .

## Description

There are three separate services which can be run:

![Workflow](https://github.com/maprox/pulper/raw/master/assets/routing.png)

### serviceA

This service listens for incoming http connections on some port.
When there is an HTTP request, it wraps it in a special internal message
and publish to the AMQP exchange (*serviceB* is the goal here).
After that it sends an HTTP response to the client with status code 200 OK
and a unique identifier of the internal message
(e.g. *c5359605-ec5b-4cae-ac52-1c1a7fe5c2c1*)

Http request should include several specific headers:

* **X-URL** - **REQUIRED**. Destination url (since the host in given HTTP
    request is wrong and equals to *serviceA* host). When *serviceB* receives
    this message from the AMQP broker it will use this url to send
    given HTTP request to the addressee.

* **X-CALLBACK-URL** - *OPTIONAL*. Where to send response which will be
    taken from the destination. If this url contains **%uid%** in it, it will
    be automatically replaced with unique identifier of the internal message
    which was returned on the first step.

### serviceB

This service connects to the AMQP broker and waits for internal message
from *serviceA* with HTTP request to come.

After it receives this internal message it obtains HTTP request with its
destination URL and makes HTTP request to that URL with the same method,
headers and body.

After destination endpoint answers something, *serviceB* wraps its answer
into internal message and send it to the AMQP exchange
(*serviceC* is the goal here).

### serviceC

Final place of our journey.

This service connects to the AMQP broker and waits for internal message
from *serviceB* with HTTP response to come.

After it receives this internal message with its **X-CALLBACK-URL** 
(uses *CALLBACK-URL* option if this header is empty) it obtains HTTP response
and makes HTTP request to that URL with the same status code,
headers and body as original HTTP response had.


---

[![forthebadge](http://forthebadge.com/images/badges/designed-in-ms-paint.svg)](http://forthebadge.com)
[![forthebadge](http://forthebadge.com/images/badges/powered-by-electricity.svg)](http://forthebadge.com)
[![forthebadge](http://forthebadge.com/images/badges/fuck-it-ship-it.svg)](http://forthebadge.com)