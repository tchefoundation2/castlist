// Simple webhook endpoint for Farcaster MiniApp v2 compliance
export default function handler(req, res) {
  console.log('🔗 Webhook called:', req.method, req.url);
  console.log('📝 Headers:', req.headers);
  console.log('📦 Body:', req.body);
  
  // For now, just return success
  // In a real implementation, you would handle the webhook data
  res.status(200).json({ 
    success: true, 
    message: 'Webhook received',
    timestamp: new Date().toISOString()
  });
}
