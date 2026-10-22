// In-browser text extraction for style manuals. The file itself never leaves the browser.
// The legacy build runs on older browsers too; the standard build needs very recent ones.
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import pdfWorkerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import mammoth from 'mammoth/mammoth.browser';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const UNREADABLE_PDF = 'This PDF could not be read. Please check the file and try again.';
const UNREADABLE_DOCX = 'This document could not be read. Please check the file and try again.';
const PASSWORD_PROTECTED_PDF = 'This PDF is password protected. Remove the password and try again.';
const PASSWORD_EXCEPTION = 'PasswordException';
const LINE_BREAK = '\n';
const PAGE_BREAK = '\n\n';

const extractPdfText = async (file) => {
  const data = new Uint8Array(await file.arrayBuffer());
  // The loading task owns the worker resources, so it is the thing to destroy (not the document).
  const loadingTask = pdfjs.getDocument({ data });
  try {
    const pdf = await loadingTask.promise;
    const pages = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(content.items.map((item) => ('str' in item ? item.str + (item.hasEOL ? LINE_BREAK : ' ') : '')).join(''));
    }
    return pages.join(PAGE_BREAK);
  } finally {
    await loadingTask.destroy();
  }
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
  } catch (error) {
    // Keep the real cause visible for debugging: the user-facing message below is deliberately short.
    console.error('[document-text] extraction failed:', error);
    const message =
      error?.name === PASSWORD_EXCEPTION ? PASSWORD_PROTECTED_PDF : fileType === 'pdf' ? UNREADABLE_PDF : UNREADABLE_DOCX;
    throw { status: 'error', message, data: null };
  }
};
