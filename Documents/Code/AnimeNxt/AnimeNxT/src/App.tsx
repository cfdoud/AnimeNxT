// src/App.tsx
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/home.tsx";  // your Home.tsx
import ResultsPage from "./components/Results.tsx"; // new page we’ll make
import QuestionnairePage from "./components/Questionaire.tsx"; // optional later

function App() {
  const [animeList, setAnimeList] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const saveAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  return (
    <Router>
      <Routes>
        {/* Default homepage */}
        <Route path="/" element={<HomePage />} />

        {/* Questionnaire */}
        {/* <Route
          path="/questionnaire"
          element={
            <QuestionnairePage
              animeList={animeList}
              answers={answers}
              saveAnswer={saveAnswer}
            />
          }
        /> */}

        {/* Results */}
       
      </Routes>
    </Router>
  );
}

export default App;
