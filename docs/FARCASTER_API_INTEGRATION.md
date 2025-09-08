# 🔑 Farcaster API Integration

## Overview
This document explains how to use the Farcaster API integration in the Castlist app.

## API Key
- **Key**: `wc_secret_a42c4d96bfd9e08dfdf803e8d9e0907073dd8e01390bf3f22ea8bb43_83f487fb`
- **Valid Until**: 2029
- **Access**: Full API access to Warpcast/Farcaster

## Features Implemented

### 1. User Management
- **Fetch User Data**: Get user info by FID
- **Search Users**: Search users by username
- **Profile Updates**: Sync with latest Farcaster data

### 2. Cast Operations
- **Create Casts**: Post new casts to Farcaster
- **Fetch User Casts**: Get user's recent casts
- **Trending Casts**: Get trending casts from the network
- **Share Guides**: Convert guides to Farcaster casts

### 3. Real-time Integration
- **Fresh Data**: Always fetch latest user data from Farcaster
- **Auto-sync**: Update profiles with current Farcaster info
- **Error Handling**: Graceful fallbacks when API is unavailable

## How to Use

### 1. Access the Test Page
1. Open the app
2. Go to **Profile** tab
3. Click **🔑 Test Farcaster API** button

### 2. Test User Fetch
- Enter a FID (e.g., `1` for dwr.eth)
- Click **Fetch User** to get user data
- View profile info, followers, following count

### 3. Test User Search
- Enter a username (e.g., `dwr`)
- Click **Search** to find users
- View search results with profile pictures

### 4. Test Trending Casts
- Click **Fetch Trending** to get popular casts
- View cast content, reactions, and engagement

### 5. Test Cast Creation
- Enter text in the textarea
- Click **Create Cast** to post to Farcaster
- Click **Share Test Guide** to share a sample guide

## API Endpoints Used

### User Endpoints
- `GET /v2/user?fid={fid}` - Get user by FID ✅
- `GET /v2/user-search?q={query}` - Search users ❌ (Not available)
- `GET /v2/casts?fid={fid}` - Get user's casts ✅

### Cast Endpoints
- `GET /v2/trending/casts` - Get trending casts ❌ (Not available)
- `POST /v2/casts` - Create new cast ✅
- `GET /v2/cast?hash={hash}` - Get cast by hash ✅

### Workarounds Implemented
- **User Search**: Searches through popular FIDs (1-20) and filters by username
- **Trending Casts**: Gets casts from popular users and sorts by reactions

## Integration Points

### 1. Authentication
- **File**: `src/services/supabaseService.ts`
- **Function**: `getOrCreateUserProfile()`
- **Behavior**: Fetches fresh Farcaster data on login

### 2. Social Features
- **File**: `src/services/farcasterService.ts`
- **Functions**: `shareGuideAsCast()`, `createCast()`
- **Behavior**: Convert guides to Farcaster casts

### 3. User Interface
- **File**: `src/components/FarcasterTest.tsx`
- **Page**: `src/pages/FarcasterTestPage.tsx`
- **Access**: Profile → Settings → Test Farcaster API

## Error Handling

### API Errors
- **Network Issues**: Graceful fallback to cached data
- **Rate Limits**: Automatic retry with exponential backoff
- **Invalid FID**: Clear error messages

### Fallback Behavior
- **No API Key**: Use mock data for development
- **API Unavailable**: Continue with existing data
- **User Not Found**: Show appropriate error message

## Development vs Production

### Development Mode
- **Mock Users**: Available when Farcaster SDK not detected
- **API Testing**: Full access to Farcaster API
- **Debug Info**: Console logs for API calls

### Production Mode
- **Real Users**: Authenticated via Farcaster SDK
- **API Integration**: Seamless user experience
- **Error Handling**: User-friendly error messages

## Security Considerations

### API Key Protection
- **Environment Variables**: Store in `.env` file
- **Client-side**: Key is visible in browser (expected for this use case)
- **Rate Limiting**: Implemented to prevent abuse

### Data Privacy
- **User Consent**: Users must authenticate via Farcaster
- **Data Usage**: Only public Farcaster data is accessed
- **No Storage**: Sensitive data not stored locally

## API Limitations

### Available Endpoints
- ✅ **User by FID**: `GET /v2/user?fid={fid}`
- ✅ **User Casts**: `GET /v2/casts?fid={fid}`
- ✅ **Create Cast**: `POST /v2/casts`
- ✅ **Get Cast**: `GET /v2/cast?hash={hash}`

### Unavailable Endpoints
- ❌ **User Search**: No search endpoint available
- ❌ **Trending Casts**: No trending endpoint available
- ❌ **Global Feed**: No global feed endpoint

### Workarounds
- **Search**: Uses popular FIDs (1-20) and filters by username
- **Trending**: Gets casts from popular users and sorts by engagement
- **Discovery**: Limited to known popular users

## Troubleshooting

### Common Issues

1. **"User not found"**
   - Check if FID is correct
   - Verify user exists on Farcaster
   - Check API key validity

2. **"Failed to create cast"**
   - Ensure user is authenticated
   - Check cast text length (max 320 characters)
   - Verify API permissions

3. **"Search returned no results"**
   - Try searching for "farcaster" or "dwr" (known users)
   - Check if username exists in popular FIDs (1-20)
   - Verify API connectivity

4. **"No trending casts"**
   - Check if popular users have recent casts
   - Verify API connectivity
   - Try refreshing the page

### Debug Steps

1. **Check Console**: Look for API error messages
2. **Test API Key**: Use the test page to verify connectivity
3. **Check Network**: Ensure internet connection is stable
4. **Verify FID**: Use known valid FIDs for testing

## Future Enhancements

### Planned Features
- **Real-time Notifications**: WebSocket integration
- **Cast Interactions**: Like, recast, reply functionality
- **Social Feed**: Display Farcaster feed in app
- **Advanced Search**: Filter by date, engagement, etc.

### API Limitations
- **Rate Limits**: 1000 requests per hour
- **Data Freshness**: Some data may be cached
- **User Privacy**: Only public data accessible

## Support

For issues with the Farcaster API integration:
1. Check this documentation
2. Test with the built-in test page
3. Verify API key validity
4. Check Farcaster API status

---

**Note**: This integration is for development and testing purposes. For production use, ensure proper error handling and user consent flows are implemented.
