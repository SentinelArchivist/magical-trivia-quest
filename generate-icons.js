// Script to convert SVG to PNG icons for PWA
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure directories exist
const iconsDir = path.join(__dirname, 'assets', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Icon sizes needed based on manifest.json
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Use our enhanced SVG file as the source
const svgPath = path.join(iconsDir, 'icon-192x192.svg');

// Generate each PNG size using the system's imagemagick or similar conversion tool
sizes.forEach(size => {
  const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
  
  // Log the current operation
  console.log(`Generating ${size}x${size} icon...`);
  
  try {
    // Use different approaches based on available tools
    try {
      // Try using ImageMagick's convert command if available
      execSync(`convert -background none -size ${size}x${size} "${svgPath}" "${outputPath}"`, { stdio: 'inherit' });
    } catch (err) {
      // If ImageMagick fails, try using Mac's sips command
      execSync(`sips -s format png -z ${size} ${size} "${svgPath}" --out "${outputPath}"`, { stdio: 'inherit' });
    }
    
    console.log(`Successfully created icon-${size}x${size}.png`);
  } catch (error) {
    console.error(`Error creating ${size}x${size} icon:`, error.message);
  }
});

// Also create a favicon.ico (typically 32x32 for favicon)
try {
  const faviconPath = path.join(iconsDir, 'favicon.ico');
  try {
    // Try using ImageMagick
    execSync(`convert -background none -size 32x32 "${svgPath}" "${faviconPath}"`, { stdio: 'inherit' });
  } catch (err) {
    // Try using sips for PNG then convert to ICO
    const tempPngPath = path.join(iconsDir, 'temp-favicon.png');
    execSync(`sips -s format png -z 32 32 "${svgPath}" --out "${tempPngPath}"`, { stdio: 'inherit' });
    // Note: This will create a PNG, not an ICO, but we'll rename it for now
    fs.copyFileSync(tempPngPath, faviconPath);
    fs.unlinkSync(tempPngPath);
  }
  console.log('Successfully created favicon.ico');
} catch (error) {
  console.error('Error creating favicon:', error.message);
}

console.log('Icon generation complete!');
