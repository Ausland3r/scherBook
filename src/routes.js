const express = require("express");
const jwt = require("jsonwebtoken");
const { User } = require("./models");
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




// Получение всех пользователей
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Добавление нового пользователя
router.post("/users", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Обновление пользователя
router.put("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).send("User not found");
    res.json(user);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Удаление пользователя
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).send("User not found");
    res.status(204).send();
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
