
// ----------------- CRUD de sensores y actuadores
app.get("/sensoresyactuadores", async (req, res) => {
  try {
    const datos = await SensorActuador.find();
    res.json(datos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los datos" });
  }
});

app.get("/sensoresyactuadores/:id", async (req, res) => {
  try {
    const dato = await SensorActuador.findById(req.params.id);
    if (!dato) return res.status(404).json({ error: "No encontrado" });
    res.json(dato);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el dato" });
  }
});

app.get("/sensoresactuadores/buscar", async (req, res) => {
  try {
    const { tipo, nombre } = req.query;
    const filtro = {};
    if (tipo) filtro.tipo = tipo;
    if (nombre) filtro.nombre = nombre;

    const resultados = await SensorActuador.find(filtro);
    res.json(resultados);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar datos" });
  }
});

app.post("/sensoresyactuadores", async (req, res) => {
  try {
    const nuevoRegistro = new SensorActuador(req.body);
    await nuevoRegistro.save();
    io.emit("datoGuardado", nuevoRegistro);
    res.status(201).json(nuevoRegistro);
  } catch (error) {
    console.error("❌ Error al crear el registro:", error);
    res.status(400).json({ error: "Error al crear el registro" });
  }
});

app.put("/sensoresyactuadores/:id", async (req, res) => {
  try {
    const actualizado = await SensorActuador.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!actualizado) return res.status(404).json({ error: "No encontrado" });
    io.emit("datoActualizado", actualizado);
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar" });
  }
});

app.delete("/sensoresyactuadores/:id", async (req, res) => {
  try {
    const eliminado = await SensorActuador.findByIdAndDelete(req.params.id);
    if (!eliminado) return res.status(404).json({ error: "No encontrado" });
    io.emit("datoEliminado", eliminado);
    res.json({ mensaje: "Registro eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar" });
  }
});

// -----------