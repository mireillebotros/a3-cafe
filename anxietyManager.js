// anxietyManager.js - Handles anxiety level changes and display

// Initialize the anxiety manager
function initAnxietyManager() {
    anxietyLevel = 0;
    console.log("Anxiety manager initialized");
  }
  
  // Increase anxiety by a specific amount
  function increaseAnxiety(amount) {
    // Calculate the previous level for comparison
    const prevLevel = anxietyLevel;
    
    // Increase anxiety and clamp between 0-10
    anxietyLevel = Math.min(anxietyLevel + amount, 10);
    
    // Log the change
    console.log(`Anxiety increased by ${amount}: ${prevLevel} -> ${anxietyLevel}`);
    
    // Apply a visual/audio effect for significant increases
    if (anxietyLevel > prevLevel) {
      playAnxietyChangeEffect(true, anxietyLevel - prevLevel);
    }
    
    // Check if we should transition to game over
    if (anxietyLevel >= 10) {
      transitionToState(GAME_STATES.GAME_OVER);
    }
    
    return anxietyLevel;
  }
  
  // Decrease anxiety by a specific amount
  function decreaseAnxiety(amount) {
    // Calculate the previous level for comparison
    const prevLevel = anxietyLevel;
    
    // Decrease anxiety and clamp between 0-10
    anxietyLevel = Math.max(anxietyLevel - amount, 0);
    
    // Log the change
    console.log(`Anxiety decreased by ${amount}: ${prevLevel} -> ${anxietyLevel}`);
    
    // Apply a visual/audio effect for significant decreases
    if (anxietyLevel < prevLevel) {
      playAnxietyChangeEffect(false, prevLevel - anxietyLevel);
    }
    
    return anxietyLevel;
  }
  
  // Get the current anxiety level
  function getAnxietyLevel() {
    return anxietyLevel;
  }
  
  // Draw the anxiety meter
  function drawAnxietyMeter() {
    if (assets.anxietyMeter && assets.anxietyMeter[anxietyLevel]) {
      // Draw the anxiety meter in the top right corner
      image(
        assets.anxietyMeter[anxietyLevel], 
        width - 200, 
        10, 
        180, 
        50
      );
    } else {
      // Fallback if image isn't loaded
      fill(255);
      textAlign(RIGHT, TOP);
      textSize(16);
      text(`Anxiety: ${anxietyLevel}/10`, width - 20, 20);
    }
  }
  // Anxiety visual effect parameters
let anxietyPulseEffect = null;
let anxietyWarningEffect = null;
let screenShakeEffect = null;

// Play a visual and audio effect when anxiety changes
function playAnxietyChangeEffect(isIncrease, magnitude) {
  // Create visual pulse effect
  anxietyPulseEffect = {
    color: isIncrease ? color(255, 100, 100, 150) : color(100, 255, 100, 150),
    startTime: millis(),
    duration: 500 + (magnitude * 200),
    magnitude: magnitude
  };
  
  // Screen shake for large increases
  if (isIncrease && magnitude >= 2) {
    screenShakeEffect = {
      startTime: millis(),
      duration: 300 + (magnitude * 100),
      intensity: magnitude * 2
    };
    
    // Play anxiety increase sound if available
    if (assets.anxietyUpSound) {
      let volume = map(magnitude, 1, 5, 0.2, 0.7);
      assets.anxietyUpSound.setVolume(volume);
      assets.anxietyUpSound.play();
    }
  } 
  // Play calming sound for decreases
  else if (!isIncrease && magnitude >= 1) {
    if (assets.anxietyDownSound) {
      let volume = map(magnitude, 1, 5, 0.2, 0.5);
      assets.anxietyDownSound.setVolume(volume);
      assets.anxietyDownSound.play();
    }
  }
  
  // Show warning when anxiety is getting high
  if (anxietyLevel >= 8 && anxietyLevel < 10) {
    showAnxietyWarning();
  }
}

// Show warning when anxiety is getting high
function showAnxietyWarning() {
  // Visual warning (screen edge pulse)
  anxietyWarningEffect = {
    startTime: millis(),
    duration: 2000,
    interval: 500 // Pulse interval in ms
  };
  
  // Play warning sound if available
  if (assets.warningSound) {
    assets.warningSound.play();
  }
}

// Draw anxiety effects
function drawAnxietyEffects() {
  // Draw pulse effect
  if (anxietyPulseEffect) {
    const elapsed = millis() - anxietyPulseEffect.startTime;
    if (elapsed < anxietyPulseEffect.duration) {
      // Calculate pulse opacity
      const progress = elapsed / anxietyPulseEffect.duration;
      const opacity = sin(progress * PI) * 255;
      
      // Apply pulse color with fading opacity
      noStroke();
      fill(
        red(anxietyPulseEffect.color),
        green(anxietyPulseEffect.color),
        blue(anxietyPulseEffect.color),
        opacity
      );
      rect(0, 0, width, height);
    } else {
      anxietyPulseEffect = null;
    }
  }
  
  // Draw warning effect
  if (anxietyWarningEffect) {
    const elapsed = millis() - anxietyWarningEffect.startTime;
    if (elapsed < anxietyWarningEffect.duration) {
      // Calculate warning pulse opacity
      const interval = elapsed % anxietyWarningEffect.interval;
      const pulseProgress = interval / anxietyWarningEffect.interval;
      const opacity = sin(pulseProgress * PI) * 100;
      
      // Draw red border around screen
      noFill();
      strokeWeight(20);
      stroke(255, 0, 0, opacity);
      rect(0, 0, width, height);
    } else {
      anxietyWarningEffect = null;
    }
  }
  
  // Apply screen shake effect
  if (screenShakeEffect) {
    const elapsed = millis() - screenShakeEffect.startTime;
    if (elapsed < screenShakeEffect.duration) {
      // Calculate shake intensity
      const progress = elapsed / screenShakeEffect.duration;
      const fadeOut = 1 - progress;
      const intensity = screenShakeEffect.intensity * fadeOut;
      
      // Apply random offset to canvas
      translate(
        random(-intensity, intensity),
        random(-intensity, intensity)
      );
    } else {
      screenShakeEffect = null;
    }
  }
}

// Update draw function to include anxiety effects
window.drawAnxietyEffects = drawAnxietyEffects;

  // Export functions that need to be accessible to other modules
  window.initAnxietyManager = initAnxietyManager;
  window.increaseAnxiety = increaseAnxiety;
  window.decreaseAnxiety = decreaseAnxiety;
  window.getAnxietyLevel = getAnxietyLevel;
  window.drawAnxietyMeter = drawAnxietyMeter;