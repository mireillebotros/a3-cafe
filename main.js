// Debug main.js - Simplified version with enhanced error logging

// Global game state
let gameState = "loading";
let selectedTable = 0;
let anxietyLevel = 0;
let assets = {};
let totalAssets = 0;
let loadedAssets = 0;
let pixellariFont;
let loadingErrors = []; // Track specific loading errors

// Preload function
function preload() {
  console.log("Starting preload function");
  
  // Try to load the font in preload
  try {
    pixellariFont = loadFont('Pixellari.ttf');
    console.log("✓ Pixellari font loaded successfully");
  } catch (error) {
    console.error("✗ Error loading Pixellari font:", error);
    loadingErrors.push("Font loading failed: " + error.message);
    // Continue without the custom font
  }
}

function setup() {
  console.log("Starting setup function");
  createCanvas(1280, 720);
  
  // Create global error handler
  window.onerror = function(message, source, lineno, colno, error) {
    console.error("UNCAUGHT ERROR:", message, "at", source, ":", lineno, ":", colno);
    console.error("Error object:", error);
    loadingErrors.push("Uncaught error: " + message);
    displayLoadError("Uncaught error: " + message);
    return true; // Prevents default browser error handling
  };
  
  // Display loading screen
  displayLoadingScreen();
  
  // First, just try to load one critical asset to test
  console.log("Testing a single asset load...");
  try {
    loadSound('constant_audio.mp3', 
      soundFile => {
        console.log("✓ Successfully loaded test audio");
        initializeGame(); // Only proceed if we can load at least one asset
      }, 
      error => {
        console.error("✗ Error loading test audio:", error);
        loadingErrors.push("Test audio load failed: " + error);
        displayLoadError("Failed to load test audio. Check console for details.");
      }
    );
  } catch (error) {
    console.error("✗ Critical error in loadSound:", error);
    loadingErrors.push("loadSound function error: " + error.message);
    displayLoadError("Critical error in sound loading. Check console for details.");
  }
}

// Simplified initialization
function initializeGame() {
  console.log("Starting minimal game initialization");
  
  // Define basic game states if not already defined
  if (typeof GAME_STATES === 'undefined') {
    window.GAME_STATES = {
      LOADING: "loading",
      INTRO: "intro",
      TABLE_SELECT: "tableSelect",
      MINI_GAME_1: "miniGame1",
      ORDER_DRINK: "orderDrink",
      MINI_GAME_2: "miniGame2",
      SUCCESS: "success",
      GAME_OVER: "gameOver"
    };
    
    gameState = "intro"; // Go directly to intro
    console.log("✓ Game states defined, set initial state to intro");
  }
  
  // Check if module functions are available
  console.log("Checking module availability:");
  console.log("- initAnxietyManager:", typeof initAnxietyManager === 'function' ? "✓ Available" : "✗ Missing");
  console.log("- initDrawingCanvas:", typeof initDrawingCanvas === 'function' ? "✓ Available" : "✗ Missing");
  console.log("- initIntro:", typeof initIntro === 'function' ? "✓ Available" : "✗ Missing");
  console.log("- initTableSelection:", typeof initTableSelection === 'function' ? "✓ Available" : "✗ Missing");
  
  // Try to start the intro sequence directly
  try {
    if (typeof initIntro === 'function') {
      console.log("Starting intro sequence...");
      initIntro();
    } else {
      throw new Error("Intro module not found");
    }
  } catch (error) {
    console.error("✗ Error initializing intro:", error);
    loadingErrors.push("Intro initialization error: " + error.message);
    displayLoadError("Failed to initialize intro. Check console for details.");
  }
}

// Draw function
function draw() {
  // Basic error handling in draw
  try {
    // Just show loading or error screen for now
    if (gameState === "loading") {
      displayLoadingScreen();
    } else {
      background(0);
      
      // Minimal functionality - just show intro if it's loaded
      if (gameState === "intro" && typeof drawIntro === 'function') {
        drawIntro();
      } else {
        // Display basic text if no state handlers are available
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(24);
        text("Game state: " + gameState, width/2, height/2 - 40);
        text("Check console for detailed logs", width/2, height/2 + 40);
      }
    }
  } catch (error) {
    console.error("✗ Error in draw cycle:", error);
    // Just show a simple error message
    background(40, 0, 0);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(20);
    text(`Error in draw: ${error.message}`, width/2, height/2);
  }
}

// Simplify key and mouse handlers
function keyPressed() {
  console.log("Key pressed:", keyCode);
  // Try to handle intro skip
  if (gameState === "intro" && keyCode === ENTER) {
    if (typeof handleIntroKeyPress === 'function') {
      handleIntroKeyPress();
    } else {
      console.log("No intro key handler available");
    }
  }
}

function mouseClicked() {
  console.log("Mouse clicked at:", mouseX, mouseY);
  return false;
}

// Show loading screen with errors if any
function displayLoadingScreen() {
  background(0);
  
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(32);
  text("Loading...", width/2, height/2 - 50);
  
  // Show any loading errors
  if (loadingErrors.length > 0) {
    textSize(16);
    text("Loading issues detected:", width/2, height/2 + 20);
    
    for (let i = 0; i < Math.min(loadingErrors.length, 3); i++) {
      text(loadingErrors[i], width/2, height/2 + 50 + (i * 25));
    }
    
    if (loadingErrors.length > 3) {
      text(`...and ${loadingErrors.length - 3} more errors (see console)`, width/2, height/2 + 125);
    }
  }
}

// Display load error with detailed info
function displayLoadError(errorMsg) {
  background(40, 0, 0);
  
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(32);
  text("Error Loading Game", width/2, height/2 - 100);
  
  textSize(18);
  text("Please check your connection and refresh the page.", width/2, height/2 - 60);
  
  // Show the specific error message
  if (errorMsg) {
    textSize(16);
    text("Error details:", width/2, height/2 - 20);
    
    // Wrap error text if too long
    let words = errorMsg.split(' ');
    let line = '';
    let y = height/2 + 10;
    
    for (let i = 0; i < words.length; i++) {
      let testLine = line + words[i] + ' ';
      if (textWidth(testLine) > width - 100) {
        text(line, width/2, y);
        line = words[i] + ' ';
        y += 25;
      } else {
        line = testLine;
      }
    }
    text(line, width/2, y);
  }
  
  // Show console hint
  textSize(14);
  text("For more details, check your browser's developer console (F12)", width/2, height/2 + 80);
  
  // Draw retry button
  fill(80);
  rect(width/2 - 60, height/2 + 120, 120, 40);
  fill(255);
  textSize(18);
  text("Retry", width/2, height/2 + 140);
  
  // Add click handler for retry button
  mousePressed = function() {
    if (mouseX >= width/2 - 60 && mouseX <= width/2 + 60 && 
        mouseY >= height/2 + 120 && mouseY <= height/2 + 160) {
      // Reset mouse handler
      mousePressed = null;
      // Reload the page
      window.location.reload();
    }
  };
}