// src/lib/fileConnector.ts
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);

export async function searchFiles(directory: string, query: string): Promise<string[]> {
  const files = await readdir(directory);
  const results = [];
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stats = await stat(filePath);
    
    if (stats.isDirectory()) {
      // Recursively search directories
      const nestedResults = await searchFiles(filePath, query);
      results.push(...nestedResults);
    } else {
      // Search in file content
      try {
        const content = await readFile(filePath, 'utf8');
        if (content.toLowerCase().includes(query.toLowerCase())) {
          results.push(filePath);
        }
      } catch (err) {
        console.error(`Error reading file ${filePath}:`, err);
      }
    }
  }
  
  return results;
}