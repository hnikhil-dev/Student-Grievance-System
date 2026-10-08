/**
 * Google Gemini AI Gateway for Autonomous Multi-Agent Governance
 * Connects to Gemini 1.5/2.0 Flash REST API with zero external runtime dependencies.
 * Automatically falls back to dynamic deterministic synthesis if GEMINI_API_KEY is not configured.
 */

export interface GeminiResponse<T = any> {
  success: boolean;
  data?: T;
  rawText?: string;
  isAiGenerated: boolean;
  error?: string;
}

export class GeminiGateway {
  private static getApiKey(): string | null {
    return process.env.GEMINI_API_KEY || null;
  }

  public static getApiKeyId(): string | null {
    return process.env.GEMINI_API_KEY_ID || process.env.API_KEY_ID || null;
  }

  /**
   * Returns true if a valid Gemini API key is configured in the environment
   */
  public static isAvailable(): boolean {
    const key = this.getApiKey();
    return Boolean(key && key.trim().length > 10 && !key.includes('placeholder'));
  }

  /**
   * Dispatches a structured reasoning prompt to Gemini
   */
  public static async generateStructuredReasoning<T>(
    systemInstruction: string,
    userPrompt: string,
    timeoutMs = 15000
  ): Promise<GeminiResponse<T>> {
    const apiKey = this.getApiKey();
    if (!apiKey || !this.isAvailable()) {
      return { success: false, isAiGenerated: false, error: 'GEMINI_API_KEY_NOT_CONFIGURED' };
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      systemInstruction: {
        role: 'system',
        parts: [
          {
            text: `${systemInstruction}\nCRITICAL: Always respond with valid JSON only. Do not enclose in markdown code fences (\`\`\`json). Return clean, unadorned JSON matching the requested schema.`,
          },
        ],
      },
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    };

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[GeminiGateway] API returned status ${response.status}: ${errorText}`);
        return { success: false, isAiGenerated: false, error: `API_ERROR_${response.status}` };
      }

      const json = await response.json();
      const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      if (!rawText) {
        return { success: false, isAiGenerated: false, error: 'EMPTY_AI_RESPONSE' };
      }

      const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      const parsedData = JSON.parse(cleanJson) as T;

      return {
        success: true,
        data: parsedData,
        rawText,
        isAiGenerated: true,
      };
    } catch (err: any) {
      console.warn(`[GeminiGateway] Gemini request failed or timed out: ${err?.message}`);
      return { success: false, isAiGenerated: false, error: err?.message };
    }
  }

  /**
   * Multimodal Vision Analysis: sends image buffer + prompt to Gemini Vision
   */
  public static async analyzeMultimodalImage<T>(
    imageBuffer: Buffer,
    mimeType: string,
    systemInstruction: string,
    userPrompt: string,
    timeoutMs = 10000
  ): Promise<GeminiResponse<T>> {
    const apiKey = this.getApiKey();
    if (!apiKey || !this.isAvailable()) {
      return { success: false, isAiGenerated: false, error: 'GEMINI_API_KEY_NOT_CONFIGURED' };
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const base64Data = imageBuffer.toString('base64');

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: userPrompt },
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
      systemInstruction: {
        role: 'system',
        parts: [
          {
            text: `${systemInstruction}\nCRITICAL: Always respond with valid JSON only. Return clean JSON matching the requested schema.`,
          },
        ],
      },
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    };

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        return { success: false, isAiGenerated: false, error: `VISION_ERROR_${response.status}` };
      }

      const json = await response.json();
      const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      const parsedData = JSON.parse(cleanJson) as T;

      return {
        success: true,
        data: parsedData,
        rawText,
        isAiGenerated: true,
      };
    } catch (err: any) {
      console.warn(`[GeminiGateway] Multimodal vision request failed: ${err?.message}`);
      return { success: false, isAiGenerated: false, error: err?.message };
    }
  }
}
