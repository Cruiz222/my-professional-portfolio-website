import { useEffect, useState } from "react";
import ImagePicker from "./ImagePicker";
export default function ProfileEditor() {
 const [image, setImage] = useState("/profile.png");
 const [backgroundImage, setBackgroundImage] = useState("/profile.png");
 const [revision, setRevision] = useState("");
 const [message, setMessage] = useState("");
 const [busy, setBusy] = useState(false);
 const [preparingProfile, setPreparingProfile] = useState(false);
 const [preparingBackground, setPreparingBackground] = useState(false);
 useEffect(() => {
  const controller = new AbortController();
  fetch("/api/profile", {signal:controller.signal, cache:"no-store"}).then(async r => {
   const d = await r.json();
   if (r.status === 401) window.dispatchEvent(new Event("owner-session-expired"));
   if (!r.ok) throw new Error(d.error);
   setImage(d.projects.image); setBackgroundImage(d.projects.backgroundImage || "/profile.png"); setRevision(d.revision);
  }).catch(e => {if (!controller.signal.aborted) setMessage(String(e));});
  return () => controller.abort();
 }, []);
 async function save() {
  setBusy(true); setMessage("");
  try {
   const r = await fetch("/api/profile", {method:"PUT", headers:{"Content-Type":"application/json", "If-Match":revision}, body:JSON.stringify({image, backgroundImage})});
   const d = await r.json();
   if (r.status === 401) window.dispatchEvent(new Event("owner-session-expired"));
   if (!r.ok) throw new Error(d.error);
   setRevision(d.revision); setMessage("Profile and background images saved."); window.dispatchEvent(new Event("portfolio-profile-updated"));
  } catch(e) {setMessage(String(e));} finally {setBusy(false);}
 }
 return <section id="manage-images" className="profile-editor">
  <p className="eyebrow">01 / Your images</p><h2>Profile & background images</h2>
  <p>Choose each picture separately. Your existing photo is the default for both.</p>
  <fieldset disabled={busy || !revision}>
   <div className="image-settings-grid">
    <section><h3>Profile picture</h3><p>The main portrait card beside your introduction.</p><ImagePicker label="Upload profile picture" images={[image]} onBusy={setPreparingProfile} onChange={v => setImage(v[0] ?? "/profile.png")} /></section>
    <section><h3>Background picture</h3><p>The subtle floating image behind your introduction.</p><ImagePicker label="Upload background picture" images={[backgroundImage]} onBusy={setPreparingBackground} onChange={v => setBackgroundImage(v[0] ?? "/profile.png")} /></section>
   </div>
   <button type="button" className="button primary" disabled={preparingProfile || preparingBackground} onClick={() => void save()}>{busy ? "Saving…" : "Save image settings"}</button>
  </fieldset><p role="status">{message}</p>
 </section>;
}
