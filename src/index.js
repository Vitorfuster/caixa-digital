import React from "react";
import ReactDOM from "react-dom/client";
import { ToastContainer } from "react-toastify"; // Biblioteca Toatify
import Rotas from "./routes/routes";
import GlobalStyles from "./styles/globalStyles";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <>
    <Rotas />
    <GlobalStyles />
    <ToastContainer />
  </>,
);
