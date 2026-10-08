export const catalogTypes = {
  "📄": { type: "document", label: "文档" },
  "📺": { type: "video", label: "视频" },
  "🚀": { type: "launcher", label: "启动工具" },
  "🧾": { type: "template", label: "源码与模板" },
  "📊": { type: "analysis", label: "数据分析" },
  "⚔️": { type: "ranking", label: "排行榜" },
  "📰": { type: "news", label: "新闻" },
  "📚": { type: "learning", label: "学习资料" },
  "🌐": { type: "website", label: "网站" },
};

export function resourceCategoryLabel(category) {
  return { "智能体": "Agent 安装与配置" }[category] || category;
}

export function catalogGroupId(category, group) {
  return group === category ? category : `${category}--${group}`;
}

/** @returns {string[]} */
export function resourceSectionAliases(category, group = category) {
  const aliases = {
    "Agent 学习资料": ["资源"],
    "Agent 学习资料--Agent 入门与实践": ["资源--Agent 入门与实践"],
    "Agent 学习资料--Agent 原理与优化": ["资源--Agent 原理与优化"],
    "Agent 学习资料--MCP 市场": ["资源--MCP 市场"],
    "LLM 参数汇总": ["大模型选型与排行榜"],
    "开发与模型工具": ["资源--开发与模型工具"],
    "AI 新闻": ["资源--AI 新闻"],
    "AI 行业观察": ["资源--AI 行业观察"],
  };
  return aliases[catalogGroupId(category, group)] || [];
}

export function catalogEntries(markdown) {
  const block = markdown.match(/<!-- site-catalog:start -->([\s\S]*?)<!-- site-catalog:end -->/)?.[1];
  if (!block) throw new Error("README is missing the public catalog markers");
  const entries = [];
  let category = "", group = "";
  for (const line of block.split(/\r?\n/)) {
    const categoryMatch = line.match(/^##\s+(.+?)\s*$/);
    if (categoryMatch) { category = categoryMatch[1]; group = category; continue; }
    const groupMatch = line.match(/^###\s+(.+?)\s*$/);
    if (groupMatch) { group = groupMatch[1]; continue; }
    const match = line.match(/^\s*-\s+(\S+)\[([^\]]+)]\(([^)]+)\)\s*$/);
    if (!match) {
      if (/^\s*-\s+.*\[[^\]]+]\([^)]+\)/.test(line)) throw new Error(`README catalog entry must use a supported icon: ${line.trim()}`);
      continue;
    }
    if (!category) throw new Error("README catalog entry has no category");
    const kind = catalogTypes[match[1]];
    if (!kind) throw new Error(`README catalog entry uses unknown icon: ${match[1]}`);
    entries.push({ category, group, icon: match[1], type: kind.type, typeLabel: kind.label, label: match[2].trim(), target: match[3].trim() });
  }
  return entries;
}
