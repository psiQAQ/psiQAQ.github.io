import { access, readdir, rename } from "node:fs/promises";
import path from "node:path";

const outputRoot = path.resolve(process.argv[2] ?? "dist/client");

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

async function decodeTree(directory) {
  let renamedEntries = 0;

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const source = path.join(directory, entry.name);
    if (entry.isDirectory()) renamedEntries += await decodeTree(source);

    let decodedName;
    try {
      decodedName = decodeURIComponent(entry.name);
    } catch {
      continue;
    }

    if (decodedName === entry.name) continue;
    if ([".", ".."].includes(decodedName) || /[\\/]/.test(decodedName)) {
      throw new Error(`Unsafe decoded static path: ${entry.name}`);
    }

    const target = path.join(directory, decodedName);
    if (await exists(target)) throw new Error(`Decoded static path already exists: ${target}`);
    await rename(source, target);
    renamedEntries += 1;
  }

  return renamedEntries;
}

const renamedEntries = await decodeTree(outputRoot);
console.log(`[static-export] Decoded ${renamedEntries} path entries.`);
