import * as vscode from "vscode";

export class SalesforceOutputChannel {
  private static instance: vscode.OutputChannel;

  public static getInstance(): vscode.OutputChannel {
    if (!SalesforceOutputChannel.instance) {
      SalesforceOutputChannel.instance = vscode.window.createOutputChannel("Salesforce Fast Fetch");
    }
    return SalesforceOutputChannel.instance;
  }
}
