const database = require("../dbConnection");

async function createUser(username, password) {
  const query = `INSERT INTO user (username, hashed_password) VALUES (?, ?)`;
  try {
    const [result] = await database.query(query, [username, password]);
    return result.insertId;
  } catch (error) {
    console.error("Error creating user", error);
  }
}

async function getUser(username) {
  const query = `SELECT * FROM user WHERE username = ?`;
  try {
    const [result] = await database.query(query, [username]);

    return result[0];
  } catch (error) {
    console.error("Error getting user", error);
  }
}

async function save(username, level) {
  const query = `UPDATE user SET level = ?, save_score = ? WHERE userId = ?`;
  try {
    const [result] = await database.query(query, [level, username]);
    return result;
  } catch (error) {
    console.error("Error saving user", error);
  }
}

async function getLeaderboard() {
  const query = `SELECT username, high_score FROM user ORDER BY high_score DESC limit 5;`;
  try {
    const [result] = await database.query(query);
    console.log(result);
    return result;
  } catch (error) {
    console.error("Error getting leaderboard", error);
  }
}

async function saveHighScore(userId, score) {
  const query = `UPDATE user SET
    high_score = GREATEST(high_score, ?)
    WHERE id = ?`;

  try {
    const [result] = await database.query(query, [score, userId]);
    return result;
  } catch (error) {
    console.error("Error saving high score", error);
  }
}

module.exports = { createUser, getUser, save, getLeaderboard, saveHighScore };
