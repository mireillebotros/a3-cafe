// sketch.js - Main entry point for p5.js

// Global font variable for Pixellari
let pixellariFont;

// Preload function - loads essential assets before setup
function preload() {
  // Preload the Pixellari font
  pixellariFont = loadFont('pixellari.ttf');
}

// Setup function - called once at start
function setup() {
  createCanvas(1280, 720);
  
  // Display loading screen while we load assets
  displayLoadingScreen();
  
  // Initialize module systems
  if (typeof initAnxietyManager === 'function') {
    initAnxietyManager();
  }
  
  if (typeof initDrawingCanvas === 'function') {
    initDrawingCanvas();
  }
  
  // Start asset loading
  loadGameAssets().then(() => {
    // Initialize the game once assets are loaded
    if (typeof initIntro === 'function') {
      initIntro();
    } else {
      console.error("Intro module not loaded properly");
    }
  }).catch(error => {
    console.error("Error loading assets:", error);
    displayLoadError();
  });
}

function draw() {
  // Delegate to the appropriate module based on game state
  switch(gameState) {
    case GAME_STATES.LOADING:
      displayLoadingScreen();
      break;
      
    case GAME_STATES.INTRO:
      if (typeof drawIntro === 'function') {
        drawIntro();
      }
      break;
      
    case GAME_STATES.TABLE_SELECT:
      if (typeof drawTableSelection === 'function') {
        drawTableSelection();
      }
      break;
      
    case GAME_STATES.MINI_GAME_1:
      if (typeof drawMiniGame1 === 'function') {
        drawMiniGame1();
      }
      break;
      
    case GAME_STATES.ORDER_DRINK:
      if (typeof drawOrderDrink === 'function') {
        drawOrderDrink();
      }
      break;
      
    case GAME_STATES.MINI_GAME_2:
      if (typeof drawMiniGame2 === 'function') {
        drawMiniGame2();
      }
      break;
      
    case GAME_STATES.ORDER_SNACK:
      if (typeof drawOrderSnack === 'function') {
        drawOrderSnack();
      }
      break;
      
    case GAME_STATES.SUCCESS:
      if (typeof drawSuccess === 'function') {
        drawSuccess();
      }
      break;
      
    case GAME_STATES.GAME_OVER:
      if (typeof drawGameOver === 'function') {
        drawGameOver();
      }
      break;
    
    default:
      // If no module handles this state, show error
      displayStateError();
      break;
  }
  
  // Always draw anxiety meter except in intro and loading
  if (gameState !== GAME_STATES.LOADING && gameState !== GAME_STATES.INTRO) {
    if (typeof drawAnxietyMeter === 'function') {
      drawAnxietyMeter();
    }
  }
  
  // Draw quit button in the corner for all states except loading and intro
  if (gameState !== GAME_STATES.LOADING && gameState !== GAME_STATES.INTRO) {
    drawQuitButton();
  }
}

// Draw the quit button
function drawQuitButton() {
  if (assets.buttons && assets.buttons.quit) {
    // Draw small quit button in top left corner
    image(assets.buttons.quit, 20, 20, 40, 40);
  }
}

// Mouse click handler
function mouseClicked() {
  // Check for quit button click first
  if (gameState !== GAME_STATES.LOADING && gameState !== GAME_STATES.INTRO) {
    if (mouseX >= 20 && mouseX <= 60 && mouseY >= 20 && mouseY <= 60) {
      showQuitConfirmation();
      return false;
    }
  }
  
  // Delegate to the appropriate module based on game state
  switch(gameState) {
    case GAME_STATES.INTRO:
      if (typeof handleIntroClicks === 'function') {
        handleIntroClicks();
      }
      break;
      
    case GAME_STATES.TABLE_SELECT:
      if (typeof handleTableSelectionClicks === 'function') {
        handleTableSelectionClicks();
      }
      break;
      
    case GAME_STATES.MINI_GAME_1:
      if (typeof handleMiniGame1Clicks === 'function') {
        handleMiniGame1Clicks();
      }
      break;
      
    case GAME_STATES.ORDER_DRINK:
      if (typeof handleOrderDrinkClicks === 'function') {
        handleOrderDrinkClicks();
      }
      break;
      
    case GAME_STATES.MINI_GAME_2:
      if (typeof handleMiniGame2Clicks === 'function') {
        handleMiniGame2Clicks();
      }
      break;
      
    case GAME_STATES.ORDER_SNACK:
      if (typeof handleOrderSnackClicks === 'function') {
        handleOrderSnackClicks();
      }
      break;
      
    case GAME_STATES.SUCCESS:
    case GAME_STATES.GAME_OVER:
      if (typeof handleEndScreenClicks === 'function') {
        handleEndScreenClicks();
      }
      break;
  }
  
  // Play button press sound for general clicking
  if (assets.buttonPressSound && gameState !== GAME_STATES.LOADING) {
    assets.buttonPressSound.play();
  }
  
  // Prevent default behavior
  return false;
}

// Mouse drag handler - for drawing in mini-games
function mouseDragged() {
  if (gameState.includes("miniGame")) {
    if (typeof handleCanvasDrag === 'function') {
      handleCanvasDrag();
    }
    
    // Call specific mini-game drag handlers
    if (gameState === GAME_STATES.MINI_GAME_1 && typeof handleMiniGame1MouseDrag === 'function') {
      handleMiniGame1MouseDrag();
    } else if (gameState === GAME_STATES.MINI_GAME_2 && typeof handleMiniGame2MouseDrag === 'function') {
      handleMiniGame2MouseDrag();
    }
  }
  
  // Prevent default behavior
  return false;
}

// Mouse release handler - for drawing in mini-games
function mouseReleased() {
  if (gameState.includes("miniGame")) {
    if (typeof handleCanvasMouseRelease === 'function') {
      handleCanvasMouseRelease();
    }
    
    // Call specific mini-game release handlers
    if (gameState === GAME_STATES.MINI_GAME_1 && typeof handleMiniGame1MouseRelease === 'function') {
      handleMiniGame1MouseRelease();
    } else if (gameState === GAME_STATES.MINI_GAME_2 && typeof handleMiniGame2MouseRelease === 'function') {
      handleMiniGame2MouseRelease();
    }
  }
  
  // Prevent default behavior
  return false;
}

function keyPressed() {
  // Handle Enter key for intro screen
  if (gameState === GAME_STATES.INTRO && keyCode === ENTER) {
    if (typeof handleIntroKeyPress === 'function') {
      handleIntroKeyPress();
    }
  }
  
  // Delegate to the appropriate module based on game state
  switch(gameState) {
    case GAME_STATES.INTRO:
      if (typeof handleIntroKeyPress === 'function') {
        handleIntroKeyPress();
      }
      break;
      
    case GAME_STATES.ORDER_DRINK:
      if (typeof handleOrderDrinkKeyPress === 'function') {
        handleOrderDrinkKeyPress();
      }
      break;
      
    case GAME_STATES.ORDER_SNACK:
      if (typeof handleOrderSnackKeyPress === 'function') {
        handleOrderSnackKeyPress();
      }
      break;
  }
}

// Show quit confirmation dialog
function showQuitConfirmation() {
  // Pause the game
  const previousState = gameState;
  gameState = "confirmation";
  
  // Draw gray overlay
  fill(0, 0, 0, 150); // 60% opaque black
  rect(0, 0, width, height);
  
  // Draw confirmation dialog
  if (assets.alerts && assets.alerts.sureQuit) {
    const dialogX = width/2 - 200;
    const dialogY = height/2 - 100;
    image(assets.alerts.sureQuit, dialogX, dialogY, 400, 200);
    
    // Draw yes/no buttons
    if (assets.buttons) {
      if (assets.buttons.yesQuit) {
        image(assets.buttons.yesQuit, dialogX + 50, dialogY + 150, 120, 40);
      }
      
      if (assets.buttons.noQuit) {
        image(assets.buttons.noQuit, dialogX + 230, dialogY + 150, 120, 40);
      }
    }
    
    // Handle button clicks
    mousePressed = function() {
      // Yes button
      if (mouseX >= dialogX + 50 && mouseX <= dialogX + 170 && 
          mouseY >= dialogY + 150 && mouseY <= dialogY + 190) {
        // Resume normal mouse behavior
        mousePressed = null;
        // Quit to game over
        transitionToState(GAME_STATES.GAME_OVER);
      }
      // No button
      else if (mouseX >= dialogX + 230 && mouseX <= dialogX + 350 && 
               mouseY >= dialogY + 150 && mouseY <= dialogY + 190) {
        // Resume normal mouse behavior
        mousePressed = null;
        // Return to previous state
        gameState = previousState;
      }
    };
  }
}

// Display loading screen
function displayLoadingScreen() {
  background(0);
  
  // Use Pixellari font for loading text if available
  if (pixellariFont) {
    textFont(pixellariFont);
  }
  
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(32);
  text("Loading...", width/2, height/2);
  
  // Show loading progress if available
  if (typeof loadedAssets !== 'undefined' && typeof totalAssets !== 'undefined') {
    const progress = Math.floor((loadedAssets / totalAssets) * 100);
    textSize(18);
    text(`${progress}%`, width/2, height/2 + 40);
    
    // Draw progress bar
    noStroke();
    fill(50);
    rect(width/2 - 100, height/2 + 60, 200, 20);
    fill(200);
    rect(width/2 - 100, height/2 + 60, 200 * (progress/100), 20);
  }
  
  // Reset to default font
  textFont('default');
}

// Display load error
function displayLoadError() {
  background(40, 0, 0);
  
  // Use Pixellari font for error text if available
  if (pixellariFont) {
    textFont(pixellariFont);
  }
  
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(32);
  text("Error Loading Game", width/2, height/2 - 40);
  
  textSize(18);
  text("Please check your connection and refresh the page.", width/2, height/2 + 20);
  
  // Draw retry button
  fill(80);
  rect(width/2 - 60, height/2 + 60, 120, 40);
  fill(255);
  text("Retry", width/2, height/2 + 80);
  
  // Reset to default font
  textFont('default');
}

// Display state error
function displayStateError() {
  background(40, 0, 40);
  
  // Use Pixellari font for error text if available
  if (pixellariFont) {
    textFont(pixellariFont);
  }
  
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(24);
  text(`Error: No handler for game state "${gameState}"`, width/2, height/2);
  
  // Reset to default font
  textFont('default');
}

// Ensure the game adjusts to different screen sizes
function windowResized() {
  // Optional: Implement responsive canvas scaling
  // resizeCanvas(windowWidth, windowHeight);
}