import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';

const API = "http://localhost:5000/api/alimentaciones";
const API_PORCINOS = "http://localhost:5000/api/porcinos";

function AlimentarPorcinoModal({ isOpen, onRequestClose, alimentacionId, onAlimentado }) {
  const [porcinos, setPorcinos] = useState([]);
  const [form, setForm] = useState({ porcinoId: '', dosis: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch(API_PORCINOS)
        .then(res => res.json())
        .then(data => setPorcinos(data))
        .catch(() => setPorcinos([]));
      setForm({ porcinoId: '', dosis: '' });
    }
  }, [isOpen]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.porcinoId) {
      alert('Seleccione un porcino');
      return;
    }
    if (!form.dosis || Number(form.dosis) <= 0) {
      alert('Ingrese una dosis válida (mayor que 0)');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/porcinos/${form.porcinoId}/alimentar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alimentacionId, dosis: Number(form.dosis) })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.mensaje || 'Error al asignar alimentación');
      } else {
        alert('Alimentación asignada correctamente');
        onAlimentado();
        onRequestClose();
      }
    } catch {
      alert('Error en la conexión al servidor');
    }
    setLoading(false);
  }

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} ariaHideApp={false}>
      <h2>Asignar alimentación a porcino</h2>
      <form onSubmit={handleSubmit}>
        <select name="porcinoId" value={form.porcinoId} onChange={handleChange} required>
          <option value="">Seleccione porcino</option>
          {porcinos.map(p => (
            <option key={p._id} value={p._id}>
              {p.identificacion} - {p.cliente?.nombres} {p.cliente?.apellidos}
            </option>
          ))}
        </select>
        <input
          type="number"
          name="dosis"
          value={form.dosis}
          onChange={handleChange}
          placeholder="Dosis en libras"
          step="0.1"
          min="0.1"
          required
        />
        <button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
        <button type="button" onClick={onRequestClose} disabled={loading}>Cancelar</button>
      </form>
    </Modal>
  );
}

export default function AlimentacionCRUD({ minimalMode, onSaved, onCancel }) {
  const [alimentaciones, setAlimentaciones] = useState([]);
  const [form, setForm] = useState({ id: "", nombre: "", descripcion: "", cantidadLibras: "" });
  const [editId, setEditId] = useState(null);

  const [alimentarModalOpen, setAlimentarModalOpen] = useState(false);
  const [alimentacionSeleccionada, setAlimentacionSeleccionada] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  function cargarDatos() {
    fetch(API).then(res => res.json()).then(setAlimentaciones);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validarFormulario() {
    if (!form.id.trim()) {
      alert("El campo ID es obligatorio y único.");
      return false;
    }
    if (!form.nombre.trim()) {
      alert("El campo Nombre es obligatorio.");
      return false;
    }
    if (!form.descripcion.trim()) {
      alert("El campo Descripción es obligatorio.");
      return false;
    }
    if (!form.cantidadLibras || Number(form.cantidadLibras) <= 0) {
      alert("La cantidad en libras debe ser un número positivo.");
      return false;
    }
    return true;
  }

  function save(e) {
    e.preventDefault();
    if (!validarFormulario()) return;

    const method = editId ? "PUT" : "POST";
    const url = editId ? `${API}/${editId}` : API;

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: form.id,
        nombre: form.nombre,
        descripcion: form.descripcion,
        cantidadLibras: Number(form.cantidadLibras)
      })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          alert(data.mensaje || "Error al guardar alimentación");
        } else {
          alert(editId ? "Alimentación actualizada" : "Alimentación creada");
          setForm({ id: "", nombre: "", descripcion: "", cantidadLibras: "" });
          setEditId(null);
          cargarDatos();
          if (onSaved) onSaved();
        }
      })
      .catch(() => alert("Error en la conexión al servidor"));
  }

  function edit(alimentacion) {
    setForm({
      id: alimentacion.id,
      nombre: alimentacion.nombre,
      descripcion: alimentacion.descripcion,
      cantidadLibras: alimentacion.cantidadLibras
    });
    setEditId(alimentacion._id);
  }

  function del(id) {
    if (!window.confirm("¿Seguro que deseas eliminar esta alimentación?")) return;
    fetch(`${API}/${id}`, { method: "DELETE" })
      .then(() => cargarDatos())
      .catch(() => alert("Error al eliminar alimentación"));
  }

  function abrirModalAlimentar(alimentacion) {
    setAlimentacionSeleccionada(alimentacion);
    setAlimentarModalOpen(true);
  }

  return (
    <div>
      {!minimalMode && <h2>Alimentaciones</h2>}
      <form onSubmit={save}>
        <input name="id" value={form.id} onChange={handleChange} placeholder="ID (único)" required />
        <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" required />
        <input name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Descripción" required />
        <input
          name="cantidadLibras"
          type="number"
          value={form.cantidadLibras}
          onChange={handleChange}
          placeholder="Cantidad en libras"
          min="0.1"
          step="0.1"
          required
        />
        <button type="submit">{editId ? "Actualizar" : "Crear"}</button>
        {editId && <button type="button" onClick={() => {
          setEditId(null);
          setForm({ id: "", nombre: "", descripcion: "", cantidadLibras: "" });
        }}>Cancelar</button>}
      </form>

      <table border="1">
        <thead>
          <tr>
            <th>ID</th><th>Nombre</th><th>Descripción</th><th>Stock (libras)</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {alimentaciones.map(a => (
            <tr key={a._id}>
              <td>{a.id}</td>
              <td>{a.nombre}</td>
              <td>{a.descripcion}</td>
              <td>{a.cantidadLibras}</td>
              <td>
                <button onClick={() => edit(a)}>Editar</button>{" "}
                <button onClick={() => del(a._id)}>Borrar</button>{" "}
                <button onClick={() => abrirModalAlimentar(a)}>Asignar a Porcino</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <AlimentarPorcinoModal
        isOpen={alimentarModalOpen}
        onRequestClose={() => setAlimentarModalOpen(false)}
        alimentacionId={alimentacionSeleccionada?._id}
        onAlimentado={() => {
          cargarDatos();
          setAlimentarModalOpen(false);
        }}
      />

      {minimalMode && <button onClick={onCancel}>Cancelar</button>}
    </div>
  );
}
