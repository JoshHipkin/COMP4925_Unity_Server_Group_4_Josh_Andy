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
  const query = `UPDATE user SET level = ?, save_score = ? WHERE username = ?`;
  try {
    const [result] = await database.query(query, [level, username]);
    return result;
  } catch (error) {
    console.error("Error saving user", error);
  }
}

async function getLeaderboard() {
  const query = `SELECT username, high_score FROM user ORDER BY high_score DESC`;
  try {
    const [result] = await database.query(query);
    return result;
  } catch (error) {
    console.error("Error getting leaderboard", error);
  }
}

module.exports = { createUser, getUser, save, getLeaderboard };
