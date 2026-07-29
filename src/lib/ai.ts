import { GoogleGenAI } from '@google/genai';

// Helper to get configured AI API key
export function getAIApiKey(): string {
  const viteKey = import.meta.env.VITE_AI_API_KEY;
  if (viteKey && viteKey.trim().length > 0) return viteKey.trim();
  
  const geminiEnvKey = import.meta.env.GEMINI_API_KEY;
  if (geminiEnvKey && geminiEnvKey.trim().length > 0) return geminiEnvKey.trim();

  if (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY.trim();
  }

  return '';
}

// Get configured provider ("gemini" | "openai" | custom)
export function getAIProvider(): string {
  return import.meta.env.VITE_AI_PROVIDER || 'gemini';
}

// Helper to get client instance
function getAIClient(): GoogleGenAI | null {
  const apiKey = getAIApiKey();
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (e) {
    console.warn('Failed to initialize GoogleGenAI client:', e);
    return null;
  }
}

/**
 * 1. Generate Product Story
 * Generates a compelling 150-200 word product story based on product details.
 */
export async function generateProductStory(productData: {
  name: string;
  fabric?: string;
  material?: string;
  price?: number | string;
  category?: string;
  gsm?: string;
  vibe?: string;
}): Promise<string> {
  const apiKey = getAIApiKey();
  if (!apiKey) {
    return "AI features are not configured. Please add your AI API key to the .env file.";
  }

  const ai = getAIClient();
  if (!ai) {
    return "AI is currently unavailable. Please try again later.";
  }

  const prompt = `Write a compelling 150-200 word luxury product story and heritage narrative for a high-end fashion garment.
Product Name: ${productData.name || 'Bespoke Traditional Garment'}
Fabric: ${productData.fabric || productData.material || 'Hand-loomed Luxury Textile'}
GSM: ${productData.gsm || '320 GSM'}
Style / Vibe: ${productData.vibe || 'Royal Dignity'}
Category: ${productData.category || 'Luxury Garments'}
${productData.price ? `Price Point: ₦${productData.price}` : ''}

Focus on craftsmanship, artisanal provenance, cultural heritage, and digital authenticity via Digital Product Passport. Write in an elegant, prestigious tone. Do not use generic buzzwords. Keep it strictly between 150 and 200 words.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an elite luxury fashion copywriter and brand storyteller specializing in African couture, traditional textiles, and digital product passport provenance.',
        temperature: 0.7,
      },
    });

    if (response.text && response.text.trim().length > 0) {
      return response.text.trim();
    }
    return "AI is currently unavailable. Please try again later.";
  } catch (error) {
    console.warn('generateProductStory AI error:', error);
    return "AI is currently unavailable. Please try again later.";
  }
}

/**
 * 2. Generate Care Instructions
 * Generates washing, drying, ironing, and storing instructions based on fabric & material.
 */
export async function generateCareInstructions(fabric?: string, material?: string): Promise<string> {
  const apiKey = getAIApiKey();
  if (!apiKey) {
    return "AI features are not configured. Please add your AI API key to the .env file.";
  }

  const ai = getAIClient();
  if (!ai) {
    return "AI is currently unavailable. Please try again later.";
  }

  const fabricName = fabric || material || 'Luxury Textile';
  const prompt = `Provide concise, professional care regime instructions for a luxury garment made from "${fabricName}".
Include specific guidelines for:
1. Washing / Cleaning
2. Drying
3. Ironing / Steaming
4. Storage & Hanger Protection

Keep the response formatted clearly as bullet points or a structured paragraph (approx 60-100 words).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a master garment care specialist for luxury apparel and delicate hand-woven fabrics.',
        temperature: 0.5,
      },
    });

    if (response.text && response.text.trim().length > 0) {
      return response.text.trim();
    }
    return "AI is currently unavailable. Please try again later.";
  } catch (error) {
    console.warn('generateCareInstructions AI error:', error);
    return "AI is currently unavailable. Please try again later.";
  }
}

/**
 * 3. Generate Product Tags
 * Suggests categories, keywords, and tags based on product name and description.
 */
export async function generateProductTags(name: string, description?: string): Promise<string[]> {
  const apiKey = getAIApiKey();
  if (!apiKey) {
    return ['Luxury', 'Bespoke', 'Authentic', 'Hand-Crafted'];
  }

  const ai = getAIClient();
  if (!ai) {
    return ['Luxury', 'Bespoke', 'Authentic', 'Hand-Crafted'];
  }

  const prompt = `Suggest 5 to 8 relevant category keywords and tags for a luxury fashion item.
Product Name: "${name}"
Description: "${description || ''}"

Return ONLY a comma-separated list of tags (e.g. Traditional, Agbada, Aso-Oke, Couture, Nigeria, Sustainable). Do not include numbered lists or explanations.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an e-commerce taxonomy and luxury fashion tagging expert.',
        temperature: 0.6,
      },
    });

    if (response.text && response.text.trim().length > 0) {
      const raw = response.text.trim();
      const tags = raw.split(',').map(t => t.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
      return tags.length > 0 ? tags : ['Luxury', 'Couture', 'Bespoke'];
    }
    return ['Luxury', 'Couture', 'Bespoke'];
  } catch (error) {
    console.warn('generateProductTags AI error:', error);
    return ['Luxury', 'Couture', 'Bespoke'];
  }
}

/**
 * 4. Generate Campaign Copy
 * Generates email subject and body copy based on campaign type and brand name.
 */
export async function generateCampaignCopy(
  campaignType: string,
  brandName: string
): Promise<{ subject: string; body: string }> {
  const apiKey = getAIApiKey();
  if (!apiKey) {
    return {
      subject: `AI features are not configured. Please add your AI API key to the .env file.`,
      body: `AI features are not configured. Please add your AI API key to the .env file.`
    };
  }

  const ai = getAIClient();
  if (!ai) {
    return {
      subject: `Special Update from ${brandName}`,
      body: `AI is currently unavailable. Please try again later.`
    };
  }

  const prompt = `Generate a high-converting luxury email campaign draft for the brand "${brandName}".
Campaign Type: ${campaignType}

Return a valid JSON object with exact structure:
{
  "subject": "The email subject line",
  "body": "The email body copy"
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a luxury email marketing strategist for elite fashion houses. Return valid JSON only.',
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    if (response.text) {
      try {
        const parsed = JSON.parse(response.text.trim());
        if (parsed.subject && parsed.body) {
          return { subject: parsed.subject, body: parsed.body };
        }
      } catch (e) {
        console.warn('Failed to parse campaign JSON:', e);
      }
    }
    return {
      subject: `Exclusive Update from ${brandName}`,
      body: `AI is currently unavailable. Please try again later.`
    };
  } catch (error) {
    console.warn('generateCampaignCopy AI error:', error);
    return {
      subject: `Exclusive Update from ${brandName}`,
      body: `AI is currently unavailable. Please try again later.`
    };
  }
}

/**
 * 5. Get Premium Help
 * Answers fashion business, sourcing, pricing, or atelier strategy questions.
 */
export async function getPremiumHelp(userPrompt: string): Promise<string> {
  const apiKey = getAIApiKey();
  if (!apiKey) {
    return "AI features are not configured. Please add your AI API key to the .env file.";
  }

  const ai = getAIClient();
  if (!ai) {
    return "AI is currently unavailable. Please try again later.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: userPrompt,
      config: {
        systemInstruction: `You are VeriThread AI, an expert fashion business consultant, master textile advisor, and luxury brand strategist specializing in African fashion houses, Digital Product Passports, authentication, supply chain provenance, pricing, and global e-commerce scaling. Provide clear, direct, actionable, and prestigious advice.`,
        temperature: 0.7,
      },
    });

    if (response.text && response.text.trim().length > 0) {
      return response.text.trim();
    }
    return "AI is currently unavailable. Please try again later.";
  } catch (error) {
    console.warn('getPremiumHelp AI error:', error);
    return "AI is currently unavailable. Please try again later.";
  }
}
