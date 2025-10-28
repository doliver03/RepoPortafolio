const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Asegúrate de que la ruta es correcta
const router = express.Router();
const bcrypt = require('bcrypt');
const authMiddleware = require('../middlewares/authMiddleware');


/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Inicia sesión
 *     description: Inicia sesión con un email y contraseña, y devuelve un token JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "usuario@email.com"
 *               password:
 *                 type: string
 *                 example: "contraseñaSegura"
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Error al iniciar sesión
 *       401:
 *         description: Email o contraseña inválidos
 */

// Ruta para iniciar sesión

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Datos recibidos:', req.body);

        const user = await User.findOne({ email }).select('+password');
        console.log('Usuario encontrado:', user);

        if (!user) {
            console.log('No se encontró el usuario');
            return res.status(401).json({ error: 'Email o contraseña inválidos' });
        }
        
        // Eliminar el .trim() de aquí ya que bcrypt.compare() no requiere ese paso

        console.log('Contraseña ingresada:', password);  // Contraseña proporcionada por el usuario
        console.log('Contraseña hash en base de datos:', user.password);  // Contraseña hash almacenada en la base de dato

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Comparación de contraseñas:', isMatch);

        if (!isMatch) {
            console.log('No coinciden la contraseña');
            return res.status(401).json({ error: 'Email o contraseña inválidos' });
        }

        if (!process.env.JWT_SECRET) {
            console.log('JWT_SECRET no está definido');
            return res.status(500).json({ error: 'Error del servidor: JWT_SECRET no está definido' });
        }

        // Generar el token JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        console.log('Token generado:', token);

        // Verificar el token (esto puede ser opcional según tu flujo)
        jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token válido');

        res.json({ token, message: '✅✅✅✅✅✅✅✅✅✅Autenticación exitosa✅✅✅✅✅✅✅✅✅✅' });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(400).json({ error: 'Error al iniciar sesión' });
    }
});

module.exports = router;
