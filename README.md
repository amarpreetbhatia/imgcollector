# CollageForge 🎨

**Create stunning photo collages from any website and order custom prints**

*Discover • Create • Print*

CollageForge is an innovative web application that transforms website images into beautiful custom collages and enables professional poster printing - all in one seamless experience.

## ✨ Key Features

### 🔍 **Smart Image Discovery**
- Discovers images from any website (up to 50 images)
- Respects robots.txt and website policies
- Intelligent crawling with 3-minute time limits
- Two-level deep discovery (main page + internal links)

### 🎨 **Collage Creation**
- Select up to 5 images for your custom collage
- Smart auto-layouts (1-5 images supported)
- Real-time preview with professional designs
- High-quality PNG output (1200×800px)

### 🖨️ **Professional Printing**
- Three poster sizes: 12"×18", 18"×24", 24"×36"
- Matte and glossy paper options
- Integrated with Printful for global shipping
- Pricing from $15.95 with quantity discounts

### 💫 **Premium User Experience**
- Dual view modes (carousel and grid)
- Mobile-first responsive design
- Dark theme with Material-UI components
- Real-time progress indicators
- Comprehensive error handling

## Tech Stack

- **React 18** with TypeScript
- **Material-UI (MUI)** for components and dark theme
- **Joy UI** for enhanced progress indicators
- **React Multi Carousel** for responsive carousel functionality
- **Node.js/Express** backend for web crawling
- **Cheerio** for HTML parsing and crawling
- **Axios** for HTTP requests with timeout handling

## Getting Started

1. Install frontend dependencies:
```bash
npm install
```

2. Install backend dependencies:
```bash
npm run install:server
```

3. Start both frontend and backend servers:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:3001
- Frontend React app on http://localhost:3000

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Alternative: Start servers separately

Backend server:
```bash
npm run server:dev
```

Frontend (in another terminal):
```bash
npm start
```

## 🚀 How It Works

### Step 1: Discover 🔍
Enter any website URL and let CollageForge discover up to 50 high-quality images from the site and its internal pages.

### Step 2: Select 🎯
Browse discovered images in carousel or grid view. Select up to 5 images that inspire you for your collage.

### Step 3: Create 🎨
Generate your custom collage with smart auto-layouts. Preview your creation before proceeding.

### Step 4: Print 🖨️
Choose your poster size, paper type, and quantity. Order professional prints delivered to your door.

### Step 5: Enjoy 📦
Receive your custom photo collage poster and transform your space with personalized wall art!

## 🎯 Use Cases

- **Home Decor**: Create personalized wall art from travel websites, nature blogs, or design inspiration sites
- **Business Branding**: Generate collages from company websites, product catalogs, or brand galleries  
- **Event Memories**: Combine images from event websites, venue galleries, or celebration pages
- **Gift Creation**: Design custom posters from recipient's favorite websites or hobby-related content
- **Interior Design**: Source and combine images from architecture, furniture, or lifestyle websites

## 🏗️ Architecture

CollageForge uses a modern client-server architecture optimized for performance and user experience:

- **Frontend (React 18 + TypeScript)**: Responsive UI with Material-UI components
- **Backend (Node.js/Express)**: Handles image discovery and CORS bypass
- **Canvas API**: Client-side collage generation with high-quality output
- **Print Integration**: Seamless connection to professional printing services
- **Security First**: Multi-layer validation and resource limits

## Build for Production

```bash
npm run build
```

This creates an optimized build in the `build` folder ready for deployment.
## 🎯 Perfec
t For

- **Home Decorators**: Transform your space with personalized wall art
- **Gift Givers**: Create unique, meaningful presents for loved ones  
- **Creative Professionals**: Generate mood boards and visual inspiration
- **Small Businesses**: Design custom marketing materials and office decor
- **Event Planners**: Create themed decorations and memorable keepsakes

## 🌟 Why Choose CollageForge?

### **All-in-One Solution**
No need for multiple tools - discover, create, and print all in one platform.

### **Professional Quality**
High-resolution output (1200×800px) with smart layouts optimized for printing.

### **Global Shipping**
Powered by Printful's worldwide network for reliable delivery anywhere.

### **Ethical & Respectful**
Respects website policies and robots.txt while discovering images responsibly.

### **Mobile-First Design**
Fully responsive experience optimized for all devices and screen sizes.

## 📈 SEO Keywords

- Photo collage maker
- Custom poster printing
- Image collage creator
- Personalized wall art
- Photo collage online
- Custom print service
- Collage design tool
- Photo poster maker
- Website image extractor
- Print on demand posters

## 🔗 Related Searches

- "How to make a photo collage online"
- "Custom poster printing service"
- "Create collage from website images"
- "Personalized wall art maker"
- "Photo collage printing online"
- "Design custom posters online"

---

**Ready to create your first collage?** [Get Started →](http://localhost:3000)

*Transform any website into beautiful wall art in minutes.*