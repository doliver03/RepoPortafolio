require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const http = require("http");
const authMiddleware = require("../middlewares/authMiddleware");
const SensorActuador = require("../models/sensorModel");    
const router = express.Router();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// Conectar a MongoDB
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/incubadoraDB";
mongoose.connect(MONGO_URI)
  .then(() => console.log("-----MongoDB conectado-----"))
  .catch(err => console.error("Error al conectar a MongoDB", err));

// Definir el esquema
const sensorSchema = new mongoose.Schema({
  tipo: String,
  nombre: String,
  valor: mongoose.Schema.Types.Mixed,
  unidad: String,
  fechaHora: { type: Date, default: Date.now }
});

// WebSockets
io.on("connection", (socket) => {
  console.log("Cliente conectado");

  socket.on("nuevoDato", async (data) => {
    try {
      const nuevoRegistro = new SensorActuador(data);
      await nuevoRegistro.save();
      io.emit("datoGuardado", nuevoRegistro);
    } catch (error) {
      console.error("Error al guardar dato", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });
});



/**
 * @swagger
 * /sensoresyactuadores:
 *   get:
 *     summary: Obtiene todos los sensores y actuadores (Requiere autenticación)
 *     description: Retorna una lista de sensores y actuadores desde la base de datos
 *     tags:
 *       - Sensores
 *     responses:
 *       200:
 *         description: Lista de sensores y actuadores obtenida exitosamente
 *       401:
 *         description: No autorizado, falta token.
 *       500:
 *         description: Error interno del servidor.
 */
router.get("/", async (req, res) => {
  try {
    const datos = await SensorActuador.find(); // Obtener todos los registros

    res.json({
      mensaje: "Lista de sensores y actuadores obtenida",
      user: req.user, // Incluye información del usuario autenticado
      sensores: datos, // Devuelve los sensores y actuadores
    });
  } catch (error) {
    console.error("Error al obtener los datos:", error);
    res.status(500).json({ error: "Error al obtener los datos" });
  }
});



/**
 * @swagger
 * tags:
 *   name: Sensores
 *   description: Rutas para manejar sensores y actuadores
 */



/*----------------------OBTIENE TODOS LOS REGISTROS------------*/
/**
 * @swagger
 * /sensoresyactuadores:
 *   get:
 *     summary: Obtiene todos los sensores y actuadores
 *     tags: [Sensores]
 *     responses:
 *       200:
 *         description: Lista de sensores y actuadores obtenida exitosamente
 */
router.get("/", async (req, res) => {
  try {
    const datos = await SensorActuador.find();
    res.json(datos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los datos" });
  }
});



//validacion de token
/**
 * @swagger
 * tags:
 *   name: Sensores
 *   description: Rutas para manejar sensores y actuadores
 */


/*----------------------OBTIENE TODOS LOS REGISTROS???------------*/
/**
 * @swagger
 * /sensoresyactuadores:
 *   get:
 *     summary: Obtiene todos los sensores y actuadores
 *     security:
 *       - bearerAuth: []  # 🔒 Requiere autenticación con token
 *     tags: 
 *       - Sensores
 *     responses:
 *       200:
 *         description: Lista de sensores obtenida con éxito
 *       401:
 *         description: Token no proporcionado o inválido
 */
router.get("/sensoresyactuadores", (req, res) => {
  res.json({ message: "Sensores obtenidos correctamente" });
});


/*--------------------OBTIENE UN SENSOR POR ID*/
/**
 * @swagger
 * /sensoresyactuadores/{id}:
 *   get:
 *     summary: Obtiene un sensor o actuador por ID
 *     security:
 *       - bearerAuth: []
 *     tags: [Sensores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sensor o actuador encontrado
 */
router.get("/:id", async (req, res) => {
  try {
    const dato = await SensorActuador.findById(req.params.id);
    if (!dato) return res.status(404).json({ error: "No encontrado" });
    res.json(dato);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el dato" });
  }
});



/*-----------------------REGISTRA UN NUEVO SENSOR--------------*/
/**
 * @swagger
 * /sensoresyactuadores:
 *   post:
 *     summary: Registra un nuevo sensor o actuador
 *     tags: [Sensores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               tipo:
 *                 type: string
 *               valor:
 *                 type: number
 *               unidad:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sensor registrado correctamente
 */
router.post("/", async (req, res) => {
  try {
    const nuevoRegistro = new SensorActuador(req.body);
    await nuevoRegistro.save();
    io.emit("datoGuardado", nuevoRegistro);
    res.status(201).json(nuevoRegistro);
  } catch (error) {
    res.status(400).json({ error: "Error al crear el registro" });
  }
});



/*---------------ACTUALIZA UN SENSOR POR ID--------------------*/
/**
 * @swagger
 * /sensoresyactuadores/{id}:
 *   put:
 *     summary: Actualiza un sensor o actuador por ID
 *     security:
 *       - bearerAuth: []
 *     tags: [Sensores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               tipo:
 *                 type: string
 *               valor:
 *                 type: number
 *               unidad:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sensor actualizado correctamente
 */
router.put("/:id", async (req, res) => {
  try {
    const actualizado = await SensorActuador.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!actualizado) return res.status(404).json({ error: "No encontrado" });
    io.emit("datoActualizado", actualizado);
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar" });
  }
});



/*----------------ELIMINAR UN REGISTRO POR ID----------------*/
/**
 * @swagger
 * /sensoresyactuadores/{id}:
 *   delete:
 *     summary: Elimina un sensor o actuador por ID
 *     security:
 *       - bearerAuth: []
 *     tags: [Sensores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sensor eliminado correctamente
 */
router.delete("/:id", async (req, res) => {
  try {
    const eliminado = await SensorActuador.findByIdAndDelete(req.params.id);
    if (!eliminado) return res.status(404).json({ error: "No encontrado" });
    io.emit("datoEliminado", eliminado);
    res.json({ mensaje: "Registro eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar" });
  }
});

module.exports = router;
