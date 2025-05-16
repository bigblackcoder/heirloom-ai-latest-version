# Secure SVG Creation Guide

This guide provides best practices for working with SVG files in a secure manner, particularly to avoid accidentally embedding sensitive information like AWS credentials.

## Potential Security Risks with SVG Files

SVG files can pose security risks for several reasons:

1. **Embedded Credentials**: Base64-encoded images within SVGs may contain screenshots or images with API keys or credentials
2. **Metadata Leakage**: SVGs can contain metadata that might include sensitive information
3. **Script Execution**: SVGs can include executable JavaScript, which presents security risks

## Best Practices for Secure SVG Usage

### 1. Avoid Embedding Base64 Images in SVGs

```xml
<!-- DON'T DO THIS -->
<image id="some-id" width="100" height="100" 
  xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA...">
</image>
```

Instead, reference external image files:

```xml
<!-- PREFERRED APPROACH -->
<image id="some-id" width="100" height="100" xlink:href="/images/my-image.png"></image>
```

### 2. Create Pure Vector Graphics

Whenever possible, use SVG's native vector capabilities instead of embedded raster images:

```xml
<!-- GOOD EXAMPLE: Pure vector graphics -->
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="180" height="180" fill="#f0f4f8" stroke="#2e5aac" stroke-width="2"/>
  <circle cx="100" cy="100" r="50" fill="#4a90e2"/>
  <text x="100" y="170" text-anchor="middle" font-family="sans-serif">Secure SVG</text>
</svg>
```

### 3. Remove Unnecessary Metadata

Strip metadata that might contain sensitive information before committing to the repository:

```bash
# Example using svgo tool
svgo --disable=removeViewBox --enable=removeMetadata,removeComments input.svg -o output.svg
```

### 4. Validate SVGs Before Committing

Use the provided credential scanning script to check for credential patterns:

```bash
./scripts/scan-credentials.sh
```

### 5. SVG Creation Tools Recommendations

- **Inkscape**: Free and open-source vector graphics editor
- **Figma**: Design tool with SVG export capability that creates clean SVGs
- **SVGOMG**: Online SVG optimizer (https://jakearchibald.github.io/svgomg/)

### Example: Converting Base64 Embedded Images to External References

If you have an SVG with embedded base64 data, follow these steps to convert it to a more secure format:

1. Extract the base64 data (everything after `data:image/png;base64,`)
2. Decode and save it as a separate file:
   ```bash
   echo "BASE64_STRING_HERE" | base64 -d > image.png
   ```
3. Update the SVG to reference the external file instead of embedding it

## Remember

- Never take screenshots of applications where credentials, tokens, or API keys are visible
- Always inspect SVGs (especially those from third parties) for embedded data before including them in your project
- Run the credential scanning script before committing changes