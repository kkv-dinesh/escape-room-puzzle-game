import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoadingScreen from "./components/LoadingScreen";
import AuthPage from "./components/Authpage";
import Dashboard from "./components/Dashboard";
import Puzzle1 from "./components/Puzzle1";
import Puzzle2 from "./components/Puzzle2";
import Puzzle3 from "./components/Puzzle3";

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, []);

  return (
    <Router>
      {loading ? (
        <LoadingScreen />
      ) : (
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/game/puzzle1" element={<Puzzle1 />} />
          <Route path="/game/puzzle2" element={<Puzzle2 />} />
          <Route path="/game/puzzle3" element={<Puzzle3 />} />
        </Routes>
      )}
    </Router>
  );
};

export default App;
