import React, { useState } from "react";
import { api } from "../api/http";
import { saveAuth } from "../state/auth";
import { useNavigate } from "react-router-dom";

export default function Register({ onAuth }) {
  const [name, setName] = useState("New User");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Password@123");
  const [inviteCode, setInviteCode] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const { data } = await api.post("/auth/register", { name, email, password, inviteCode });
      saveAuth(data);
      onAuth(data);
      nav("/chat");
    } catch (e) {
      setErr(e?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="card">
      <h3>Register (Invite code required)</h3>
      <form onSubmit={submit} className="list">
        <input className="input" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Name" />
        <input className="input" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" />
        <input className="input" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" type="password" />
        <input className="input" value={inviteCode} onChange={(e)=>setInviteCode(e.target.value)} placeholder="Invite Code" />
        {err && <div className="small" style={{color:"crimson"}}>{err}</div>}
        <button className="btn" type="submit">Create account</button>
        <div className="small">After signup you get a 3-day free trial automatically.</div>
      </form>
    </div>
  );
}
