const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], required: true },
  profileImage: { type: String, default: "" },
  contactData: {type: String, default: ""}
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

const exchangeSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ID пользователя, создавшего обмен
  accepterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // ID пользователя, принявшего обмен (по умолчанию null)
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true }, // ID книги, предложенной для обмена
  desiredCriteria: { // Желаемые критерии
    title: { type: String, required: false }, // Желаемое название книги
    author: { type: String, required: false }, // Желаемый автор книги
    genre: { type: String, required: false } // Желаемый жанр книги
  },
  status: { type: String, enum: ["pending", "match"], default: "pending" },
  createdAt: { type: Date, default: Date.now } // Дата создания запроса на обмен

});

const Exchange = mongoose.model("Exchange", exchangeSchema, "Exchanges");

module.exports = { User, Book, Exchange };
