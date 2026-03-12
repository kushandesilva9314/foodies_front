import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Admin from "./pages/Admin.jsx";

function App() {
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const rememberMe = localStorage.getItem("rememberMe") === "true";
    const token = localStorage.getItem("token");
    const sessionActive = sessionStorage.getItem("sessionActive");

    if (token && !rememberMe && !sessionActive) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken"); // ← add this
      localStorage.removeItem("user");
      localStorage.removeItem("rememberMe");
    }

    // Mark session as active
    if (localStorage.getItem("token")) {
      sessionStorage.setItem("sessionActive", "true");
    }

    // Auth check done — allow render
    setAuthChecked(true);
  }, []);

  // Don't render anything until auth check is complete
  if (!authChecked) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
