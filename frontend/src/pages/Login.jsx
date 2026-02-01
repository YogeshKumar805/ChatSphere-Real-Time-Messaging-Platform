import React, { useState } from "react";
import { api } from "../api/http";
import { saveAuth } from "../state/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Login({ onAuth }) {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Admin@123");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      saveAuth(data);
      onAuth(data);
      nav("/");
    } catch (e) {
      setErr(e?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="card">
      <h3>Login</h3>
      <form onSubmit={submit} className="list">
        <input className="input" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" />
        <input className="input" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" type="password" />
        {err && <div className="small" style={{color:"crimson"}}>{err}</div>}
        <button className="btn" type="submit">Sign in</button>
        <div className="small">No account? <Link to="/register">Register</Link></div>
      </form>
    </div>
  );
}
