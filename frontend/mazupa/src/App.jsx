import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AcademicSelection from "./pages/AcademicSelection.jsx";
import Landing from "./pages/Landing.jsx";
import MallaCurricular from "./pages/Mallacurricular.jsx";

function AppLayout() {
  return (
    <main>
      <Routes>
        <Route path="/" element={<Landing/>} />
        <Route path="/selection" element={<AcademicSelection />} />
        <Route path="/malla" element={<MallaCurricular />} />
      </Routes>
    </main>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
