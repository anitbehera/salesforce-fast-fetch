import * as fs from "fs";
import * as path from "path";

export class MetadataStore {
  private saveTimer?: NodeJS.Timeout;

  constructor(private readonly filePath: string) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "[]");
    }
  }

  private toLightweight(data: any[]) {
    return data.map(mt => {
      const { components, ...rest } = mt;
      return rest; // drop components
    });
  }

  save(data: any[], delayMs = 500) {
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      try {
        const lightweight = this.toLightweight(data);
        fs.writeFileSync(this.filePath, JSON.stringify(lightweight, null, 2));
      } catch (e) {
        console.error("Failed to save metadataTypes.json:", e);
      }
    }, delayMs);
  }

  saveNow(data: any[]) {
    clearTimeout(this.saveTimer);
    try {
      const lightweight = this.toLightweight(data);
      fs.writeFileSync(this.filePath, JSON.stringify(lightweight, null, 2));
    } catch (e) {
      console.error("Failed to save metadataTypes.json:", e);
    }
  }
}
