
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

let users = [
  { id: 1, username: "alice", description: "Frontend dev" },
  { id: 2, username: "bob", description: "Backend dev" },
];

let nextId = 3;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Users API",
      version: "1.0.0",
      description: "Simple users CRUD"
    },
    servers: [{ url: "http://localhost:3000" }],
  },
  apis: ["./index.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const validateId = (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  req.userId = id;
  next();
};

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         username:
 *           type: string
 *         description:
 *           type: string
 *     UserInput:
 *       type: object
 *       required: [username, description]
 *       properties:
 *         username:
 *           type: string
 *         description:
 *           type: string
 */

 /**
 * @swagger
 * /users:
 *   get:
 *     summary: Список всех пользователей
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: OK
 */
app.get("/users", (req, res) => {
  res.json(users);
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Получить пользователя по ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Не найден
 */
app.get("/users/:id", validateId, (req, res) => {
  const user = users.find((u) => u.id === req.userId);

  if (!user) {
    return res.status(404).json({ error: "Not found" });
  }

  res.json(user);
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Создать пользователя
 *     tags: [Users]
 *     responses:
 *       201:
 *         description: Создан
 */
app.post("/users", (req, res) => {
  const { username, description = "" } = req.body;

  if (typeof username !== "string" || !username.trim()) {
    return res.status(400).json({ error: "username required" });
  }

  const user = {
    id: nextId++,
    username: username.trim(),
    description: typeof description === "string" ? description.trim() : ""
  };

  users.push(user);
  res.status(201).json(user);
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Полная замена пользователя
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Не найден
 */
app.put("/users/:id", validateId, (req, res) => {
  const idx = users.findIndex((u) => u.id === req.userId);

  if (idx === -1) {
    return res.status(404).json({ error: "Not found" });
  }

  const { username, description } = req.body;

  if (
    typeof username !== "string" ||
    !username.trim() ||
    typeof description !== "string" ||
    !description.trim()
  ) {
    return res.status(400).json({
      error: "PUT requires username and description"
    });
  }

  users[idx] = {
    id: req.userId,
    username: username.trim(),
    description: description.trim()
  };

  res.json(users[idx]);
});

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Частичное обновление пользователя
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Не найден
 */
app.patch("/users/:id", validateId, (req, res) => {
  const user = users.find((u) => u.id === req.userId);

  if (!user) {
    return res.status(404).json({ error: "Not found" });
  }

  const { username, description } = req.body;

  if (username === undefined && description === undefined) {
    return res.status(400).json({
      error: "Provide username or description"
    });
  }

  if (
    username !== undefined &&
    (typeof username !== "string" || !username.trim())
  ) {
    return res.status(400).json({ error: "Invalid username" });
  }

  if (
    description !== undefined &&
    (typeof description !== "string" || !description.trim())
  ) {
    return res.status(400).json({ error: "Invalid description" });
  }

  if (username !== undefined) {
    user.username = username.trim();
  }

  if (description !== undefined) {
    user.description = description.trim();
  }

  res.json(user);
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Удалить пользователя
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Удалён
 *       404:
 *         description: Не найден
 */
app.delete("/users/:id", validateId, (req, res) => {
  const idx = users.findIndex((u) => u.id === req.userId);

  if (idx === -1) {
    return res.status(404).json({ error: "Not found" });
  }

  const deleted = users.splice(idx, 1)[0];

  res.json({ deleted });
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
  console.log("Swagger docs at http://localhost:3000/api-docs");
});
