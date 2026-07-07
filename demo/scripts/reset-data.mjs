import { existsSync, unlinkSync } from "fs";
import { join } from "path";

const files = ["users.json", "conversations.json", "marketplace.json"];
const dir = join(process.cwd(), "data");

for (const file of files) {
  const path = join(dir, file);
  if (existsSync(path)) {
    unlinkSync(path);
    console.log(`Removed ${file}`);
  }
}

console.log("Sample data will be restored on next server start.");
