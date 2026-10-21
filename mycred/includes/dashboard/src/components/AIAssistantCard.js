import React from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const fontFamily = 'Figtree, Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const DEFAULT_PROMPTS = [
  'What is my total point circulation?',
  'Suggest hooks for my WooCommerce store',
  'How can I improve member retention?',
];

const getAiConfig = () => {
  if (typeof window === 'undefined') {
    return {};
  }
  return window.mycredDashboardData?.ai_assistant || {};
};

const buildAiUrl = (baseUrl, prompt) => {
  if (!baseUrl) return 'admin.php?page=mycred-ai-assistant';
  if (!prompt) return baseUrl;
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}prompt=${encodeURIComponent(prompt)}`;
};

const AIAssistantCard = ({ compact = false }) => {
  const aiConfig = getAiConfig();
  const available = Boolean(aiConfig.available);
  const aiUrl = aiConfig.url || 'admin.php?page=mycred-ai-assistant';
  const addonsUrl = aiConfig.addons_url || 'admin.php?page=mycred-addons';
  const prompts = Array.isArray(aiConfig.prompts) && aiConfig.prompts.length
    ? aiConfig.prompts
    : DEFAULT_PROMPTS;

  return (
    <Box
      sx={{
        backgroundColor: '#F8F6FF',
        border: '1px solid rgba(226, 221, 238, 0.85)',
        borderRadius: '14px',
        p: compact ? '12px' : '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            minWidth: 38,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6A38FF, #834BF6)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(94, 44, 237, 0.22)',
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 18 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ fontFamily, fontSize: '13.5px', fontWeight: 700, color: '#2D1572' }}>
              myCred AI Assistant
            </Typography>
            <Chip
              label="NEW"
              size="small"
              sx={{
                bgcolor: '#EDE9FE',
                color: '#5E2CED',
                fontFamily,
                fontWeight: 800,
                fontSize: '9.5px',
                height: 18,
                borderRadius: '4px',
              }}
            />
          </Box>
          <Typography sx={{ fontFamily, fontSize: '11.5px', color: '#6B57A1', lineHeight: 1.35, mt: 0.2 }}>
            Get loyalty ideas tailored to your site.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
        {prompts.slice(0, 3).map((prompt) => (
          <Button
            key={prompt}
            component="a"
            href={available ? buildAiUrl(aiUrl, prompt) : addonsUrl}
            sx={{
              justifyContent: 'flex-start',
              textAlign: 'left',
              backgroundColor: '#ffffff',
              border: '1px solid rgba(226, 221, 238, 0.9)',
              color: '#5E2CED',
              fontFamily,
              fontSize: '11px',
              fontWeight: 600,
              py: '7px',
              px: '10px',
              borderRadius: '8px',
              textTransform: 'none',
              lineHeight: 1.35,
              '&:hover': {
                backgroundColor: '#EDE9FE',
                borderColor: '#c7d2fe',
              },
            }}
          >
            {prompt}
          </Button>
        ))}
      </Box>

      <Button
        component="a"
        href={available ? aiUrl : addonsUrl}
        endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
        sx={{
          backgroundColor: '#ffffff',
          border: '1px solid rgba(226, 221, 238, 0.9)',
          color: '#5E2CED',
          fontFamily,
          fontSize: '11.5px',
          fontWeight: 700,
          py: '6px',
          borderRadius: '8px',
          textTransform: 'none',
          justifyContent: 'space-between',
          '&:hover': {
            backgroundColor: '#5E2CED',
            color: '#ffffff',
            borderColor: '#5E2CED',
          },
        }}
      >
        {available ? 'Launch AI Assistant' : 'Enable AI Assistant'}
      </Button>
    </Box>
  );
};

export default AIAssistantCard;
