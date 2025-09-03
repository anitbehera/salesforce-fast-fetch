import * as vscode from "vscode";
import { getUri } from "../utils/getUri";
import { getNonce } from "../utils/getNonce";
import * as path from "path";
import { MetadataService } from "../services/metadataService";
import { MetadataStore } from "../utils/metadataStore";
import { MetadataComponent, MetadataType } from "../types/metadata";
import { MetadataCommands } from "../commands/metadataCommands";

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;
  private metadataTypes: MetadataType[];
  private store?: MetadataStore;

  constructor(
    private _extensionUri: vscode.Uri,
    private orgFolderUri?: vscode.Uri,
    private initError?: string,
    initialMetadataTypes?: MetadataType[]
  ) {
    this.metadataTypes = initialMetadataTypes ?? [];
    if (this.orgFolderUri) {
      this.store = new MetadataStore(
        path.join(this.orgFolderUri.fsPath, "metadataTypes.json")
      );
    }
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    if (this.initError) {
      console.warn("Initialization warning:", this.initError);
      this.sendMessageToWebview({
        type: "initError",
        message: this.initError,
      });
    }

    if (this.orgFolderUri) {
      console.log(
        "Org folder path available to sidebar:",
        this.orgFolderUri.fsPath
      );
    }

    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.command) {
        case "ready": {
          await this.handleLoadMetadataTypes();
          break;
        }
        case "loadMetadataComponents": {
          await this.handleLoadMetadata(data);
          break;
        }
        case "refreshSelectedMetadataList": {
          await this.handleRefreshMetadataList(data.value);
          break;
        }
        case "retrieveMetadata": {
          this.handleRetrieveSingleComponent(data);
          break;
        }
      }
    });
  }

  /**
   * Called when need to reinitialize.
   */
  public update(
    orgFolderUri?: vscode.Uri,
    error?: string,
    metadataTypes: MetadataType[] = []
  ) {
    this.orgFolderUri = orgFolderUri;
    this.initError = error;
    this.metadataTypes = metadataTypes;

    this.store = orgFolderUri
      ? new MetadataStore(path.join(orgFolderUri.fsPath, "metadataTypes.json"))
      : undefined;

    if (!this._view) {
      return;
    }

    if (this.initError) {
      this.sendMessageToWebview({
        type: "initError",
        message: this.initError,
      });
    } else {
      this.sendMessageToWebview({
        type: "metadataTypes",
        metadataTypes: this.metadataTypes,
        orgSwitch: true,
      });
    }
  }

  private handleRetrieveSingleComponent(data: { type: string; value: string }) {
    MetadataCommands.retrieveSingleComponent({
      type: data.type,
      fullName: data.value,
    });
  }

  private async handleRefreshMetadataList(selectedTypes: string[]) {
    const updatedMetadataList = await MetadataService.getSelectedMetadataList(
      selectedTypes,
      this.metadataTypes,
      this.orgFolderUri
    );
    this.metadataTypes = updatedMetadataList;

    // Send updated state to webview
    this.sendMessageToWebview({
      type: "metadataTypes",
      metadataTypes: this.metadataTypes,
    });
  }

  private async handleLoadMetadataTypes() {
    this.sendMessageToWebview({
      type: "metadataTypes",
      metadataTypes: this.metadataTypes,
    });
  }

  private async handleLoadMetadata(data: { type: string; value: string }) {
    const metadataType = data.value || "";
    const selectionAction = data.type; // "selected", "deselected", "deselectAll"

    let metadataList: MetadataComponent[] | undefined = [];
    if (selectionAction === "selected") {
      metadataList = await MetadataService.listMetadataComponents(
        metadataType,
        undefined,
        this.orgFolderUri
      );
    }

    if (selectionAction === "deselectAll") {
      this.metadataTypes.forEach((mt) => {
        mt.selected = false;
        mt.components = [];
      });
    } else {
      const idx = this.metadataTypes.findIndex(
        (mt) => mt.xmlName === metadataType
      );
      if (idx >= 0) {
        this.metadataTypes[idx].components = metadataList;
        this.metadataTypes[idx].selected = selectionAction === "selected";
      }
    }

    this.sendMessageToWebview({
      type: "metadataTypes",
      metadataTypes: this.metadataTypes,
    });

    this.store?.save(this.metadataTypes);
  }

  public sendMessageToWebview(message: any) {
    if (this._view) {
      this._view.webview.postMessage(message);
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const codiconsUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "node_modules",
        "@vscode/codicons",
        "dist",
        "codicon.css"
      )
    );
    const styleResetUri = "";
    const styleVSCodeUri = "";
    // const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
    //const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));

    // The CSS file from the React build output
    const stylesUri = getUri(webview, this._extensionUri, [
      "webview-ui",
      "build",
      "assets",
      "index.css",
    ]);
    // The JS file from the React build output
    const scriptUri = getUri(webview, this._extensionUri, [
      "webview-ui",
      "build",
      "assets",
      "index.js",
    ]);

    const nonce = getNonce();

    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">

          <link href="${codiconsUri}" rel="stylesheet" id="vscode-codicon-stylesheet" />

          <link href="${styleResetUri}" rel="stylesheet">
				  <link href="${styleVSCodeUri}" rel="stylesheet">
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>Salesforce Fast Fetch</title>
        </head>
        <body style="margin: 0; padding: 0;">
          <div id="root"></div>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
  }
}
