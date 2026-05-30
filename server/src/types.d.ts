declare module 'pdfkit' {
  import { EventEmitter } from 'events';

  interface PDFDocumentOptions {
    size?: string | [number, number];
    margins?: { top: number; bottom: number; left: number; right: number };
    info?: Record<string, string | undefined>;
    bufferPages?: boolean;
  }

  interface PDFDocument extends EventEmitter {
    fontSize(size: number): this;
    font(font: string): this;
    fillColor(color: string): this;
    strokeColor(color: string): this;
    lineWidth(width: number): this;
    text(text: string, options?: { align?: string; indent?: number; width?: number; y?: number; continued?: boolean }): this;
    moveDown(n?: number): this;
    moveUp(n?: number): this;
    moveTo(x: number, y: number): this;
    lineTo(x: number, y: number): this;
    stroke(): this;
    rect(x: number, y: number, w: number, h: number): this;
    fill(color?: string): this;
    addPage(): this;
    end(): void;
    y: number;
    page: { width: number; height: number };
  }

  interface PDFDocumentConstructor {
    new (options?: PDFDocumentOptions): PDFDocument;
    (options?: PDFDocumentOptions): PDFDocument;
  }

  const PDFDocument: PDFDocumentConstructor;
  export default PDFDocument;
}

declare module 'hpp' {
  import { RequestHandler } from 'express';
  function hpp(): RequestHandler;
  export = hpp;
}
