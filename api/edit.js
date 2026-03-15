import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler(req, res) {
  // CORS taake aapki website se connect ho sake
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
    const { image, prompt } = req.body; // Image base64 format mein aayegi

    if (!image || !prompt) {
      return res.status(400).json({ error: 'Image aur prompt dono zaruri hain' });
    }

    // AI ko instruct-pix2pix model bhej rahe hain
    const input = { image: image, prompt: prompt };
    
    const output = await replicate.run(
      "timothybrooks/instruct-pix2pix:30c1d0b916a6f8efce20493f5d61ee27491ab2a60437c13c588468b9810ec23f",
      { input }
    );

    // Edited image ka URL nikalna
    let finalImageUrl = "";
    if (Array.isArray(output)) {
       finalImageUrl = typeof output[0] === 'string' ? output[0] : output[0].url();
    }

    return res.status(200).json({ success: true, edited_image_url: finalImageUrl });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message || 'AI API error' });
  }
}
