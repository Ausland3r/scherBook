const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], required: true },
  available_books: { type: [String], default: [] },
  exchange_history: { type: [String], default: [] },
});

const User = mongoose.model("User", userSchema, "Users"); // Явно указываем имя коллекции

module.exports = { User };
