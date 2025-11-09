import { NextRequest, NextResponse } from 'next/server';
import { parseResumePDF } from '@/lib/openrouter';

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Ensure this route is server-side only
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    // Extract text from PDF
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let pdfText: string;
    try {
      // Use pdf2json for more reliable parsing
      const PDFParser = require('pdf2json');
      
      // Create a promise-based wrapper for pdf2json
      const parsePDF = (): Promise<string> => {
        return new Promise((resolve, reject) => {
          const pdfParser = new PDFParser();
          
          pdfParser.on('pdfParser_dataError', (errData: any) => {
            reject(new Error(errData.parserError));
          });
          
          pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
            try {
              // Extract text from all pages
              const textParts: string[] = [];
              
              if (pdfData.Pages) {
                for (const page of pdfData.Pages) {
                  if (page.Texts) {
                    for (const text of page.Texts) {
                      if (text.R) {
                        for (const run of text.R) {
                          if (run.T) {
                            try {
                              // Try to decode URI encoded text
                              const decodedText = decodeURIComponent(run.T);
                              textParts.push(decodedText);
                            } catch (e) {
                              // If decoding fails, use the raw text
                              textParts.push(run.T.replace(/%20/g, ' '));
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
              
              const extractedText = textParts.join(' ');
              resolve(extractedText);
            } catch (err: any) {
              reject(err);
            }
          });
          
          // Parse the buffer
          pdfParser.parseBuffer(buffer);
        });
      };
      
      pdfText = await parsePDF();
      
      if (!pdfText || pdfText.trim().length === 0) {
        return NextResponse.json(
          { error: 'Could not extract text from PDF. The PDF might be scanned or image-based.' },
          { status: 400 }
        );
      }
    } catch (error: any) {
      return NextResponse.json(
        { error: `Failed to extract text from PDF: ${error.message}` },
        { status: 400 }
      );
    }

    // Parse the extracted text using OpenRouter AI
    const result = await parseResumePDF(pdfText);

    return NextResponse.json({
      success: true,
      work_experiences: result.work_experiences,
      count: result.work_experiences.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: error.message || 'Failed to parse resume',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

