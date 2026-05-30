import { Router } from 'express';
import { generateCodeDocumentationPDF } from '../services/pdfGenerator';

export const docsRoutes = Router();

docsRoutes.get('/download', async (_request, response) => {
  try {
    const pdf = await generateCodeDocumentationPDF();
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', 'attachment; filename="digital-wave-crm-code-documentation.pdf"');
    response.setHeader('Content-Length', pdf.length);
    response.end(pdf);
  } catch (error) {
    console.error('PDF generation failed:', error);
    response.status(500).json({ error: 'Failed to generate documentation PDF' });
  }
});
