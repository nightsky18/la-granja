const express = require('express');
const router = express.Router();
const Alimentacion = require('../models/Alimentacion');

// Crear alimentación
router.post('/', async (req, res) => {
  const nuevo = new Alimentacion(req.body);
  await nuevo.save();
  res.json(nuevo);
});

// Obtener todas las alimentaciones
router.get('/', async (req, res) => {
  const alimentaciones = await Alimentacion.find();
  res.json(alimentaciones);
});

// Actualizar alimentación
router.put('/:id', async (req, res) => {
  const actualizado = await Alimentacion.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(actualizado);
});

// Eliminar alimentación
router.delete('/:id', async (req, res) => {
  await Alimentacion.findByIdAndDelete(req.params.id);
  res.json({ mensaje: 'Alimentación eliminada' });
});

module.exports = router;
