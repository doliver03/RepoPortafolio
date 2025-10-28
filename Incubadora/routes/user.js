const express = require("express");
const User = require("../models/userModel");
const authMiddleware = require("../middlewares/authMiddleware");
const bcrypt = require("bcrypt");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Rutas para manejar usuarios
 */

/*>>>>>>>>>OBTIENE TODOS LOS USUARIOS<<<<<<<<<<<<*/

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtiene todos los usuarios
 *     
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 */
router.get("/", async (req, res) => {
  try {
    const usuarios = await User.find();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los usuarios" });
  }
});

/*>>>>>>>>>OBTIENE UN USUARIO POR ID<<<<<<<<<<<<*/

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtiene un usuario por ID
 *     security:
 *       - bearerAuth: []
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 */
router.get("/:id",authMiddleware, async (req, res) => {
  try {
    const usuario = await User.findById(req.params.id);
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el usuario" });
  }
});


/*>>>>>>>>>REGISTRA UN USUARIO<<<<<<<<<<<<*/
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellidoP
 *               - apellidoM
 *               - email
 *               - password
 *             properties:
 *               nombre:
 *                 type: string
 *               apellidoP:
 *                 type: string
 *               apellidoM:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Datos inválidos en la solicitud
 *       409:
 *         description: El usuario ya existe
 */
router.post("/", async (req, res) => {
  try {
    const { nombre, apellidoP, apellidoM, email, password } = req.body;

    // Validación de campos obligatorios
    if (!nombre || !apellidoP || !apellidoM || !email || !password) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // Verificar si el usuario ya está registrado
    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) {
      return res.status(409).json({ error: "El usuario ya está registrado con este email" });
    }

    // Crear un nuevo usuario
    const nuevoUsuario = new User({ nombre, apellidoP, apellidoM, email, password });

    // Guardar el nuevo usuario (la contraseña ya se cifrará en el modelo)
    await nuevoUsuario.save();

    // Responder con éxito
    res.status(201).json({
      message: "Usuario registrado exitosamente",
      usuario: { nombre, apellidoP, apellidoM, email }, // No es necesario devolver la contraseña
    });
  } catch (error) {
    console.error("Error al registrar el usuario:", error); // Log de error para depuración
    res.status(400).json({
      error: "Error al registrar el usuario",
      details: error.message, // Añadir más detalles del error
    });
  }
});

/*>>>>>>>>>ACTUALIZA USUARIOS POR ID<<<<<<<<<<<<*/
/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Actualiza un usuario por ID
 *     
 *     tags: [Usuarios]
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
 *               apellidoP:
 *                 type: string
 *               apellidoM:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *       404:
 *         description: Usuario no encontrado
 */
router.put("/:id", async (req, res) => {
  try {
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }
    const actualizado = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!actualizado) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el usuario" });
  }
});

/*>>>>>>>>>ELIINA UN USUARIO POR ID<<<<<<<<<<<<*/
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Elimina un usuario por ID
 *     
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 *       404:
 *         description: Usuario no encontrado
 */
router.delete("/:id",async (req, res) => {
  try {
    const eliminado = await User.findByIdAndDelete(req.params.id);
    if (!eliminado) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ mensaje: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el usuario" });
  }
});

/*>>>>>>>>>>>>>OBTENER PERFIL USUARIO<<<<<<<<<<<<<<<<<<<<*/
/**
 * @swagger
 * /user/perfil:
 *   get:
 *     summary: Obtener el perfil del usuario
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Usuario
 *     responses:
 *       200:
 *         description: Datos del usuario obtenidos correctamente.
 *       401:
 *         description: No autorizado, falta token.
 */
router.get("/perfil", authMiddleware, async (req, res) => {
  try {
      res.json({ mensaje: "Acceso permitido", user: req.user });
  } catch (error) {
      res.status(500).json({ error: "Error al obtener perfil" });
  }
});

module.exports = router;
