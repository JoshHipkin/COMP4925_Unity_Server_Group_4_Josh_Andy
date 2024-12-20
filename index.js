//#region SETUP
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const cors = require("cors");
const MongoStore = require("connect-mongo");
const app = express();
const port = process.env.PORT || 3000;
const {
  createUser,
  getUser,
  save,
  getLeaderboard,
  saveHighScore,
} = require("./database/user");
const bcrypt = require("bcrypt");
app.use(express.urlencoded({ extended: false }));
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

app.use(cors());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

app.post("/signup", (req, res) => {
  const { username, password } = req.body;
  const saltRounds = 10;

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{10,}$/;

  if (!passwordRegex.test(password)) {
    return res
      .status(400)
      .send("Password does not meet complexity requirements");
  }

  bcrypt.hash(password, saltRounds, async (err, hash) => {
    if (err) {
      return res.status(500).send("Error hashing password");
    }

    try {
      const userId = await createUser(username, hash);
      if (!userId) {
        return res.status(500).send("Error creating user");
      } else {
        req.session.authenticated = true;
        req.session.userId = userId;
        req.session.username = username;
        req.session.cookie.maxAge = expireTime;
        return res.json({
          message: "User signed up",
          user: { id: userId },
        });
      }
    } catch (error) {
      return res.status(500).send("Error creating user");
    }
  });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send("Missing username or password");
  } else {
    const user = await getUser(username);

    if (!user) {
      return res.status(404).send("User not found");
    }

    if (bcrypt.compare(password, user.hashed_password)) {
      req.session.authenticated = true;
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.cookie.maxAge = expireTime;
      return res.json({
        message: "User logged in",
        userId: user.user_id,
        level: user.level,
        score: user.save_score,
        highScore: user.high_score,
      });
    } else {
      return res.status(401).send("Invalid password");
    }
  }
});

app.post("/save", (req, res) => {
  if (!req.session.authenticated) {
    return res.status(401).send("Unauthorized");
  }
  const { level, score, userId } = req.body;
  console.log(level, score, userId);
  save(level, score, userId);
  res.send("User saved");
});

app.post("/highscore", async (req, res) => {
  const { userId, score } = req.body;
  try {
    await saveHighScore(userId, score);
    res.send("High score saved");
  } catch (error) {
    res.status(500).send("Error saving high score");
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy();
  res.send("User logged out");
});

app.get("/leaderboard", async (req, res) => {
  try {
    const rows = await getLeaderboard();
    res.json(rows);
  } catch (error) {
    res.status(500).send("Error getting leaderboard");
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
