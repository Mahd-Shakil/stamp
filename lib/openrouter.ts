/**
 * Free AI Resume Parser
 * Uses OpenRouter's free models (moonshotai/kimi-k2:free)
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export interface WorkExperience {
  company_name: string;
  role_title: string;
  start_date: string;
  end_date?: string;
  description?: string;
}

export interface ParseResumeResponse {
  work_experiences: WorkExperience[];
  raw_text?: string;
}

/**
 * List of free models to try in sequence (fallback mechanism)
 */
const FALLBACK_MODELS = [
  'deepseek/deepseek-chat-v3.1:free',
  'deepseek/deepseek-r1-0528-qwen3-8b:free',
  'openai/gpt-oss-20b:free',
  'google/gemini-2.0-flash-exp:free', // Keep as last fallback
];

/**
 * Try to parse resume with a specific model
 */
async function tryParseWithModel(
  model: string,
  prompt: string
): Promise<{ work_experiences: WorkExperience[]; raw_text: string }> {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      'X-Title': 'Vouch - Resume Verification',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `OpenRouter API error: ${response.status}`;
    
    // Handle specific error cases
    if (response.status === 429 || response.status === 402) {
      throw new Error('RATE_LIMIT'); // Special error code for rate limiting
    } else if (response.status === 401) {
      throw new Error('Invalid API key. Please check your OPENROUTER_API_KEY in .env.local');
    } else {
      // Check raw error text first for data policy issues
      if (errorText.toLowerCase().includes('data policy') ||
          errorText.toLowerCase().includes('privacy') ||
          errorText.toLowerCase().includes('no endpoints found')) {
        throw new Error('DATA_POLICY');
      }
      
      try {
        const errorData = JSON.parse(errorText);
        const providerError = errorData.error?.message || errorData.error?.code || errorText;
        
        // Check for rate limiting or data policy errors in error message
        if (providerError.toLowerCase().includes('rate limit') || 
            providerError.toLowerCase().includes('quota') ||
            providerError.toLowerCase().includes('too many requests')) {
          throw new Error('RATE_LIMIT');
        } else if (providerError.toLowerCase().includes('data policy') ||
                   providerError.toLowerCase().includes('privacy') ||
                   providerError.toLowerCase().includes('no endpoints found')) {
          throw new Error('DATA_POLICY'); // Special error for data policy issues
        } else {
          errorMessage = providerError;
        }
      } catch (e: any) {
        if (e.message === 'RATE_LIMIT' || e.message === 'DATA_POLICY') throw e;
        errorMessage = errorText;
      }
    }
    
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  // Check for provider errors in the response
  if (data.error) {
    const errorMsg = data.error.message || data.error.code || JSON.stringify(data.error);
    
    // Check for rate limiting or data policy errors in provider errors
    if (errorMsg.toLowerCase().includes('rate limit') || 
        errorMsg.toLowerCase().includes('quota') ||
        errorMsg.toLowerCase().includes('too many requests') ||
        errorMsg.toLowerCase().includes('429')) {
      throw new Error('RATE_LIMIT');
    } else if (errorMsg.toLowerCase().includes('data policy') ||
               errorMsg.toLowerCase().includes('privacy') ||
               errorMsg.toLowerCase().includes('no endpoints found')) {
      throw new Error('DATA_POLICY');
    }
    
    throw new Error(`Provider returned error: ${errorMsg}`);
  }
  
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No content returned from OpenRouter API');
  }

  // Extract JSON from response (handle cases where AI adds markdown formatting)
  let jsonContent = content.trim();
  
  // Remove markdown code blocks if present
  if (jsonContent.startsWith('```json')) {
    jsonContent = jsonContent.replace(/^```json\n?/, '').replace(/\n?```$/, '');
  } else if (jsonContent.startsWith('```')) {
    jsonContent = jsonContent.replace(/^```\n?/, '').replace(/\n?```$/, '');
  }

  const parsed = JSON.parse(jsonContent);

  // Validate and normalize the response
  if (!parsed.work_experiences || !Array.isArray(parsed.work_experiences)) {
    throw new Error('Invalid response format: missing work_experiences array');
  }

  // Normalize dates and validate entries
  const normalizedExperiences = parsed.work_experiences
    .filter((exp: any) => exp.company_name && exp.role_title && exp.start_date)
    .map((exp: any) => {
      // Clean up company name - remove concatenated parts and fix spacing
      let companyName = exp.company_name.trim();
      // Fix common concatenation issues (e.g., "Company-AnotherPart" -> "Company")
      // Only split if there are multiple dashes suggesting concatenation
      const dashParts = companyName.split('-');
      if (dashParts.length > 2) {
        // Likely concatenated, take the first meaningful part
        // But preserve legitimate multi-part names like "Wilfrid Laurier University"
        const firstPart = dashParts[0].trim();
        const secondPart = dashParts[1]?.trim();
        // If first part looks complete (has spaces), use it; otherwise try first two
        if (firstPart.includes(' ') && firstPart.length > 5) {
          companyName = firstPart;
        } else if (secondPart && (firstPart + ' ' + secondPart).length > 5) {
          companyName = firstPart + ' ' + secondPart;
        } else {
          companyName = firstPart;
        }
      }
      // Fix camelCase or no-space issues in company names (but preserve acronyms)
      companyName = companyName.replace(/([a-z])([A-Z][a-z])/g, '$1 $2');
      
      // Clean up role title - fix spacing issues
      let roleTitle = exp.role_title.trim();
      // Fix camelCase issues (e.g., "DataEngineer" -> "Data Engineer")
      roleTitle = roleTitle.replace(/([a-z])([A-Z])/g, '$1 $2');
      // Fix common abbreviations (e.g., "VPof" -> "VP of")
      roleTitle = roleTitle.replace(/([A-Z]{2,})of([A-Z])/gi, '$1 of $2');
      roleTitle = roleTitle.replace(/([A-Z]{2,})Of([A-Z])/g, '$1 of $2');
      
      const startDate = normalizeDate(exp.start_date);
      const endDate = exp.end_date ? normalizeDate(exp.end_date) : undefined;
      
      // Validate dates are not in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate) {
        const start = new Date(startDate);
        if (start > today) {
          // Date is in the future, invalid - skip this entry
          return null;
        }
      }
      
      if (endDate) {
        const end = new Date(endDate);
        if (end > today) {
          // End date in future means it's current, set to null
          return {
            company_name: companyName,
            role_title: roleTitle,
            start_date: startDate,
            end_date: undefined,
            description: exp.description?.trim(),
          };
        }
      }
      
      return {
        company_name: companyName,
        role_title: roleTitle,
        start_date: startDate,
        end_date: endDate,
        description: exp.description?.trim(),
      };
    })
    .filter((exp: any) => exp !== null && exp.start_date); // Remove invalid entries

  return {
    work_experiences: normalizedExperiences,
    raw_text: content,
  };
}

/**
 * Parse a PDF resume using OpenRouter's free AI models with fallback
 * @param pdfText - Extracted text from PDF
 * @returns Parsed work experience data
 */
export async function parseResumePDF(pdfText: string): Promise<ParseResumeResponse> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  // Use custom model from env, or use fallback list
  const customModel = process.env.OPENROUTER_MODEL;
  const modelsToTry = customModel ? [customModel, ...FALLBACK_MODELS] : FALLBACK_MODELS;

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
  const currentDay = String(currentDate.getDate()).padStart(2, '0');
  const today = `${currentYear}-${currentMonth}-${currentDay}`;

  const prompt = `You are an expert at extracting work experience information from resumes. Extract ALL work experience entries from the resume text below.

CRITICAL RULES:
1. Dates must be valid and NOT in the future. Today's date is ${today}. If a date appears to be in the future, use the most recent valid date instead.
2. Job titles must preserve proper spacing. "Data Engineer" not "DataEngineer", "VP of Technology" not "VPofTechnology".
3. Company names must be complete and properly separated. Do not concatenate multiple words together. "Wilfrid Laurier University" not "WilfridLaurierUniversity" or "Wilfrid Laurier University-VRLaurierWaterloo".
4. If end_date is "Present", "Current", or missing and the role appears ongoing, set end_date to null.
5. Extract dates in YYYY-MM-DD format. If only month/year is given, use the 1st of the month.
6. Only include entries with clear company name, job title, and start date.

EXAMPLE OUTPUT:
{
  "work_experiences": [
    {
      "company_name": "Meta",
      "role_title": "Data Engineer",
      "start_date": "2023-09-01",
      "end_date": null,
      "description": "Built data pipelines"
    },
    {
      "company_name": "Wilfrid Laurier University",
      "role_title": "VP of Technology",
      "start_date": "2024-05-01",
      "end_date": null
    }
  ]
}

Resume text:
${pdfText}

Return ONLY a valid JSON object with the exact structure shown above. No markdown, no explanations, no additional text.`;

  // Try each model in sequence until one works
  let lastError: Error | null = null;
  
  for (let i = 0; i < modelsToTry.length; i++) {
    const model = modelsToTry[i];
    
    try {
      const result = await tryParseWithModel(model, prompt);
      return result;
    } catch (error: any) {
      lastError = error;
      
      // If it's a rate limit or data policy issue, try the next model
      if ((error.message === 'RATE_LIMIT' || error.message === 'DATA_POLICY') && i < modelsToTry.length - 1) {
        // Small delay before trying next model
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }
      
      // If it's not a recoverable error or it's the last model, throw the error
      if ((error.message !== 'RATE_LIMIT' && error.message !== 'DATA_POLICY') || i === modelsToTry.length - 1) {
        // Provide helpful message for data policy errors
        if (error.message === 'DATA_POLICY') {
          throw new Error('All models require data policy configuration. Please configure your privacy settings at https://openrouter.ai/settings/privacy and enable "Free model publication".');
        }
        throw error;
      }
    }
  }
  
  // If we get here, all models failed
  throw new Error(`All models failed. Last error: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Normalize date strings to YYYY-MM-DD format
 */
function normalizeDate(dateStr: string | null | undefined): string {
  if (!dateStr || dateStr === 'null' || dateStr.toLowerCase() === 'present' || dateStr.toLowerCase() === 'current') {
    return '';
  }

  try {
    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }

    // Try to parse and format
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
}

