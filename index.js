const express = require("express");
require("dotenv").config();
const request = require("request");
const axios = require("axios");

const app = express();
app.use(express.json());

// define tokens
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

//chatbot service
const chatbotService = require("./service/chatbot-service");

// Handles messages events
function handleMessage(senderPsid, receivedMessage) {
  let response;

  // Checks if the message contains text
  if (receivedMessage.text) {
    // Create the payload for a basic text message, which
    // will be added to the body of your request to the Send API
    response = {
      text: `You sent the message: '${receivedMessage.text}'. Now send me an attachment!`,
    };
  } else if (receivedMessage.attachments) {
    // Get the URL of the message attachment
    let attachmentUrl = receivedMessage.attachments[0].payload.url;
    response = {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "Is this the right picture?",
              subtitle: "Tap a button to answer.",
              image_url: attachmentUrl,
              buttons: [
                {
                  type: "postback",
                  title: "Yes!",
                  payload: "yes",
                },
                {
                  type: "postback",
                  title: "No!",
                  payload: "no",
                },
              ],
            },
          ],
        },
      },
    };
  }

  // Send the response message
  callSendAPI(senderPsid, response);
}

// Handles messaging_postbacks events
function handlePostback(senderPsid, receivedPostback) {
  let response;

  // Get the payload for the postback
  let payload = receivedPostback.payload;

  // handle get statarted
  if (payload === "GET_STARTED") {
    response = { text: "About to get started" };
  }

  // Set the response based on the postback payload
  if (payload === "yes") {
    response = { text: "Thanks!" };
  } else if (payload === "no") {
    response = { text: "Oops, try sending another image." };
  }
  // Send the message to acknowledge the postback
  chatbotService.sendMessage(senderPsid, response);
}

// Verify that the callback came from Facebook.
// function verifyRequestSignature(req, res, buf) {
//   var signature = req.headers["x-hub-signature-256"];

//   if (!signature) {
//     console.warn(`Couldn't find "x-hub-signature-256" in headers.`);
//   } else {
//     var elements = signature.split("=");
//     var signatureHash = elements[1];
//     var expectedHash = crypto
//       .createHmac("sha256", config.appSecret)
//       .update(buf)
//       .digest("hex");
//     if (signatureHash != expectedHash) {
//       throw new Error("Couldn't validate the request signature.");
//     }
//   }
// }

app.get("/", function (req, res) {
  console.log("Home Route");
  res.send("Hello World");
});

// endpoint for webhook
app.post("/messaging-webhook", (req, res) => {
  let body = req.body;

  console.log("body", req.body);

  // Send a 200 OK response if this is a page webhook

  if (body.object === "page") {
    body.entry.forEach(function (entry) {
      // Gets the body of the webhook event
      let webhook_event = entry.messaging[0];
      console.log("web", webhook_event);

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log(sender_psid);

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
  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

// verify webhook
app.get("/messaging-webhook", (req, res) => {
  console.log("verifying token");

  // Parse the query params
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode is in the query string of the request
  if (mode && token) {
    // Check the mode and token sent is correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Respond with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Respond with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

app.listen(3600, () => {
  console.log("Server is listening on port");

  chatbotService.setPersistentMenu;
  chatbotService.setGetStartedAndWelcomeMessage;
});
