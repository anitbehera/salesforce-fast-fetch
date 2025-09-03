import * as vscode from 'vscode';
import { TARGET_ORG_KEY } from '../constants';
import { SalesforceCLIExecutor } from "../cli/commandExecutor";

export class OrgInfo {
  /**
   * Get the default from sf-config
   */
  public static async getDefaultOrg(
    root: vscode.Uri
  ): Promise<any | undefined> {
    const configUri = vscode.Uri.joinPath(root, ".sf", "config.json");
    try {
      const bytes = await vscode.workspace.fs.readFile(configUri);
      const parsed = JSON.parse(new TextDecoder().decode(bytes));
      return parsed[TARGET_ORG_KEY];
    } catch {
      console.warn("No sf-config found or could not read file.");
      return undefined;
    }
  }

  /**
   * Get the default username from Salesforce CLI config
   */
  public static async getDefaultUsername(): Promise<string | null> {
    try {
      const result = await SalesforceCLIExecutor.executeSfCommand(
        "config get target-org",
        ["--json"]
      );

      if (result.success) {
        const output = JSON.parse(result.stdout);
        return output.result[0].value || null;
      } else {
        throw new Error(`Failed to get default username: ${result.stderr}`);
      }
    } catch (error) {
      console.error("Error getting default username:", error);
      return null;
    }
  }
}
