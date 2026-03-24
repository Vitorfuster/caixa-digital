import React from "react";

import { Routes, Route, BrowserRouter as Router } from "react-router-dom";

import { Home, Daily, CloseBox } from "../containers";

function Rotas() {
  return (
    <Router>
      <Routes>
        <Route element={<Home />} path="/" />
        <Route element={<Daily />} path="daily" />

        <Route element={<CloseBox />} path="closebox" />
      </Routes>
    </Router>
  );
}

export default Rotas;
