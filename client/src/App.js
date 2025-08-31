import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useOrientation } from './hooks/useOrientation';
// import { useWorkoutStore } from './stores/workoutStore';
import Header from './components/Header';
import Home from './pages/Home';
import WorkoutInput from './pages/WorkoutInput';
import WorkoutSession from './pages/WorkoutSession';
import WorkoutComplete from './pages/WorkoutComplete';
import './App.css';

function App() {
  const orientation = useOrientation();
  // const { currentWorkout } = useWorkoutStore();

  return (
    <Router>
      <div className={`App ${orientation}`}>
        <Header />
        <main className="flex-1 safe-area">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/input" element={<WorkoutInput />} />
            <Route path="/workout" element={<WorkoutSession />} />
            <Route path="/complete" element={<WorkoutComplete />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
