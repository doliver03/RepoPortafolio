require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const swaggerDocs = require("./swagger");

// Importar rutas y modelos
const SensorActuador = require("./models/sensorModel");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user.js");
const sensoresyactuadoresRoutes = require("./routes/sensoresyactuadores.js");

// Crear la aplicación Express y servidor HTTP
const app = express();
const server = http.createServer(app);

// Configuración de WebSockets con Socket.io
const io = new Server(server, {
  cors: { origin: "*" },
});

// Definir puerto y URI de la base de datos
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/test";

// ----------------- Middleware
app.use(cors());
app.use(express.json());

// -------------------- Conectar a MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() =>
    console.log(
      "✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅MongoDB conectado✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅"
    )
  )
  .catch((err) => console.error("❌ Error al conectar a MongoDB:", err));

// ----------------- WebSockets
io.on("connection", (socket) => {
  console.log("Cliente conectado");

  socket.on("nuevoDato", async (data) => {
    try {
      const nuevoRegistro = new SensorActuador(data);
      await nuevoRegistro.save();
      io.emit("datoGuardado", nuevoRegistro);
    } catch (error) {
      console.error("❌ Error al guardar dato:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });
});

// ----------------- Rutas
app.use("/api", authRoutes);
app.use("/users", userRoutes);
app.use("/sensoresyactuadores", sensoresyactuadoresRoutes);

// ----------------- Cargar Swagger
swaggerDocs(app);

// ----------------- Iniciar Servidor
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📜 Documentación Swagger en http://localhost:${PORT}/api-docs`);
});
