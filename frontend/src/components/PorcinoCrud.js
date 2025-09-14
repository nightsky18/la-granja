import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import Swal from 'sweetalert2';
import ClienteCRUD from './ClienteCrud';
import AlimentacionCRUD from './AlimentacionCrud';
import EditarHistorialModal from './EditarHistorialModal';

const API = "http://localhost:5000/api/porcinos";
const API_CLIENTES = "http://localhost:5000/api/clientes";
const API_ALIMENTACIONES = "http://localhost:5000/api/alimentaciones";

export default function PorcinoCRUD() {
  const [porcinos, setPorcinos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [alimentaciones, setAlimentaciones] = useState([]);
  // estados
const [editHistOpen, setEditHistOpen] = useState(false);
const [registroEdit, setRegistroEdit] = useState(null);
const [porcinoEditRef, setPorcinoEditRef] = useState(null);

  // Form alta/edición de porcino (datos básicos)
  const [form, setForm] = useState({
    identificacion: "",
    raza: 1,
    edad: "",
    peso: "",
    cliente: ""
  });
  const [editId, setEditId] = useState(null);

  // Formularios embebidos
  const [showClienteForm, setShowClienteForm] = useState(false);
  const [showAlimentacionForm, setShowAlimentacionForm] = useState(false);

  // Modal para agregar alimentación al historial de un porcino
  const [alimentarModalOpen, setAlimentarModalOpen] = useState(false);
  const [porcinoSeleccionado, setPorcinoSeleccionado] = useState(null);
  const [alimentarForm, setAlimentarForm] = useState({ alimentacionId: "", dosis: "" });

  useEffect(() => {
    cargarListas();
  }, []);

  function cargarListas() {
    fetch(API).then(r => r.json()).then(setPorcinos);
    fetch(API_CLIENTES).then(r => r.json()).then(setClientes);
    fetch(API_ALIMENTACIONES).then(r => r.json()).then(setAlimentaciones);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validarFormulario() {
    if (!form.identificacion.trim()) {
      Swal.fire('Error', 'La identificación es obligatoria.', 'error');
      return false;
    }
    if (!form.edad || Number(form.edad) <= 0) {
      Swal.fire('Error', 'La edad debe ser un número positivo en meses.', 'error');
      return false;
    }
    if (!form.peso || Number(form.peso) <= 0) {
      Swal.fire('Error', 'El peso debe ser un número positivo en kg.', 'error');
      return false;
    }
    if (!form.cliente) {
      Swal.fire('Error', 'Debe seleccionar un cliente.', 'error');
      return false;
    }
    return true;
  }

  async function save(e) {
    e.preventDefault();
    if (!validarFormulario()) return;

    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${API}/${editId}` : API;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (!res.ok) {
        // Manejo de identificación duplicada u otros errores
        if (data?.mensaje?.toLowerCase().includes('identificacion') || data?.code === 11000) {
          Swal.fire('Error', 'La identificación ya está registrada.', 'error');
        } else {
          Swal.fire('Error', data.mensaje || 'Error al guardar porcino.', 'error');
        }
        return;
      }

      Swal.fire('¡Éxito!', editId ? 'Porcino actualizado.' : 'Porcino creado.', 'success');
      setForm({ identificacion: "", raza: 1, edad: "", peso: "", cliente: "" });
      setEditId(null);
      cargarListas();
    } catch {
      Swal.fire('Error', 'Error de conexión con el servidor.', 'error');
    }
  }

  function edit(p) {
    setForm({
      identificacion: p.identificacion,
      raza: p.raza,
      edad: p.edad,
      peso: p.peso,
      cliente: p.cliente?._id || ""
    });
    setEditId(p._id);
  }
  function abrirEditarHist(p, reg) {
  setPorcinoEditRef(p);
  setRegistroEdit(reg);
  setEditHistOpen(true);
}

async function eliminarRegistroHist(p, reg) {
  const ok = await Swal.fire({ title: '¿Eliminar registro?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar' });
  if (!ok.isConfirmed) return;
  try {
    const res = await fetch(`http://localhost:5000/api/porcinos/${p._id}/historial/${reg._id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) return Swal.fire('Error', data.mensaje || 'No se pudo eliminar.', 'error');
    Swal.fire('Eliminado', 'Registro eliminado y stock devuelto.', 'success');
    cargarListas();
  } catch {
    Swal.fire('Error', 'Error de conexión.', 'error');
  }
}


  async function del(id) {
    const confirm = await Swal.fire({
      title: '¿Eliminar porcino?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        Swal.fire('Error', data.mensaje || 'No se pudo eliminar.', 'error');
        return;
      }
      Swal.fire('Eliminado', 'Porcino eliminado correctamente.', 'success');
      cargarListas();
    } catch {
      Swal.fire('Error', 'Error de conexión al eliminar.', 'error');
    }
  }

  // Embebidos: al guardar, cerrar y recargar listas
  function onClienteSaved() {
    setShowClienteForm(false);
    cargarListas();
  }
  function onAlimentacionSaved() {
    setShowAlimentacionForm(false);
    cargarListas();
  }

  // Modal: agregar alimentación al historial de un porcino existente
  function abrirModalAlimentar(p) {
    setPorcinoSeleccionado(p);
    setAlimentarForm({ alimentacionId: '', dosis: '' });
    setAlimentarModalOpen(true);
  }

  function handleAlimentarChange(e) {
    setAlimentarForm({ ...alimentarForm, [e.target.name]: e.target.value });
  }

  async function guardarAlimentacionEnPorcino(e) {
    e.preventDefault();
    if (!alimentarForm.alimentacionId) {
      Swal.fire('Error', 'Seleccione una alimentación.', 'error');
      return;
    }
    if (!alimentarForm.dosis || Number(alimentarForm.dosis) <= 0) {
      Swal.fire('Error', 'Ingrese una dosis válida (libras).', 'error');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/porcinos/${porcinoSeleccionado._id}/alimentar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alimentacionId: alimentarForm.alimentacionId,
          dosis: Number(alimentarForm.dosis)
        })
      });
      const data = await res.json();
      if (!res.ok) {
        Swal.fire('Error', data.mensaje || 'No se pudo registrar la alimentación.', 'error');
        return;
        }
      Swal.fire('¡Listo!', 'Alimentación registrada y stock actualizado.', 'success');
      setAlimentarModalOpen(false);
      cargarListas();
    } catch {
      Swal.fire('Error', 'Error de conexión al registrar alimentación.', 'error');
    }
  }

  // Pantallas embebidas (crear cliente/alimentación desde aquí)
  if (showClienteForm) {
    return (
      <div>
        <h3>Crear nuevo Cliente</h3>
        <ClienteCRUD minimalMode={true} onSaved={onClienteSaved} onCancel={() => setShowClienteForm(false)} />
      </div>
    );
  }
  if (showAlimentacionForm) {
    return (
      <div>
        <h3>Crear nueva Alimentación</h3>
        <AlimentacionCRUD minimalMode={true} onSaved={onAlimentacionSaved} onCancel={() => setShowAlimentacionForm(false)} />
      </div>
    );
  }

  return (
    <div>
      <h2>Porcinos</h2>
      <form onSubmit={save}>
        <input
          name="identificacion"
          value={form.identificacion}
          onChange={handleChange}
          placeholder="Identificación (única)"
          required
        />
        <select name="raza" value={form.raza} onChange={handleChange} required>
          <option value={1}>York</option>
          <option value={2}>Hamp</option>
          <option value={3}>Duroc</option>
        </select>
        <input
          name="edad"
          type="number"
          value={form.edad}
          onChange={handleChange}
          placeholder="Edad (meses)"
          required
          min="1"
        />
        <input
          name="peso"
          type="number"
          value={form.peso}
          onChange={handleChange}
          placeholder="Peso (kg)"
          required
          min="0.1"
          step="0.1"
        />
        <select
          name="cliente"
          value={form.cliente}
          onChange={e => e.target.value === 'nuevo' ? setShowClienteForm(true) : handleChange(e)}
          required
        >
          <option value="">Seleccione cliente</option>
          {clientes.map(c => (
            <option key={c._id} value={c._id}>{c.nombres} {c.apellidos}</option>
          ))}
          <option value="nuevo">[+] Nuevo cliente</option>
        </select>

        <button type="submit">{editId ? 'Actualizar' : 'Crear'}</button>
        {editId && (
          <button
            type="button"
            onClick={() => {
              setEditId(null);
              setForm({ identificacion: "", raza: 1, edad: "", peso: "", cliente: "" });
            }}
          >
            Cancelar
          </button>
        )}
      </form>

      <table border="1">
        <thead>
          <tr>
            <th>Identificación</th>
            <th>Raza</th>
            <th>Edad (meses)</th>
            <th>Peso (kg)</th>
            <th>Cliente</th>
            <th>Historial alimentaciones</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {porcinos.map(p => (
            <tr key={p._id}>
              <td>{p.identificacion}</td>
              <td>{["", "York", "Hamp", "Duroc"][p.raza]}</td>
              <td>{p.edad}</td>
              <td>{p.peso}</td>
              <td>{p.cliente?.nombres} {p.cliente?.apellidos}</td>
             <td>
  {Array.isArray(p.historialAlimentacion) && p.historialAlimentacion.length > 0
    ? p.historialAlimentacion.map((h, idx) => (
        <div key={h._id || idx}>
          {h.alimentacion?.nombre || 'Alimento'} - {h.dosis} lbs - {new Date(h.fecha).toLocaleDateString()}{" "}
          <button onClick={() => abrirEditarHist(p, h)}>Editar</button>{" "}
          <button onClick={() => eliminarRegistroHist(p, h)}>Eliminar</button>
        </div>
      ))
    : 'Sin registros'}
</td>
              <td>
                <button onClick={() => edit(p)}>Editar</button>{" "}
                <button onClick={() => del(p._id)}>Borrar</button>{" "}
                <button onClick={() => abrirModalAlimentar(p)}>Agregar alimentación</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal para alimentar porcino */}
      <Modal isOpen={alimentarModalOpen} onRequestClose={() => setAlimentarModalOpen(false)} ariaHideApp={false}>
        <h3>Agregar alimentación a porcino</h3>
        {porcinoSeleccionado && (
          <p>
            Porcino: <strong>{porcinoSeleccionado.identificacion}</strong>
          </p>
        )}
        <form onSubmit={guardarAlementacionOnSubmitWrapper}>
          <select
            name="alimentacionId"
            value={alimentarForm.alimentacionId}
            onChange={handleAlimentarChange}
            required
          >
            <option value="">Seleccione alimentación</option>
            {alimentaciones.map(a => (
              <option key={a._id} value={a._id}>
                {a.nombre} (Stock: {a.cantidadLibras} lbs)
              </option>
            ))}
          </select>
          <input
            type="number"
            name="dosis"
            value={alimentarForm.dosis}
            onChange={handleAlimentarChange}
            placeholder="Dosis (libras)"
            required
            min="0.1"
            step="0.1"
          />
          <button type="submit">Guardar</button>
          <button type="button" onClick={() => setAlimentarModalOpen(false)}>Cancelar</button>
        </form>
    </Modal>
    {/* Modal de edición de historial: colócalo al final del JSX */}
    <EditarHistorialModal
      isOpen={editHistOpen}
      onRequestClose={() => setEditHistOpen(false)}
      porcino={porcinoEditRef}
      registro={registroEdit}
      onGuardado={() => cargarListas()}
    />
    </div>
  );

  // wrapper para evitar linters si deseas separar la función
  function guardarAlementacionOnSubmitWrapper(e) {
    guardarAlimentacionEnPorcino(e);
  }
}
