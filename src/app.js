require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const uuid = require("uuid/v4");
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

// sample data
const users = [
  {
    id: "3c8da4d5-1597-46e7-baa1-e402aed70d80",
    username: "sallyStudent",
    password: "c00d1ng1sc00l",
    favoriteClub: "Cache Valley Stone Society",
    newsLetter: "true"
  },
  {
    id: "ce20079c-2326-4f17-8ac4-f617bfd28b7f",
    username: "johnBlocton",
    password: "veryg00dpassw0rd",
    favoriteClub: "Salt City Curling Club",
    newsLetter: "false"
  }
];

// basic POST endpoint for app.js
app.post("/", (req, res) => {
  console.log(req.body);
  res.send("POST request received");
});

// POST /user endpoint requiring  username, password, favorite club, and if they receive the newsletter
app.post("/user", (req, res) => {
  // get the data
  const { username, password, favoriteClub, newsLetter = false } = req.body;

  //* Validate the data

  // Validate username
  // username is required
  if (!username) {
    return res.status(400).send("Username required");
  }
  // username must be between 6 and 20 characters
  if (username.length < 6 || username.length > 20) {
    return res.status(400).send("Username must be between 6 and 20 characters");
  }

  // Validate password
  // password required
  if (!password) {
    return res.status(400).send("Password required");
  }
  // password must be between 8 and 36 characters
  if (password.length < 8 || password.length > 36) {
    return res.status(400).send("Password must be between 8 and 36 characters");
  }
  // password must include a digit
  if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)) {
    return res.status(400).send("Password must contain at least one digit");
  }

  // Validate favoriteClub
  // favoriteClub is required
  if (!favoriteClub) {
    return res.status(400).send("favorite Club required");
  }
  // favoriteClub must be one of the clubs in the list
  const clubs = [
    "Cache Valley Stone Society",
    "Ogden Curling Club",
    "Park City Curling Club",
    "Salt City Curling Club",
    "Utah Olympic Oval Curling Club"
  ];
  if (!clubs.includes(favoriteClub)) {
    return res.status(400).send("Not a valid club");
  }

  // create a newUser object from the data and push it to user array
  const id = uuid();
  const newUser = {
    id,
    username,
    password,
    favoriteClub,
    newsLetter
  };
  users.push(newUser);

  // send message that validation has passed
  res.send("All validation passed");
});

app.delete("/user/:userId", (req, res) => {
  const { userId } = req.params;

  const index = users.findIndex(u => u.id === userId);

  // make sure we actually  find a user with that id
  if (index === -1) {
    return res.status(404).send("User not found");
  }

  users.splice(index, 1);

  res.status(204).end();
});

app.get("/user", (req, res) => {
  res.json(users);
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
