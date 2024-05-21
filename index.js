const express = require("express");
const app = express();
require("dotenv").config();
const request = require("request");

app.get("/", function (req, res) {
  res.send("Hello World");
  console.log(process.env.VERIFY_TOKEN);
});

// endpoint for webhook
app.post("/webhook", (req, res) => {
  let body = req.body;

  console.log("body", body);
  console.log(`\u{1F7EA} Received webhook:`);

  // Send a 200 OK response if this is a page webhook

  if (body.object === "page") {
    body.entry.forEach(function (entry) {
      // Gets the body of the webhook event
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log("Sender PSID: " + sender_psid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send("EVENT_RECEIVED");
    // Determine which webhooks were triggered and get sender PSIDs and locale, message content and more.
  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

// Add support for GET requests webhook
app.get("/messaging-webhook", (req, res) => {
  // Parse the query params
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode is in the query string of the request
  if (mode && token) {
    // Check the mode and token sent is correct
    if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
      // Respond with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Respond with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

// Handles messages events
function handleMessage(sender_psid, received_message) {
  let response;

  // Check if the message contains text
  if (received_message.text) {
    // Create the payload for a basic text message
    response = {
      text: `You sent the message: "${received_message.text}". Now send me an image!`,
    };
  }

  // Sends the response message
  callSendAPI(sender_psid, response);
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    recipient: {
      id: sender_psid,
    },
    message: response,
  };

  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: "https://graph.facebook.com/v2.6/me/messages",
      qs: { access_token: process.env.VERIFY_TOKEN },
      method: "POST",
      json: request_body,
    },
    (err, res, body) => {
      if (!err) {
        console.log("message sent!");
      } else {
        console.error("Unable to send message:" + err);
      }
    }
  );
}

// Verify that the callback came from Facebook.
function verifyRequestSignature(req, res, buf) {
  var signature = req.headers["x-hub-signature-256"];

  if (!signature) {
    console.warn(`Couldn't find "x-hub-signature-256" in headers.`);
  } else {
    var elements = signature.split("=");
    var signatureHash = elements[1];
    var expectedHash = crypto
      .createHmac("sha256", config.appSecret)
      .update(buf)
      .digest("hex");
    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

app.listen(3600, () => {
  console.log("Server is listening");
});
