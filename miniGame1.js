// miniGame1.js - Handles the first drawing mini-game

// State variables for mini game 1
let miniGame1VideoStarted = false;
let miniGame1Completed = false;
let miniGame1VideoEnded = false;
let miniGame1DrawingActive = false;
let miniGame1SavedDrawing = null;
let miniGame1CheckVisible = false;
let miniGame1ThoughtPlayed = false;

// Initialize mini game 1
function initMiniGame1() {
  console.log("Initializing mini game 1");
  miniGame1VideoStarted = false;
  miniGame1Completed = false;
  miniGame1VideoEnded = false;
  miniGame1DrawingActive = false;
  miniGame1CheckVisible = false;
  miniGame1ThoughtPlayed = false;
  
  // Register state callbacks
  registerStateCallbacks(GAME_STATES.MINI_GAME_1, {
    init: setupMiniGame1,
    cleanup: cleanupMiniGame1,
    videoComplete: handleMiniGame1VideoComplete
  });
  
  // Setup mini game 1
  setupMiniGame1();
}

// Setup mini game 1
function setupMiniGame1() {
  const tableNum = getSelectedTable();
  if (!tableNum || tableNum < 1 || tableNum > 3) {
    console.error("Invalid table number for mini game 1");
    return;
  }
  
  // Setup drawing canvas
  setupDrawingCanvas({ x: 380, y: 220, width: 520, height: 320 });
  
  if (!miniGame1VideoStarted && assets.videos && assets.videos.miniGame) {
    const videoKey = `mini1_T${tableNum}`;
    
    if (assets.videos.miniGame[videoKey]) {
      assets.videos.miniGame[videoKey].onended(() => {
        miniGame1VideoEnded = true;
        miniGame1DrawingActive = true;
        handleMiniGame1VideoComplete(videoKey);
      });
      
      // Play mini game video
      assets.videos.miniGame[videoKey].play();
      miniGame1VideoStarted = true;
      console.log(`Mini game 1 video started playing: ${videoKey}`);
    } else {
      console.warn(`Mini game 1 video asset not found: ${videoKey}`);
    }
  } else {
    console.warn("Mini game 1 video asset not ready or already started");
  }
}

// Clean up mini game 1
function cleanupMiniGame1() {
  const tableNum = getSelectedTable();
  
  // Stop all mini game 1 videos
  if (assets.videos && assets.videos.miniGame) {
    const videoKeys = [
      `mini1_T${tableNum}`,
      `mini1_T${tableNum}END`,
      'mini1_thought',
      `mini_T${tableNum}`
    ];
    
    videoKeys.forEach(key => {
      if (assets.videos.miniGame[key]) {
        assets.videos.miniGame[key].stop();
        assets.videos.miniGame[key].hide();
      }
    });
  }
  
  // Stop table audio
  if (assets.tableAudio && assets.tableAudio[`mini_T${tableNum}`]) {
    assets.tableAudio[`mini_T${tableNum}`].stop();
  }
  
  // Save drawing for later mini games
  if (hasUserDrawn()) {
    miniGame1SavedDrawing = saveDrawingData();
  }
  
  console.log("Mini game 1 cleaned up");
}

// Handle mini game 1 video completion
function handleMiniGame1VideoComplete(videoId) {
  console.log(`Mini game 1 video completed: ${videoId}`);
  
  const tableNum = getSelectedTable();
  
  // Handle intro video completion
  if (videoId === `mini1_T${tableNum}`) {
    // Show drawing background video
    miniGame1VideoEnded = true;
    miniGame1DrawingActive = true;
    
    // Loop the background video
    if (assets.videos.miniGame[`mini_T${tableNum}`]) {
      assets.videos.miniGame[`mini_T${tableNum}`].loop();
    }
    
    // Play the corresponding table audio
    if (assets.tableAudio && assets.tableAudio[`mini_T${tableNum}`]) {
      assets.tableAudio[`mini_T${tableNum}`].loop();
    }
  }
  // Handle thought bubble video completion
  else if (videoId === 'mini1_thought' && !miniGame1ThoughtPlayed) {
    miniGame1ThoughtPlayed = true;
    
    // Play end video after thought bubble
    if (assets.videos.miniGame[`mini1_T${tableNum}END`]) {
      assets.videos.miniGame[`mini1_T${tableNum}END`].play();
      assets.videos.miniGame[`mini1_T${tableNum}END`].onended(() => {
        // Transition to next state
        transitionToState(GAME_STATES.ORDER_DRINK);
      });
    }
  }
  // Handle end video completion
  else if (videoId === `mini1_T${tableNum}END`) {
    // Transition to next state
    transitionToState(GAME_STATES.ORDER_DRINK);
  }
}

// Draw function for mini game 1
function drawMiniGame1() {
  background(0);
  const tableNum = getSelectedTable();
  
  // Active video playing phase
  if (!miniGame1VideoEnded) {
    if (assets.videos && assets.videos.miniGame && assets.videos.miniGame[`mini1_T${tableNum}`]) {
      image(assets.videos.miniGame[`mini1_T${tableNum}`], 0, 0, width, height);
    }
  }
  // End video playing phase
  else if (miniGame1Completed) {
    if (!miniGame1ThoughtPlayed) {
      // Draw thought bubble video first
      if (assets.videos && assets.videos.miniGame && assets.videos.miniGame.mini1_thought) {
        image(assets.videos.miniGame.mini1_thought, 0, 0, width, height);
        
        // If thought bubble video ends, move to end video
        if (assets.videos.miniGame.mini1_thought.time() >= assets.videos.miniGame.mini1_thought.duration() - 0.1) {
          handleMiniGame1VideoComplete('mini1_thought');
        }
      }
    } else {
      // Draw the end video
      if (assets.videos && assets.videos.miniGame && assets.videos.miniGame[`mini1_T${tableNum}END`]) {
        image(assets.videos.miniGame[`mini1_T${tableNum}END`], 0, 0, width, height);
        
        // Draw the saved drawing on top of the end video
        if (miniGame1SavedDrawing) {
          image(miniGame1SavedDrawing, 0, 0);
        }
      }
    }
  }
  // Interactive drawing phase
  else {
    // Draw background video (now a video instead of an image)
    if (assets.videos && assets.videos.miniGame && assets.videos.miniGame[`mini_T${tableNum}`]) {
      image(assets.videos.miniGame[`mini_T${tableNum}`], 0, 0, width, height);
    }
    
    // Draw the canvas content
    drawCanvas();
    
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
      
      // Draw check mark if user has drawn something
      if (hasUserDrawn() && assets.buttons.check) {
        miniGame1CheckVisible = true;
        image(assets.buttons.check, width - 80, height - 80, 60, 60);
      } else {
        miniGame1CheckVisible = false;
      }
    }
  }
}

// Handle mouse clicks in mini game 1
function handleMiniGame1Clicks() {
  // Only process clicks in drawing phase
  if (!miniGame1VideoEnded || miniGame1Completed) return;
  
  // Check for pencil button click
  if (mouseX >= width - 120 && mouseX <= width - 70 &&
      mouseY >= height - 180 && mouseY <= height - 130) {
    setDrawingMode(true);
    
    // Play pencil sound
    if (assets.toolSounds && assets.toolSounds.pencil) {
      assets.toolSounds.pencil.play();
    }
    
    if (assets.buttonPressSound) {
      assets.buttonPressSound.play();
    }
  }
  
  // Check for eraser button click
  else if (mouseX >= width - 120 && mouseX <= width - 70 &&
           mouseY >= height - 120 && mouseY <= height - 70) {
    setDrawingMode(false);
    
    // Play eraser sound
    if (assets.toolSounds && assets.toolSounds.eraser) {
      assets.toolSounds.eraser.play();
    }
    
    if (assets.buttonPressSound) {
      assets.buttonPressSound.play();
    }
  }
  
  // Check for check mark button click
  else if (miniGame1CheckVisible &&
           mouseX >= width - 80 && mouseX <= width - 20 &&
           mouseY >= height - 80 && mouseY <= height - 20) {
    
    // Save the drawing
    miniGame1SavedDrawing = saveDrawingData();
    miniGame1Completed = true;
    miniGame1DrawingActive = false;
    
    // Stop looping background video
    const tableNum = getSelectedTable();
    if (assets.videos && assets.videos.miniGame && assets.videos.miniGame[`mini_T${tableNum}`]) {
      assets.videos.miniGame[`mini_T${tableNum}`].stop();
    }
    
    // Stop table audio
    if (assets.tableAudio && assets.tableAudio[`mini_T${tableNum}`]) {
      assets.tableAudio[`mini_T${tableNum}`].stop();
    }
    
    // Play the thought bubble video first
    if (assets.videos && assets.videos.miniGame && assets.videos.miniGame.mini1_thought) {
      assets.videos.miniGame.mini1_thought.play();
    } else {
      // If no thought bubble video, go straight to end video
      if (assets.videos && assets.videos.miniGame && assets.videos.miniGame[`mini1_T${tableNum}END`]) {
        assets.videos.miniGame[`mini1_T${tableNum}END`].play();
      }
    }
    
    if (assets.buttonPressSound) {
      assets.buttonPressSound.play();
    }
    
    console.log("Mini game 1 completed");
  }
}

// Handle mouse drag for drawing in mini game 1
function handleMiniGame1MouseDrag() {
  if (miniGame1DrawingActive) {
    handleCanvasDrag();
  }
}

// Handle mouse release in mini game 1
function handleMiniGame1MouseRelease() {
  if (miniGame1DrawingActive) {
    handleCanvasMouseRelease();
  }
}

// Export functions that need to be accessible to other modules
window.initMiniGame1 = initMiniGame1;
window.drawMiniGame1 = drawMiniGame1;
window.handleMiniGame1Clicks = handleMiniGame1Clicks;
window.handleMiniGame1MouseDrag = handleMiniGame1MouseDrag;
window.handleMiniGame1MouseRelease = handleMiniGame1MouseRelease;

// Export the saved drawing for later mini games
window.getMiniGame1SavedDrawing = function() {
  return miniGame1SavedDrawing;
};