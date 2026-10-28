// Checks every link in data/gallery.js and reports the ones that no longer work.
// Run locally with:  node tools/check-links.mjs
// Exit code 1 if any link is broken (so the scheduled GitHub Action can flag it).
import { readFileSync, appendFileSync } from 'node:fs';
import vm from 'node:vm';

const src = readFileSync(new URL('../data/gallery.js', import.meta.url), 'utf8');
const ctx = { window: {} };
vm.runInNewContext(src, ctx);
const data = ctx.window.LH_GALLERY;

const jobs = [];
for (const item of data.items) {
  for (const link of item.links) jobs.push({ id: item.id, title: item.title, label: link.label, url: link.url });
}

const UA = 'Mozilla/5.0 (compatible; LinesAndHuesLinkCheck/1.0; +https://github.com/leomohan/lines-and-hues)';

async function check(job) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    let res = await fetch(job.url, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': UA } });
    if (res.status === 405 || res.status === 403 || res.status === 400) {
      res = await fetch(job.url, { method: 'GET', redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': UA } });
    }
    return { ...job, status: res.status };
  } catch (e) {
    return { ...job, status: 0, error: e.name === 'AbortError' ? 'timeout' : e.message };
  } finally {
    clearTimeout(timer);
  }
}

async function run(list, limit = 6) {
  const out = [];
  let i = 0;
  await Promise.all(Array.from({ length: limit }, async () => {
    while (i < list.length) {
      const job = list[i++];
      out.push(await check(job));
    }
  }));
  return out;
}

const results = await run(jobs);
// 403/429 usually means a site blocks automated checks, not that the page is gone.
const broken = results.filter(r => r.status === 0 || r.status === 404 || r.status === 410 || r.status >= 500);
const blocked = results.filter(r => r.status === 403 || r.status === 429);

const lines = [];
lines.push(`# Link check — ${new Date().toISOString().slice(0, 10)}`);
lines.push(`Checked ${results.length} links across ${data.items.length} gallery entries.`);
lines.push(`Broken: ${broken.length} · Could not verify (site blocks bots): ${blocked.length}`);
if (broken.length) {
  lines.push('\n## Broken links\n\n| Gallery | Title | Link | Status |\n|---|---|---|---|');
  broken.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
    .forEach(r => lines.push(`| ${r.id} | ${r.title} | ${r.url} | ${r.status || r.error} |`));
}
if (blocked.length) {
  lines.push('\n## Check by hand (site blocked the robot)\n\n| Gallery | Link | Status |\n|---|---|---|');
  blocked.forEach(r => lines.push(`| ${r.id} | ${r.url} | ${r.status} |`));
}
const report = lines.join('\n');
console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report + '\n');
process.exit(broken.length ? 1 : 0);
