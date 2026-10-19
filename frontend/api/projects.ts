import {handler, content} from "../server/cloud.ts";
export default handler((req,res)=>content(req,res,"projects"));
