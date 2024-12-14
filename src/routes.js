const express = require("express");
const jwt = require("jsonwebtoken");
const { User, Book, Exchange } = require("./models");
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

// Получение списка всех книг
router.get("/books", async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/exchange", async (req, res) => {
  try {
    const { creatorId, title, author, genre, desiredCriteria } = req.body;

    // 1. Создаем книгу, которую пользователь предлагает на обмен
    const newBook = new Book({
      ownerId: creatorId,
      title,
      author,
      genre,
    });
    const savedBook = await newBook.save();
    const bookId = savedBook._id;

    // 2. Проверяем, есть ли книга, соответствующая `desiredCriteria`
    const matchingBook = await Book.findOne({
      title: desiredCriteria.title,
      author: desiredCriteria.author,
      genre: desiredCriteria.genre,
    });

    if (matchingBook) {
      // 2.1. Если есть совпадающая книга, проверяем, есть ли обмен с этой книгой
      const matchingExchange = await Exchange.findOne({
        bookId: matchingBook._id,
        status: "pending",
      });

      if (matchingExchange) {
        // 2.2. Если найден обмен, обновляем его на `match`
        matchingExchange.status = "match";
        matchingExchange.accepterId = creatorId;
        await matchingExchange.save();

        // Создаем новый обмен со статусом `match`
        const newExchange = new Exchange({
          creatorId,
          bookId,
          desiredCriteria,
          status: "match",
          accepterId: matchingExchange.creatorId,
        });
        await newExchange.save();

        return res.status(200).json(newExchange);
      }
    }

    // 3. Если совпадений не найдено, создаем новый обмен с `pending` и `accepterId: null`
    const newExchange = new Exchange({
      creatorId,
      bookId,
      desiredCriteria,
      status: "pending",
      accepterId: null, // Явно указываем null для `accepterId`
    });

    await newExchange.save();
    return res.status(201).json(newExchange);
  } catch (err) {
    console.error("Error in POST /exchange:", err.message);
    res.status(400).json({ error: err.message });
  }
});

router.get("/exchange/:id", async (req, res) => {
  try {
    const exchange = await Exchange.findById(req.params.id);
    if (!exchange) {
      return res.status(404).send("Exchange not found");
    }
    res.json(exchange);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Получение всех обменов пользователя по ID
router.get("/exchanges/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Поиск обменов, где пользователь является создателем
    const exchanges = await Exchange.find({ creatorId: id });

    res.json(exchanges);
  } catch (err) {
    res.status(500).send(err.message);
  }
});



// Получение всех обменов
router.get("/exchanges", async (req, res) => {
  try {
    const exchanges = await Exchange.find();
    res.json(exchanges);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Получение книги по id
router.get("/books/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).send("Book not found");
    }
    res.json(book);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.put("/exchange/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { accepterId } = req.body;

    // Обновление accepterId и статуса
    const updatedExchange = await Exchange.findByIdAndUpdate(
      id,
      { accepterId, status: "match" },
      { new: true, runValidators: true }
    );

    if (!updatedExchange) {
      return res.status(404).send("Exchange not found");
    }

    res.json(updatedExchange);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;
