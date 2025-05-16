#!/bin/bash

# Script to safely extract and inspect base64 encoded data from SVG files
# Usage: ./scripts/svg-base64-extractor.sh <svg_file> [output_directory]

set -e

# Set colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Check if filename was provided
if [ $# -lt 1 ]; then
    echo -e "${RED}Error: SVG file path is required${NC}"
    echo "Usage: $0 <svg_file> [output_directory]"
    exit 1
fi

SVG_FILE="$1"
OUTPUT_DIR="${2:-./extracted_svg_data}"

# Check if the file exists
if [ ! -f "$SVG_FILE" ]; then
    echo -e "${RED}Error: File '$SVG_FILE' not found${NC}"
    exit 1
fi

# Check if the file is an SVG
if [[ ! "$SVG_FILE" =~ \.svg$ ]] && [ "$(file -b --mime-type "$SVG_FILE")" != "image/svg+xml" ]; then
    echo -e "${YELLOW}Warning: File doesn't appear to be an SVG. Continuing anyway.${NC}"
fi

echo -e "${BLUE}${BOLD}SVG Base64 Data Extractor${NC}"
echo -e "Inspecting file: ${BOLD}$SVG_FILE${NC}"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"
echo -e "Extraction directory: ${BOLD}$OUTPUT_DIR${NC}"

# Find all base64 encoded data in the SVG
BASE64_PATTERNS=$(grep -o 'xlink:href="data:[^"]*' "$SVG_FILE" | cut -d'"' -f2 || echo "")

if [ -z "$BASE64_PATTERNS" ]; then
    echo -e "${GREEN}No base64 encoded data found in the SVG.${NC}"
    exit 0
fi

echo -e "${YELLOW}Found $(echo "$BASE64_PATTERNS" | wc -l) base64 encoded data segments.${NC}"

# Process each base64 data segment
COUNTER=1
echo "$BASE64_PATTERNS" | while read -r DATA_URI; do
    echo -e "\n${BLUE}${BOLD}Processing data segment #$COUNTER${NC}"
    
    # Get MIME type
    MIME_TYPE=$(echo "$DATA_URI" | sed -n 's/^data:\([^;]*\);base64,.*/\1/p')
    echo -e "MIME type: ${BOLD}$MIME_TYPE${NC}"
    
    # Extract the base64 data
    BASE64_DATA=$(echo "$DATA_URI" | sed 's/^data:[^,]*,//')
    
    # Determine the appropriate file extension
    case "$MIME_TYPE" in
        "image/png") EXT="png" ;;
        "image/jpeg") EXT="jpg" ;;
        "image/gif") EXT="gif" ;;
        "image/svg+xml") EXT="svg" ;;
        *) EXT="bin" ;;
    esac
    
    OUTPUT_FILE="$OUTPUT_DIR/extracted_$COUNTER.$EXT"
    
    # Save the extracted data
    echo "$BASE64_DATA" | base64 -d > "$OUTPUT_FILE"
    echo -e "${GREEN}Extracted to: ${BOLD}$OUTPUT_FILE${NC}"
    
    # Check for AWS credentials in the decoded data
    echo -e "${YELLOW}Scanning extracted data for potential credentials...${NC}"
    
    # Attempt to find AWS credentials
    if grep -q "AKIA[0-9A-Z]\{16\}" "$OUTPUT_FILE" 2>/dev/null; then
        echo -e "${RED}${BOLD}ALERT: Found AWS Access Key in the extracted data!${NC}"
        echo -e "${RED}This is a serious security issue that needs to be addressed immediately.${NC}"
    elif strings "$OUTPUT_FILE" | grep -q "AKIA[0-9A-Z]\{16\}" 2>/dev/null; then
        echo -e "${RED}${BOLD}ALERT: Found AWS Access Key pattern in the binary data!${NC}"
        echo -e "${RED}This is a serious security issue that needs to be addressed immediately.${NC}"
    else
        echo -e "${GREEN}No obvious AWS credential patterns found in the extracted data.${NC}"
    fi
    
    COUNTER=$((COUNTER + 1))
done

echo -e "\n${BLUE}${BOLD}Processing complete.${NC}"
echo -e "All extracted data has been saved to: ${BOLD}$OUTPUT_DIR${NC}"
echo -e "${YELLOW}Please manually inspect the extracted files to ensure no sensitive data is present.${NC}"
echo -e "For safe SVG creation guidelines, refer to: ${BOLD}docs/SECURE_SVG_GUIDE.md${NC}"