import assert from "node:assert/strict";
import {test} from "node:test";
import {createServer} from "node:http";
import {createHash} from "node:crypto";
import {hashPassword} from "../server/owner-auth.ts";
import {handler,session,content,load,send} from "../server/cloud.ts";
import media from "../api/media.ts";

test("hosted admin persists sessions and content, rejects forged cookies, CSRF and stale saves",async(t)=> {
 const oldEnv = {...process.env}, originalFetch = globalThis.fetch;
 process.env.SUPABASE_URL="https://test-project.supabase.co";
 process.env.SUPABASE_SECRET_KEY="test-only-key";
 process.env.OWNER_PASSWORD_HASH=hashPassword("private-owner-password");
 process.env.SITE_URL="https://portfolio.example";
 const sessions = new Map<string,{credential:string;expires_at:string}>();
 const saved = new Map<string,{data:unknown;revision:string}>();
 let attempts=0, storageWrites=0;
 globalThis.fetch = (async(input, options={})=> {
  const url = String(input);
  if (!url.startsWith(process.env.SUPABASE_URL!)) return originalFetch(input,options);
  const u = new URL(url), data = options.body ? JSON.parse(String(options.body).startsWith("{") ? String(options.body) : "{}") : {};
  const answer=(value:unknown)=>new Response(JSON.stringify(value),{status:200});
  if(u.pathname.endsWith("portfolio_login_attempt")) return answer(++attempts<=5);
  if(u.pathname.endsWith("portfolio_save")) {
   const current=saved.get(data.p_kind);
   if ((current?.revision??"initial")!==data.p_revision) return answer(null);
   const revision=`revision-${saved.size}-${Date.now()}`;
   saved.set(data.p_kind,{data:data.p_data,revision}); return answer(revision);
  }
  if(u.pathname.endsWith("portfolio_sessions")) {
   if(options.method==="POST") {sessions.set(data.token_hash,data);return new Response(null,{status:201});}
   const hash=u.searchParams.get("token_hash")?.slice(3)??"";
   if(options.method==="DELETE") {sessions.delete(hash);return new Response(null,{status:204});}
   const row=sessions.get(hash);
   return answer(row && row.expires_at>new Date().toISOString() && `eq.${row.credential}`===u.searchParams.get("credential") ? [{token_hash:hash}] : []);
  }
  if(u.pathname.endsWith("portfolio_content")) {const row=saved.get(u.searchParams.get("kind")!.slice(3));return answer(row?[row]:[]);}
  if(u.pathname.startsWith("/storage/")) {storageWrites++;return answer({Key:"uploaded"});}
  throw new Error(`Unexpected backend request ${u.pathname}`);
 }) as typeof fetch;
 t.after(()=>{globalThis.fetch=originalFetch;process.env=oldEnv;});
 const server=createServer((req,res)=> {
  const path=req.url?.split("?")[0];
  if(path==="/api/owner/session") void handler(session)(req,res);
  else if(path==="/api/media") void media(req,res);
  else if(path==="/api/content") void handler(async(_q,r)=>send(r,200,(await load("projects")).projects))(req,res);
  else void handler((q,r)=>content(q,r,path==="/api/profile"?"profile":"projects"))(req,res);
 });
 await new Promise<void>(resolve=>server.listen(0,"127.0.0.1",resolve));
 t.after(()=>new Promise<void>(resolve=>server.close(()=>resolve())));
 const address=server.address();assert(address&&typeof address!=="string");
 const base=`http://127.0.0.1:${address.port}`;
 const request=(path:string,method="GET",data?:unknown,cookie="",origin=process.env.SITE_URL!)=> originalFetch(`${base}${path}`,{method,headers:{Cookie:cookie,Origin:origin,"Content-Type":"application/json"},...(data===undefined?{}:{body:JSON.stringify(data)})});
 assert.equal((await request("/api/projects")).status,401);
 assert.equal((await request("/api/projects","GET",undefined,"cruiz_owner="+"a".repeat(64))).status,401);
 assert.equal((await request("/api/owner/session","POST",{password:"private-owner-password"},"","https://evil.example")).status,403);
 assert.equal((await request("/api/owner/session","POST",{password:"wrong"})).status,401);
 const login=await request("/api/owner/session","POST",{password:"private-owner-password"});assert.equal(login.status,200);
 const cookie=login.headers.get("set-cookie")!.split(";")[0];
 assert.match(login.headers.get("set-cookie")!,/Secure; SameSite=Strict/);
 assert.equal((await (await request("/api/owner/session","GET",undefined,cookie)).json()).authenticated,true);
 const initial=await(await request("/api/projects","GET",undefined,cookie)).json();assert.equal(initial.revision,"initial");
 const project={id:"cloud", title:"Hosted work",description:"Persistent",technologies:["Python"],category:"Software",contribution:"Personal project",repositoryUrl:"",demoUrl:""};
 const put=(path:string,data:unknown,revision:string,origin=process.env.SITE_URL!)=>originalFetch(base+path,{method:"PUT",headers:{Cookie:cookie,Origin:origin,"Content-Type":"application/json","If-Match":revision},body:JSON.stringify(data)});
 assert.equal((await put("/api/projects",[project],"initial","https://evil.example")).status,403);
 assert.equal((await put("/api/projects",[{...project,demoUrl:"javascript:alert(1)"}],"initial")).status,400);
 assert.equal((await put("/api/projects",[project],"initial")).status,200);
 assert.equal((await put("/api/projects",[],"initial")).status,409);
 assert.equal((await(await request("/api/content")).json())[0].title,"Hosted work");
 const image="https://test-project.supabase.co/storage/v1/object/public/portfolio-images/00000000-0000-0000-0000-000000000000.jpg";
 assert.equal((await put("/api/profile",{image,backgroundImage:"/profile.png"},"initial")).status,200);
 assert.equal((await(await request("/api/profile","GET",undefined,cookie)).json()).projects.image,image);
 assert.equal((await request("/api/media","POST",{image:"data:image/jpeg;base64,/9j/AA=="},cookie)).status,200);assert.equal(storageWrites,1);
 assert.equal((await request("/api/media","POST",{image:"data:image/jpeg;base64,AAAA"},cookie)).status,400);
 assert.equal((await request("/api/media","POST",{image:"data:image/jpeg;base64,/9j/AA=="})).status,401);
 const token=cookie.split("=")[1],hash=createHash("sha256").update(token).digest("hex");
 sessions.get(hash)!.expires_at=new Date(0).toISOString();
 assert.equal((await request("/api/projects","GET",undefined,cookie)).status,401);
 sessions.get(hash)!.expires_at=new Date(Date.now()+3600000).toISOString();
 assert.equal((await request("/api/owner/session","DELETE",{},cookie)).status,200);
 assert.equal((await request("/api/projects","GET",undefined,cookie)).status,401);
 attempts=5;assert.equal((await request("/api/owner/session","POST",{password:"private-owner-password"})).status,429);
 delete process.env.SUPABASE_SECRET_KEY;
 assert.equal((await(await request("/api/owner/session")).json()).configured,false);
 assert.equal((await request("/api/projects")).status,401);
});
