import * as vscode from 'vscode';
import { getUri } from '../utils/getUri';
import { getNonce } from '../utils/getNonce';

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.command) {
        case 'ready': {
          // Handle commands from webview
          console.log("Ready");
          break;
        }
        case 'hello': {
          // Handle commands from webview
          console.log("Hello from webview!");
          vscode.window.showInformationMessage('Command received!');
          break;
        }
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {

    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );

    // The CSS file from the React build output
    const stylesUri = getUri(webview, this._extensionUri, ["webview-ui", "build", "assets", "index.css"]);
    // The JS file from the React build output
    const scriptUri = getUri(webview, this._extensionUri, ["webview-ui", "build", "assets", "index.js"]);

    const nonce = getNonce();

    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
          <link href="${styleResetUri}" rel="stylesheet">
				  <link href="${styleVSCodeUri}" rel="stylesheet">
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>Salesforce Fast Fetch</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
  }
}
