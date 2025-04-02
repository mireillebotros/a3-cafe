// miniGame2.js - Handles the second drawing mini-game with drink interaction

// State variables for mini game 2
let miniGame2VideoStarted = false;
let miniGame2Completed = false;
let miniGame2VideoEnded = false;
let miniGame2DrawingActive = false;
let miniGame2SavedDrawing = null;
let miniGame2CheckVisible = false;
let drinkState = "full"; // full, mid, empty
let drinkX = 0;
let drinkY = 0;

// Initialize mini game 2
function initMiniGame2() {
  console.log("Initializing mini game 2");
  miniGame2VideoStarted = false;
  miniGame2Completed = false;
  miniGame2VideoEnded = false;
  miniGame2DrawingActive = false;
  miniGame2CheckVisible = false;
  drinkState = "full";
  
  // Set drink position (right side of screen)
  drinkX = width - 150;
  drinkY = 300;
  
  // Register state callbacks
  registerStateCallbacks(GAME_STATES.MINI_GAME_2, {
    init: setupMiniGame2,
    cleanup: cleanupMiniGame2,
    videoComplete: handleMiniGame2VideoComplete
  });
  
  // Setup mini game 2
  setupMiniGame2();
}

// Setup mini game 2
function setupMiniGame2() {
  const tableNum = getSelectedTable();
  if (!tableNum || tableNum < 1 || tableNum > 3) {
    console.error("Invalid table number for mini game 2");
    return;
  }
  
  // Setup drawing canvas with the same dimensions as mini game 1
  setupDrawingCanvas({ x: 380, y: 220, width: 520, height: 320 });
  
  // Load the saved drawing from mini game 1 if available
  if (window.getMiniGame1SavedDrawing) {
    miniGame2SavedDrawing = window.getMiniGame1SavedDrawing();
    if (miniGame2SavedDrawing) {
      loadDrawingData(miniGame2SavedDrawing);
    }
  }
  
  if (!miniGame2VideoStarted && assets.videos && assets.videos.miniGame) {
    const videoKey = `mini2T${tableNum}`;
    
    if (assets.videos.miniGame[videoKey]) {
      assets.videos.miniGame[videoKey].onended(() => {
        miniGame2VideoEnded = true;
        miniGame2DrawingActive = true;
        handleMiniGame2VideoComplete(videoKey);
      });
      
      // Play mini game video
      assets.videos.miniGame[videoKey].play();
      miniGame2VideoStarted = true;
      console.log(`Mini game 2 video started playing: ${videoKey}`);
    } else {
      console.warn(`Mini game 2 video asset not found: ${videoKey}`);
    }
  } else {
    console.warn("Mini game 2 video asset not ready or already started");
  }
}

// Clean up mini game 2
function cleanupMiniGame2() {
  const tableNum = getSelectedTable();
  
  // Stop mini game videos
  if (assets.videos && assets.videos.miniGame) {
    const videoKeys = [
      `mini2T${tableNum}`,
      `mini2T${tableNum}End`
    ];
    
    videoKeys.forEach(key => {
      if (assets.videos.miniGame[key]) {
        assets.videos.miniGame[key].stop();
        assets.videos.miniGame[key].hide();
      }
    });
  }
  
  // Save drawing for later mini games
  if (hasUserDrawn()) {
    miniGame2SavedDrawing = saveDrawingData();
  }
  
  console.log("Mini game 2 cleaned up");
}

// Handle mini game 2 video completion
function handleMiniGame2VideoComplete(videoId) {
  console.log(`Mini game 2 video completed: ${videoId}`);
  
  const tableNum = getSelectedTable();
  
  // Handle intro video completion
  if (videoId === `mini2T${tableNum}`) {
    // Show static background for drawing
    miniGame2VideoEnded = true;
    miniGame2DrawingActive = true;
  }
  // Handle end video completion
  else if (videoId === `mini2T${tableNum}End`) {
    // Transition to next state
    transitionToState(GAME_STATES.ORDER_SNACK);
  }
}

// Draw function for mini game 2
function drawMiniGame2() {
  background(0);
  const tableNum = getSelectedTable();
  
  // Active video playing phase
  if (!miniGame2VideoEnded) {
    if (assets.videos && assets.videos.miniGame && assets.videos.miniGame[`mini2T${tableNum}`]) {
      image(assets.videos.miniGame[`mini2T${tableNum}`], 0, 0, width, height);
    }
  }
  // End video playing phase
  else if (miniGame2Completed) {
    if (assets.videos && assets.videos.miniGame && assets.videos.miniGame[`mini2T${tableNum}End`]) {
      image(assets.videos.miniGame[`mini2T${tableNum}End`], 0, 0, width, height);
      
      // Draw the saved drawing on top of the end video
      if (miniGame2SavedDrawing) {
        image(miniGame2SavedDrawing, 0, 0);
      }
    }
  }
  // Interactive drawing phase
  else {
    // Draw static background image
    if (assets.miniGameBgs && assets.miniGameBgs[`miniT${tableNum}`]) {
      image(assets.miniGameBgs[`miniT${tableNum}`], 0, 0, width, height);
    }
    
    // Draw the canvas content
    drawCanvas();
    
    // Draw the mug with current drink state
    if (assets.items) {
      let drinkImg;
      switch (drinkState) {
        case "full":
          drinkImg = assets.items.drinkFull;
          break;
        case "mid":
          drinkImg = assets.items.drinkMid;
          break;
        case "empty":
          drinkImg = assets.items.drinkEmpty;
          break;
      }
      
      if (drinkImg) {
        image(drinkImg, drinkX, drinkY, 120, 120);
      }
    }
    
    // Draw pencil and eraser buttons
    if (assets.buttons) {
      // Draw pencil button
      if (assets.buttons.pencil) {
        image(assets.buttons.pencil, width - 120, height - 180, 50, 50);
      }
      
      // Draw eraser button
      if (assets.buttons.eraser) {
        image(assets.buttons.eraser, width - 120, height - 120, 50, 50);
      }
      
      // Draw check mark if user has drawn something and drink is empty
      if (hasUserDrawn() && drinkState === "empty" && assets.buttons.check) {
        miniGame2CheckVisible = true;
        image(assets.buttons.check, width - 80, height - 80, 60, 60);
      } else {
        miniGame2CheckVisible = false;
      }
    }
  }
}

// Handle mouse clicks in mini game 2
function handleMiniGame2Clicks() {
  // Only process clicks in drawing phase
  if (!miniGame2VideoEnded || miniGame2Completed) return;
  
  // Check for pencil button click
  if (mouseX >= width - 120 && mouseX <= width - 70 &&
      mouseY >= height - 180 && mouseY <= height - 130) {
    setDrawingMode(true);
    if (assets.clickSound) {
      assets.clickSound.play();
    }
  }
  
  // Check for eraser button click
  else if (mouseX >= width - 120 && mouseX <= width - 70 &&
           mouseY >= height - 120 && mouseY <= height - 70) {
    setDrawingMode(false);
    if (assets.clickSound) {
      assets.clickSound.play();
    }
  }
  
  // Check for drink click
  else if (mouseX >= drinkX && mouseX <= drinkX + 120 &&
           mouseY >= drinkY && mouseY <= drinkY + 120) {
    
    // Cycle through drink states
    if (drinkState === "full") {
      drinkState = "mid";
      decreaseAnxiety(1); // Decrease anxiety according to PDF
    } else if (drinkState === "mid") {
      drinkState = "empty";
      decreaseAnxiety(1); // Decrease anxiety according to PDF
    }
    
    if (assets.clickSound) {
      assets.clickSound.play();
    }
  }
  
  // Check for check mark button click
  else if (miniGame2CheckVisible &&
           mouseX >= width - 80 && mouseX <= width - 20 &&
           mouseY >= height - 80 && mouseY <= height - 20) {
    
    // Save the drawing
    miniGame2SavedDrawing = saveDrawingData();
    miniGame2Completed = true;
    miniGame2DrawingActive = false;
    
    // Play the end video
    const tableNum = getSelectedTable();
    if (assets.videos && assets.videos.miniGame && assets.videos.miniGame[`mini2T${tableNum}End`]) {
      assets.videos.miniGame[`mini2T${tableNum}End`].play();
    }
    
    if (assets.clickSound) {
      assets.clickSound.play();
    }
    
    console.log("Mini game 2 completed");
  }
}

// Handle mouse drag for drawing in mini game 2
function handleMiniGame2MouseDrag() {
  if (miniGame2DrawingActive) {
    handleCanvasDrag();
  }
}

// Handle mouse release in mini game 2
function handleMiniGame2MouseRelease() {
  if (miniGame2DrawingActive) {
    handleCanvasMouseRelease();
  }
}

// Export functions that need to be accessible to other modules
window.initMiniGame2 = initMiniGame2;
window.drawMiniGame2 = drawMiniGame2;
window.handleMiniGame2Clicks = handleMiniGame2Clicks;
window.handleMiniGame2MouseDrag = handleMiniGame2MouseDrag;
window.handleMiniGame2MouseRelease = handleMiniGame2MouseRelease;

// Export the saved drawing for later mini games
window.getMiniGame2SavedDrawing = function() {
  return miniGame2SavedDrawing;
};