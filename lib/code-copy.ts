type CopyEnvironment = {
  clipboard: Pick<Clipboard, "writeText">;
  clearTimeout(id: number): void;
  setLabel(label: string): void;
  setTimeout(callback: () => void, delay: number): number;
};

export async function copyCode(
  text: string,
  previousTimer: number | undefined,
  environment: CopyEnvironment,
): Promise<number | undefined> {
  if (previousTimer !== undefined) environment.clearTimeout(previousTimer);

  try {
    await environment.clipboard.writeText(text);
    environment.setLabel("已复制！");
    return environment.setTimeout(() => environment.setLabel("点我复制~"), 3000);
  } catch {
    environment.setLabel("复制失败");
    return undefined;
  }
}
