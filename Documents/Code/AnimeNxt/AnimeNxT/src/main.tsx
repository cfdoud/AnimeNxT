import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";       // This is your whole app (the router + pages)
import "./index.css";          // Global styles (Tailwind included)

// Find the <div id="root"> in index.html and render <App /> inside it
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
