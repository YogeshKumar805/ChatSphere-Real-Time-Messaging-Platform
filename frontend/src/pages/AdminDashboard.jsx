import React, { useEffect, useState } from "react";
import { api } from "../api/http";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [invite, setInvite] = useState("");
  const [err, setErr] = useState("");

  const load = async () => {
    const [s, r] = await Promise.all([
      api.get("/admin/dashboard"),
      api.get("/admin/requests/pending")
    ]);
    setStats(s.data);
    setRequests(r.data);
  };

  useEffect(() => { load().catch(e=>setErr(e?.response?.data?.message || "Failed to load")); }, []);

  const genInvite = async () => {
    setErr("");
    try {
      const { data } = await api.post("/invites/generate");
      setInvite(data.code);
    } catch (e) {
      setErr(e?.response?.data?.message || "Invite generation failed");
    }
  };

  const approve = async (id, duration) => {
    setErr("");
    try {
      await api.post(`/admin/requests/${id}/approve`, { duration });
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Approval failed");
    }
  };

  return (
    <div className="list">
      <div className="card">
        <h3>Admin Dashboard</h3>
        {err && <div className="small" style={{color:"crimson"}}>{err}</div>}
        {!stats ? <div className="small">Loading...</div> : (
          <div className="row">
            <div className="col card"><div>Total users</div><b>{stats.totalUsers}</b></div>
            <div className="col card"><div>Active</div><b>{stats.activeUsers}</b></div>
            <div className="col card"><div>Expired</div><b>{stats.expiredUsers}</b></div>
            <div className="col card"><div>Pending requests</div><b>{stats.pendingRequests}</b></div>
          </div>
        )}
      </div>

      <div className="card">
        <h4>Generate Invite Code</h4>
        <button className="btn" onClick={genInvite}>Generate</button>
        {invite && <div className="card" style={{marginTop:8}}>
          <div className="small">Invite Code (one-time)</div>
          <b style={{wordBreak:"break-all"}}>{invite}</b>
        </div>}
      </div>

      <div className="card">
        <h4>Pending Access Requests</h4>
        {requests.length === 0 ? <div className="small">No pending requests.</div> : (
          <div className="list">
            {requests.map(r => (
              <div key={r.id} className="card">
                <div style={{display:"flex", justifyContent:"space-between", gap:8, flexWrap:"wrap"}}>
                  <div>
                    <b>{r.name}</b> <span className="small">{r.email}</span>
                    <div className="small">Requested: {new Date(r.requested_at).toLocaleString()}</div>
                  </div>
                  <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                    <button className="btn" onClick={()=>approve(r.id,"1_day")}>Approve 1 day</button>
                    <button className="btn" onClick={()=>approve(r.id,"7_days")}>7 days</button>
                    <button className="btn" onClick={()=>approve(r.id,"1_month")}>1 month</button>
                    <button className="btn" onClick={()=>approve(r.id,"3_months")}>3 months</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
