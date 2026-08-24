import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DetectNews from "./pages/DetectNews";
import History from "./pages/History";
import Profile from "./pages/Profile";

import ProtectedRoute from "./routes/ProtectedRoute";

import {
  wakeFullProject,
} from "./services/api";


function App() {

  /*
  ============================================================
  AUTOMATIC FULL PROJECT WAKE-UP
  ============================================================

  When the frontend opens:

  1. Frontend contacts Express backend
  2. Backend wakes/checks FastAPI AI service
  3. AI service loads BERT V4 + EfficientNet V2

  This runs once when the app starts.
  ============================================================
  */

  useEffect(() => {

    wakeFullProject();

  }, []);


  return (
    <BrowserRouter>

      <Routes>

        {/* PUBLIC ROUTES */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* DASHBOARD */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* DETECT NEWS */}

        <Route
          path="/detect-news"
          element={
            <ProtectedRoute>
              <DetectNews />
            </ProtectedRoute>
          }
        />


        {/* PREDICTION HISTORY */}

        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />


        {/* USER PROFILE */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;