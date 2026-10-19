import { useEffect, useState } from "react";
import ImagePicker from "./ImagePicker";
export default function ProfileEditor() {
 const [image, setImage] = useState("/profile.png"), [revision, setRevision] = useState(""), [message, setMessage] = useState(""), [busy, setBusy] = useState(false);
 useEffect(() => { fetch("/api/profile").then(async r => {const d = await r.json(); if (!r.ok) throw new Error(d.error); setImage(d.projects.image); setRevision(d.revision);}).catch(e => setMessage(String(e))); }, []);
 async function save() { setBusy(true); setMessage(""); try { const r = await fetch("/api/profile", {method: "PUT", headers: {"Content-Type":"application/json", "If-Match":revision}, body:JSON.stringify({image})}); const d = await r.json(); if (r.status === 401) window.dispatchEvent(new Event("owner-session-expired")); if (!r.ok) throw new Error(d.error); setRevision(d.revision); setMessage("Profile picture saved."); window.dispatchEvent(new Event("portfolio-profile-updated")); } catch(e) {setMessage(String(e));} finally {setBusy(false);} }
 return <section className="profile-editor"><p className="eyebrow">01 / Your identity</p><h2>Profile & hero portrait</h2><fieldset disabled={busy || !revision}><ImagePicker images={[image]} onChange={v => setImage(v[0] ?? "/profile.png")} /><button className="button primary" onClick={() => void save()}> {busy ? "Saving…" : "Save profile picture"}</button></fieldset><p role="status">{message}</p></section>;
}
