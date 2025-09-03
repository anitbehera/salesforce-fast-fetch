import * as vscode from 'vscode';
import { OrgInfo } from './orgInfo';
import { MetadataService } from '../services/metadataService';
import { MetadataType } from "../types/metadata";

export interface InitResult {
  orgFolderUri?: vscode.Uri;
  error?: string;
  metadataTypes?: MetadataType[];
}

export async function initializeWorkspace(): Promise<InitResult> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders?.length) {
    return { error: "No workspace detected" };
  }

  const workspaceRoot = workspaceFolders[0].uri;

  const sfDefaultOrg = await OrgInfo.getDefaultOrg(workspaceRoot);
  if (!sfDefaultOrg) {
    return { error: "No default org set in Salesforce CLI" };
  }

  try {
    // Salesforce project detection
    const projectFile = vscode.Uri.joinPath(workspaceRoot, "sfdx-project.json");
    await vscode.workspace.fs.stat(projectFile);

    // Ensure folder
    const targetFolderUri = await ensureOrgFolder(workspaceRoot, sfDefaultOrg);

    // Ensure metadataTypes.json exists (base metadata list)
    const metadataTypes = await ensureMetadataFile(targetFolderUri);

    // Merge components back in memory if selected
    for (const mt of metadataTypes) {
      if (mt.selected) {
        try {
          const fileUri = vscode.Uri.joinPath(targetFolderUri, `${mt.xmlName}.json`);
          const bytes = await vscode.workspace.fs.readFile(fileUri);
          mt.components = JSON.parse(new TextDecoder().decode(bytes));
        } catch {
          console.warn(`No saved components file for ${mt.xmlName}`);
        }
      }
    }

    return { orgFolderUri: targetFolderUri, metadataTypes };

  } catch {
    return { error: "Non-Salesforce project detected" };
  }
}


async function ensureOrgFolder(root: vscode.Uri, username: string): Promise<vscode.Uri> {
  const folderUri = vscode.Uri.joinPath(root, ".sfdx", "sf-fast-fetch", "orgs", username);
  try {
    await vscode.workspace.fs.stat(folderUri);
  } catch {
    await vscode.workspace.fs.createDirectory(folderUri);
  }
  return folderUri;
}

async function ensureMetadataFile(folderUri: vscode.Uri): Promise<any[]> {
  const fileUri = vscode.Uri.joinPath(folderUri, "metadataTypes.json");
  try {
    const bytes = await vscode.workspace.fs.readFile(fileUri);
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    const metadataTypes = await MetadataService.getAllMetadataTypes();
    const jsonBytes = new TextEncoder().encode(JSON.stringify(metadataTypes, null, 2));
    await vscode.workspace.fs.writeFile(fileUri, jsonBytes);
    return metadataTypes;
  }
}
