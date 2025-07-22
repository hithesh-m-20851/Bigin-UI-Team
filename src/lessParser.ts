import * as fs from 'fs';

export function extractClassNamesFromLess(filePath: string): string[] {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const content = raw
      .replace(/\/\*[\s\S]*?\*\//g, '')  // block comments
      .replace(/\/\/[^\n]*/g, '');       // single-line comments
    const regex = /(?:^|\s)\.([a-zA-Z0-9_-]+)\s*[,{]/g;

    const matches = new Set<string>();
    let match;

    while ((match = regex.exec(content)) !== null) {
      matches.add(match[1]);
    }

    return Array.from(matches);
  } catch (e) {
    console.error("Failed to read LESS file:", filePath, e);
    return [];
  }
}

