require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const { NODE_ENV } = require("./config");

// create Express app
const app = express();

// log 'tiny' output if in production, else log 'common'
const morganOption = NODE_ENV === "production" ? "tiny" : "common";
app.use(morgan(morganOption));

// parse the body of the request
app.use(express.json());

// hide sensitive data with 'helmet' and allow cors
app.use(helmet());
app.use(cors());

// basic POST endpoint for app.js
app.post("/", (req, res) => {
  console.log(req.body);
  res.send("POST request received");
});

// POST /user endpoint requiring  username, password, favorite club, and if they receive the newsletter
app.post("/user", (req, res) => {
  // get the data
  const { username, password, favoriteClub, newsLetter = false } = req.body;

  if (!username) {
    return res.status(400).send("Username required");
  }

  if (username.length < 6 || username.length > 20) {
    return res.status(400).send("Username must be between 6 and 20 characters");
  }

  if (!password) {
    return res.status(400).send("Password required");
  }

  if (password.length < 8 || password.length > 36) {
    return res.status(400).send("Password must be between 8 and 36 characters");
  }

  if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)) {
    return res.status(400).send("Password must contain at least one digit");
  }

  if (!favoriteClub) {
    return res.status(400).send("favorite Club required");
  }
});

// basic GET endpoint handler for app.js
app.get("/", (req, res) => {
  res.send("A GET Request");
});

// error handling middleware gives short response if in production
app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

// export the app
module.exports = app;
