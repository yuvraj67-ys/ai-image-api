import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const { prompt } = req.body; 

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt zaruri hai!' });
    }

    // AI ko FLUX.2 Pro model bhej rahe hain
    const input = { prompt: prompt };
    
    const output = await replicate.run(
      "black-forest-labs/flux-2-pro",
      { input }
    );

    // FLUX ka output URL nikalna
    let finalImageUrl = "";
    if (typeof output === 'string') {
        finalImageUrl = output;
    } else if (output && typeof output.url === 'function') {
        finalImageUrl = output.url();
    } else if (Array.isArray(output)) {
        finalImageUrl = output[0];
    }

    return res.status(200).json({ success: true, edited_image_url: finalImageUrl });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message || 'AI API error' });
  }
}
