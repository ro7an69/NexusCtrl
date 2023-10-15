import React, { lazy, Suspense, startTransition } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

// Lazy load your components
const Home = lazy(() => import("./pages/Home"));
const Gestures = lazy(() => import("./pages/gestures"));
const Settings = lazy(() => import("./pages/settings"));

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route
          path="/gestures"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <Gestures />
            </Suspense>
          }
        />
        <Route
          path="/settings"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <Settings />
            </Suspense>
          }
        />
        {/* Add more routes using the <Route> component */}
      </Routes>
    </Router>
  );
}

export default App;
