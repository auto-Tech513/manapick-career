import fs from "node:fs/promises";
import ts from "typescript";

export async function loadJobs(){
  const source=await fs.readFile(new URL("../content/jobs.ts",import.meta.url),"utf8");
  const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
  const mod=await import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);
  return {jobs:mod.jobs,publishedJobs:mod.publishedJobs,categories:mod.categories};
}
