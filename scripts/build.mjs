import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = resolve(root, 'src', 'integrated-clinical-workbench.fragment.html');
const outputPath = resolve(root, 'index.html');
const fragment = await readFile(sourcePath, 'utf8');

if (!fragment.includes('id="integrated-clinical-workbench"')) {
  throw new Error('The source fragment is missing its application root.');
}

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="referrer" content="no-referrer">
  <title>量知 · 临床数据工作台</title>
  <style>html,body{margin:0;min-width:320px;background:#f7f9f8}button,input,select,textarea{font:inherit}</style>
  <script>
    (() => {
      const key = 'hainan-ui-prototype-state';
      let privateContent = null;
      try { privateContent = JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) {}
      window.openai = {
        widgetState: { privateContent },
        setWidgetState(payload) {
          privateContent = payload && payload.privateContent || null;
          localStorage.setItem(key, JSON.stringify(privateContent));
          return Promise.resolve();
        }
      };
    })();
  </script>
  <script defer src="https://unpkg.com/lucide@0.468.0/dist/umd/lucide.min.js" onload="globalThis.lucide&&globalThis.lucide.createIcons({attrs:{width:16,height:16}})"></script>
</head>
<body>
${fragment}
</body>
</html>
`;

await writeFile(outputPath, html, 'utf8');
console.log(`Built ${outputPath}`);
