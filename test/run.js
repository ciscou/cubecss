// Runs every *.test.js in this folder. Usage: node test/run.js   (CUBECSS=path to test another build)
const { spawnSync } = require("child_process"), fs = require("fs"), path = require("path");

const files = fs.readdirSync(__dirname).filter(f => f.endsWith(".test.js")).sort();
let failed = 0;

for (const f of files) {
  console.log(`\n== ${f}`);
  const r = spawnSync(process.execPath, [path.join(__dirname, f)], { stdio: "inherit", env: process.env });
  if (r.status !== 0) failed++;
}

console.log(failed ? `\n${failed} test file(s) FAILED` : "\nall test files passed");
process.exit(failed ? 1 : 0);
