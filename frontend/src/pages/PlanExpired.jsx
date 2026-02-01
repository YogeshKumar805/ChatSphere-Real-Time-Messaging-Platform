import React, { useState } from "react";
import { api } from "../api/http";

export default function PlanExpired({ auth }) {
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const sendReq = async () => {
    setErr(""); setMsg("");
    try {
      const { data } = await api.post("/requests");
      setMsg(`Request sent (id: ${data.requestId}). Please wait for admin approval.`);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to send request");
    }
  };

  return (
    <div className="card">
      <h3>Plan Expired</h3>
      <div className="small">
        Your access is currently not active. Click below to request access from Admin.
      </div>
      <div style={{marginTop:12}}>
        <button className="btn" onClick={sendReq}>Send Request to Admin</button>
      </div>
      {msg && <div className="small" style={{marginTop:8}}>{msg}</div>}
      {err && <div className="small" style={{color:"crimson", marginTop:8}}>{err}</div>}
      {auth?.user?.access_ends_at && <div className="small" style={{marginTop:8}}>
        Last access ended: {new Date(auth.user.access_ends_at).toLocaleString()}
      </div>}
    </div>
  );
}
