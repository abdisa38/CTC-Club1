import fs from 'fs';
import path from 'path';

function getImports(dir) {
  let imports = new Set();
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
        const subImports = getImports(fullPath);
        for(let a of subImports) imports.add(a);
    } else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = content.matchAll(/from\s+['"]([^'"]+)['"]/g);
      for (const m of matches) {
        if (!m[1].startsWith('.')) {
          imports.add(m[1]);
        }
      }
    }
  }
  return Array.from(imports);
}
console.log(getImports('./src').join('\n'));
