const express = require('express');
const router = express.Router();
const Cliente = require('../models/Cliente');

// Crear
router.post('/', async (req, res) => {
  try {
    const cliente = new Cliente(req.body);
    await cliente.save();
    res.status(201).json(cliente);
  } catch (error) {
    if (error.code === 11000) { // Error de índice duplicado en MongoDB
      return res.status(400).json({ mensaje: 'La cédula ya está registrada.' });
    }
    res.status(500).json({ mensaje: 'Error al guardar el cliente.', error });
  }
});


// Listar todos
router.get('/', async (req, res) => {
  const clientes = await Cliente.find();
  res.json(clientes);
});

// Buscar por ID
router.get('/:id', async (req, res) => {
  const cliente = await Cliente.findById(req.params.id);
  res.json(cliente);
});

// Actualizar
router.put('/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(cliente);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ mensaje: 'La cédula ya está registrada.' });
    }
    res.status(500).json({ mensaje: 'Error al actualizar el cliente.', error });
  }
});


// Eliminar
router.delete('/:id', async (req, res) => {
  await Cliente.findByIdAndDelete(req.params.id);
  res.json({ mensaje: 'Eliminado' });
});

module.exports = router;
