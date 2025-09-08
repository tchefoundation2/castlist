export default async function handler(req, res) {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  console.log('🎯 Webhook called:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body
  });

  try {
    // Handle POST request (frame interactions)
    if (req.method === 'POST') {
      // Process the webhook data from Farcaster
      const webhookData = req.body;
      
      // Log the webhook for debugging
      console.log('📥 Farcaster webhook data:', webhookData);
      
      // Return a success response
      res.status(200).json({
        success: true,
        message: 'Webhook received successfully',
        timestamp: new Date().toISOString(),
        data: webhookData
      });
    } else {
      // Handle other methods
      res.status(200).json({
        success: true,
        message: 'Castlist webhook endpoint',
        timestamp: new Date().toISOString(),
        method: req.method
      });
    }
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
