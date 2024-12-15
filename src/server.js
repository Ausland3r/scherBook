require("dotenv").config({ path: "/etc/secrets/.env" });

const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const routes = require("./routes"); // Импорт маршрутов

const app = express();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

console.log("Mongo URI:", MONGO_URI);

// Подключение к MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

  const corsOptions = {
    origin: "*", // Разрешить запросы с любого источника
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Разрешённые методы
    allowedHeaders: ["Content-Type", "Authorization"], // Разрешённые заголовки
    credentials: false // Если не нужно передавать токены/куки
  };

// Middleware
app.use(express.json()); // Обработка JSON-запросов
app.use("/api", routes); // Подключение маршрутов по префиксу "/api"
app.use(cors(corsOptions));


// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
