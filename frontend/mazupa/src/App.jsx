import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import AcademicSelection from "./pages/AcademicSelection.jsx";
import Landing from "./pages/Landing.jsx";

function AppLayout() {
  const location = useLocation();

  return (
    <>
      <main>
        <Routes>
          <Route path="/" element={<Landing/>} />
          <Route path="/selection" element={<AcademicSelection />} />

        </Routes>
      </main>

    </>
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
