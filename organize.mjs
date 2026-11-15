import fs from 'fs';
import path from 'path';
for (const f of fs.readdirSync('.')) {
  if (!f.includes('__')) continue;
  const t = f.replaceAll('__', '/');
  fs.mkdirSync(path.dirname(t), { recursive: true });
  fs.renameSync(f, t);
}
