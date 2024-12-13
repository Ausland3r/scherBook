const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], required: true },
  profileImage: { type: String, default: "" }
});

const User = mongoose.model("User", userSchema, "Users");


const bookSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ID владельца книги
  title: { type: String, required: true }, // Название книги
  author: { type: String, required: true }, // Автор книги
  genre: { type: String, required: true }, // Жанр книги
  image: { type: String, default: "" }, // URL изображения книги (по умолчанию пусто)
  addedDate: { type: Date, default: Date.now } // Дата добавления книги (по умолчанию текущее время)
});

const Book = mongoose.model("Book", bookSchema, "Books");

module.exports = { User, Book };
