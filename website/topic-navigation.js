// Fragment links can stay on the current article. Close Quartz's mobile drawer before scrolling.
document.addEventListener("click", (event) => {
  const link = event.target.closest?.(".topic-nav a")
  if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
  const button = link.closest(".explorer").querySelector(".mobile-explorer")
  if (button.getAttribute("aria-expanded") === "true" && button.getClientRects().length) button.click()
})
