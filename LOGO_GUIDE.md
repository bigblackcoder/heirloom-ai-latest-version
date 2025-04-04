# AI Service Logo Guide

This document provides information about the available logo assets for various AI services that can be connected to the Heirloom Identity Platform.

## Available Logos

| Service | File Path | Format | Style |
|---------|-----------|--------|-------|
| Anthropic (Claude) | `/public/images/claude-color.png` | PNG | Color |
| Anthropic (Claude) | `/public/images/claude-logo.svg` | SVG | Monochrome |
| Google (Gemini) | `/public/images/gemini-color.png` | PNG | Color |
| OpenAI (ChatGPT) | `/public/images/openai-logo.svg` | SVG | Color |
| Perplexity | `/public/images/perplexity-logo.svg` | SVG | Color |
| Microsoft (Copilot) | `/public/images/copilot-logo.svg` | SVG | Color |

## Usage Guidelines

When implementing AI service connections in the application, use these logos with the following guidelines:

1. Use the color versions for the main connection cards and detailed views
2. Use SVG format when possible for better scaling and quality
3. Maintain proper attribution and trademark recognition in accordance with each company's brand guidelines
4. Keep logos at their original aspect ratio when resizing
5. Provide sufficient padding around logos (recommended: at least 8px on all sides)

## Implementation Example

```tsx
import { AiServiceCard } from '@/components/ai-service-card';

// Example component usage
<AiServiceCard 
  name="Claude"
  provider="Anthropic"
  logoSrc="/images/claude-color.png"
  description="Advanced reasoning and comprehension AI assistant"
  status="connected"
/>
```

This standardized approach ensures consistent representation of AI service brands throughout the application.

## Adding New Services

When adding support for new AI services:

1. Add the service logo to the `/public/images/` directory
2. Use a consistent naming convention: `[service-name]-[style].svg/png`
3. Update this guide to include the new logo information
4. Ensure proper attribution and usage rights
