// intro.js - Handles the intro video sequence

// State variables for intro module
let introVideoStarted = false;
let introCompleted = false;

// Initialize the intro sequence
function initIntro() {
  console.log("Initializing intro sequence");
  introVideoStarted = false;
  introCompleted = false;
  
  // Register state callbacks
  registerStateCallbacks(GAME_STATES.INTRO, {
    init: setupIntro,
    cleanup: cleanupIntro,
    videoComplete: handleIntroVideoComplete
  });
  
  // Start playing the intro video
  setupIntro();
}

// Setup the intro video sequence
function setupIntro() {
  if (!introVideoStarted && assets.videos && assets.videos.intro) {
    assets.videos.intro.onended(() => {
      introCompleted = true;
      handleIntroVideoComplete();
    });
    
    // Play intro video
    assets.videos.intro.play();
    introVideoStarted = true;
    console.log("Intro video started playing");
  } else {
    console.warn("Intro video asset not ready or already started");
  }
}

// Clean up the intro sequence
function cleanupIntro() {
  if (assets.videos && assets.videos.intro) {
    assets.videos.intro.stop();
    assets.videos.intro.hide();
  }
  console.log("Intro sequence cleaned up");
}

// Handle completion of intro video
function handleIntroVideoComplete() {
  console.log("Intro video completed");
  if (gameState === GAME_STATES.INTRO) {
    // Transition to table selection
    transitionToState(GAME_STATES.TABLE_SELECT);
  }
}

// Draw function for intro state
function drawIntro() {
  background(0);
  
  // Draw the intro video frame if it's loaded and playing
  if (assets.videos && assets.videos.intro) {
    image(assets.videos.intro, 0, 0, width, height);
  }
  
  // Show skip button or press to continue
  if (introVideoStarted && !introCompleted) {
    fill(255);
    textSize(20);
    textAlign(CENTER, CENTER);
    text("Press ENTER to skip", width - 100, height - 30);
  }
}

// Handle key presses during intro
function handleIntroKeyPress() {
  if (keyCode === ENTER) {
    console.log("Intro sequence skipped by user");
    introCompleted = true;
    
    // Skip to table selection
    transitionToState(GAME_STATES.TABLE_SELECT);
  }
}

// Handle mouse clicks during intro
function handleIntroClicks() {
  // Optional: Add click-to-skip functionality here
}

// Export functions that need to be accessible to other modules
window.initIntro = initIntro;
window.drawIntro = drawIntro;
window.handleIntroKeyPress = handleIntroKeyPress;
window.handleIntroClicks = handleIntroClicks;