// import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Worker } from "@react-pdf-viewer/core";
import "./globals.css";
import React from "react";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
      <App />
    </Worker>
  </React.StrictMode>
);
