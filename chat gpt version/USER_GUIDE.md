# ASCII PRO - Professional Character Art Effect
## User Guide & Documentation

### 📦 **What's Included**

- **ASCII_PRO_Effect.jsx** - Main script file
- **Preset Files** - Animation presets for quick setup
- **User Guide** - This document
- **Tutorial Videos** - Video walkthroughs (separate download)

---

## 🚀 **Installation**

### Method 1: ScriptUI Panels (Recommended)

1. Close After Effects
2. Copy `ASCII_PRO_Effect.jsx` to:
   - **Windows**: `C:\Program Files\Adobe\Adobe After Effects [version]\Support Files\Scripts\ScriptUI Panels\`
   - **Mac**: `/Applications/Adobe After Effects [version]/Scripts/ScriptUI Panels/`
3. Open After Effects
4. Go to **Window** > **ASCII_PRO_Effect.jsx**

### Method 2: Run Script

1. Open After Effects
2. Go to **File** > **Scripts** > **Run Script File...**
3. Navigate to and select `ASCII_PRO_Effect.jsx`

---

## 🎯 **Quick Start Guide**

### Creating Your First ASCII Effect

1. **Import Your Footage**
   - Drag your video/image into After Effects
   - Create a new composition

2. **Select Your Layer**
   - Click on the layer you want to convert to ASCII
   - Make sure it's selected (highlighted)

3. **Run ASCII PRO**
   - Go to **Window** > **ASCII_PRO_Effect.jsx**
   - OR **File** > **Scripts** > **Run Script File**

4. **Configure Settings**
   - **Character Set**: Choose from 8 presets or create custom
   - **Grid Size**: Lower = more detail (4-50 pixels recommended)
   - **Font Size**: Match to grid size for best results
   - **Color Mode**: Original, Monochrome, Matrix, etc.

5. **Click "Create Effect"**
   - The script will generate your ASCII art effect
   - A control layer named "ASCII PRO Controls" will appear

---

## 🎨 **Understanding the Controls**

After creating the effect, you'll see a control layer with these parameters:

### **Basic Controls**

| Control | Function | Range | Tips |
|---------|----------|-------|------|
| **Grid Size** | Size of each character cell | 4-100px | Lower = more detail, slower render |
| **Font Size** | Size of ASCII characters | 6-48pt | Match grid size for best results |
| **Character Spacing** | X/Y spacing between chars | 0.1-2.0 | Adjust for custom fonts |

### **Image Adjustment**

| Control | Function | Range | Tips |
|---------|----------|-------|------|
| **Contrast** | Increases character variation | 0-200% | Higher = more dramatic |
| **Brightness** | Lightens or darkens | -100-100 | Adjust before creating |
| **Gamma** | Mid-tone adjustment | 0.1-3.0 | Fine-tune character mapping |
| **Invert** | Reverses brightness map | ON/OFF | For negative effects |

### **Color Options**

| Mode | Description | Best For |
|------|-------------|----------|
| **Original** | Uses source video colors | Realistic ASCII |
| **Monochrome** | Black and white | Classic terminal look |
| **Duotone** | Two-color gradient | Vintage posters |
| **Tritone** | Three-color gradient | Artistic effects |
| **Matrix** | Green terminal style | Hacker/tech themes |
| **Thermal** | Heat map colors | Data visualization |
| **Cyberpunk** | Cyan/magenta neon | Modern sci-fi |

### **Advanced**

| Control | Function | Tips |
|---------|----------|------|
| **Animation Speed** | Random character flicker | 0 = static, 10 = fast glitch |
| **Color 1/2/3** | Custom gradient colors | Used in Duotone/Tritone modes |

---

## 📝 **Character Sets Explained**

### **Detailed (70+ characters)**
- Maximum detail and gradation
- Best for: High-resolution work, close-ups
- Performance: Slower

### **Standard Symbols**
`@%#*+=-:. `
- Balanced detail and performance
- Best for: Most projects, general use
- Performance: Fast

### **Block Characters**
`█▓▒░ `
- Solid, geometric look
- Best for: Retro games, pixelated style
- Performance: Very fast

### **Binary**
`10 `
- Minimalist, digital aesthetic
- Best for: Tech/coding themes, abstract
- Performance: Very fast

### **Numbers**
`9876543210 `
- Numeric display
- Best for: Data/matrix themes, countdowns
- Performance: Fast

### **Alphabet**
`ZYXWVUTSRQPONMLKJIHGFEDCBA `
- Letter-based
- Best for: Text art, typography projects
- Performance: Fast

### **Matrix Style**
`ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ `
- Japanese katakana characters
- Best for: Matrix-style effects
- Performance: Fast
- **Note**: Requires font with Japanese character support

### **Custom**
- Define your own character set
- Enter 5-80 characters from darkest to lightest
- Example: `•○◦∘ ` for circles

---

## 🎬 **Workflow Tips**

### **For Best Results**

1. **Pre-compose Complex Layers**
   - If your source has multiple effects, pre-compose first
   - This improves performance

2. **Adjust Contrast First**
   - Use the source layer's contrast/levels
   - Get good character variation before ASCII conversion

3. **Grid Size Guidelines**
   - **4-8px**: Maximum detail, use for still images
   - **8-16px**: Good balance for most videos
   - **16-32px**: Stylized, faster performance
   - **32-50px**: Very stylized, maximum speed

4. **Font Size = Grid Size**
   - For tightest packing, set Font Size = Grid Size
   - Adjust Character Spacing X/Y as needed

5. **Color Workflow**
   - Start with "Original" to see source colors
   - Switch to "Monochrome" for classic look
   - Use "Duotone/Tritone" for custom color grading

### **Animation Techniques**

1. **Static ASCII Look**
   - Set Animation Speed = 0
   - Animate source footage or camera

2. **Glitch Effect**
   - Set Animation Speed = 5-15
   - Combine with displacement effects

3. **Matrix Rain**
   - Use Matrix character set
   - Set Color Mode = Matrix
   - Animate Grid Size or add motion blur

4. **Typing Effect**
   - Animate a mask on the ASCII layer
   - Reveal from left to right

---

## 🔧 **Troubleshooting**

### **Effect appears too dark/light**
- Adjust **Brightness** control on ASCII PRO Controls
- Increase **Contrast** for more character variation
- Try enabling **Invert** checkbox

### **Characters don't fill the frame**
- Increase **Font Size** to match **Grid Size**
- Adjust **Character Spacing** X and Y values
- Make sure source layer is correct resolution

### **Performance is slow**
- Increase **Grid Size** (fewer characters = faster)
- Reduce composition resolution (Half or Quarter)
- Disable **High Quality Sampling** when creating effect
- Use simpler character sets (Binary, Blocks)

### **Colors look wrong**
- Check **Color Mode** setting
- Verify Color 1/2/3 are set correctly for Duotone/Tritone
- Try switching to "Original" mode first

### **Script won't run**
- Make sure you have a composition open
- Select a layer before running
- Check After Effects version (CC 2018 or newer)

### **Text appears garbled**
- Make sure you're using a monospace font (Courier New)
- Check that your font supports the character set
- For Matrix style, install a Japanese font

---

## 💡 **Creative Ideas**

### **Music Videos**
- Beat-reactive ASCII using audio keyframes
- Transition between ASCII and normal footage
- Use colored ASCII for psychedelic effects

### **Title Sequences**
- Reveal titles through ASCII transformation
- Matrix-style code rain backgrounds
- Retro computer terminal aesthetic

### **Corporate/Tech**
- Data visualization effects
- Binary code backgrounds
- Digital transformation concepts

### **Social Media**
- Eye-catching Instagram posts
- YouTube intros/outros
- TikTok effects and transitions

### **Artistic Projects**
- Portrait art from photos
- Abstract video art
- Experimental film techniques

---

## 📊 **Performance Guide**

### **Render Times** (1920x1080, 30fps)

| Grid Size | Character Set | Estimated Speed |
|-----------|---------------|-----------------|
| 8px | Detailed | 0.5-1 fps |
| 8px | Standard | 1-2 fps |
| 16px | Standard | 3-5 fps |
| 32px | Standard | 8-12 fps |
| 32px | Binary | 15-20 fps |

**Tips for Faster Renders:**
- Pre-render the ASCII layer
- Use Multi-Frame Rendering (After Effects 2022+)
- Render in batches overnight
- Use larger grid sizes for drafts

---

## 🎓 **Advanced Techniques**

### **Custom Character Mapping**

Create your own character sets:
1. Order characters from darkest to lightest
2. Include spaces for lightest areas
3. Test with a gradient to verify mapping

**Example Custom Sets:**
- Dots: `●◐◑◒◓◔○ `
- Lines: `█▓▒░ `
- Braille: `⠀⠁⠃⠇⠏⠟⠿⣿`

### **Multi-Layer Compositing**

Stack multiple ASCII layers:
1. Duplicate ASCII effect layer
2. Change character set on each
3. Blend using different blend modes
4. Animate opacity for transitions

### **3D Integration**

Use ASCII in 3D space:
1. Convert ASCII layer to 3D
2. Add camera and lights
3. Duplicate for depth
4. Use Z-space for reveals

### **Expression Enhancements**

Add these to the Source Text expression:

**Random Character Shuffle:**
```javascript
var flickerChance = 0.1; // 10% chance
if (random() < flickerChance) {
    charIndex = Math.floor(random(chars.length));
}
```

**Wave Effect:**
```javascript
var wave = Math.sin(time * 2 + x * 0.1) * 0.2;
brightness += wave;
```

---

## 📞 **Support**

### **Need Help?**

- **Email**: support@yourcompany.com
- **Website**: www.yourproduct.com
- **Tutorials**: youtube.com/yourproduct
- **Community**: discord.gg/yourproduct

### **Updates**

Check for updates at: www.yourproduct.com/updates

Current Version: 2.0
Last Updated: February 2026

---

## 📜 **License**

### **Single User License**
- For use on one workstation
- Commercial projects allowed
- Cannot redistribute script

### **Studio License**
- For use on up to 5 workstations
- Commercial projects allowed
- Cannot redistribute script

### **Selling Rendered Content**
✅ **You CAN:**
- Sell videos created with ASCII PRO
- Use in client work
- Use in commercial productions
- Include in stock footage

❌ **You CANNOT:**
- Resell or redistribute the script
- Share the script with others
- Claim authorship of the tool

---

## 🙏 **Credits**

**Developed by**: [Your Name/Company]
**Version**: 2.0
**Release Date**: February 2026
**Compatible with**: After Effects CC 2018 and newer

---

## 🆕 **Changelog**

### Version 2.0 (February 2026)
- Added 8 character set presets
- Improved performance with optimized sampling
- Added color modes (Matrix, Thermal, Cyberpunk)
- High quality sampling option
- Animation speed control
- Custom character support
- Better UI/UX

### Version 1.0 (Initial Release)
- Basic ASCII conversion
- Standard character set
- Grid size control
- Basic color options

---

**Thank you for using ASCII PRO!**

For tutorials and examples, visit: **www.yourproduct.com**
