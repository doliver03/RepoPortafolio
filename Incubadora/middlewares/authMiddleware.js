const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization"); // Obtiene el token del header

    if (!token) {
        return res.status(401).json({ error: "Acceso denegado. Token no proporcionado." });
    }

    try {
        const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET); // Verifica el token
        req.user = verified; // Guarda el usuario en `req.user`
        next(); // Continúa con la siguiente función
    } catch (error) {
        res.status(401).json({ error: "Token inválido o expirado." });
    }
};





module.exports = authMiddleware;
