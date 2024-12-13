const express = require("express");
const jwt = require("jsonwebtoken");
const { User, Book } = require("./models");
const router = express.Router();

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Поиск пользователя по email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found.");
    }

    // Проверка пароля
    if (user.password !== password) {
      return res.status(401).send("Invalid email or password.");
    }

    // Генерация токена
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/auth/register", async (req, res) => {
  try {
    const { email, username, password, role } = req.body;

    // Проверка, существует ли пользователь с таким email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User with this email already exists.");
    }

    // Создание нового пользователя
    const user = new User({
      email,
      username,
      password,
      role: role || "user", // По умолчанию роль "user"
    });

    await user.save();

    // Генерация JWT
    const token = jwt.sign(
      { userId: user._id }, // Полезная информация в токене
      process.env.JWT_SECRET, // Секретный ключ из .env
      { expiresIn: "1h" } // Срок действия токена
    );

    res.status(201).json({
      message: "Registration successful",
      token, // Токен для аутентификации
      user: {
        id: user._id,
      },
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.json(user);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.put("/users/:id", async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.json(user);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.get("/genres", async (req, res) => {
  try {
    const genres = await Book.distinct("genre");
    res.json(genres);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Добавление новой книги
router.post("/books", async (req, res) => {
  try {
    const { ownerId, title, author, genre, image } = req.body;

    // Создание новой книги
    const newBook = new Book({
      ownerId,
      title,
      author,
      genre,
      image,
    });

    await newBook.save();
    res.status(201).json(newBook);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;
