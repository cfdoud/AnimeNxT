// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/home.tsx";  // your Home.tsx
import ResultsPage from "./components/Results.tsx"; // new page we’ll make
import QuestionnairePage from "./components/Questionnaire.tsx"; // optional later

function App() {
  return (
    <Router>
      <Routes>
        {/* Default homepage */}
        <Route path="/" element={<HomePage />} />

        {/* Questionnaire */}
        <Route path="/questionnaire" element={<QuestionnairePage />} />

        {/* Results */}
        <Route path="/results" element={<ResultsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
