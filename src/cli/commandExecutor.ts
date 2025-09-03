import { spawn, ChildProcess } from 'child_process';
import * as vscode from 'vscode';

export interface CommandResult {
  metadataObjects?: any;
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
}

export class SalesforceCLIExecutor {
  public static async executeCommand(
    command: string,
    args: string[],
    workingDirectory?: string
  ): Promise<CommandResult> {
    return new Promise((resolve) => {
      const process: ChildProcess = spawn(command, args, {
        cwd: workingDirectory || vscode.workspace.rootPath,
        shell: true
      });

      let stdout = '';
      let stderr = '';

      process.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (exitCode) => {
        resolve({
          success: exitCode === 0,
          stdout,
          stderr,
          exitCode: exitCode || 0
        });
      });
    });
  }

  public static async executeSfCommand(
    subCommand: string,
    flags: string[] = []
  ): Promise<CommandResult> {
    const args = [subCommand, ...flags];
    return this.executeCommand('sf', args);
  }
}
