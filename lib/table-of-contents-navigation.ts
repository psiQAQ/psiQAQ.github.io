type NavigateEvent = {
  preventDefault(): void;
};

type NavigationEnvironment = {
  history: Pick<History, "pushState">;
  document: Pick<Document, "getElementById">;
};

export function handleTableOfContentsNavigation(
  event: NavigateEvent,
  id: string,
  environment: NavigationEnvironment = window,
) {
  event.preventDefault();
  environment.history.pushState(null, "", `#${id}`);
  environment.document.getElementById(id)?.scrollIntoView({ behavior: "auto" });
}
