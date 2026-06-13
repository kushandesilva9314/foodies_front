import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Admin from "./pages/Admin.jsx";
import { AdminRoute, GuestRoute } from "./utils/ProtectedRoute.jsx";

function App() {
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const rememberMe = localStorage.getItem("rememberMe") === "true";
    const token = localStorage.getItem("token");
    const sessionActive = sessionStorage.getItem("sessionActive");

    if (token && !rememberMe && !sessionActive) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("rememberMe");
    }

    if (localStorage.getItem("token")) {
      sessionStorage.setItem("sessionActive", "true");
    }

    setAuthChecked(true);
  }, []);

  if (!authChecked) return null;

  return (
    <BrowserRouter>
      <Routes>
        {/* Public — anyone can visit */}
        <Route path="/" element={<Home />} />

        {/* Guest only — logged in users get redirected */}
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />

        {/* Admin only — must be logged in as admin */}
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;