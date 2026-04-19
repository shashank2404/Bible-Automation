import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import ChatPage from "./pages/chatPage";
import BibleOnboarding from "./pages/bibleOnboarding";
import HomePage from "./pages/HomePage";
import BiblePage from "./pages/biblePage";
import Profile from "./pages/profile";
import CalendarPage from "./pages/CalendarPage"
import VersePage from "./pages/VersePage";
// Auth Guard
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Onboarding */}
        <Route
          path="/onboarding"
          element={<PrivateRoute><BibleOnboarding /></PrivateRoute>}
        />

        {/* Home */}
        <Route
          path="/home"
          element={<PrivateRoute><HomePage /></PrivateRoute>}
        />

        {/* Chat */}
        <Route
          path="/chat"
          element={<PrivateRoute><ChatPage /></PrivateRoute>}
        />

        {/* Bible */}
        <Route
          path="/bible"
          element={<PrivateRoute><BiblePage /></PrivateRoute>}
        />
           //profile
        <Route
          path="/profile"
          element={<PrivateRoute><Profile /></PrivateRoute>}
        />
        //calendar
        <Route
          path="/calendar"
          element={<PrivateRoute><CalendarPage /></PrivateRoute>}
        />
         <Route
          path="/verse-reading"
          element={<PrivateRoute><VersePage /></PrivateRoute>}
        />
        {/* Default */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;