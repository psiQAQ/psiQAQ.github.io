# 拟分享条目的可见性和私有引用

试用此示例时，先将其 `publish_ready` 设为 `true`，完成后改回 `false`，以便分享队列只展示正式指南。

通过示例：[如何记录检索失败](../Guides/如何记录检索失败.md) 引用库内可分享材料。

将示例自身的 `visibility` 属性改为 `private` 并保留 `publish_ready` 为 `true`，检验会提示这两个属性的冲突。

要复现私有引用提醒，可在示例的 `related` 加入 `[[内部提纲]]`，或在正文加入 `[内部提纲](../Drafts/内部提纲.md)`。[内部提纲](../Drafts/内部提纲.md) 标为 `visibility: private`。在 Obsidian 中运行「拟分享条目的可见性和私有引用」，检查会提示实际目标的路径。离线检查可核对这个 Markdown 相对路径。短链需要 Obsidian 的 Vault 索引，离线时会标为待核实。
