exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse the webhook payload
    const payload = JSON.parse(event.body);
    
    console.log('🔔 Farcaster webhook received:', {
      type: payload.type,
      timestamp: new Date().toISOString(),
      data: payload.data
    });

    // Handle different webhook types
    switch (payload.type) {
      case 'user.authenticated':
        console.log('✅ User authenticated:', payload.data);
        break;
      case 'user.deauthenticated':
        console.log('❌ User deauthenticated:', payload.data);
        break;
      case 'cast.created':
        console.log('📝 Cast created:', payload.data);
        break;
      case 'cast.deleted':
        console.log('🗑️ Cast deleted:', payload.data);
        break;
      default:
        console.log('ℹ️ Unknown webhook type:', payload.type);
    }

    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Webhook received successfully',
        timestamp: new Date().toISOString()
      }),
    };

  } catch (error) {
    console.error('❌ Webhook error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
    };
  }
};
