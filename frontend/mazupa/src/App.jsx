import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import AcademicSelection from "./pages/AcademicSelection.jsx";
import Landing from "./pages/Landing.jsx";
import MallaCurricular from "./pages/Mallacurricular.jsx";
import mallaData from "./messagee.json";


function AppLayout() {
  const location = useLocation();

  return (
    <>
      <main>
        <Routes>
          <Route path="/" element={<Landing/>} />
          <Route path="/selection" element={<AcademicSelection />} />
          <Route path="/malla" element={<MallaCurricular data={mallaData} />} />

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
