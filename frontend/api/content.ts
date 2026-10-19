import {handler, load, send, HttpError} from "../server/cloud.ts";
export default handler(async (req,res)=> {
 if (req.method !== "GET") throw new HttpError(405,"Method not allowed.");
 const kind = new URL(req.url!,"https://portfolio.invalid").searchParams.get("kind");
 if (kind !== "projects" && kind !== "profile") throw new HttpError(400,"Unknown content type.");
 send(res,200,(await load(kind)).projects);
});
