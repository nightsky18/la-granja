import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const API = "http://localhost:5000/api/clientes";

export default function ClienteCRUD({ minimalMode, onSaved, onCancel }) {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({ cedula: "", nombres: "", apellidos: "", direccion: "", telefono: "" });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetch(API).then(res => res.json()).then(setClientes);
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function save(e) {
  e.preventDefault();

  // Validaciones básicas frontend
  if (!/^\d{10}$/.test(form.telefono)) {
    return Swal.fire('Error', 'Teléfono debe tener exactamente 10 números.', 'error');
  }
  if (form.nombres.trim().length < 3 || form.apellidos.trim().length < 3) {
    return Swal.fire('Error', 'Nombre y apellido deben tener al menos 3 letras.', 'error');
  }
  if (!form.direccion.trim()) {
    return Swal.fire('Error', 'La dirección es obligatoria.', 'error');
  }

  try {
    const method = editId ? "PUT" : "POST";
    const url = editId ? `${API}/${editId}` : API;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await res.json();

    if (!res.ok) {
      // Validar el error de cédula duplicada enviado por backend
      if (data.mensaje && data.mensaje.includes('cedula')) {
        return Swal.fire('Error', 'La cédula ya está registrada.', 'error');
      }
      return Swal.fire('Error', data.mensaje || 'Error al guardar cliente', 'error');
    }

    // Éxito
    Swal.fire('¡Éxito!', `Cliente ${editId ? 'actualizado' : 'creado'} correctamente`, 'success');
    
    // Limpiar formulario y actualizar lista
    setForm({ cedula: "", nombres: "", apellidos: "", direccion: "", telefono: "" });
    setEditId(null);
    fetch(API).then(res => res.json()).then(setClientes);

    if (onSaved) onSaved(); // Para modo embebido

  } catch (error) {
    Swal.fire('Error', 'Error en la conexión con el servidor.', 'error');
  }
}

  function edit(cli) {
    setForm(cli);
    setEditId(cli._id);
  }

  function del(id) {
    fetch(`${API}/${id}`, { method: "DELETE" })
      .then(() => fetch(API).then(res => res.json()).then(setClientes));
  }
  function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

  return (
    <div>
      {!minimalMode && <h2>Clientes</h2>}
      <form onSubmit={save}>
        <input name="cedula" value={form.cedula} onChange={handleChange} placeholder="Cédula" required />
        <input name="nombres" value={form.nombres} onChange={handleChange} placeholder="Nombres" required />
        <input name="apellidos" value={form.apellidos} onChange={handleChange} placeholder="Apellidos" required />
        <input name="direccion" value={form.direccion} onChange={handleChange} placeholder="Dirección" required />
        <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="Teléfono" required />
        <button type="submit">{editId ? "Actualizar" : "Crear"}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setForm({ cedula: "", nombres: "", apellidos: "", direccion: "", telefono: "" }) }}>Cancelar</button>}
      </form>

      <table border="1">
        <thead>
          <tr>
            <th>Cédula</th><th>Nombres</th><th>Apellidos</th><th>Dirección</th><th>Teléfono</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map(c => (
            <tr key={c._id}>
              <td>{c.cedula}</td>
              <td>{capitalizar(c.nombres)}</td>
              <td>{capitalizar(c.apellidos)}</td>
              <td>{c.direccion}</td>
              <td>{c.telefono}</td>
              <td>
                <button onClick={() => edit(c)}>Editar</button>
                <button onClick={() => del(c._id)}>Borrar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {minimalMode && <button onClick={onCancel}>Cancelar</button>}
    </div>
  );
}
