const mongoose = require('mongoose');

// Definir el esquema
const sensorSchema = new mongoose.Schema({
  tipo: {
    type: String,
    required: true,
    enum: ['Sensor', 'Actuador'],
  },
  nombre: {
    type: String,
    required: true,
  },
  valor: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  unidad: {
    type: String,
    required: true,
  },
  fechaHora: {
    type: Date,
    default: Date.now,
  },
});

// Crear el modelo y especificar la colección
const SensorActuador = mongoose.model('SensorActuador', sensorSchema, 'sensoresactuadores');

module.exports = SensorActuador;