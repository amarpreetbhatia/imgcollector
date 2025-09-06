// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || process.env.NODE_ENV === 'production'
    ? ['https://collageforge.onrender.com', 'https://collageforge-frontend.onrender.com']
    : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

module.exports = corsOptions;