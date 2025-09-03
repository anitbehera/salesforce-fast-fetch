import * as vscode from "vscode";
import { initializeWorkspace } from './utils/workspaceSetup';
import { SidebarProvider } from "./providers/SidebarProvider";
import { watchSfConfig } from "./utils/configWatcher";

export async function activate(context: vscode.ExtensionContext) {
  // Initialize extension based on workspace context
  let initResult = await initializeWorkspace();

  const sidebarProvider = new SidebarProvider(
    context.extensionUri,
    initResult.orgFolderUri,
    initResult.error,
    initResult.metadataTypes || []
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "salesforceFastFetch.sidebar",
      sidebarProvider,
      {
        webviewOptions: {
          retainContextWhenHidden: true, // Keep the webview alive when hidden
        },
      }
    )
  );

  const watcher = watchSfConfig(async (event) => {
    if (event === "delete") {
      sidebarProvider.update(undefined, "No default org set in Salesforce CLI", []);
      return;
    }

    sidebarProvider.sendMessageToWebview({
      type: "orgSwitch",
      message: "Refreshing Salesforce org context...",
    });

    console.log(`SF default org ${event} — reinitializing workspace...`);
    initResult = await initializeWorkspace();

    sidebarProvider.update(
      initResult.orgFolderUri,
      initResult.error,
      initResult.metadataTypes || []
    );

  });

  if (watcher) {
    context.subscriptions.push(watcher);
  }

  console.log("Salesforce Fast Fetch extension Activated!");
}

// This method is called when your extension is deactivated
export function deactivate() {
  console.log("Salesforce Fast Fetch extension Deactivated");
}
