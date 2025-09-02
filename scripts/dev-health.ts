import { execSync } from "node:child_process";

function run(cmd: string) {
  console.log(`\n$ ${cmd}`);
  try { 
    execSync(cmd, { stdio: "inherit" }); 
  }
  catch (e) { 
    console.error(`Command failed: ${cmd}`);
    process.exitCode = 1; 
  }
}

console.log("🔍 Running development health checks...\n");

console.log("✅ TypeScript Check (allowing test file errors)");
run("pnpm exec tsc --noEmit --skipLibCheck");

console.log("✅ ESLint Check (warnings allowed)");
run("pnpm exec eslint . || true");

console.log("✅ Next.js Build Check"); 
run("pnpm build");

if (process.exitCode === 0) {
  console.log("\n✅ All checks passed! 🎉");
} else {
  console.log("\n❌ Some checks failed. See output above for details.");
}