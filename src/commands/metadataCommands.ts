import * as vscode from "vscode";
import { MetadataService } from "../services/metadataService";
import { MetadataType, MetadataComponent } from "../types/metadata";
import { SalesforceCLIExecutor } from "../cli/commandExecutor";
import { SalesforceOutputChannel } from '../utils/outputChannel';

export class MetadataCommands {
  /**
   * Retrieve a single metadata component
   */
  public static async retrieveSingleComponent(
    component: MetadataComponent
  ): Promise<void> {
    const outputChannel = SalesforceOutputChannel.getInstance();

    try {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Retrieving`,
          cancellable: false,
        },
        async (progress) => {
          progress.report({
            message: `${component.fullName} (${component.type})`,
          });
          outputChannel.appendLine(`Retrieving: ${component.fullName} (${component.type})`);
          const success = await MetadataService.retrieveSingleComponent(
            component.type,
            component.fullName
          );

          if (success) {
            const message = `✅ Successfully retrieved: ${component.fullName} (${component.type})`;
            vscode.window.showInformationMessage(message);
            outputChannel.appendLine(message);
          } else {
            const errorMsg = `❌ Failed to retrieve: ${component.fullName} (${component.type})`;
            vscode.window.showErrorMessage(errorMsg);
            outputChannel.appendLine(errorMsg);
          }
        }
      );
    } catch (error) {
      const errorMsg = `Error retrieving component: ${error}`;
      vscode.window.showErrorMessage(errorMsg);
      outputChannel.appendLine(errorMsg);
    }
    // Show the output channel once, after logging
    outputChannel.show(true);
  }

  /**
   * Retrieve all components of a specific metadata type
   */
  public static async retrieveAllOfType(metadataType: string): Promise<void> {
    const outputChannel = SalesforceOutputChannel.getInstance();

    try {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Retrieving all ${metadataType} components...`,
          cancellable: false,
        },
        async (progress) => {
          progress.report({
            message: `Fetching all ${metadataType} components from org...`,
          });

          const success = await MetadataService.retrieveAllComponentsOfType(
            metadataType
          );

          if (success) {
            const message = `✅ Successfully retrieved all ${metadataType} components`;
            vscode.window.showInformationMessage(message);
            outputChannel.appendLine(message);
          } else {
            const errorMsg = `❌ Failed to retrieve ${metadataType} components`;
            vscode.window.showErrorMessage(errorMsg);
            outputChannel.appendLine(errorMsg);
          }
        }
      );
    } catch (error) {
      const errorMsg = `Error retrieving metadata type: ${error}`;
      vscode.window.showErrorMessage(errorMsg);
      outputChannel.appendLine(errorMsg);
    }

    // Show the output channel once, after logging
    outputChannel.show(true);
  }

  /**
   * Retrieve selected components (multi-select)
   */
  public static async retrieveSelectedComponents(
    components: MetadataComponent[]
  ): Promise<void> {
    const outputChannel = SalesforceOutputChannel.getInstance();

    if (components.length === 0) {
      vscode.window.showWarningMessage("No components selected for retrieval");
      return;
    }

    try {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Retrieving ${components.length} selected components...`,
          cancellable: false,
        },
        async (progress) => {
          const componentMap = components.map((c) => ({
            type: c.type,
            name: c.fullName,
          }));

          progress.report({
            message: "Fetching selected components from org...",
          });

          const success = await MetadataService.retrieveMultipleComponents(
            componentMap
          );

          if (success) {
            const message = `✅ Successfully retrieved ${components.length} components`;
            vscode.window.showInformationMessage(message);
            outputChannel.appendLine(message);
            outputChannel.appendLine(`Retrieved components: ${JSON.stringify(components, null, 2)}`);
          } else {
            const errorMsg = `❌ Failed to retrieve selected components`;
            vscode.window.showErrorMessage(errorMsg);
            outputChannel.appendLine(errorMsg);
          }
        }
      );
    } catch (error) {
      const errorMsg = `Error retrieving selected components: ${error}`;
      vscode.window.showErrorMessage(errorMsg);
      outputChannel.appendLine(errorMsg);
    }

    // Show the output channel once, after logging
    outputChannel.show(true);
  }

  /**
   * Quick retrieve - select and retrieve components via quick pick
   */
  public static async quickRetrieveComponent(): Promise<void> {
    try {
      // First, let user select metadata type
      const metadataTypes = await MetadataService.getAllMetadataTypes();
      const typeOptions = metadataTypes.map((type) => ({
        label: type.xmlName,
        description: type.directoryName,
        detail: `Metadata Type: ${type.xmlName}`,
      }));

      const selectedType = await vscode.window.showQuickPick(typeOptions, {
        placeHolder: "Select metadata type to retrieve from",
        matchOnDescription: true,
        matchOnDetail: true,
      });

      if (!selectedType) {
        return;
      }

      // Then get components of that type
      const components = await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Loading ${selectedType.label} components...`,
          cancellable: true,
        },
        async (progress, token) => {
          return await MetadataService.listMetadataComponents(
            selectedType.label
          );
        }
      );

      if (components.length === 0) {
        vscode.window.showInformationMessage(
          `No ${selectedType.label} components found in org`
        );
        return;
      }

      // Let user select specific component(s)
      const componentOptions = components.map((comp) => ({
        label: comp.fullName,
        description: comp.type,
        detail: `Component: ${comp.fullName}`,
        component: comp,
      }));

      const selectedComponents = await vscode.window.showQuickPick(
        componentOptions,
        {
          placeHolder: `Select ${selectedType.label} component(s) to retrieve`,
          canPickMany: true,
          matchOnDescription: true,
          matchOnDetail: true,
        }
      );

      if (!selectedComponents || selectedComponents.length === 0) {
        return;
      }

      // Retrieve selected components
      const componentsToRetrieve = selectedComponents.map(
        (item) => item.component
      );
      await this.retrieveSelectedComponents(componentsToRetrieve);
    } catch (error) {
      vscode.window.showErrorMessage(`Error in quick retrieve: ${error}`);
    }
  }

  /**
   * Retrieve all metadata from org (dangerous - use with caution)
   */
  public static async retrieveAllMetadata(): Promise<void> {
    const outputChannel = SalesforceOutputChannel.getInstance();

    const dangerConfirm = await vscode.window.showWarningMessage(
      "⚠️ WARNING: This will retrieve ALL metadata from your org.\n\nThis operation may take a very long time and download large amounts of data.\n\nOnly use this in development/sandbox orgs.",
      { modal: true },
      "I Understand - Retrieve All",
      "Cancel"
    );

    if (dangerConfirm !== "I Understand - Retrieve All") {
      return;
    }

    try {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Retrieving ALL metadata from org...",
          cancellable: false,
        },
        async (progress) => {
          progress.report({ message: "This may take several minutes..." });

          const result = await SalesforceCLIExecutor.executeSfCommand(
            "project retrieve start",
            ["--manifest", "manifest/package.xml", "--json"]
          );

          if (result.success) {
            const message = "✅ Successfully retrieved all metadata";
            vscode.window.showInformationMessage(message);
            outputChannel.appendLine(message);
          } else {
            const errorMsg = "❌ Failed to retrieve all metadata";
            vscode.window.showErrorMessage(errorMsg);
            outputChannel.appendLine(errorMsg);
            outputChannel.appendLine(result.stderr);
          }
        }
      );
    } catch (error) {
      const errorMsg = `Error retrieving all metadata: ${error}`;
      vscode.window.showErrorMessage(errorMsg);
      outputChannel.appendLine(errorMsg);
    }

    // Show the output channel once, after logging
    outputChannel.show(true);
  }

  public static async deleteSingleComponent(
    component: MetadataComponent
  ): Promise<boolean> {
    const outputChannel = SalesforceOutputChannel.getInstance();
    try {
      const confirm = await vscode.window.showWarningMessage(
        `Are you sure want to delete "${component.fullName}(${component.type})" from default Org and Local workspace ?`,
        "Yes, Delete",
        "Cancel"
      );
      if (confirm !== "Yes, Delete") {
        return false;
      }
      outputChannel.appendLine(`Deleting: ${component.fullName} (${component.type}).`);

      return await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Deleting: ${component.fullName} (${component.type}).`,
          cancellable: false,
        },
        async (progress) => {
          const result = await MetadataService.deleteMetadata(
            component.type,
            component.fullName
          );

          const stdout = JSON.parse(result.stdout);

          if (result.success) {
            const message = `Successfully deleted: ${component.fullName} (${component.type}).`;
            if (stdout?.warnings && stdout.warnings.length > 0) {
              stdout.warnings.forEach((warning: string) => {
                outputChannel.appendLine(`⚠️ Warning: ${warning}.`);
              });
            }
            outputChannel.appendLine(`✅ ${message}`);
            outputChannel.show(true);
            vscode.window.showInformationMessage(`🗑️ ${message}`);
          } else {
            const errorDetail = stdout?.result.details.componentFailures[0].problem || 'Unknown error';
            outputChannel.appendLine(`❌ Failed to delete: ${component.fullName} (${component.type}).`);
            outputChannel.appendLine(errorDetail);
            outputChannel.show(true);
            vscode.window.showErrorMessage(
              `Failed to delete: ${component.fullName} (${component.type}).`
            );
          }

          return result.success;
        }
      );
    } catch (error) {
      outputChannel.appendLine(`❌ Error deleting component: ${error}`);
      outputChannel.show(true);
      vscode.window.showErrorMessage(`Error deleting component: ${error}`);
      return false;
    }
  }
}
