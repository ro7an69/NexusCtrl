import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import HandWaving from "./pages/gestures"; // Correct the import statement for HandWaving
import Settings from "./pages/settings"; // Correct the import statement for Settings

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/gestures" element={<HandWaving />} /> {/* Correct the element for HandWaving */}
        <Route path="/settings" element={<Settings />} /> {/* Correct the element for Settings */}
        {/* Add more routes using the <Route> component */}
      </Routes>
    </Router>
  );
}

export default App;
