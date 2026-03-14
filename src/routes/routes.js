import React from "react";

import { Routes, Route, BrowserRouter as Router } from "react-router-dom";

import { Home, Daily } from "../containers";

function Rotas() {
  return (
    <Router>
      <Routes>
        <Route element={<Home />} path="/" />
        <Route element={<Daily />} path="daily" />
      </Routes>
    </Router>
  );
}

export default Rotas;
