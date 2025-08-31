import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Stack,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Star as StarIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';
import { merchandiseService } from '../utils/printService';

interface MerchandiseShowcaseProps {
  onExplore: () => void;
}

const MerchandiseShowcase: React.FC<MerchandiseShowcaseProps> = ({ onExplore }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const categories = merchandiseService.getProductCategories();
  const featuredProducts = categories.slice(0, 6); // Show first 6 categories

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: { xs: 2, md: 4 }, 
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
        border: '1px solid',
        borderColor: 'primary.light',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
          zIndex: 0
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant={isMobile ? "h4" : "h3"} 
            sx={{ 
              fontWeight: 'bold', 
              mb: 2,
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            🛍️ Turn Your Collage Into Amazing Products
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}
          >
            From posters to t-shirts, mugs to phone cases - bring your creativity to life with premium merchandise
          </Typography>

          {/* Feature highlights */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="center"
            sx={{ mb: 4 }}
          >
            <Chip 
              icon={<StarIcon />} 
              label="Premium Quality" 
              color="primary" 
              variant="filled"
              size="medium"
            />
            <Chip 
              icon={<ShippingIcon />} 
              label="Worldwide Shipping" 
              color="secondary" 
              variant="filled"
              size="medium"
            />
            <Chip 
              label="30-Day Guarantee" 
              color="success" 
              variant="filled"
              size="medium"
            />
          </Stack>
        </Box>

        {/* Product Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {featuredProducts.map((category) => (
            <Grid item xs={6} sm={4} md={2} key={category.id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                  },
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
                onClick={onExplore}
              >
                <Box
                  sx={{
                    height: 120,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.secondary.light}20)`,
                    fontSize: '3rem'
                  }}
                >
                  {category.icon}
                </Box>
                <CardContent sx={{ p: 2, textAlign: 'center' }}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ fontWeight: 'bold', mb: 0.5 }}
                  >
                    {category.name}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ fontSize: '0.75rem' }}
                  >
                    {category.description}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      label={`From $${category.variants[0]?.price || '9.95'}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Popular combinations */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
            💡 Popular Combinations
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Chip 
                label="🖼️ Poster + 📱 Phone Case" 
                variant="outlined" 
                sx={{ fontSize: '0.9rem', py: 2 }}
              />
            </Grid>
            <Grid item>
              <Chip 
                label="👕 T-Shirt + ☕ Mug" 
                variant="outlined" 
                sx={{ fontSize: '0.9rem', py: 2 }}
              />
            </Grid>
            <Grid item>
              <Chip 
                label="🎨 Canvas + 🛏️ Pillow" 
                variant="outlined" 
                sx={{ fontSize: '0.9rem', py: 2 }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Call to Action */}
        <Box sx={{ textAlign: 'center' }}>
          <Button
            onClick={onExplore}
            startIcon={<ShoppingCartIcon />}
            variant="contained"
            size="large"
            sx={{
              py: 2,
              px: 4,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              textTransform: 'none',
              borderRadius: 3,
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)'
              }
            }}
          >
            Explore All Products & Start Creating
          </Button>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mt: 2 }}
          >
            🚚 Free shipping on orders over $50 • 🔒 Secure checkout • ⭐ 4.9/5 customer rating
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default MerchandiseShowcase;