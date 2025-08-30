# Print Service Setup Guide

This guide explains how to set up the poster printing functionality using Printful.

## Why Printful?

Printful is recommended because:
- **Excellent API**: Well-documented REST API with comprehensive features
- **High Quality**: Professional printing with multiple paper options
- **Global Shipping**: Ships worldwide with reasonable rates
- **Good Pricing**: Competitive poster prices starting at $15.95
- **Reliable**: Established print-on-demand service with good reputation

## Setup Steps

### 1. Create Printful Account

1. Go to [Printful.com](https://www.printful.com)
2. Sign up for a free account
3. Complete the store setup process

### 2. Get API Credentials

1. Go to your [Printful Dashboard](https://www.printful.com/dashboard)
2. Navigate to **Settings** → **API**
3. Generate a new API key

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Add your Printful credentials:

```env
REACT_APP_PRINTFUL_API_KEY=your_api_key_here
```

### 4. Test the Integration

1. Generate a collage with 2-5 images
2. Click "Order Print" in the preview dialog
3. Fill out the shipping information
4. Submit a test order

## Poster Options

The app supports three poster sizes:

- **Small**: 12" × 18" - $15.95
- **Medium**: 18" × 24" - $19.95  
- **Large**: 24" × 36" - $24.95

Paper types:
- **Matte**: Non-reflective, professional look
- **Glossy**: Vibrant colors, reflective finish

## Alternative Setup (Manual Orders)

If you prefer not to use the API integration, the app also supports manual order processing:

1. Users can click "Email Order" to generate a pre-filled email
2. The email includes order specifications and image attachment
3. You can process orders manually through your preferred print service

To configure manual orders:
```env
REACT_APP_PRINT_ORDER_EMAIL=orders@yourprintservice.com
```

## Other Print Service Options

If you prefer a different service, you can modify `src/utils/printService.ts`:

### Gooten
- API: https://www.gooten.com/api
- Good for custom products
- Simple REST API

### Printify
- API: https://developers.printify.com/
- Multiple print providers
- Good variety of products

### Custom Print Service
You can integrate any print service by:
1. Updating the API endpoints in `printService.ts`
2. Modifying the product IDs and pricing
3. Adjusting the order payload format

## Security Notes

- API keys are only used in the frontend for demo purposes
- For production, implement a backend proxy to secure API keys
- Validate all user inputs before sending to print service
- Implement rate limiting to prevent abuse

## Troubleshooting

### Common Issues

1. **API Key Invalid**: Double-check your Printful API key
2. **CORS Errors**: Printful API supports CORS for frontend requests
3. **Image Upload Fails**: Ensure images are under 10MB and valid formats
4. **Order Fails**: Check shipping address format and required fields

### Testing

Use Printful's sandbox mode for testing:
- Orders won't be actually printed or charged
- Perfect for development and testing

## Cost Structure

- **Setup**: Free Printful account
- **API Usage**: Free (no API call limits)
- **Orders**: Only pay when customers place orders
- **Profit**: Set your own markup on poster prices

## Support

- Printful API Documentation: https://developers.printful.com/
- Printful Support: https://help.printful.com/
- This app's print integration: Check `src/utils/printService.ts`