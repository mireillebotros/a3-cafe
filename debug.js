// debug.js - Add this to your project to help diagnose and fix loading issues

// Enable debug mode
window.debugMode = true;

// Force the game to continue after a timeout
setTimeout(function() {
  console.log("Debug: Force-checking game initialization after timeout");
  
  // Check if we're still in loading state
  if (typeof gameState !== 'undefined' && 
     (gameState === GAME_STATES.LOADING || gameState === "loading")) {
    
    console.log("Game still loading after 15 seconds - checking status");
    
    // Log loading progress
    console.log("Loading progress:", {
      loaded: window.loadedAssets || 0,
      total: window.totalAssets || 0,
      percentage: Math.floor(((window.loadedAssets || 0) / (window.totalAssets || 1)) * 100) + "%"
    });
    
    // If nearly loaded but stuck, force continue
    if (window.loadedAssets > 0 && window.loadedAssets >= window.totalAssets * 0.9) {
      console.log("Debug: Game is 90%+ loaded but stuck - forcing continuation");
      
      // Force assets to window if needed
      if (!window.assets) {
        window.assets = assets || {
          videos: { intro: {}, tableSelect: {}, table1: {}, table2: {}, table3: {}, 
                   miniGame: {}, meowchi: {}, pete: {}, end: {} },
          buttons: {},
          items: {},
          miniGameBgs: {},
          anxietyMeter: Array(11).fill(null),
          tableAudio: {},
          toolSounds: {},
          alerts: {}
        };
      }
      
      // Try to initialize intro
      if (typeof initIntro === 'function') {
        console.log("Debug: Forcing game to start with initIntro()");
        initIntro();
      } else {
        console.error("Debug: Cannot find initIntro function");
        
        // Try direct state transition
        if (typeof transitionToState === 'function') {
          console.log("Debug: Trying direct state transition to intro");
          transitionToState("intro");
        }
      }
    }
  } else {
    console.log("Game is no longer in loading state, no action needed");
  }
}, 15000);  // 15 second timeout

// Add global error handling
window.addEventListener('error', function(e) {
  console.error("Global error:", e.message, "at", e.filename, "line", e.lineno);
  
  // Display error on screen if we're still loading
  if (typeof gameState !== 'undefined' && 
     (gameState === GAME_STATES.LOADING || gameState === "loading")) {
    // Try to show error on screen
    try {
      fill(255, 0, 0);
      textAlign(CENTER, CENTER);
      textSize(16);
      text("Error: " + e.message, width/2, height - 100);
    } catch (err) {
      // Ignore drawing errors
    }
  }
});

// Add mock video creation helper
window.createMockVideo = function(name) {
  console.log(`Creating mock video: ${name}`);
  
  // Create a mock video object
  return {
    play: function() { 
      console.log(`Mock video playing: ${name}`);
      setTimeout(() => {
        if (this.onendedCallback) this.onendedCallback();
      }, 500);
    },
    stop: function() { console.log(`Mock video stopped: ${name}`); },
    loop: function() { console.log(`Mock video looping: ${name}`); },
    noLoop: function() { console.log(`Mock video no loop: ${name}`); },
    hide: function() {},
    onended: function(callback) { this.onendedCallback = callback; },
    time: function() { return 0; },
    duration: function() { return 1; }
  };
};

// Add missing placeholder creation helper
window.insertMissingVideos = function() {
  const expectedVideos = [
    'BG_startVID.mp4', 'BG_enterToStart.mp4', 'BG_introVID.mp4', 'M_Q1.mp4'
  ];
  
  let inserted = 0;
  
  expectedVideos.forEach(name => {
    // Check if it exists in assets structure already
    let exists = false;
    
    try {
      if (window.assets && window.assets.videos) {
        if (name.startsWith('BG_') && window.assets.videos.intro && 
            window.assets.videos.intro[name.replace('BG_', '').replace('.mp4', '')]) {
          exists = true;
        } else if (name.startsWith('M_') && window.assets.videos.meowchi && 
                  window.assets.videos.meowchi[name]) {
          exists = true;
        }
      }
    } catch (e) {
      // Ignore errors checking existence
    }
    
    if (!exists) {
      console.log(`Inserting missing video: ${name}`);
      
      try {
        if (name.startsWith('BG_')) {
          if (!window.assets.videos.intro) window.assets.videos.intro = {};
          window.assets.videos.intro[name.replace('BG_', '').replace('.mp4', '')] = window.createMockVideo(name);
        } else if (name.startsWith('M_')) {
          if (!window.assets.videos.meowchi) window.assets.videos.meowchi = {};
          window.assets.videos.meowchi[name] = window.createMockVideo(name);
        }
        inserted++;
      } catch (e) {
        console.error(`Failed to insert ${name}:`, e);
      }
    }
  });
  
  console.log(`Inserted ${inserted} missing video placeholders`);
};

// Run missing video insertion after a delay
setTimeout(window.insertMissingVideos, 10000);

console.log("Debug helpers loaded successfully");