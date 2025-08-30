import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { PrintOptions, PrintOrderResult } from '../types';
import { printService } from '../utils/printService';
import { collageService } from '../utils/collageService';

interface CollagePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  imageBlob: Blob | null;
  imageUrl: string | null;
}

const CollagePreviewDialog: React.FC<CollagePreviewDialogProps> = ({
  open,
  onClose,
  imageBlob,
  imageUrl,
}) => {
  const [printOptions, setPrintOptions] = useState<PrintOptions>({
    size: 'medium',
    paperType: 'matte',
    quantity: 1,
  });
  const [pricing, setPricing] = useState<{ [key: string]: number }>({});
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderResult, setOrderResult] = useState<PrintOrderResult | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    address: {
      name: '',
      address1: '',
      city: '',
      state_code: '',
      country_code: 'US',
      zip: '',
    },
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (open) {
      loadPricing();
    }
  }, [open]);

  const loadPricing = async () => {
    try {
      const prices = await printService.getPricing();
      setPricing(prices);
    } catch (error) {
      console.error('Failed to load pricing:', error);
    }
  };

  const handleDownload = () => {
    if (imageBlob) {
      collageService.downloadCollage(imageBlob, 'collage-preview.png');
    }
  };

  const handlePrintOrder = () => {
    setShowOrderForm(true);
  };

  const handleSubmitOrder = async () => {
    if (!imageBlob) return;

    setIsOrdering(true);
    try {
      const result = await printService.createPrintOrder(
        imageBlob,
        printOptions,
        customerInfo
      );
      setOrderResult(result);
    } catch (error) {
      setOrderResult({
        success: false,
        error: error instanceof Error ? error.message : 'Order failed',
      });
    } finally {
      setIsOrdering(false);
    }
  };

  const handleCreateOrderLink = () => {
    if (imageBlob) {
      const orderLink = printService.createOrderLink(imageBlob, printOptions);
      window.open(orderLink, '_blank');
    }
  };

  const getSizeLabel = (size: string) => {
    switch (size) {
      case 'small': return '12" × 18"';
      case 'medium': return '18" × 24"';
      case 'large': return '24" × 36"';
      default: return size;
    }
  };

  const estimatedPrice = pricing[printOptions.size] * printOptions.quantity || 0;

  const handleClose = () => {
    setShowOrderForm(false);
    setOrderResult(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            🎨 Your Custom Collage
          </Typography>
          <Button
            onClick={handleClose}
            startIcon={<CloseIcon />}
            size="small"
          >
            Close
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* Image Preview */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  🖼️ Collage Preview
                </Typography>
                {imageUrl && (
                  <Box
                    component="img"
                    src={imageUrl}
                    alt="Collage preview"
                    sx={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '400px',
                      objectFit: 'contain',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Print Options */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  🖨️ Print Your Poster
                </Typography>

                <Box display="flex" flexDirection="column" gap={2}>
                  <FormControl fullWidth>
                    <InputLabel>Size</InputLabel>
                    <Select
                      value={printOptions.size}
                      label="Size"
                      onChange={(e) =>
                        setPrintOptions({
                          ...printOptions,
                          size: e.target.value as 'small' | 'medium' | 'large',
                        })
                      }
                    >
                      <MenuItem value="small">
                        Small - {getSizeLabel('small')} - ${pricing.small || 15.95}
                      </MenuItem>
                      <MenuItem value="medium">
                        Medium - {getSizeLabel('medium')} - ${pricing.medium || 19.95}
                      </MenuItem>
                      <MenuItem value="large">
                        Large - {getSizeLabel('large')} - ${pricing.large || 24.95}
                      </MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Paper Type</InputLabel>
                    <Select
                      value={printOptions.paperType}
                      label="Paper Type"
                      onChange={(e) =>
                        setPrintOptions({
                          ...printOptions,
                          paperType: e.target.value as 'matte' | 'glossy',
                        })
                      }
                    >
                      <MenuItem value="matte">Matte</MenuItem>
                      <MenuItem value="glossy">Glossy</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    label="Quantity"
                    type="number"
                    value={printOptions.quantity}
                    onChange={(e) =>
                      setPrintOptions({
                        ...printOptions,
                        quantity: Math.max(1, parseInt(e.target.value) || 1),
                      })
                    }
                    inputProps={{ min: 1, max: 10 }}
                    fullWidth
                  />

                  <Divider />

                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Estimated Total: ${estimatedPrice.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      * Shipping costs calculated at checkout
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Order Form */}
            {showOrderForm && !orderResult && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Shipping Information
                  </Typography>
                  
                  <Box display="flex" flexDirection="column" gap={2}>
                    <TextField
                      label="Full Name"
                      value={customerInfo.name}
                      onChange={(e) =>
                        setCustomerInfo({ ...customerInfo, name: e.target.value })
                      }
                      fullWidth
                      required
                    />
                    
                    <TextField
                      label="Email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) =>
                        setCustomerInfo({ ...customerInfo, email: e.target.value })
                      }
                      fullWidth
                      required
                    />
                    
                    <TextField
                      label="Address"
                      value={customerInfo.address.address1}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          address: { ...customerInfo.address, address1: e.target.value },
                        })
                      }
                      fullWidth
                      required
                    />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          label="City"
                          value={customerInfo.address.city}
                          onChange={(e) =>
                            setCustomerInfo({
                              ...customerInfo,
                              address: { ...customerInfo.address, city: e.target.value },
                            })
                          }
                          fullWidth
                          required
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <TextField
                          label="State"
                          value={customerInfo.address.state_code}
                          onChange={(e) =>
                            setCustomerInfo({
                              ...customerInfo,
                              address: { ...customerInfo.address, state_code: e.target.value },
                            })
                          }
                          fullWidth
                          required
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <TextField
                          label="ZIP"
                          value={customerInfo.address.zip}
                          onChange={(e) =>
                            setCustomerInfo({
                              ...customerInfo,
                              address: { ...customerInfo.address, zip: e.target.value },
                            })
                          }
                          fullWidth
                          required
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Order Result */}
            {orderResult && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  {orderResult.success ? (
                    <Alert severity="success">
                      <Typography variant="subtitle1" gutterBottom>
                        Order Created Successfully!
                      </Typography>
                      <Typography variant="body2">
                        Order ID: {orderResult.orderId}
                      </Typography>
                      {orderResult.orderUrl && (
                        <Button
                          href={orderResult.orderUrl}
                          target="_blank"
                          variant="outlined"
                          size="small"
                          sx={{ mt: 1 }}
                        >
                          View Order
                        </Button>
                      )}
                    </Alert>
                  ) : (
                    <Alert severity="error">
                      <Typography variant="subtitle1" gutterBottom>
                        Order Failed
                      </Typography>
                      <Typography variant="body2">
                        {orderResult.error}
                      </Typography>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleDownload}
          startIcon={<DownloadIcon />}
          variant="outlined"
        >
          Download Image
        </Button>

        {!showOrderForm && !orderResult && (
          <>
            <Button
              onClick={handleCreateOrderLink}
              startIcon={<PrintIcon />}
              variant="outlined"
            >
              📧 Email Order
            </Button>
            <Button
              onClick={handlePrintOrder}
              startIcon={<PrintIcon />}
              variant="contained"
              color="primary"
            >
              🛒 Order Custom Print
            </Button>
          </>
        )}

        {showOrderForm && !orderResult && (
          <Button
            onClick={handleSubmitOrder}
            disabled={isOrdering || !customerInfo.name || !customerInfo.email}
            startIcon={isOrdering ? <CircularProgress size={20} /> : <PrintIcon />}
            variant="contained"
            color="primary"
          >
            {isOrdering ? 'Processing...' : 'Submit Order'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CollagePreviewDialog;