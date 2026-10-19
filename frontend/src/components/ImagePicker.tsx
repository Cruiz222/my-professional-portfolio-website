import { useState } from "react";
export default function ImagePicker({images, onChange, multiple = false, label, onBusy}: {label?: string; onBusy?: (busy: boolean) => void; images: string[]; onChange: (images: string[]) => void; multiple?: boolean}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function choose(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true); onBusy?.(true); setError("");
    try {
      if ((multiple ? images.length : 0) + files.length > (multiple ? 6 : 1)) throw new Error("Choose fewer images (six per project, one profile portrait).");
      const results: string[] = [];
      for (const file of Array.from(files)) {
        if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 15 * 1024 * 1024) throw new Error("Choose PNG, JPEG or WebP files under 15 MB.");
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement("canvas"); canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
        const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Image processing unavailable.");
        ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
        const image = canvas.toDataURL("image/jpeg", .78);
        if (image.length > 700000) throw new Error("This image is too detailed. Choose a smaller image.");
        results.push(image);
      }
      onChange(multiple ? [...images, ...results] : results);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to read image."); }
    finally { setBusy(false); onBusy?.(false); }
  }
  return <div className="image-picker"><label> {label ?? (multiple ? "Project pictures (up to six; first is the cover)" : "Profile picture")}<input type="file" accept="image/png,image/jpeg,image/webp" multiple={multiple} disabled={busy} onChange={e => {void choose(e.target.files); e.target.value = "";}} /></label><p role="status">{busy ? "Preparing images…" : "Images are resized automatically. Save to publish locally."}</p><p role="alert">{error}</p><div className="image-previews">{images.map((src, i) => <div key={i}><img src={src} alt={`Selected image ${i + 1}`} /><button type="button" className="button" disabled={busy} onClick={() => onChange(images.filter((_, n) => n !== i))}>Remove {i + 1}</button></div>)}</div></div>;
}
