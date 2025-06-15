import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001", // porta onde o json-server vai rodar
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
