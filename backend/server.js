const express = require('express');
const multer = require('multer');
const cors = require('cors');
const sharp = require('sharp');
const potrace = require('potrace');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { promisify } = require('util');
require('dotenv').config();

const execPromise = promisify(exec);
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use('/downloads', express.static('downloads'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Character set
const CHARSET = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  '!', '?', '.', ',', ';', ':', '-', '_', '(', ')', '[', ']', ' '
];

const COLS = 13;
const ROWS = Math.ceil(CHARSET.length / COLS);

// Helper function to clean up temp files
async function cleanupFiles(files) {
  for (const file of files) {
    try {
      await fs.unlink(file);
    } catch (error) {
      console.error(`Error deleting ${file}:`, error);
    }
  }
}

// Edge detection function to find exact character bounds
async function detectCharacterBounds(imagePath) {
  try {
    const image = sharp(imagePath);
    const { data, info } = await image
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const width = info.width;
    const height = info.height;

    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    let hasContent = false;
    let pixelCount = 0;

    // Scan image to find bounds of non-white pixels
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const pixelValue = data[idx];

        // If pixel is dark (not white/near-white)
        // More aggressive threshold to ignore light gray from borders
        if (pixelValue < 200) {
          hasContent = true;
          pixelCount++;
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    if (!hasContent) {
      return null; // No character found
    }

    // Filter out if too few pixels (likely just noise or border artifacts)
    const minPixelCount = 50; // Minimum pixels to consider valid character
    if (pixelCount < minPixelCount) {
      console.log(`Character has only ${pixelCount} pixels, likely noise`);
      return null;
    }

    // Add margin to bounds for better appearance
    const margin = 5; // Increased margin for cleaner extraction
    minX = Math.max(0, minX - margin);
    minY = Math.max(0, minY - margin);
    maxX = Math.min(width - 1, maxX + margin);
    maxY = Math.min(height - 1, maxY + margin);

    const boundWidth = maxX - minX + 1;
    const boundHeight = maxY - minY + 1;

    // Filter out if bounds are too small or too large (likely artifacts)
    if (boundWidth < 5 || boundHeight < 5) {
      console.log(`Character bounds too small: ${boundWidth}×${boundHeight}`);
      return null;
    }

    // Filter out if bounds cover almost entire cell (likely border was captured)
    if (boundWidth > width * 0.95 || boundHeight > height * 0.95) {
      console.log(`Character bounds too large: ${boundWidth}×${boundHeight}, likely border captured`);
      return null;
    }

    return {
      left: minX,
      top: minY,
      width: boundWidth,
      height: boundHeight,
      hasContent: true
    };
  } catch (error) {
    console.error('Error detecting character bounds:', error);
    return null;
  }
}

// Extract individual character cells from the uploaded image
async function extractCharacters(imagePath) {
  const image = sharp(imagePath);
  const metadata = await image.metadata();

  const cellWidth = Math.floor(metadata.width / COLS);
  const cellHeight = Math.floor(metadata.height / ROWS);

  // Label area is 20% of cell height (same as frontend template)
  const labelHeight = Math.floor(cellHeight * 0.2);
  const writingAreaHeight = cellHeight - labelHeight;

  const characters = {};
  const tempFiles = [];

  console.log(`Cell dimensions: ${cellWidth}×${cellHeight}, Label: ${labelHeight}px, Writing area: ${writingAreaHeight}px`);

  for (let i = 0; i < CHARSET.length; i++) {
    const char = CHARSET[i];
    const col = i % COLS;
    const row = Math.floor(i / COLS);

    const x = col * cellWidth;
    const y = row * cellHeight;

    // Increased padding to avoid borders - more aggressive cropping
    const sidePadding = Math.floor(cellWidth * 0.12); // 12% padding on each side
    const topPadding = Math.floor(writingAreaHeight * 0.08); // 8% padding from top of writing area
    const bottomPadding = Math.floor(writingAreaHeight * 0.08); // 8% padding from bottom

    // Extract only the writing area with generous padding to avoid grid lines
    const extractX = x + sidePadding;
    const extractY = y + labelHeight + topPadding; // Start after label + top padding
    const extractWidth = Math.max(cellWidth - (sidePadding * 2), 1);
    const extractHeight = Math.max(writingAreaHeight - topPadding - bottomPadding, 1);

    const tempPath = path.join('temp', `char_temp_${i}_${char.charCodeAt(0)}.png`);
    const outputPath = path.join('temp', `char_${i}_${char.charCodeAt(0)}.png`);
    tempFiles.push(tempPath);
    tempFiles.push(outputPath);

    await fs.mkdir('temp', { recursive: true });

    try {
      // Step 1: Extract writing area with aggressive cropping to avoid borders
      await image
        .clone()
        .extract({
          left: Math.max(extractX, 0),
          top: Math.max(extractY, 0),
          width: extractWidth,
          height: extractHeight
        })
        .greyscale()
        .normalize()
        .blur(0.5) // Slightly more blur to smooth edges
        .threshold(150) // Lower threshold to capture more of the character
        .toFile(tempPath);

      // Step 2: Detect exact character bounds using edge detection
      const bounds = await detectCharacterBounds(tempPath);

      if (!bounds || !bounds.hasContent) {
        console.log(`Skipping empty character: ${char}`);
        continue;
      }

      // Step 3: Extract just the character (tight crop) and normalize size
      await sharp(tempPath)
        .extract({
          left: bounds.left,
          top: bounds.top,
          width: bounds.width,
          height: bounds.height
        })
        .resize(300, 300, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .toFile(outputPath);

      characters[char] = outputPath;
      console.log(`✓ Extracted '${char}' - Bounds: ${bounds.width}×${bounds.height}`);

    } catch (error) {
      console.error(`Error extracting character ${char}:`, error);
    }
  }
  
  return { characters, tempFiles };
}

// Convert bitmap to SVG using Potrace with better parameters
async function bitmapToSvg(imagePath) {
  return new Promise((resolve, reject) => {
    const params = {
      threshold: 140, // Adjusted for cleaner output
      optTolerance: 0.3, // Reduced for more accurate curves
      turdSize: 10, // Increased to remove more noise/artifacts
      turnPolicy: potrace.Potrace.TURNPOLICY_MINORITY,
      alphaMax: 1,
      opticurve: true,
    };

    potrace.trace(imagePath, params, (err, svg) => {
      if (err) {
        reject(err);
      } else {
        resolve(svg);
      }
    });
  });
}

// Create FontForge Python script for better font generation
async function createFontForgeScript(svgDir, fontName, outputPath) {
  // Convert Windows paths to use forward slashes for Python
  const normalizedSvgDir = svgDir.replace(/\\/g, '/');
  const normalizedOutputPath = outputPath.replace(/\\/g, '/');
  
  const scriptContent = `#!/usr/bin/env python3
import fontforge
import os
import sys

# Character mapping
charset = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  '!', '?', '.', ',', ';', ':', '-', '_', '(', ')', '[', ']', ' '
]

# Create new font
font = fontforge.font()
font.fontname = "${fontName}"
font.familyname = "${fontName}"
font.fullname = "${fontName}"
font.encoding = "UnicodeFull"
font.em = 1000
font.ascent = 800
font.descent = 200

# Process each character
svg_dir = r"${normalizedSvgDir}"
processed_count = 0

for i, char in enumerate(charset):
    svg_file = os.path.join(svg_dir, f"char_{i}_{ord(char)}.svg")
    
    if not os.path.exists(svg_file):
        print(f"Warning: SVG file not found for character '{char}'")
        continue
    
    try:
        # Get unicode value
        unicode_val = ord(char)
        
        # Create glyph
        glyph = font.createChar(unicode_val)
        
        # Import SVG
        glyph.importOutlines(svg_file)
        
        # Remove overlap and simplify to clean up artifacts
        glyph.removeOverlap()
        glyph.simplify()
        glyph.round()
        
        # Auto-scale and position the glyph
        if glyph.isWorthOutputting():
            # Get bounding box
            bbox = glyph.boundingBox()
            if bbox[0] != bbox[2] and bbox[1] != bbox[3]:  # Check if not empty
                # Calculate scale to fit in em square
                width = bbox[2] - bbox[0]
                height = bbox[3] - bbox[1]
                
                # Target size (leave some margin) - adjusted for better appearance
                target_height = 650
                target_width = 500
                
                scale = min(target_height / height, target_width / width) if height > 0 and width > 0 else 1
                
                # Transform the glyph
                matrix = fontforge.psMat.scale(scale, scale)
                glyph.transform(matrix)
                
                # Center horizontally and position on baseline
                bbox = glyph.boundingBox()
                x_offset = (target_width - (bbox[2] - bbox[0])) / 2 - bbox[0]
                y_offset = 50 - bbox[1]  # Slightly raised from baseline for better appearance
                
                matrix = fontforge.psMat.translate(x_offset, y_offset)
                glyph.transform(matrix)
                
                # Set width - extremely tight letter spacing, wider word spacing
                bbox = glyph.boundingBox()
                char_width = bbox[2] - bbox[0]

                # Ultra-tight letter spacing (letters almost touching)
                # Wider space between words for clear separation
                if char == ' ':
                    glyph.width = 800  # Space between words
                elif char in '.,;:!?':
                    glyph.width = int(char_width * 1.005)  # Punctuation: 0.5% padding
                elif char in 'ij|lI':
                    glyph.width = int(char_width * 1.005)  # Narrow letters: 0.5% padding
                elif char in 'mMwW':
                    glyph.width = int(char_width * 1.005)  # Wide letters: 0.5% padding
                elif char in 'tfrk':
                    glyph.width = int(char_width * 1.005)  # Medium letters: 0.5% padding
                else:
                    glyph.width = int(char_width * 1.005)  # Default: 0.5% padding (ultra-tight)

                # Nearly zero side bearings - letters will touch
                side_bearing = 0  # No side bearing - letters touching
                glyph.left_side_bearing = side_bearing
                glyph.right_side_bearing = side_bearing
                    
                processed_count += 1
                print(f"Processed character '{char}' (U+{unicode_val:04X}) - Width: {glyph.width}")
            else:
                print(f"Warning: Empty glyph for character '{char}'")
        else:
            print(f"Warning: Glyph not worth outputting for character '{char}'")
            
    except Exception as e:
        print(f"Error processing character '{char}': {str(e)}")
        continue

print(f"\\nTotal characters processed: {processed_count}")

# Set font metadata for better rendering
font.os2_weight = 400  # Normal weight
font.os2_width = 5     # Normal width
font.os2_fstype = 0    # Installable embedding
font.os2_vendor = "CUST"

# Generate the font
output_path = r"${normalizedOutputPath}"
try:
    # Ensure output directory exists
    output_dir = os.path.dirname(output_path)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)
    
    font.generate(output_path)
    print(f"\\nFont generated successfully: {output_path}")
except Exception as e:
    print(f"Error generating font: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

font.close()
`;

  const scriptPath = path.join('temp', 'generate_font.py');
  await fs.writeFile(scriptPath, scriptContent);
  await fs.chmod(scriptPath, 0o755);
  return scriptPath;
}

// API endpoint to process uploaded image and generate font
app.post('/api/process-font', upload.single('image'), async (req, res) => {
  let tempFiles = [];
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const fontName = req.body.fontName || 'MyHandwriting';
    const imagePath = req.file.path;
    tempFiles.push(imagePath);

    console.log('Starting font generation process...');
    console.log('Extracting characters from image...');
    
    const { characters, tempFiles: charFiles } = await extractCharacters(imagePath);
    tempFiles.push(...charFiles);

    console.log(`Extracted ${Object.keys(characters).length} characters`);
    console.log('Converting to SVG format...');
    
    // Create SVG directory
    const svgDir = path.join('temp', 'svg');
    await fs.mkdir(svgDir, { recursive: true });
    
    const characterSvgs = {};
    let successCount = 0;
    
    for (const [char, charPath] of Object.entries(characters)) {
      try {
        const svg = await bitmapToSvg(charPath);
        const svgPath = path.join(svgDir, `char_${CHARSET.indexOf(char)}_${char.charCodeAt(0)}.svg`);
        await fs.writeFile(svgPath, svg);
        characterSvgs[char] = svgPath;
        tempFiles.push(svgPath);
        successCount++;
      } catch (error) {
        console.error(`Error processing character ${char}:`, error.message);
      }
    }

    console.log(`Successfully converted ${successCount} characters to SVG`);
    console.log('Generating TTF font with FontForge...');

    // Create FontForge script
    await fs.mkdir('downloads', { recursive: true });
    const outputPath = path.resolve(path.join('downloads', `${fontName}.ttf`));
    const scriptPath = await createFontForgeScript(path.resolve(svgDir), fontName, outputPath);
    tempFiles.push(scriptPath);

    // Execute FontForge script
    try {
      const { stdout, stderr } = await execPromise(`fontforge -script ${scriptPath}`);
      console.log('FontForge output:', stdout);
      if (stderr) console.error('FontForge warnings:', stderr);
    } catch (error) {
      console.error('FontForge error:', error);
      throw new Error(`Font generation failed: ${error.message}`);
    }

    // Verify font was created
    try {
      await fs.access(outputPath);
      console.log('Font file created successfully');
    } catch (error) {
      throw new Error('Font file was not created');
    }

    // Generate preview images
    console.log('Generating preview images...');
    const previewImages = {};
    for (const [char, charPath] of Object.entries(characters)) {
      const previewPath = path.join('downloads', `preview_${char.charCodeAt(0)}.png`);
      try {
        await sharp(charPath)
          .resize(100, 100, { 
            fit: 'contain', 
            background: { r: 255, g: 255, b: 255, alpha: 1 } 
          })
          .toFile(previewPath);
        previewImages[char] = `/downloads/preview_${char.charCodeAt(0)}.png`;
      } catch (error) {
        console.error(`Error creating preview for ${char}:`, error);
      }
    }

    // Cleanup temp files
    console.log('Cleaning up temporary files...');
    await cleanupFiles(tempFiles);

    // Clean up SVG directory
    try {
      const svgFiles = await fs.readdir(svgDir);
      for (const file of svgFiles) {
        await fs.unlink(path.join(svgDir, file));
      }
      await fs.rmdir(svgDir);
    } catch (error) {
      console.error('Error cleaning up SVG directory:', error);
    }

    console.log('Font generation complete!');
    res.json({
      success: true,
      fontUrl: `/downloads/${fontName}.ttf`,
      previewImages,
      fontName
    });

  } catch (error) {
    console.error('Error processing font:', error);
    await cleanupFiles(tempFiles);
    res.status(500).json({ 
      error: 'Failed to process font', 
      details: error.message 
    });
  }
});

// OpenRouter API endpoint for generating assignment content
app.post('/api/generate-assignment', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenRouter API key not configured' });
    }

    // List of free models to try in order
    const freeModels = [
      'openai/gpt-oss-20b:free'
    ];

    let lastError = null;

    // Try each model until one works
    for (const model of freeModels) {
      try {
        console.log(`Trying model: ${model}`);

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:5173',
            'X-Title': 'Handwriting Font Assignment Helper'
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'user',
                content: `You are a helpful assistant that generates well-structured assignment content. Generate content based on this prompt:\n\n${prompt}`
              }
            ],
            temperature: 0.7,
            max_tokens: 2000
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Model ${model} failed:`, response.status, errorText);
          lastError = errorText;
          continue; // Try next model
        }

        const data = await response.json();

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          console.error('Unexpected API response:', data);
          lastError = 'Invalid response format';
          continue; // Try next model
        }

        const generatedContent = data.choices[0].message.content;
        console.log(`Successfully used model: ${model}`);

        return res.json({ content: generatedContent });
      } catch (error) {
        console.error(`Error with model ${model}:`, error.message);
        lastError = error.message;
        continue; // Try next model
      }
    }

    // If we get here, all models failed
    throw new Error(`All models failed. Last error: ${lastError}`);

  } catch (error) {
    console.error('Error generating assignment:', error);
    res.status(500).json({
      error: 'Failed to generate content',
      details: error.message
    });
  }
});

// Export to Word document
app.post('/api/export-word', async (req, res) => {
  try {
    const { content, fontName } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Create a simple HTML that Word can open
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: '${fontName || 'Arial'}', Arial, sans-serif;
      font-size: 14pt;
      line-height: 2;
      margin: 2cm;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>${content}</body>
</html>`;

    // Set appropriate headers for Word download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename=assignment.doc');
    res.send(htmlContent);
  } catch (error) {
    console.error('Error exporting to Word:', error);
    res.status(500).json({
      error: 'Failed to export to Word',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Make sure FontForge and Potrace are installed and accessible');
});