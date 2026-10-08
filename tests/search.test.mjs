import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { searchEntries, searchSnippet } from "../lib/search.mjs";
import { sourceHeadings } from "../lib/source-headings.mjs";
const entries = JSON.parse(await readFile(new URL("../dist/client/search-index.json", import.meta.url), "utf8"));
const cases = [
  ["Git", "Git：版本控制基础"], ["Node.js", "Node.js：JavaScript 运行环境"], ["Miniforge", "Miniforge：Python 开发基础设施"],
  ["WSL", "WSL：Windows Linux 子系统"], ["Hyper-V", "Hyper-V：Windows 虚拟化"], ["PowerShell 7", "PowerShell 7：Windows Agent 终端优化"],
  ["Codex", "Codex：OpenAI 编程智能体"], ["Claude Code", "Claude Code：终端编程智能体"], ["Context7", "Context7 MCP：技术文档检索"],
  ["graphify", "graphify：代码库知识图谱"], ["ponytail", "ponytail：防止过度设计插件"],
  ["中文社区", "Zotero：文献管理"], ["中文元数据补全", "Zotero：文献管理"], ["Add-on Market", "Zotero：文献管理"],
  ["主机指纹", "跨系统远程 SSH 登录配置"], ["Model Context Protocol Observatory", "Model Context Protocol Observatory"],
  ["Windows 更新脚本", "Claude Code Windows 更新脚本"], ["普通贡献者视角", "Git PR 教程文档（普通贡献者视角）"],
  ["AIHOT", "AIHOT：AI 热点聚合"], ["源码与模板", "Agent 通用全局指令模板"],
];
for (const [query, title] of cases) test(`search finds ${query} within the first five results`, () => {
  assert.ok(searchEntries(entries, query).slice(0, 5).some(entry => entry.title === title), title);
});
test("search preserves empty-query order, case-insensitive matching and no-result behavior", () => {
  assert.deepEqual(searchEntries(entries, "  "), entries);
  assert.deepEqual(searchEntries(entries, "context7"), searchEntries(entries, "Context7"));
  assert.deepEqual(searchEntries(entries, "no-such-query-87654321"), []);
});
test("search includes learning prose and excludes source code and private notes", () => {
  const learning = entries.find(entry => entry.title === "Git PR 教程文档（普通贡献者视角）");
  assert.ok(learning.searchText.length > 100);
  for (const entry of entries.filter(entry => /\.(bat|sh|md)$/.test(entry.href) && entry.typeLabel !== "学习资料")) assert.equal(entry.searchText, "");
  assert.ok(!entries.some(entry => entry.id.includes("codex-sqlite-bug-fix")));
  assert.ok(!entries.find(entry => entry.title.startsWith("Docker：")).searchText.includes("{{json .State}}"));
});
test("search excerpts show the matching passage", () => {
  const zotero = entries.find(entry => entry.title === "Zotero：文献管理");
  assert.match(searchSnippet(zotero.searchText, "中文元数据补全"), /中文元数据补全/);
});

test("resource search uses the seven resource topics and separates model data from rankings", () => {
  const resourceEntries = entries.filter(entry => entry.typeLabel !== "文档");
  const topics = ["Agent 安装与配置", "Agent 学习资料", "LLM 参数汇总", "LLM 评测排行榜", "开发与模型工具", "AI 新闻", "AI 行业观察"];
  assert.deepEqual([...new Set(resourceEntries.map(entry => entry.category))], topics);
  assert.deepEqual(topics.map(topic => resourceEntries.filter(entry => entry.category === topic).length), [10, 8, 1, 2, 5, 2, 4]);
  assert.equal(entries.find(entry => entry.title.startsWith("Models.dev")).category, "LLM 参数汇总");
  for (const prefix of ["Artificial Analysis", "Arena AI"]) assert.equal(entries.find(entry => entry.title.startsWith(prefix)).category, "LLM 评测排行榜");
  assert.ok(searchEntries(entries, "LLM 参数汇总").some(entry => entry.title.startsWith("Models.dev")));
  assert.ok(searchEntries(entries, "LLM 评测排行榜").some(entry => entry.title.startsWith("Arena AI")));
});
test("template heading anchors locate actual source heading lines", async () => {
  const source = await readFile(new URL("../notes/agents/prompt/AGENTS.md", import.meta.url), "utf8");
  const heading = sourceHeadings(source).find(item => item.id === "user-interaction");
  assert.equal(source.split(/\r?\n/)[heading.line - 1], "## User Interaction");
});
