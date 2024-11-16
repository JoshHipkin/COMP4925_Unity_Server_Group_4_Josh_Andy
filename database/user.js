const database = require("../dbConnection");

async function createUser(username, password) {
  const query = `INSERT INTO unity_users (username, hashed_password) VALUES (?, ?)`;
  try {
    const [result] = await database.query(query, [username, password]);
    return result;
  } catch (error) {
    console.error("Error creating user", error);
  }
}

async function getUser(username) {
  const query = `SELECT * FROM unity_users WHERE username = ?`;
  try {
    const [result] = await database.query(query, [username]);
    return result;
  } catch (error) {
    console.error("Error getting user", error);
  }
}

async function save(username, level) {
  const query = `UPDATE unity_users SET level = ? WHERE username = ?`;
  try {
    const [result] = await database.query(query, [level, username]);
    return result;
  } catch (error) {
    console.error("Error saving user", error);
  }
}

module.exports = { createUser, getUser, save };
