import React from "react";
import { Spinner as BS_Spinner } from "react-bootstrap";

const Spinner: React.FC = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
    <BS_Spinner animation="border" role="status" variant="primary">
      <span className="visually-hidden">Carregando...</span>
    </BS_Spinner>
  </div>
);

export default Spinner;
