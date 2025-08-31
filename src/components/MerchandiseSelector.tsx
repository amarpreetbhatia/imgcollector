import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Stack,
  Paper,
  IconButton,
  Alert,

} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ShoppingCart as CartIcon,
  Info as InfoIcon,
  LocalShipping as ShippingIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { ProductVariant, PrintOptions } from '../types';
import { merchandiseService } from '../utils/printService';

interface MerchandiseSelectorProps {
  imageBlob: Blob | null;
  imageUrl: string | null;
  onOrderCreate: (options: PrintOptions, variant: ProductVariant) => void;
  onClose: () => void;
}

const MerchandiseSelector: React.FC<MerchandiseSelectorProps> = ({
  imageBlob,
  imageUrl,
  onOrderCreate,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('poster');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [placement, setPlacement] = useState<string>('front');
  const [mockupUrl, setMockupUrl] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  const categories = merchandiseService.getProductCategories();
  const currentCategory = merchandiseService.getProductCategory(selectedCategory);
  const recommendedProducts = merchandiseService.getRecommendedProducts(selectedCategory);

  useEffect(() => {
    if (currentCategory && currentCategory.variants.length > 0) {
      setSelectedVariant(currentCategory.variants[0]);
    }
  }, [selectedCategory, currentCategory]);

  useEffect(() => {
    const generateMockup = async () => {
      if (!selectedVariant || !imageUrl) return;
      
      try {
        const mockupKey = await merchandiseService.getProductMockup(
          selectedVariant.id,
          imageUrl,
          placement
        );
        if (mockupKey) {
          setMockupUrl(`https://api.printful.com/mockup-generator/task?task_key=${mockupKey}`);
        }
      } catch (error) {
        console.error('Failed to generate mockup:', error);
      }
    };

    if (selectedVariant && imageUrl) {
      generateMockup();
    }
  }, [selectedVariant, imageUrl, placement]);



  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPlacement('front'); // Reset placement
  };

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
  };

  const handleAddToFavorites = (productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const calculateCosts = () => {
    if (!selectedVariant) return null;
    
    const shippingCost = 4.99; // Default shipping cost
    return merchandiseService.calculateTotalCost(selectedVariant, quantity, shippingCost);
  };

  const handleCreateOrder = () => {
    if (!selectedVariant || !currentCategory) return;

    const options: PrintOptions = {
      productType: currentCategory.id as any,
      size: selectedVariant.size,
      color: selectedVariant.color,
      quantity,
      placement: currentCategory.placement ? placement as any : undefined
    };

    onOrderCreate(options, selectedVariant);
  };

  const costs = calculateCosts();

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              🛍️ Choose Your Merchandise
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Transform your collage into amazing products
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ textTransform: 'none' }}
          >
            Back to Collage
          </Button>
        </Box>

        {/* Quick Stats */}
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <Chip 
            icon={<StarIcon />} 
            label={`${categories.length} Product Types`} 
            color="primary" 
            variant="filled" 
          />
          <Chip 
            icon={<ShippingIcon />} 
            label="Worldwide Shipping" 
            color="secondary" 
            variant="filled" 
          />
          <Chip 
            label="Premium Quality" 
            color="success" 
            variant="filled" 
          />
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        {/* Product Categories */}
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 2, borderRadius: 2, height: 'fit-content' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Product Categories
            </Typography>
            
            <Stack spacing={1}>
              {categories.map((category) => (
                <Card
                  key={category.id}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: selectedCategory === category.id ? 2 : 1,
                    borderColor: selectedCategory === category.id ? 'primary.main' : 'divider',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 2,
                    },
                  }}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h4">{category.icon}</Typography>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {category.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {category.description}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToFavorites(category.id);
                        }}
                        color={favorites.has(category.id) ? 'error' : 'default'}
                      >
                        <FavoriteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>

            {/* Recommended Products */}
            {recommendedProducts.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  💡 You Might Also Like
                </Typography>
                <Stack spacing={1}>
                  {recommendedProducts.map((product) => (
                    <Button
                      key={product.id}
                      variant="outlined"
                      size="small"
                      startIcon={<span>{product.icon}</span>}
                      onClick={() => handleCategorySelect(product.id)}
                      sx={{ 
                        justifyContent: 'flex-start',
                        textTransform: 'none'
                      }}
                    >
                      {product.name}
                    </Button>
                  ))}
                </Stack>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Product Configuration */}
        <Grid item xs={12} md={8}>
          {currentCategory && (
            <Stack spacing={3}>
              {/* Product Preview */}
              <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  {currentCategory.icon} {currentCategory.name}
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    {/* Product Image/Mockup */}
                    <Box
                      sx={{
                        width: '100%',
                        height: 300,
                        borderRadius: 2,
                        overflow: 'hidden',
                        position: 'relative',
                        backgroundColor: 'grey.100',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {mockupUrl ? (
                        <img
                          src={mockupUrl}
                          alt="Product mockup"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                          }}
                        />
                      ) : imageUrl ? (
                        <img
                          src={imageUrl}
                          alt="Your design"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                          }}
                        />
                      ) : (
                        <Typography color="text.secondary">
                          Product Preview
                        </Typography>
                      )}
                      
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: 'rgba(255,255,255,0.9)',
                        }}
                      >
                        <ShareIcon />
                      </IconButton>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Stack spacing={2}>
                      {/* Variant Selection */}
                      <FormControl fullWidth>
                        <InputLabel>Size & Color</InputLabel>
                        <Select
                          value={selectedVariant?.id || ''}
                          onChange={(e) => {
                            const variant = currentCategory.variants.find(v => v.id === e.target.value);
                            if (variant) handleVariantSelect(variant);
                          }}
                        >
                          {currentCategory.variants.map((variant) => (
                            <MenuItem key={`${variant.id}-${variant.size}-${variant.color}`} value={variant.id}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                <span>
                                  {variant.size} {variant.color && `- ${variant.color}`}
                                </span>
                                <span>${variant.price}</span>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {/* Placement Selection for Apparel */}
                      {currentCategory.placement && (
                        <FormControl fullWidth>
                          <InputLabel>Design Placement</InputLabel>
                          <Select
                            value={placement}
                            onChange={(e) => setPlacement(e.target.value)}
                          >
                            {currentCategory.placement.map((option) => (
                              <MenuItem key={option} value={option}>
                                {option.charAt(0).toUpperCase() + option.slice(1)}
                                {option === 'both' && ' (+$2.00)'}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}

                      {/* Quantity */}
                      <TextField
                        label="Quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        inputProps={{ min: 1, max: 100 }}
                        fullWidth
                      />

                      {/* Size Guide Link */}
                      {currentCategory.sizeGuide && (
                        <Button
                          variant="text"
                          size="small"
                          startIcon={<InfoIcon />}
                          href={currentCategory.sizeGuide}
                          target="_blank"
                          sx={{ textTransform: 'none' }}
                        >
                          View Size Guide
                        </Button>
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>

              {/* Pricing & Order */}
              <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  💰 Order Summary
                </Typography>

                {costs && selectedVariant && (
                  <Box>
                    <Stack spacing={1} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography>
                          {selectedVariant.name} × {quantity}
                        </Typography>
                        <Typography>${costs.subtotal}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="text.secondary">Shipping</Typography>
                        <Typography color="text.secondary">${costs.shipping}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="text.secondary">Tax (est.)</Typography>
                        <Typography color="text.secondary">${costs.tax}</Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          Total
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          ${costs.total}
                        </Typography>
                      </Box>
                    </Stack>

                    <Alert severity="info" sx={{ mb: 2 }}>
                      🚚 Free shipping on orders over $50! Add more items to qualify.
                    </Alert>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<CartIcon />}
                        onClick={handleCreateOrder}
                        disabled={!selectedVariant}
                        sx={{
                          flex: 1,
                          py: 1.5,
                          textTransform: 'none',
                          fontWeight: 'bold',
                        }}
                      >
                        Order Now - ${costs.total}
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={() => {/* Add to cart functionality */}}
                        sx={{
                          textTransform: 'none',
                          minWidth: 120,
                        }}
                      >
                        Add to Cart
                      </Button>
                    </Stack>
                  </Box>
                )}
              </Paper>

              {/* Product Details */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">📋 Product Details & Specifications</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Materials & Quality
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {getProductDetails(currentCategory.id).materials}
                      </Typography>
                      
                      <Typography variant="subtitle2" gutterBottom>
                        Care Instructions
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {getProductDetails(currentCategory.id).care}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Shipping & Production
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        • Production time: 2-5 business days
                        <br />
                        • Shipping: 3-7 business days
                        <br />
                        • Worldwide delivery available
                      </Typography>
                      
                      <Typography variant="subtitle2" gutterBottom>
                        Quality Guarantee
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        30-day satisfaction guarantee. Free replacement for defects.
                      </Typography>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Stack>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

// Helper function for product details
const getProductDetails = (productType: string) => {
  const details: { [key: string]: { materials: string; care: string } } = {
    poster: {
      materials: 'Premium 200gsm matte or glossy paper with vibrant, fade-resistant inks.',
      care: 'Frame behind glass to protect from moisture and UV light.'
    },
    tshirt: {
      materials: '100% combed and ring-spun cotton (Heather colors contain polyester).',
      care: 'Machine wash cold, tumble dry low, do not iron directly on design.'
    },
    hoodie: {
      materials: '50% cotton, 50% polyester blend for comfort and durability.',
      care: 'Machine wash cold, tumble dry low, do not bleach.'
    },
    mug: {
      materials: 'High-quality ceramic with dishwasher and microwave safe coating.',
      care: 'Dishwasher safe, avoid abrasive cleaners to preserve design.'
    },
    canvas: {
      materials: 'Premium canvas with wooden frame, gallery-wrapped edges.',
      care: 'Dust gently with soft cloth, avoid direct sunlight for longevity.'
    },
    phonecase: {
      materials: 'Durable polycarbonate with precise cutouts for all ports.',
      care: 'Clean with damp cloth, avoid harsh chemicals.'
    },
    totebag: {
      materials: '100% cotton canvas, reinforced handles for heavy loads.',
      care: 'Machine wash cold, air dry, iron on reverse side if needed.'
    },
    pillow: {
      materials: 'Soft polyester cover with hypoallergenic filling.',
      care: 'Remove cover and machine wash cold, tumble dry low.'
    },
    sticker: {
      materials: 'Waterproof vinyl with strong adhesive, UV resistant.',
      care: 'Apply to clean, dry surfaces. Remove carefully to avoid residue.'
    }
  };

  return details[productType] || { materials: 'High-quality materials', care: 'Follow care instructions' };
};

export default MerchandiseSelector;