import axios from "axios"; // conectando com o back-end

const caixaDigital = axios.create({
  baseURL: "http://localhost:3002",
});

export default caixaDigital;
