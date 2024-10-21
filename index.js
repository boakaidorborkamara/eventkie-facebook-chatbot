const express = require("express");
require("dotenv").config();
const request = require("request");
const axios = require("axios");

const app = express();
app.use(express.json());

// define tokens
let PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
let VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// Handles messages events
function handleMessage(sender_psid, received_message) {
  let response;

  // Check if the message contains text
  if (received_message.text) {
    // Create the payload for a basic text message
    response = {
      text: `"Hi there! 👋 Welcome to Ticketzor! Looking to attend an event? 🎉 I can help you find and purchase tickets right here. How can I assist you today?"`,
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
      qs: { access_token: PAGE_ACCESS_TOKEN },
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

app.get("/", function (req, res) {
  res.send("Hello World");
  console.log("PAGE ACCESS TOKEN", PAGE_ACCESS_TOKEN);
  console.log("VERIFY TOKEN", VERIFY_TOKEN);
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
    // Determine which webhooks were triggered and get sender PSIDs and locale, message content and more.
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

////////---------------
// Set Get Started and Welcome Message
const setGetStartedAndWelcomeMessage = async () => {
  const url = `https://graph.facebook.com/v2.6/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`;

  const data = {
    get_started: {
      payload: "GET_STARTED_PAYLOAD",
    },
    greeting: [
      {
        locale: "default",
        text: "Welcome to Ticket! I can help you browse events and buy tickets.",
      },
    ],
  };

  try {
    await axios.post(url, data);
    console.log("Get Started Button and Welcome Message set successfully.");
  } catch (error) {
    console.error("Error setting Get Started button:", error.response.data);
  }
};

// Set Persistent Menu
const setPersistentMenu = async () => {
  const url = `https://graph.facebook.com/v2.6/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`;

  const data = {
    persistent_menu: [
      {
        locale: "default",
        composer_input_disabled: false,
        call_to_actions: [
          {
            type: "postback",
            title: "🏠Home",
            payload: "HOME",
          },
          {
            type: "postback",
            title: "😜 Browse Events",
            payload: "BROWSE_EVENTS",
          },
          {
            type: "postback",
            title: "🎟️ My Tickets",
            payload: "MY_TICKETS",
          },
          {
            type: "postback",
            title: "💭 Give Feedback",
            payload: "GIVE_FEEDBACK",
          },

          {
            type: "postback",
            title: "🤷‍♂️ About Ticketzor",
            payload: "ABOUT_TICKETZOR",
          },
        ],
      },
    ],
  };

  try {
    await axios.post(url, data);
    console.log("Persistent Menu set successfully.");
  } catch (error) {
    console.error("Error setting Persistent Menu:", error.response.data);
  }
};

// Send Quick Replies
const sendQuickReplies = async (userId) => {
  const url = `https://graph.facebook.com/v2.6/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;

  const data = {
    recipient: {
      id: userId,
    },
    message: {
      text: "How can I help you today?",
      quick_replies: [
        {
          content_type: "text",
          title: "Browse Events",
          payload: "BROWSE_EVENTS",
        },
        {
          content_type: "text",
          title: "My Tickets",
          payload: "MY_TICKETS",
        },
        {
          content_type: "text",
          title: "Help & Support",
          payload: "HELP_SUPPORT",
        },
      ],
    },
  };

  try {
    await axios.post(url, data);
    console.log("Sent Quick Replies:", data);
  } catch (error) {
    console.error("Error sending quick replies:", error.response.data);
  }
};

app.listen(3600, () => {
  console.log("Server is listening on port");

  setPersistentMenu();
  setGetStartedAndWelcomeMessage();
});
