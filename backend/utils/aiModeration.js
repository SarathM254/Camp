// aiModeration.js - Utility to interact with Gemini and Groq via REST APIs

/**
 * Checks text content using Groq.
 * @param {string} text - The article text (HTML or plain text)
 * @returns {Promise<{isApproved: boolean, reason: string}>}
 */
export const moderateTextWithGroq = async (text) => {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || 'llama3-70b-8192';

  if (!apiKey || apiKey === 'your_groq_api_key') {
    return { isApproved: true, reason: 'Groq API Key not configured. Auto-approved by default fallback.' };
  }

  const prompt = `
You are an AI content moderator for a university campus news and social platform.
Analyze the following article text and determine if it is appropriate for publication.
Reject it if it contains explicit adult content, hate speech, severe harassment, or illegal activities.
Respond strictly in JSON format with exactly two keys: "isApproved" (boolean) and "reason" (string explaining why).

Article Text:
${text.substring(0, 5000)}
`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const resultContent = data.choices[0].message.content;
    const parsed = JSON.parse(resultContent);
    
    return {
      isApproved: parsed.isApproved === true,
      reason: parsed.reason || 'No reason provided.'
    };
  } catch (err) {
    console.error('Error during Groq moderation:', err);
    throw err;
  }
};

/**
 * Checks image content using Gemini.
 * @param {string} imageUrl - The URL of the image to check
 * @returns {Promise<{isApproved: boolean, reason: string}>}
 */
export const moderateImageWithGemini = async (imageUrl) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  if (!apiKey || apiKey === 'your_gemini_api_key') {
    return { isApproved: true, reason: 'Gemini API Key not configured. Auto-approved by default fallback.' };
  }

  try {
    // Fetch image and convert to base64
    let base64Image = '';
    let mimeType = 'image/jpeg';
    
    try {
      const imgRes = await fetch(imageUrl);
      const arrayBuffer = await imgRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      base64Image = buffer.toString('base64');
      mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
    } catch (fetchErr) {
      console.error('Failed to download image for Gemini check:', fetchErr);
      return { isApproved: false, reason: 'Could not access the uploaded image for analysis.' };
    }

    const prompt = `
You are an AI content moderator for a university campus news platform.
Analyze the provided image and determine if it is appropriate for publication.
Reject it if it contains explicit adult content, graphic violence, hate speech symbols, or illegal activities.
Respond strictly in JSON format with exactly two keys: "isApproved" (boolean) and "reason" (string explaining why).
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Image
              }
            }
          ]
        }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) {
      throw new Error('Unexpected response format from Gemini');
    }

    const parsed = JSON.parse(resultText);
    return {
      isApproved: parsed.isApproved === true,
      reason: parsed.reason || 'No reason provided.'
    };
  } catch (err) {
    console.error('Error during Gemini moderation:', err);
    throw err;
  }
};
