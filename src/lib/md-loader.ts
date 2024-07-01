import { promises as fs } from 'fs';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { env } from "./config";
import { join, resolve } from 'path';


class MarkdownLoader {
    constructor(private filePath: string) {}
  
    async load() {
      const fileContent = await fs.readFile(this.filePath, 'utf-8');
      return [{ pageContent: fileContent, metadata: {} }];
    }
}

// Solo un MDK
export async function getChunkedDocsFromMarkdown() {
  try {
    const loader = new MarkdownLoader(env.MARKDOWN_PATH);

    const docs = await loader.load();

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunkedDocs = await textSplitter.splitDocuments(docs);

    return chunkedDocs;
  } catch (e) {
    console.error(e);
    throw new Error("Markdown docs chunking failed !");
  }
}

// Multiples MDK
export async function getChunkedDocsFromMultipleMarkdown() {
  try {
    const fileNames = await fs.readdir(env.MARKDOWN_PATH);
    //console.log(fileNames);
    const markdownFiles = fileNames.filter(fn => fn.endsWith('.mdx'));
    //console.log("md fi", markdownFiles);

    const loaders = markdownFiles.map(fileName => new MarkdownLoader(join(env.MARKDOWN_PATH, fileName)));

    const docs = [];
    for (const loader of loaders) {
      const doc = await loader.load();
      docs.push(...doc);
    }

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunkedDocs = await textSplitter.splitDocuments(docs);

    return chunkedDocs;
  } catch (e) {
    console.error(e);
    throw new Error("Markdown docs chunking failed !");
  }
}

// pendiente: recursivo

export async function loadMarkdownFilesFromDirectory(directoryPath = env.FILES_PATH) {
  let filePaths: string[] = [];
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      filePaths = filePaths.concat(await loadMarkdownFilesFromDirectory(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
      filePaths.push(fullPath);
    }
  }
  console.log(filePaths);
  return filePaths;
}

export async function getChunkedDocsFromMultiplesMarkdown(directoryPath = env.FILES_PATH) {
  try {
    const markdownFilePaths = await loadMarkdownFilesFromDirectory(directoryPath);

    const docs = [];
    for (const filePath of markdownFilePaths) {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      docs.push({ pageContent: fileContent, metadata: { filePath } }); // Adjusted to include filePath in metadata
    }

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    // Assuming textSplitter and its configuration are defined elsewhere
    const chunkedDocs = await textSplitter.splitDocuments(docs);

    return chunkedDocs;
  } catch (e) {
    console.error(e);
    throw new Error("Markdown docs chunking failed !");
  }
}