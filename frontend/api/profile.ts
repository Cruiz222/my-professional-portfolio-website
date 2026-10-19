import {handler, content} from "../server/runtime/cloud.mjs";
export default handler((req,res)=>content(req,res,"profile"));
