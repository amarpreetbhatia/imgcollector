import { PrintOptions, PrintOrderResult, ProductCategory, ProductVariant } from '../types';

// Printful API configuration
const PRINTFUL_API_BASE = 'https://api.printful.com';

// Comprehensive Printful product catalog with real product IDs
const PRODUCT_CATALOG: { [key: string]: ProductCategory } = {
  poster: {
    id: 'poster',
    name: 'Posters',
    description: 'High-quality prints perfect for wall art',
    icon: '🖼️',
    variants: [
      { id: 1, name: 'Small Poster', size: '12"×18"', price: 15.95 },
      { id: 2, name: 'Medium Poster', size: '18"×24"', price: 19.95 },
      { id: 3, name: 'Large Poster', size: '24"×36"', price: 24.95 },
    ]
  },
  tshirt: {
    id: 'tshirt',
    name: 'T-Shirts',
    description: 'Comfortable cotton tees with your custom design',
    icon: '👕',
    placement: ['front', 'back', 'both'],
    sizeGuide: 'https://www.printful.com/size-guide/unisex-jersey-short-sleeve-tee',
    variants: [
      { id: 71, name: 'Unisex T-Shirt', size: 'S', color: 'White', price: 12.95 },
      { id: 71, name: 'Unisex T-Shirt', size: 'M', color: 'White', price: 12.95 },
      { id: 71, name: 'Unisex T-Shirt', size: 'L', color: 'White', price: 12.95 },
      { id: 71, name: 'Unisex T-Shirt', size: 'XL', color: 'White', price: 12.95 },
      { id: 71, name: 'Unisex T-Shirt', size: 'S', color: 'Black', price: 12.95 },
      { id: 71, name: 'Unisex T-Shirt', size: 'M', color: 'Black', price: 12.95 },
      { id: 71, name: 'Unisex T-Shirt', size: 'L', color: 'Black', price: 12.95 },
      { id: 71, name: 'Unisex T-Shirt', size: 'XL', color: 'Black', price: 12.95 },
    ]
  },
  hoodie: {
    id: 'hoodie',
    name: 'Hoodies',
    description: 'Cozy hoodies perfect for any season',
    icon: '🧥',
    placement: ['front', 'back', 'both'],
    sizeGuide: 'https://www.printful.com/size-guide/unisex-heavy-blend-hooded-sweatshirt',
    variants: [
      { id: 146, name: 'Unisex Hoodie', size: 'S', color: 'White', price: 32.95 },
      { id: 146, name: 'Unisex Hoodie', size: 'M', color: 'White', price: 32.95 },
      { id: 146, name: 'Unisex Hoodie', size: 'L', color: 'White', price: 32.95 },
      { id: 146, name: 'Unisex Hoodie', size: 'XL', color: 'White', price: 32.95 },
      { id: 146, name: 'Unisex Hoodie', size: 'S', color: 'Black', price: 32.95 },
      { id: 146, name: 'Unisex Hoodie', size: 'M', color: 'Black', price: 32.95 },
      { id: 146, name: 'Unisex Hoodie', size: 'L', color: 'Black', price: 32.95 },
      { id: 146, name: 'Unisex Hoodie', size: 'XL', color: 'Black', price: 32.95 },
    ]
  },
  mug: {
    id: 'mug',
    name: 'Mugs',
    description: 'Start your day with your favorite images',
    icon: '☕',
    variants: [
      { id: 19, name: 'White Ceramic Mug', size: '11oz', color: 'White', price: 11.95 },
      { id: 20, name: 'Black Ceramic Mug', size: '11oz', color: 'Black', price: 11.95 },
      { id: 21, name: 'Color Changing Mug', size: '11oz', color: 'Black', price: 15.95 },
    ]
  },
  canvas: {
    id: 'canvas',
    name: 'Canvas Prints',
    description: 'Gallery-quality canvas prints with wooden frames',
    icon: '🎨',
    variants: [
      { id: 29, name: 'Canvas Print', size: '12"×16"', price: 29.95 },
      { id: 30, name: 'Canvas Print', size: '16"×20"', price: 39.95 },
      { id: 31, name: 'Canvas Print', size: '20"×24"', price: 49.95 },
    ]
  },
  phonecase: {
    id: 'phonecase',
    name: 'Phone Cases',
    description: 'Protect your phone with style',
    icon: '📱',
    variants: [
      { id: 45, name: 'iPhone Case', size: 'iPhone 14', price: 19.95 },
      { id: 46, name: 'iPhone Case', size: 'iPhone 14 Pro', price: 19.95 },
      { id: 47, name: 'iPhone Case', size: 'iPhone 14 Pro Max', price: 19.95 },
      { id: 48, name: 'Samsung Case', size: 'Galaxy S23', price: 19.95 },
    ]
  },
  totebag: {
    id: 'totebag',
    name: 'Tote Bags',
    description: 'Eco-friendly bags for everyday use',
    icon: '👜',
    variants: [
      { id: 131, name: 'Cotton Tote Bag', size: '15"×16"', color: 'Natural', price: 14.95 },
      { id: 132, name: 'Cotton Tote Bag', size: '15"×16"', color: 'Black', price: 14.95 },
    ]
  },
  pillow: {
    id: 'pillow',
    name: 'Pillows',
    description: 'Comfortable throw pillows for home decor',
    icon: '🛏️',
    variants: [
      { id: 25, name: 'Throw Pillow', size: '18"×18"', price: 24.95 },
      { id: 26, name: 'Throw Pillow', size: '20"×12"', price: 22.95 },
    ]
  },
  sticker: {
    id: 'sticker',
    name: 'Stickers',
    description: 'Durable vinyl stickers for laptops and more',
    icon: '🏷️',
    variants: [
      { id: 224, name: 'Die Cut Sticker', size: '3"×3"', price: 3.95 },
      { id: 225, name: 'Die Cut Sticker', size: '4"×4"', price: 4.95 },
      { id: 226, name: 'Die Cut Sticker', size: '6"×6"', price: 6.95 },
    ]
  }
};

class MerchandiseService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.REACT_APP_PRINTFUL_API_KEY || '';
  }

  // Get all available product categories
  getProductCategories(): ProductCategory[] {
    return Object.values(PRODUCT_CATALOG);
  }

  // Get specific product category
  getProductCategory(categoryId: string): ProductCategory | null {
    return PRODUCT_CATALOG[categoryId] || null;
  }

  // Get variants for a specific product type
  getProductVariants(productType: string): ProductVariant[] {
    const category = PRODUCT_CATALOG[productType];
    return category ? category.variants : [];
  }

  // Find variant by ID
  findVariant(productType: string, variantId: number): ProductVariant | null {
    const variants = this.getProductVariants(productType);
    return variants.find(v => v.id === variantId) || null;
  }

  async createMerchandiseOrder(
    imageBlob: Blob,
    options: PrintOptions,
    customerInfo: {
      name: string;
      email: string;
      phone?: string;
      address: {
        name: string;
        address1: string;
        address2?: string;
        city: string;
        state_code: string;
        country_code: string;
        zip: string;
      };
    }
  ): Promise<PrintOrderResult> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          error: 'Print service not configured. Please contact support.'
        };
      }

      // Step 1: Upload image to Printful
      const imageUrl = await this.uploadImage(imageBlob);
      
      // Step 2: Find the selected variant
      const variant = this.findVariantByOptions(options);
      if (!variant) {
        return {
          success: false,
          error: 'Selected product variant not found'
        };
      }

      // Step 3: Prepare files based on product type
      const files = this.prepareProductFiles(imageUrl, options);

      // Step 4: Create order
      const orderData = {
        recipient: {
          ...customerInfo.address,
          email: customerInfo.email,
          phone: customerInfo.phone
        },
        items: [
          {
            variant_id: variant.id,
            quantity: options.quantity,
            files: files
          }
        ],
        retail_costs: {
          currency: 'USD',
          subtotal: (variant.price * options.quantity).toFixed(2),
          discount: '0.00',
          shipping: '0.00', // Will be calculated by Printful
          tax: '0.00'
        }
      };

      const response = await fetch(`${PRINTFUL_API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Order failed: ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        orderId: result.result.id,
        orderUrl: `https://www.printful.com/dashboard/orders/${result.result.id}`,
        estimatedCost: result.result.costs.total
      };

    } catch (error) {
      console.error('Merchandise order failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create merchandise order'
      };
    }
  }

  // Helper method to find variant based on options
  private findVariantByOptions(options: PrintOptions): ProductVariant | null {
    const variants = this.getProductVariants(options.productType);
    
    return variants.find(variant => {
      const sizeMatch = variant.size === options.size;
      const colorMatch = !options.color || variant.color === options.color;
      return sizeMatch && colorMatch;
    }) || variants[0]; // Fallback to first variant
  }

  // Prepare files based on product type and placement
  private prepareProductFiles(imageUrl: string, options: PrintOptions): any[] {
    const category = PRODUCT_CATALOG[options.productType];
    
    if (!category) {
      return [{ type: 'default', url: imageUrl }];
    }

    // For apparel with placement options
    if (category.placement && options.placement) {
      const files = [];
      
      if (options.placement === 'front' || options.placement === 'both') {
        files.push({
          type: 'front',
          url: imageUrl
        });
      }
      
      if (options.placement === 'back' || options.placement === 'both') {
        files.push({
          type: 'back',
          url: imageUrl
        });
      }
      
      return files;
    }

    // Default file configuration
    return [{ type: 'default', url: imageUrl }];
  }

  private async uploadImage(imageBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('file', imageBlob, 'collage.png');

    const response = await fetch(`${PRINTFUL_API_BASE}/files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload image for printing');
    }

    const result = await response.json();
    return result.result.url;
  }

  // Get estimated shipping cost
  async getShippingRates(
    recipient: {
      country_code: string;
      state_code?: string;
    },
    items: { variant_id: number; quantity: number }[]
  ): Promise<{ [key: string]: number }> {
    try {
      const response = await fetch(`${PRINTFUL_API_BASE}/shipping/rates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient,
          items
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get shipping rates');
      }

      const result = await response.json();
      const rates: { [key: string]: number } = {};
      
      result.result.forEach((rate: any) => {
        rates[rate.name] = parseFloat(rate.rate);
      });

      return rates;
    } catch (error) {
      console.error('Failed to get shipping rates:', error);
      return { 'Standard': 4.99, 'Express': 9.99 };
    }
  }

  // Get product mockup URL for preview
  async getProductMockup(
    variantId: number,
    imageUrl: string,
    placement?: string
  ): Promise<string | null> {
    try {
      const mockupData = {
        variant_id: variantId,
        files: [
          {
            placement: placement || 'default',
            image_url: imageUrl
          }
        ]
      };

      const response = await fetch(`${PRINTFUL_API_BASE}/mockup-generator/create-task`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockupData)
      });

      if (!response.ok) {
        return null;
      }

      const result = await response.json();
      return result.result.task_key;
    } catch (error) {
      console.error('Failed to generate mockup:', error);
      return null;
    }
  }

  // Calculate total cost including shipping
  calculateTotalCost(
    variant: ProductVariant,
    quantity: number,
    shippingCost: number = 0
  ): {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  } {
    const subtotal = variant.price * quantity;
    const tax = subtotal * 0.08; // Approximate tax rate
    const total = subtotal + shippingCost + tax;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      shipping: parseFloat(shippingCost.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    };
  }

  // Get product recommendations based on current selection
  getRecommendedProducts(currentProductType: string): ProductCategory[] {
    const recommendations: { [key: string]: string[] } = {
      poster: ['canvas', 'sticker', 'mug'],
      tshirt: ['hoodie', 'totebag', 'sticker'],
      hoodie: ['tshirt', 'mug', 'pillow'],
      mug: ['coaster', 'tshirt', 'sticker'],
      canvas: ['poster', 'pillow', 'totebag'],
      phonecase: ['sticker', 'totebag', 'mug'],
      totebag: ['tshirt', 'sticker', 'pillow'],
      pillow: ['canvas', 'mug', 'totebag'],
      sticker: ['phonecase', 'mug', 'tshirt']
    };

    const recommended = recommendations[currentProductType] || [];
    return recommended
      .map(type => PRODUCT_CATALOG[type])
      .filter(Boolean)
      .slice(0, 3);
  }

  // Create order summary for email
  createOrderSummary(
    options: PrintOptions,
    variant: ProductVariant,
    customerInfo: any,
    costs: any
  ): string {
    const category = PRODUCT_CATALOG[options.productType];
    
    return `
🛍️ CollageForge Order Summary

Product: ${category?.name} - ${variant.name}
Size: ${variant.size}
${variant.color ? `Color: ${variant.color}` : ''}
${options.placement ? `Placement: ${options.placement}` : ''}
Quantity: ${options.quantity}

💰 Pricing:
Subtotal: $${costs.subtotal}
Shipping: $${costs.shipping}
Tax: $${costs.tax}
Total: $${costs.total}

📦 Shipping Address:
${customerInfo.address.name}
${customerInfo.address.address1}
${customerInfo.address.address2 || ''}
${customerInfo.address.city}, ${customerInfo.address.state_code} ${customerInfo.address.zip}
${customerInfo.address.country_code}

Thank you for your order! 🎉
    `;
  }

  // Alternative: Create enhanced order link for manual processing
  createOrderLink(imageBlob: Blob, options: PrintOptions, variant: ProductVariant): string {
    const category = PRODUCT_CATALOG[options.productType];
    const subject = encodeURIComponent(`Custom ${category?.name} Order - CollageForge`);
    const body = encodeURIComponent(`
Hi CollageForge Team,

I would like to order a custom ${category?.name} with the following specifications:

Product: ${variant.name}
Size: ${variant.size}
${variant.color ? `Color: ${variant.color}` : ''}
${options.placement ? `Placement: ${options.placement}` : ''}
Quantity: ${options.quantity}
Estimated Price: $${variant.price * options.quantity}

I will attach the image file separately or provide a download link.

Please confirm availability and provide final pricing including shipping.

Thank you!
    `);

    return `mailto:orders@collageforge.com?subject=${subject}&body=${body}`;
  }
}

// Export both the new service and maintain backward compatibility
export const merchandiseService = new MerchandiseService();
export const printService = merchandiseService; // Backward compatibility