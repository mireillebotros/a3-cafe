// fontManager.js - Centralized font management for the game

// Global font variables
let gameFonts = {
    default: null,    // Default fallback font
    pixellari: null,  // Main game font for text input and dialog
    heading: null     // Optional additional font for headings
  };
  
  // Initialize font system
  function initFontSystem() {
    console.log("Initializing font system");
    
    // These will be populated in preload()
    if (gameFonts.pixellari) {
      console.log("Pixellari font loaded successfully");
    } else {
      console.warn("Pixellari font not loaded yet");
    }
  }
  
  // Preload all game fonts
  function preloadFonts() {
    // Preload Pixellari font
    loadFont('pixellari.ttf', 
      font => {
        gameFonts.pixellari = font;
        console.log("Pixellari font loaded successfully");
      }, 
      error => {
        console.error("Failed to load Pixellari font", error);
        // Fallback to default font if loading fails
        gameFonts.pixellari = null;
      }
    );
    
    // Additional fonts can be loaded here if needed
    // Example:
    // loadFont('another-font.ttf', font => { gameFonts.heading = font; }, error => { console.error("Font error", error); });
  }
  
  // Use Pixellari font for text rendering
  function usePixellariFont(size = 18) {
    if (gameFonts.pixellari) {
      textFont(gameFonts.pixellari);
      textSize(size);
    } else {
      // Fallback if font isn't loaded
      textFont('monospace');
      textSize(size);
      console.warn("Pixellari font not available, using fallback");
    }
  }
  
  // Reset to default font after using a special font
  function useDefaultFont(size = 14) {
    textFont('sans-serif');
    textSize(size);
  }
  
  // Calculate text width with Pixellari font
  function getPixellariTextWidth(txt) {
    // Save current font settings
    const currentFont = textFont();
    const currentSize = textSize();
    
    // Set to Pixellari for measurement
    usePixellariFont();
    
    // Measure text width
    const width = textWidth(txt);
    
    // Restore previous font settings
    textFont(currentFont);
    textSize(currentSize);
    
    return width;
  }
  
  // Draw text with Pixellari font
  function drawPixellariText(txt, x, y, size = 18) {
    usePixellariFont(size);
    text(txt, x, y);
    useDefaultFont();
  }
  
  // Draw input box with Pixellari font
  function drawInputBox(txt, x, y, width, height, showCursor = true) {
    // Draw box
    fill(255);
    stroke(0);
    rect(x, y, width, height, 5);
    
    // Draw text
    fill(0);
    usePixellariFont();
    textAlign(LEFT, CENTER);
    text(txt, x + 10, y + height/2);
    
    // Draw cursor if needed
    if (showCursor && frameCount % 60 < 30) {
      const txtWidth = textWidth(txt);
      stroke(0);
      line(x + 10 + txtWidth, y + 10, x + 10 + txtWidth, y + height - 10);
    }
    
    // Reset font
    useDefaultFont();
  }
  
  // Export functions to be accessible to other modules
  window.initFontSystem = initFontSystem;
  window.preloadFonts = preloadFonts;
  window.usePixellariFont = usePixellariFont;
  window.useDefaultFont = useDefaultFont;
  window.getPixellariTextWidth = getPixellariTextWidth;
  window.drawPixellariText = drawPixellariText;
  window.drawInputBox = drawInputBox;
  window.gameFonts = gameFonts;