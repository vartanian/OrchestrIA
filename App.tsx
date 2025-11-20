import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import TasksPage from './pages/TasksPage';
import Communications from './pages/Communications';
import { StoreProvider } from './context/StoreContext';

function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="communications" element={<Communications />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}

export default App;