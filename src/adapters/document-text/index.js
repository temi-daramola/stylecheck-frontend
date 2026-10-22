// In-browser text extraction for style manuals. The file itself never leaves the browser.
import * as pdfjs from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import mammoth from 'mammoth/mammoth.browser';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const UNREADABLE_PDF = 'This PDF could not be read. Please check the file and try again.';
const UNREADABLE_DOCX = 'This document could not be read. Please check the file and try again.';

const extractPdfText = async (file) => {
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data }).promise;
  const pages = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => ('str' in item ? item.str + (item.hasEOL ? '\n' : ' ') : '')).join(''));
  }
  await pdf.destroy();
  return pages.join('\n\n');
};

const extractDocxText = async (file) => {
  const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return value;
};

/**
 * Extracts plain text from a PDF or DOCX file. Throws { message } if the file cannot be parsed.
 * A scanned PDF (image only) parses fine but yields no text: callers check the length.
 */
export const extractDocumentText = async (file, fileType) => {
  try {
    return fileType === 'pdf' ? await extractPdfText(file) : await extractDocxText(file);
  } catch {
    throw { status: 'error', message: fileType === 'pdf' ? UNREADABLE_PDF : UNREADABLE_DOCX, data: null };
  }
};
