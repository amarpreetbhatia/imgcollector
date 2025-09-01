import { PrintOrderRequest, PrintOrderResponse, ProductVariant, ApiResponse } from '../../contracts/api';

/**
 * Interface for print service operations
 * Open/Closed Principle: Extensible for different print providers
 */
export interface IPrintService {
  /**
   * Create a print order
   * @param request - Print order details
   * @returns Promise with order confirmation
   */
  createOrder(request: PrintOrderRequest): Promise<ApiResponse<PrintOrderResponse>>;

  /**
   * Get available products and variants
   * @returns Promise with product catalog
   */
  getProductCatalog(): Promise<ApiResponse<ProductCatalog>>;

  /**
   * Calculate shipping cost
   * @param request - Shipping calculation request
   * @returns Promise with shipping cost
   */
  calculateShipping(request: ShippingCalculationRequest): Promise<ApiResponse<ShippingCost>>;

  /**
   * Track an existing order
   * @param orderId - Order ID to track
   * @returns Promise with tracking information
   */
  trackOrder(orderId: string): Promise<ApiResponse<OrderStatus>>;
}

/**
 * Product catalog structure
 */
export interface ProductCatalog {
  categories: ProductCategory[];
  lastUpdated: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  variants: ProductVariant[];
  sizeGuide?: string;
  mockupTemplates?: MockupTemplate[];
}

export interface MockupTemplate {
  id: string;
  name: string;
  imageUrl: string;
  placeholderBounds: BoundingBox;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ShippingCalculationRequest {
  productType: string;
  quantity: number;
  destination: {
    country: string;
    state?: string;
    zip?: string;
  };
}

export interface ShippingCost {
  cost: number;
  currency: string;
  estimatedDays: number;
  carrier: string;
}

export interface OrderStatus {
  orderId: string;
  status: OrderStatusType;
  trackingNumber?: string;
  estimatedDelivery?: string;
  updates: StatusUpdate[];
}

export type OrderStatusType = 'pending' | 'processing' | 'printed' | 'shipped' | 'delivered' | 'cancelled';

export interface StatusUpdate {
  timestamp: string;
  status: OrderStatusType;
  message: string;
  location?: string;
}