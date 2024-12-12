const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], required: true }
});

const User = mongoose.model("User", userSchema, "Users");

module.exports = { User };
