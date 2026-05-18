import { ToastContainer } from "react-toastify";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import LiveNote from "./pages/LiveNote";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/live-note/:id"
          element={
            <ProtectedRoute>
              <LiveNote />
            </ProtectedRoute>
          }
        />
      </Routes>

      <ToastContainer position="top-right" />
    </BrowserRouter>
  );
}

export default App;
