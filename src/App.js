import React from "react";
import "./App.css";
import Home from "./Pages/Home/Home";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Upload from "./Pages/Upload/Upload";
import { FileProvider } from "./FileContext";
import Storage from "./Pages/Storage/Storage";

function App() {
  return (
    <FileProvider>
      <Router>
        <Routes>
          <Route path="/home" exact element={<Home />} />
          <Route path="/storage" exact element={<Storage />} />
          <Route path="/" exact element={<Upload />} />
        </Routes>
      </Router>
    </FileProvider>
  );
}

export default App;
