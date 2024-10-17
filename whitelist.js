#!/usr/bin/env node

const axios = require("axios");

const GRAPHQL_URL = "http://127.0.0.1:4002/graphql"; // Replace with your actual GraphQL endpoint

const rl = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

const checkWhitelist = async (npub) => {
  const query = `
    query Query($input: IsFlashNpubInput!) {
      isFlashNpub(input: $input) {
        isFlashNpub
      }
    }
  `;

  const variables = {
    input: { npub: npub },
  };

  console.error(
    "Making API request with variables:",
    JSON.stringify(variables)
  ); // Log request to stderr

  try {
    const response = await axios.post(
      GRAPHQL_URL,
      {
        query,
        variables,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    console.error("API response:", JSON.stringify(response.data)); // Log response to stderr
    return response.data.data.isFlashNpub.isFlashNpub;
  } catch (error) {
    console.error("Error fetching whitelist status:", error.message, error);
    console.error("Request variables were:", JSON.stringify(variables));
    return false;
  }
};

rl.on("line", async (line) => {
  let req;

  try {
    req = JSON.parse(line);
  } catch (error) {
    console.error("Invalid JSON format");
    return;
  }

  if (req.type !== "new") {
    console.error("unexpected request type");
    return;
  }

  const npub = req.event.pubkey;

  // Check if the pubkey is on the whitelist via GraphQL query
  const isWhitelisted = await checkWhitelist(npub);

  let res = { id: req.event.id }; // echo event's id
  if (isWhitelisted) {
    res.action = "accept";
  } else {
    res.action = "reject";
    res.msg = "blocked: not on white-list";
  }

  console.log(JSON.stringify(res));
});
