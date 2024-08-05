const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// Memory of users and exercises
const usersDatabase = [];
const exercisesDatabase = [];

// Endpoint to create a new user
app.post("/api/users", (req, res) => {
  const { username } = req.body;
  const uid = crypto.randomUUID().split("-").join("");
  const newUser = { username, _id: uid };
  usersDatabase.push(newUser);
  res.json(newUser);
});

// Endpoint to get all users
app.get("/api/users", (req, res) => {
  res.json(usersDatabase);
});

// Endpoint to add exercises
app.post("/api/users/:_id/exercises", (req, res) => {
  const uid = req.params._id;
  const user = usersDatabase.find((user) => user._id === uid);
  if (!user) {
    return res.json({ error: "User not found." });
  }

  const { description, duration, date } = req.body;

  if (!description || !duration) {
    res.json({ error: "All fields are required." });
  }

  const dateObj = date ? new Date(date) : new Date();

  if (date && isNaN(dateObj.getTime())) {
    return res.json({ error: "Invalid date format." });
  }

  const newExercise = {
    username: user.username,
    description,
    duration: parseInt(duration),
    date: dateObj.toDateString(),
    _id: uid,
  };
  exercisesDatabase.push(newExercise);
  res.json(newExercise);
});

// Endpoint to get logs
app.get("/api/users/:_id/logs", (req, res) => {
  const uid = req.params._id;
  const { from, to, limit } = req.query;
  const user = usersDatabase.find((user) => user._id === uid);

  if (!user) {
    return res.json({ error: "User not found." });
  }

  let exercises = exercisesDatabase.filter((exer) => exer._id === uid);

  if (from) {
    const fromDate = new Date(from);
    exercises = exercises.filter((exer) => new Date(exer.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    exercises = exercises.filter((exer) => new Date(exer.date) <= toDate);
  }

  if (limit) {
    exercises = exercises.slice(0, parseInt(limit));
  }

  const log = {
    username: user.username,
    count: exercises.length,
    _id: uid,
    log: exercises.map(({ description, duration, date }) => ({
      description,
      duration,
      date,
    })),
  };

  res.json(log);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
