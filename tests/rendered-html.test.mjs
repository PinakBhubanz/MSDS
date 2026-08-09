import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html", host: "localhost" },
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the JARVIS control room", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>JARVIS Health Alpha<\/title>/i);
  assert.match(html, /One body\./);
  assert.match(html, /Scenario laboratory/);
  assert.match(html, /Privacy-safe demo data/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("publishes complete social metadata", async () => {
  const html = await (await render()).text();
  assert.match(html, /JARVIS Health Alpha/);
  assert.match(html, /http:\/\/localhost\/og\.png/);
  assert.match(html, /summary_large_image/);
});
