// miniGame3.js - Handles the third drawing mini-game with snack interaction

// State variables for mini game 3
let miniGame3VideoStarted = false;
let miniGame3Completed = false;
let miniGame3VideoEnded = false;
let miniGame3DrawingActive = false;
let miniGame3SavedDrawing = null;
let miniGame3CheckVisible = false;
let snackState = "full"; // full, oneBite, half, crumbs
let snackX = 0;
let snackY = 0;

// Initialize mini game 3
function initMiniGame3() {
  console.log("Initializing mini game 3");
  miniGame3VideoStarted = false;
  miniGame3Completed = false;
  miniGame3VideoEnded = false;
  miniGame3DrawingActive = false;
  miniGame3CheckVisible = false;
  snackState = "full";
  
  // Set snack position (top of screen)
  snackX = width / 2 - 60;
  snackY = 100;
  
  // Register state callbacks
  registerStateCallbacks(GAME_STATES.MINI_GAME_3, {
    init: setupMiniGame3,
    cleanup: cleanupMiniGame3,
    videoComplete: handleMiniGame3VideoComplete
  });
  
  // Setup mini game 3
  setupMiniGame3();
}

// Setup mini game 3
function setupMiniGame3() {
  const tableNum = getSelectedTable();
  if (!tableNum || tableNum < 1 || tableNum > 3) {
    console.error("Invalid table number for mini game 3");
    return;
  }
  
  // Setup drawing canvas with the same dimensions as previous mini games
  setupDrawingCanvas({ x: 380, y: 220, width: 520, height: 320 });
  
  // Load the saved drawing from mini game 2 if available
  if (window.getMiniGame2SavedDrawing) {
    miniGame3SavedDrawing = window.getMiniGame2SavedDrawing();
    if (miniGame3SavedDrawing) {
      loadDrawingData(miniGame3SavedDrawing);
    }
  }
  
  if (!miniGame3VideoStarted && assets.videos && assets.videos.miniGame) {
    const videoKey = `mini3T${tableNum}`;
    
    if (assets.videos.miniGame[videoKey]) {
      assets.videos.miniGame[videoKey].onended(() => {
        miniGame3VideoEnded = true;
        miniGame3DrawingActive = true;
        handleMiniGame3VideoComplete(videoKey);
      });
      
      // Play mini game video
      assets.videos.miniGame[videoKey].play();
      miniGame3VideoStarted = true;
      console.log(`Mini game 3 video started playing: ${videoKey}`);
    } else {
      console.warn(`Mini game 3 video asset not found: ${videoKey}`);
    }
  } else {
    console.warn("Mini game 3 video asset not ready or already started");
  }
}

// Clean up mini game 3
function cleanupMiniGame3() {
  const tableNum = getSelectedTable();
  
  // Stop mini game videos
  if (assets.videos && assets.videos.miniGame) {
    const videoKeys = [
      `mini3T${tableNum}`,
      `mini3T${tableNum}End`
    ];
    
    videoKeys.forEach(key => {
      if (assets.videos.miniGame[key]) {
        assets.videos.miniGame[key].stop();
        assets.videos.miniGame[key].hide();
      }
    });
  }
  
  // Save drawing for success screen
  if (hasUserDrawn()) {
    miniGame3SavedDrawing = saveDrawingData();
  }
  
  console.log("Mini game 3 cleaned up");
}

// Handle mini game 3 video completion
function handleMiniGame3VideoComplete(videoId) {
  console.log(`Mini game 3 video completed: ${videoId}`);
  
  const tableNum = getSelectedTable();
  
  // Handle intro video completion
  if (videoId === `mini3T${tableNum}`) {
    // Show static background for drawing
    miniGame3VideoEnded = true;
    miniGame3DrawingActive = true;
  }
  // Handle end video completion
  else if (videoId === `mini3T${tableNum}End`) {
    // Transition to success state
    transitionToState(GAME_STATES.SUCCESS);
  }
}

// Draw function for mini game 3
function drawMiniGame3() {
  background(0);
  const tableNum = getSelectedTable();
  
  // Active video playing phase
  if (!miniGame3VideoEnded) {
    if (assets.videos && assets.videos.miniGame && assets.videos.miniGame[`mini3T${tableNum}`]) {
      image(assets.videos.miniGame[`mini3T${tableNum}`], 0, 0, width, height);
    }
  }
  // End video playing phase
  else if (miniGame3Completed) {
    if (assets.videos && assets.videos.miniGame && assets.videos.miniGame[`mini3T${tableNum}End`]) {
      image(assets.videos.miniGame[`mini3T${tableNum}End`], 0, 0, width, height);
      
      // Draw the saved drawing on top of the end video
      if (miniGame3SavedDrawing) {
        image(miniGame3SavedDrawing, 0, 0);
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
    
    // Draw the empty mug from previous mini-game
    if (assets.items && assets.items.drinkEmpty) {
      image(assets.items.drinkEmpty, width - 150, 300, 120, 120);
    }
    
    // Draw the snack with current state
    if (assets.items) {
      let snackImg;
      switch (snackState) {
        case "full":
          snackImg = assets.items.snackFull;
          break;
        case "oneBite":
          snackImg = assets.items.snackOneBite;
          break;
        case "half":
          snackImg = assets.items.snackHalf;
          break;
        case "crumbs":
          snackImg = assets.items.snackCrumbs;
          break;
      }
      
      if (snackImg) {
        image(snackImg, snackX, snackY, 120, 120);
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
      
      // Draw check mark if user has drawn something and snack is at crumbs state
      if (hasUserDrawn() && snackState === "crumbs" && assets.buttons.check) {
        miniGame3CheckVisible = true;
        image(assets.buttons.check, width - 80, height - 80, 60, 60);
      } else {
        miniGame3CheckVisible = false;
      }
    }
  }
}

// Handle mouse clicks in mini game 3
function handleMiniGame3Clicks() {
  // Only process clicks in drawing phase
  if (!miniGame3VideoEnded || miniGame3Completed) return;
  
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
  
  // Check for snack click
  else if (mouseX >= snackX && mouseX <= snackX + 120 &&
           mouseY >= snackY && mouseY <= snackY + 120) {
    
    // Cycle through snack states
    if (snackState === "full") {
      snackState = "oneBite";
      decreaseAnxiety(1); // Decrease anxiety according to PDF
    } else if (snackState === "oneBite") {
      snackState = "half";
      decreaseAnxiety(1); // Decrease anxiety according to PDF
    } else if (snackState === "half") {
      snackState = "crumbs";
      decreaseAnxiety(1); // Decrease anxiety according to PDF
    }
    
    if (assets.clickSound) {
      assets.clickSound.play();
    }
  }
  
  // Check for check mark button click
  else if (miniGame3CheckVisible &&
           mouseX >= width - 80 && mouseX <= width - 20 &&
           mouseY >= height - 80 && mouseY <= height - 20) {
    
    // Save the drawing
    miniGame3SavedDrawing = saveDrawingData();
    miniGame3Completed = true;
    miniGame3DrawingActive = false;
    
    // Apply anxiety decrease for completing the game
    decreaseAnxiety(2); // Additional anxiety reduction according to PDFs (-2/-4)
    
    // Play the end video
    const tableNum = getSelectedTable();
    if (assets.videos && assets.videos.miniGame && assets.videos.miniGame[`mini3T${tableNum}End`]) {
      assets.videos.miniGame[`mini3T${tableNum}End`].play();
    }
    
    if (assets.clickSound) {
      assets.clickSound.play();
    }
    
    console.log("Mini game 3 completed");
  }
}

// Handle mouse drag for drawing in mini game 3
function handleMiniGame3MouseDrag() {
  if (miniGame3DrawingActive) {
    handleCanvasDrag();
  }
}

// Handle mouse release in mini game 3
function handleMiniGame3MouseRelease() {
  if (miniGame3DrawingActive) {
    handleCanvasMouseRelease();
  }
}

// Export functions that need to be accessible to other modules
window.initMiniGame3 = initMiniGame3;
window.drawMiniGame3 = drawMiniGame3;
window.handleMiniGame3Clicks = handleMiniGame3Clicks;
window.handleMiniGame3MouseDrag = handleMiniGame3MouseDrag;
window.handleMiniGame3MouseRelease = handleMiniGame3MouseRelease;

// Export the saved drawing for the success screen
window.getMiniGame3SavedDrawing = function() {
  return miniGame3SavedDrawing;
};