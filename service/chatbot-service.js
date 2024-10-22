const request = require("request");
const axios = require("axios");

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// Set Get Started and Welcome Message
const setGetStartedAndWelcomeMessage = async () => {
  const url = `https://graph.facebook.com/v19.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`;

  const data = {
    get_started: {
      payload: "GET_STARTED_PAYLOAD",
    },
    greeting: [
      {
        locale: "default",
        text: "Hi! I'm Ticketzor, your event & ticketing 🎟️ chatbot. Let me help you discover and book events happening in Liberia. Click Get Started to begin exploring! 😄",
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
  const url = `https://graph.facebook.com/v19.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`;

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

// Sends response messages via the Send API
async function sendMessage(sender_psid, response) {
  try {
    // Construct the message body
    let request_body = {
      recipient: {
        id: sender_psid,
      },
      message: response,
    };

    // Send the HTTP request to the Messenger Platform
    await axios.post(
      `https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      request_body
    );
  } catch (err) {
    console.log(err);
  }

  //   request(
  //     {
  //       uri: "https://graph.facebook.com/v19.0/me/messages",
  //       qs: { access_token: PAGE_ACCESS_TOKEN },
  //       method: "POST",
  //       json: request_body,
  //     },
  //     (err, res, body) => {
  //       if (!err) {
  //         console.log("message sent!");
  //       } else {
  //         console.error("Unable to send message:" + err);
  //       }
  //     }
  //   );
}

const handleGreetings = () => {};

module.exports = {
  setGetStartedAndWelcomeMessage,
  setPersistentMenu,
  sendQuickReplies,
  sendMessage,
};
