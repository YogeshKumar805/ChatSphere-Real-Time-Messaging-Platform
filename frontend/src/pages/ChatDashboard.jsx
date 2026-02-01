import React, { useEffect, useRef, useState } from "react";
import { api } from "../api/http";
import { connectSocket, disconnectSocket, getSocket } from "../realtime/socket";
import { useNavigate } from "react-router-dom";

export default function ChatDashboard({ auth }) {
  const nav = useNavigate();

  const [users, setUsers] = useState([]);
  const [invitedCount, setInvitedCount] = useState(0);

  // ✅ Invite UI state (same style as Admin)
  const [invite, setInvite] = useState("");
  const [myInvites, setMyInvites] = useState([]);
  const [inviteLoading, setInviteLoading] = useState(false);

  const [selected, setSelected] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [presence, setPresence] = useState({});
  const [typing, setTyping] = useState(false);
  const [err, setErr] = useState("");

  const msgsRef = useRef(null);
  const me = auth?.user;

  const load = async () => {
  setErr("");

  const results = await Promise.allSettled([
    api.get("/users"),
    api.get("/users/me/invited-count"),
    api.get("/invites/me"),
  ]);

  // Handle special cases (expired)
  for (const r of results) {
    if (r.status === "rejected") {
      const code = r?.reason?.response?.status;
      if (code === 402) {
        nav("/expired");
        return;
      }
      if (code === 401) {
        nav("/login");
        return;
      }
    }
  }

  // ✅ users
  const usersRes = results[0];
  if (usersRes.status === "fulfilled") {
    setUsers(usersRes.value.data.filter(x => x.id !== me.id && x.status !== "blocked"));
  }

  // ✅ invited count
  const countRes = results[1];
  if (countRes.status === "fulfilled") {
    setInvitedCount(countRes.value.data.count || 0);
  }

  // ✅ invites
  const invRes = results[2];
  if (invRes.status === "fulfilled") {
    setMyInvites(invRes.value.data || []);
  }

  // show an error if something failed (but still render whatever loaded)
  const failed = results.find(r => r.status === "rejected");
  if (failed) {
    setErr(failed?.reason?.response?.data?.message || "Some data failed to load");
  }
};


  useEffect(() => {
    load();

    const s = connectSocket(auth.accessToken);

    s.on("presence:online", ({ userId }) =>
      setPresence(p => ({ ...p, [userId]: true }))
    );
    s.on("presence:offline", ({ userId }) =>
      setPresence(p => ({ ...p, [userId]: false }))
    );

    s.on("typing:start", ({ chatId: cId, fromUserId }) => {
      if (selected?.id === fromUserId && chatId === cId) setTyping(true);
    });
    s.on("typing:stop", ({ chatId: cId, fromUserId }) => {
      if (selected?.id === fromUserId && chatId === cId) setTyping(false);
    });

    s.on("message:new", (msg) => {
      if (msg.chat_id === chatId) {
        setMessages(m => [...m, msg]);
        setTimeout(() => {
          msgsRef.current?.scrollTo({
            top: msgsRef.current.scrollHeight,
            behavior: "smooth"
          });
        }, 0);
      }
    });

    return () => disconnectSocket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openChat = async (u) => {
    setSelected(u);
    setMessages([]);
    setTyping(false);
    setErr("");

    try {
      const { data } = await api.post(`/chat/direct/${u.id}`);
      setChatId(data.chatId);

      const msgs = await api.get(`/chat/${data.chatId}/messages?limit=50`);
      setMessages(msgs.data);

      setTimeout(() => {
        msgsRef.current?.scrollTo({
          top: msgsRef.current.scrollHeight,
          behavior: "smooth"
        });
      }, 0);
    } catch (e) {
      if (e?.response?.status === 402) {
        nav("/expired");
        return;
      }
      setErr(e?.response?.data?.message || "Failed to open chat");
    }
  };

  const send = async () => {
    if (!text.trim() || !selected || !chatId) return;
    const body = text.trim();
    setText("");

    const s = getSocket();
    s.emit("message:send", { chatId, toUserId: selected.id, body }, (ack) => {
      if (!ack?.ok) setErr(ack?.error || "Send failed");
    });
  };

  const typingStart = () => {
    if (!selected || !chatId) return;
    getSocket()?.emit("typing:start", { chatId, toUserId: selected.id });
  };

  const typingStop = () => {
    if (!selected || !chatId) return;
    getSocket()?.emit("typing:stop", { chatId, toUserId: selected.id });
  };

  // ✅ Generate invite (Admin-style UI instead of alert)
  const generateInvite = async () => {
  setErr("");
  setInviteLoading(true);
  try {
    const { data } = await api.post("/invites/generate");
    setInvite(data.code);
    await load();
  } catch (e) {
    setErr(e?.response?.data?.message || "Invite generation failed");
  } finally {
    setInviteLoading(false);
  }
};


  const copyInvite = async () => {
    if (!invite) return;
    try {
      await navigator.clipboard?.writeText(invite);
      alert("Invite copied!");
    } catch {
      alert("Copy failed. Please copy manually.");
    }
  };

  return (
    <div className="list">
      {/* ✅ User Dashboard header */}
      <div className="card">
        <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <b>User Dashboard</b>
            <div className="small">
              My invited users: <b>{invitedCount}</b>
            </div>
          </div>
        </div>

        {err && <div className="small" style={{ color: "crimson", marginTop: 8 }}>{err}</div>}
      </div>

      {/* ✅ Invite section (same look/behavior as Admin Dashboard) */}
      <div className="card">
        <h4 style={{ marginTop: 0 }}>Generate Invite Code</h4>

        <button className="btn" onClick={generateInvite} disabled={inviteLoading}>
          {inviteLoading ? "Generating..." : "Generate"}
        </button>

        {invite && (
          <div className="card" style={{ marginTop: 8 }}>
            <div className="small">Invite Code (one-time)</div>
            <b style={{ wordBreak: "break-all" }}>{invite}</b>

            <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn secondary" onClick={copyInvite}>Copy</button>
              <button className="btn secondary" onClick={() => setInvite("")}>Clear</button>
            </div>
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <h4 style={{ marginTop: 0 }}>My Generated Invites</h4>
          {myInvites.length === 0 ? (
            <div className="small">No invites generated yet.</div>
          ) : (
            <div className="list">
              {myInvites.map((x) => (
                <div key={x.id} className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: 1 }}>
                      <div className="small">Code</div>
                      <b style={{ wordBreak: "break-all" }}>{x.code}</b>
                      <div className="small" style={{ marginTop: 6 }}>
                        Created: {new Date(x.created_at).toLocaleString()}
                      </div>
                      {x.is_used ? (
                        <div className="small" style={{ marginTop: 4 }}>
                          Used: {x.used_at ? new Date(x.used_at).toLocaleString() : "Yes"}
                        </div>
                      ) : (
                        <div className="small" style={{ marginTop: 4 }}>Unused</div>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span className="badge">{x.is_used ? "used" : "unused"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Chat UI */}
      <div className="chatShell">
        <div className="card">
          <h4 style={{ marginTop: 0 }}>Users</h4>
          <div className="list">
            {users.map(u => (
              <button
                key={u.id}
                className="card"
                style={{ textAlign: "left", cursor: "pointer" }}
                onClick={() => openChat(u)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <b>{u.name}</b>
                    <div className="small">{u.email}</div>
                  </div>
                  <span className="badge">{presence[u.id] ? "online" : "offline"}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <h4 style={{ marginTop: 0 }}>{selected ? `Chat with ${selected.name}` : "Select a user"}</h4>

          {selected && (
            <>
              <div className="msgs" ref={msgsRef}>
                {messages.map(m => (
                  <div key={m.id} className={"bubble " + (m.sender_id === me.id ? "me" : "")}>
                    <div>{m.body}</div>
                    <div className="small" style={{ marginTop: 4 }}>
                      {new Date(m.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                {typing && <div className="small">typing...</div>}
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input
                  className="input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onFocus={typingStart}
                  onBlur={typingStop}
                  placeholder="Type a message"
                  onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                />
                <button className="btn" onClick={send}>Send</button>
              </div>

              <div className="small" style={{ marginTop: 8 }}>
                Calls: signaling endpoints are wired (Socket events). Add WebRTC UI + TURN for production.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
