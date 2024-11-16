//#region SETUP
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const MongoStore = require("connect-mongo");
const app = express();
const port = process.env.PORT || 3000;
//#endregion SETUP

//#region MONGODB
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
let mongoStore;

try {
  mongoStore = MongoStore.create({
    mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@cluster0.yk8ba9z.mongodb.net/sessions`,
    crypto: {
      secret: mongodb_session_secret,
    },
  });
} catch (error) {
  console.error("MongoDB connection error", error);
}
//#endregion MONGODB

//#region SESSION
const expireTime = 1000 * 60 * 60 * 24; // 1 day
const node_session_secret = process.env.NODE_SESSION_SECRET;
try {
  app.use(
    session({
      store: mongoStore,
      secret: node_session_secret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: expireTime,
      },
    })
  );
} catch (error) {
  console.error("Session error", error);
}
//#endregion SESSION

// Routes
app.post("/signup", (req, res) => {
  const { username, password } = req.body;
  // Add logic to handle user signup
  res.send("User signed up");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  // Add logic to handle user login
  res.send("User logged in");
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
