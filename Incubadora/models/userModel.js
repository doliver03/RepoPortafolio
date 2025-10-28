const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellidoP: { type: String, required: true },
  apellidoM: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

// Middleware para encriptar la contraseña antes de guardar
userSchema.pre('save', async function (next) {
  // Solo encriptar si la contraseña ha sido modificada o es nueva
  if (this.isModified('password') || this.isNew) {
    try {
      // Crear el hash de la contraseña
      const salt = await bcrypt.genSalt(10); // Número de salt rounds
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next(); // Si no hay cambios en la contraseña, continúa
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
