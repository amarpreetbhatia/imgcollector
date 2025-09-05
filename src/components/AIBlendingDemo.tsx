import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Grid,
  Chip,
  Stack,
  Alert,
  Paper
} from '@mui/material';
import {
  AutoFixHigh as MagicIcon,
  Image as ImageIcon,
  TextFields as TextIcon,
  Palette as StyleIcon
} from '@mui/icons-material';

interface AIBlendingDemoProps {
  onTryFeature?: () => void;
}

export const AIBlendingDemo: React.FC<AIBlendingDemoProps> = ({ onTryFeature }) => {
  const [selectedExample, setSelectedExample] = useState(0);

  const examples = [
    {
      title: "Nature + Portrait Blend",
      description: "Combine landscape photos with personal portraits",
      baseImage: "/demo-placeholder.svg",
      userImage: "/demo-placeholder.svg",
      text: "Adventure Awaits",
      style: "Artistic",
      result: "/demo-placeholder.svg"
    },
    {
      title: "Architecture + Text",
      description: "Add inspiring text to architectural images",
      baseImage: "/demo-placeholder.svg",
      text: "Dream Big",
      style: "Modern",
      result: "/demo-placeholder.svg"
    },
    {
      title: "Abstract Art Creation",
      description: "Transform photos into abstract masterpieces",
      baseImage: "/demo-placeholder.svg",
      userImage: "/demo-placeholder.svg",
      style: "Abstract",
      result: "/demo-placeholder.svg"
    }
  ];

  const features = [
    {
      icon: <ImageIcon color="primary" />,
      title: "Image Blending",
      description: "Combine scraped images with your personal photos"
    },
    {
      icon: <TextIcon color="secondary" />,
      title: "Text Integration",
      description: "Add custom text with AI-powered typography"
    },
    {
      icon: <StyleIcon color="success" />,
      title: "Style Options",
      description: "Choose from realistic, artistic, cartoon, or abstract styles"
    },
    {
      icon: <MagicIcon color="warning" />,
      title: "AI Enhancement",
      description: "Use natural language prompts to guide the AI"
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box textAlign="center" sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          ✨ AI Image Blending
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Create unique, personalized images with AI-powered blending
        </Typography>
        <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto' }}>
          This feature is currently in development and requires Google Imagen API access.
        </Alert>
      </Box>

      {/* Features Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Example Showcase */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom textAlign="center">
          How It Works
        </Typography>
        
        {/* Example Selector */}
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 3 }}>
          {examples.map((example, index) => (
            <Chip
              key={index}
              label={example.title}
              onClick={() => setSelectedExample(index)}
              variant={selectedExample === index ? "filled" : "outlined"}
              color="primary"
            />
          ))}
        </Stack>

        {/* Selected Example */}
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              {/* Base Image */}
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="subtitle2" gutterBottom>
                    Base Image
                  </Typography>
                  <Card>
                    <CardMedia
                      component="img"
                      height="120"
                      image={examples[selectedExample].baseImage}
                      alt="Base image"
                      sx={{ objectFit: 'cover' }}
                    />
                  </Card>
                </Box>
              </Grid>

              {/* User Image (if exists) */}
              {examples[selectedExample].userImage && (
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="subtitle2" gutterBottom>
                      Your Image
                    </Typography>
                    <Card>
                      <CardMedia
                        component="img"
                        height="120"
                        image={examples[selectedExample].userImage}
                        alt="User image"
                        sx={{ objectFit: 'cover' }}
                      />
                    </Card>
                  </Box>
                </Grid>
              )}

              {/* AI Magic */}
              <Grid item xs={12} sm={2}>
                <Box textAlign="center" sx={{ py: 2 }}>
                  <MagicIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  <Typography variant="body2" color="primary">
                    AI Blending
                  </Typography>
                </Box>
              </Grid>

              {/* Result */}
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <Typography variant="subtitle2" gutterBottom>
                    AI Result
                  </Typography>
                  <Card>
                    <CardMedia
                      component="img"
                      height="120"
                      image={examples[selectedExample].result}
                      alt="AI blended result"
                      sx={{ objectFit: 'cover' }}
                    />
                  </Card>
                </Box>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="h6" gutterBottom>
                {examples[selectedExample].title}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {examples[selectedExample].description}
              </Typography>
              
              <Stack spacing={1}>
                {examples[selectedExample].text && (
                  <Chip
                    icon={<TextIcon />}
                    label={`Text: "${examples[selectedExample].text}"`}
                    variant="outlined"
                    size="small"
                  />
                )}
                <Chip
                  icon={<StyleIcon />}
                  label={`Style: ${examples[selectedExample].style}`}
                  variant="outlined"
                  size="small"
                />
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Call to Action */}
      <Box textAlign="center">
        <Button
          variant="contained"
          size="large"
          startIcon={<MagicIcon />}
          onClick={onTryFeature}
          sx={{
            background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
            color: 'white',
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            '&:hover': {
              background: 'linear-gradient(45deg, #FF5252 30%, #26C6DA 90%)',
            }
          }}
        >
          Try AI Blending Now
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Start by crawling a website to find images to blend
        </Typography>
      </Box>
    </Box>
  );
};