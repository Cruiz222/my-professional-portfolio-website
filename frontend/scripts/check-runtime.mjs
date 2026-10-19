// Exercise deployment-like JavaScript with TypeScript execution disabled.
import ts from "typescript";
import {mkdtemp, mkdir, readFile, writeFile, cp, rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {execFileSync} from "node:child_process";
const root = new URL("../", import.meta.url), directory = await mkdtemp(join(tmpdir(),"cruiz-runtime-"));
try {
 await writeFile(join(directory,"package.json"),'{"type":"module"}');
 await mkdir(join(directory,"api/owner"),{recursive:true});
 await cp(new URL("server/runtime/",root),join(directory,"server/runtime"),{recursive:true});
 await mkdir(join(directory,"public"));
 for (const name of ["projects.json","profile.json"]) await cp(new URL(`public/${name}`,root),join(directory,"public",name));
 for (const name of ["owner/session","projects","profile","content","media"]) {
  const source=await readFile(new URL(`api/${name}.ts`,root),"utf8");
  await writeFile(join(directory,`api/${name}.js`),ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2023}}).outputText);
 }
 await writeFile(join(directory,"check.mjs"),`
 import assert from 'node:assert/strict';
 process.chdir('/tmp');
 for (const name of ['owner/session','projects','profile','content','media']) {
  const {default:handler}=await import('./api/'+name+'.js');
  let status, result;
  const res={writeHead(code){status=code;},end(raw){result=JSON.parse(raw);},setHeader(){}};
  await handler({method:'GET',headers:{},url:name==='content'?'/api/content?kind=projects':'/api/'+name},res);
  assert.equal(status,name==='owner/session'||name==='content'?200:name==='media'?405:401,name);
  if(name==='owner/session') assert.equal(result.configured,false);
 }
 console.log('All five compiled API entrypoints load without TypeScript support; baseline content works outside the repository working directory.');
 `);
 const environment={...process.env};
 for (const key of ['SUPABASE_URL','SUPABASE_SECRET_KEY','OWNER_PASSWORD_HASH','SITE_URL']) delete environment[key];
 process.stdout.write(execFileSync(process.execPath,['--no-experimental-strip-types',join(directory,"check.mjs")],{env:environment,encoding:"utf8"}));
} finally {await rm(directory,{recursive:true,force:true});}
