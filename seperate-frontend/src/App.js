import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Scan from "./pages/Scan";
import Call from "./pages/Call";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/scan/:vehicleNumber" element={<Scan />} />
        <Route path="/call/:vehicleNumber" element={<Call />} />       
      </Routes>
    </Router>
  );
}

export default App;