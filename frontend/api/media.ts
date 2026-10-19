import {randomUUID} from "node:crypto";
import {handler, sameOrigin, requireOwner, body, send, HttpError} from "../server/cloud.ts";
import {parseImage} from "../src/data/projects.ts";
export default handler(async(req,res)=> {
 if (req.method !== "POST") throw new HttpError(405,"Method not allowed.");
 sameOrigin(req); await requireOwner(req);
 const data = await body(req, 720000) as {image?:unknown};
 let image: string;
 try { image = parseImage(data?.image); } catch { throw new HttpError(400,"Choose a valid JPEG image."); }
 if (!image.startsWith("data:image/jpeg;base64,")) throw new HttpError(400,"Uploads must be processed as JPEG.");
 const bytes = Buffer.from(image.split(",")[1],"base64");
 if (bytes[0] !== 255 || bytes[1] !== 216 || bytes[2] !== 255) throw new HttpError(400,"Invalid JPEG file.");
 const name = `${randomUUID()}.jpg`, base = process.env.SUPABASE_URL!.replace(/\/$/, "");
 const r = await fetch(`${base}/storage/v1/object/portfolio-images/${name}`, {method:"POST",headers:{apikey:process.env.SUPABASE_SECRET_KEY!, "Content-Type":"image/jpeg", "Cache-Control":"3600"}, body:bytes, signal:AbortSignal.timeout(15000)});
 if (!r.ok) throw new HttpError(503,"Image upload failed. Check the portfolio-images storage bucket.");
 send(res,200,{image:`${base}/storage/v1/object/public/portfolio-images/${name}`});
});
