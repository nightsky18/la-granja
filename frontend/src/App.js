
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import ClienteCRUD from './components/ClienteCrud';
import AlimentacionCRUD from './components/AlimentacionCrud';
import PorcinoCRUD from './components/PorcinoCrud';

function App() {
  return (
    <Router>
      <div>
        <nav>
          <Link to="/">Porcinos</Link> |{" "}
          <Link to="/clientes">Clientes</Link> |{" "}
          <Link to="/alimentaciones">Alimentaciones</Link>
        </nav>

        <Routes>
          <Route path="/" element={<PorcinoCRUD />} />
          <Route path="/clientes" element={<ClienteCRUD />} />
          <Route path="/alimentaciones" element={<AlimentacionCRUD />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
