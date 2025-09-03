import * as vscode from "vscode";
import * as path from "path";

export type ConfigChangeHandler = (event: "change" | "create" | "delete") => void;

/**
 * Watches the workspace-local sf-config for changes.
 * Automatically debounced to avoid multiple triggers in quick succession.
 */
export function watchSfConfig(
  onChange: ConfigChangeHandler,
  debounceMs = 500
): vscode.Disposable | undefined {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    console.warn("No workspace folder found, cannot watch .sf/config.json");
    return;
  }

  const workspaceRoot = workspaceFolders[0].uri.fsPath;
  const sfConfigPath = path.join(workspaceRoot, ".sf", "config.json");

  const watcher = vscode.workspace.createFileSystemWatcher(sfConfigPath);

  let debounceTimer: NodeJS.Timeout | undefined;

  const trigger = (event: "change" | "create" | "delete") => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => onChange(event), debounceMs);
  };

  watcher.onDidChange(() => trigger("change"));
  watcher.onDidCreate(() => trigger("create"));
  watcher.onDidDelete(() => trigger("delete"));

  return watcher;
}
