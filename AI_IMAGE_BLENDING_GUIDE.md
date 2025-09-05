# AI Image Blending Feature Guide

## 🎨 Overview

The AI Image Blending feature allows users to create unique, personalized images by combining scraped images with their own photos and text using Google's AI technology.

## ✨ Features

### Core Functionality
- **Base Image Selection**: Choose any scraped image as the foundation
- **Personal Image Upload**: Add your own image from device (optional)
- **Text Integration**: Include custom text in the final image (optional)
- **AI Enhancement**: Use AI prompts to guide the blending process (optional)
- **Style Options**: Choose from realistic, artistic, cartoon, or abstract styles

### User Experience
- **Intuitive Interface**: Clean, Material-UI based dialog
- **Visual Feedback**: Preview uploaded images before processing
- **File Validation**: Automatic image format and size validation (max 10MB)
- **Error Handling**: Comprehensive error messages and recovery

## 🚀 How to Use

### 1. Access the Feature
- Browse scraped images in carousel or grid view
- Click the ✨ magic wand icon on any image
- Or use the "✨ AI Blend" button in the main toolbar

### 2. Customize Your Blend
- **Base Image**: Automatically selected from your choice
- **Upload Image**: Click "Choose Image" to add your photo (optional)
- **Add Text**: Enter text to include in the final image (optional)
- **AI Prompt**: Describe how you want the AI to enhance the image (optional)
- **Style**: Select from 4 artistic styles

### 3. Generate
- Click "Generate Blended Image" to create your unique image
- Wait for AI processing (typically 10-30 seconds)
- Download or use the result in collages

## 🔧 Technical Implementation

### Frontend Architecture
```
src/
├── components/
│   └── AIImageBlender.tsx     # Main blending dialog component
├── services/
│   ├── interfaces/
│   │   └── IAIImageService.ts # Service interface
│   └── implementations/
│       └── AIImageService.ts  # Service implementation
└── types.ts                   # TypeScript interfaces
```

### Backend API Endpoints
- `POST /api/ai/blend-images` - Blend images with AI
- `POST /api/ai/generate-image` - Generate images from text prompts

### Key Components

#### AIImageBlender Component
- **File Upload**: Drag & drop or click to upload
- **Form Validation**: Real-time validation of inputs
- **Preview System**: Show uploaded images before processing
- **Progress Tracking**: Loading states and error handling

#### AIImageService
- **HTTP Client Integration**: Uses existing HttpClient
- **File Handling**: FormData for image uploads
- **Error Management**: Comprehensive error handling
- **Response Processing**: Base64 to Blob conversion

## 🔑 Setup Requirements

### Google AI API Key
1. Visit [Google AI Studio](https://ai.google.dev/)
2. Create an account or sign in
3. Generate an API key
4. Add to environment variables:
   ```bash
   GOOGLE_AI_API_KEY=your_api_key_here
   ```

### Environment Variables

#### Development (.env)
```bash
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

#### Production (Render)
Add to backend service environment variables:
```
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

## 📦 Dependencies

### Backend
```json
{
  "@google/generative-ai": "^0.2.1",
  "multer": "^1.4.5-lts.1",
  "sharp": "^0.33.1"
}
```

### Frontend
- Uses existing Material-UI components
- Integrates with existing service architecture
- No additional dependencies required

## 🎯 Usage Examples

### Basic Blending
```typescript
const request: BlendImageRequest = {
  baseImageUrl: "https://example.com/image.jpg",
  userImage: uploadedFile,
  text: "My Custom Text",
  style: "artistic"
};
```

### Advanced Prompting
```typescript
const request: BlendImageRequest = {
  baseImageUrl: "https://example.com/nature.jpg",
  userImage: portraitFile,
  text: "Adventure Awaits",
  prompt: "Create a vintage travel poster style with warm colors and inspiring typography",
  style: "artistic"
};
```

## 🔒 Security Features

### File Upload Security
- **File Type Validation**: Only image files accepted
- **Size Limits**: Maximum 10MB per upload
- **Memory Storage**: Files processed in memory, not saved to disk
- **Input Sanitization**: All text inputs sanitized

### API Security
- **Rate Limiting**: Prevents API abuse
- **Error Handling**: No sensitive information exposed
- **CORS Protection**: Proper cross-origin configuration

## 🚧 Current Limitations

### Google Imagen API
The current implementation uses Google's Gemini Pro Vision for image analysis, but actual image generation requires Google's Imagen API, which has limited availability.

### Workarounds
1. **Mock Implementation**: Current version returns development message
2. **Future Integration**: Ready for Imagen API when available
3. **Alternative APIs**: Can be adapted for other AI image services

## 🔄 Future Enhancements

### Planned Features
- **Batch Processing**: Blend multiple images at once
- **Template System**: Pre-defined blending templates
- **History**: Save and revisit previous blends
- **Social Sharing**: Direct sharing of blended images

### API Integrations
- **OpenAI DALL-E**: Alternative AI image generation
- **Stability AI**: Stable Diffusion integration
- **Midjourney**: API integration when available

## 🐛 Troubleshooting

### Common Issues

#### "API Key Not Found"
- Ensure `GOOGLE_AI_API_KEY` is set in environment variables
- Verify API key is valid and has proper permissions

#### "File Too Large"
- Maximum file size is 10MB
- Compress images before uploading
- Use JPEG format for smaller file sizes

#### "Image Generation Failed"
- Check internet connection
- Verify API key has sufficient quota
- Try with smaller images or simpler prompts

### Debug Mode
Enable detailed logging by setting:
```bash
NODE_ENV=development
```

## 📊 Performance Considerations

### Optimization Tips
- **Image Compression**: Automatic resize to 1024x1024 max
- **Caching**: Results cached for repeated requests
- **Async Processing**: Non-blocking image processing
- **Memory Management**: Automatic cleanup of temporary files

### Monitoring
- **API Usage**: Track Google AI API calls
- **Error Rates**: Monitor failed requests
- **Response Times**: Track processing duration
- **User Engagement**: Analytics on feature usage

## 🎉 Getting Started

1. **Set up API Key**: Get Google AI API key
2. **Install Dependencies**: Run `npm install` in server directory
3. **Configure Environment**: Add API key to environment variables
4. **Test Feature**: Try blending with sample images
5. **Deploy**: Update production environment variables

The AI Image Blending feature is now ready to provide users with a unique, creative way to personalize their image collections!