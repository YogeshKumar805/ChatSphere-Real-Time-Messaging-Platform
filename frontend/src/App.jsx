import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import "./styles.css";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ChatDashboard from "./pages/ChatDashboard.jsx";
import PlanExpired from "./pages/PlanExpired.jsx";

import { loadAuth, clearAuth } from "./state/auth";
import { setAuthToken } from "./api/http";

export default function App() {
  const [auth, setAuth] = useState(() => loadAuth());
  const nav = useNavigate();

  useEffect(() => {
    if (auth?.accessToken) setAuthToken(auth.accessToken);
  }, [auth]);

  const isAuthed = !!auth?.accessToken;
  const role = auth?.user?.role_name;

  return (
    <div className="container">
      <div className="toolbar">
        <h2 style={{margin:0}}>Chat App</h2>
        <div style={{display:"flex", gap:8, alignItems:"center"}}>
          {isAuthed ? (
            <>
              <span className="small">{auth.user.email}</span>
              <button className="btn secondary" onClick={() => { clearAuth(); setAuth(null); nav("/login"); }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="small">Login</Link>
              <Link to="/register" className="small">Register</Link>
            </>
          )}
        </div>
      </div>

      <Routes>
        <Route path="/" element={<Navigate to={isAuthed ? (role === "admin" ? "/admin" : "/chat") : "/login"} />} />
        <Route path="/login" element={<Login onAuth={setAuth} />} />
        <Route path="/register" element={<Register onAuth={setAuth} />} />
        <Route path="/expired" element={<PlanExpired auth={auth} />} />

        <Route path="/admin" element={isAuthed && role==="admin" ? <AdminDashboard auth={auth} /> : <Navigate to="/login" />} />
        <Route path="/chat" element={isAuthed && role==="user" ? <ChatDashboard auth={auth} /> : <Navigate to="/login" />} />

        <Route path="*" element={<div className="card">Not found</div>} />
      </Routes>
    </div>
  );
}
