import { PrintOptions, PrintOrderResult } from '../types';

// Printful API configuration
const PRINTFUL_API_BASE = 'https://api.printful.com';

// Product IDs for different poster sizes (Printful Enhanced Matte Paper Poster)
const POSTER_PRODUCTS = {
  small: 1, // 12"×18" 
  medium: 2, // 18"×24"
  large: 3, // 24"×36"
};

class PrintService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.REACT_APP_PRINTFUL_API_KEY || '';
  }

  async createPrintOrder(
    imageBlob: Blob,
    options: PrintOptions,
    customerInfo: {
      name: string;
      email: string;
      address: {
        name: string;
        address1: string;
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
      
      // Step 2: Create order
      const orderData = {
        recipient: customerInfo.address,
        items: [
          {
            sync_variant_id: POSTER_PRODUCTS[options.size],
            quantity: options.quantity,
            files: [
              {
                type: 'default',
                url: imageUrl
              }
            ]
          }
        ]
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
        throw new Error(`Print order failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        orderId: result.result.id,
        orderUrl: `https://www.printful.com/dashboard/orders/${result.result.id}`,
        estimatedCost: result.result.costs.total
      };

    } catch (error) {
      console.error('Print order failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create print order'
      };
    }
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

  // Get estimated pricing for different poster sizes
  async getPricing(): Promise<{ [key: string]: number }> {
    try {
      const pricing = {
        small: 15.95,  // 12"×18"
        medium: 19.95, // 18"×24" 
        large: 24.95   // 24"×36"
      };

      return pricing;
    } catch (error) {
      console.error('Failed to get pricing:', error);
      return { small: 15.95, medium: 19.95, large: 24.95 };
    }
  }

  // Alternative: Create a simple order link for manual processing
  createOrderLink(imageBlob: Blob, options: PrintOptions): string {
    // For demo purposes, create a mailto link with order details
    const subject = encodeURIComponent('Custom Poster Print Order');
    const body = encodeURIComponent(`
Hi,

I would like to order a custom poster with the following specifications:

Size: ${options.size === 'small' ? '12"×18"' : options.size === 'medium' ? '18"×24"' : '24"×36"'}
Paper Type: ${options.paperType}
Quantity: ${options.quantity}

Please find the image attached or I will send it separately.

Thank you!
    `);

    return `mailto:orders@yourprintservice.com?subject=${subject}&body=${body}`;
  }
}

export const printService = new PrintService();