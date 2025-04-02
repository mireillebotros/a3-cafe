// assetLoader.js - Handles loading all game assets

// Arrays to track loading progress
let totalAssets = 0;
let loadedAssets = 0;
let loadingErrors = [];

// Create assets object structure
const assets = {
  videos: {
    intro: {},
    tableSelect: {},
    table1: {},
    table2: {},
    table3: {},
    miniGame: {},
    meowchi: {},
    pete: {},
    end: {}
  },
  buttons: {},
  items: {},
  miniGameBgs: {},
  anxietyMeter: [],
  tableAudio: {},
  toolSounds: {},
  alerts: {}
};

// Function to load all game assets
function loadGameAssets() {
  return new Promise((resolve, reject) => {
    try {
      console.log("Starting asset loading process...");
      
      // Reset counters
      totalAssets = 0;
      loadedAssets = 0;
      loadingErrors = [];
      
      // Start loading audio
      loadAudioAssets();
      
      // Start loading images
      loadImageAssets();
      
      // Start loading videos
      loadVideoAssets();
      
      // Set a callback for when all assets are loaded
      const checkAllLoaded = setInterval(() => {
        if (loadedAssets >= totalAssets) {
          clearInterval(checkAllLoaded);
          console.log(`All assets loaded successfully: ${loadedAssets}/${totalAssets}`);
          
          // Assign to global assets
          window.assets = assets;
          
          if (loadingErrors.length > 0) {
            console.warn(`Loading completed with ${loadingErrors.length} errors:`, loadingErrors);
          }
          
          resolve(assets);
        }
      }, 100);
      
      // Set a timeout in case loading takes too long
      setTimeout(() => {
        if (loadedAssets < totalAssets) {
          const errorMsg = `Loading timed out. Loaded ${loadedAssets}/${totalAssets} assets.`;
          console.warn(errorMsg, loadingErrors);
          
          // Continue with partially loaded assets rather than rejecting
          window.assets = assets;
          console.warn("Continuing with partially loaded assets");
          resolve(assets);
        }
      }, 20000); // 20 second timeout
      
    } catch (error) {
      console.error("Error in asset loading:", error);
      // Continue with partial assets instead of rejecting
      window.assets = assets;
      console.warn("Continuing despite asset loading error");
      resolve(assets);
    }
  });
}

// Load all audio assets
function loadAudioAssets() {
  console.log("Loading audio assets...");
  
  // Background music
  safeSoundLoad('constant_audio.mp3', 
    soundFile => {
      assets.backgroundMusic = soundFile;
      assetLoaded("backgroundMusic");
    }
  );
  
  // UI sounds
  safeSoundLoad('B_pressed.mp3', 
    soundFile => {
      assets.buttonPressSound = soundFile;
      assetLoaded("buttonPressSound");
    }
  );
  
  // Tool sounds
  assets.toolSounds = {};
  safeSoundLoad('pencil.mp3', 
    soundFile => {
      assets.toolSounds.pencil = soundFile;
      assetLoaded("toolSounds.pencil");
    }
  );
  
  safeSoundLoad('eraser.mp3', 
    soundFile => {
      assets.toolSounds.eraser = soundFile;
      assetLoaded("toolSounds.eraser");
    }
  );
  
  // Table audio
  assets.tableAudio = {};
  for (let i = 1; i <= 3; i++) {
    safeSoundLoad(`mini_T${i}.mp3`, 
      soundFile => {
        assets.tableAudio[`mini_T${i}`] = soundFile;
        assetLoaded(`tableAudio.mini_T${i}`);
      }
    );
  }
}

// Safely load a sound file with error handling
function safeSoundLoad(filename, successCallback) {
  totalAssets++;
  
  try {
    loadSound(
      filename, 
      soundFile => {
        if (successCallback) successCallback(soundFile);
      }, 
      error => {
        handleLoadError(filename, error);
        // Create a placeholder sound object
        const emptySound = new p5.SoundFile();
        if (successCallback) successCallback(emptySound);
      }
    );
  } catch (error) {
    handleLoadError(filename, error);
    // Create a placeholder sound object
    const emptySound = new p5.SoundFile();
    if (successCallback) successCallback(emptySound);
    assetLoaded(filename); // Mark as loaded anyway
  }
}

// Load all image assets
function loadImageAssets() {
  console.log("Loading image assets...");
  
  // Anxiety meter images
  assets.anxietyMeter = [];
  for (let i = 0; i <= 10; i++) {
    safeImageLoad(`AL_${i}.png`, 
      img => {
        assets.anxietyMeter[i] = img;
        assetLoaded(`anxietyMeter[${i}]`);
      }
    );
  }
  
  // Alert images
  assets.alerts = {};
  const alertImages = {
    'sureQuit': 'A_surequit.png'
  };
  
  Object.entries(alertImages).forEach(([key, filename]) => {
    safeImageLoad(filename, 
      img => {
        assets.alerts[key] = img;
        assetLoaded(`alerts.${key}`);
      }
    );
  });
  
  // Button images
  const buttonImages = {
    'pencil': 'B_pencil.png',
    'eraser': 'B_eraser.png',
    'check': 'mini_check.png',
    'lookAtOtherTables': 'look at other tables.png',
    'pickThisTable1': 'Pick this table 1.png',
    'pickThisTable2': 'Pick this table 2.png',
    'pickThisTable3': 'Pick this table 3.png',
    'tryAgain': 'B_tryagain.png',
    'tryAgainTomorrow': 'B_tryagain.tmr.png',
    'quit': 'B_quit.png',
    'yesQuit': 'B_yesquit.png',
    'noQuit': 'B_noquit.png',
    'playAgain': 'B_playagain.png',
    'yes': 'M_YES.png',
    'no': 'M_NO.png',
    'M_R1.1': 'M_R1.1.png',
    'M_R2.1': 'M_R2.1.png',
    'M_R2.2': 'M_R2.2.png',
    'M_R2.3': 'M_R2.3.png',
    'M_R3.1': 'M_R3.1.png',
    'M_R3.2': 'M_R3.2.png',
    'M_R4.1': 'M_R4.1.png',
    'M_R4.2': 'M_R4.2.png',
    'M_R5.1': 'M_R5.1.png',
    'M_R5.2': 'M_R5.2.png',
    'M_R5.3': 'M_R5.3.png',
    'M_R6': 'M_R6.png',
    'M_R6.Blank': 'M_R6.Blank.png',
    'P_R1.1': 'P_R1.1.png',
    'P_YES': 'P_YES.png',
    'P_NO': 'P_NO.png',
    'P_R3.1': 'P_R3.1.png',
    'P_R3.2': 'P_R3.2.png',
    'P_R3.3': 'P_R3.3.png',
    'P_R4.2': 'P_R4.2.png',
    'P_R4.Blank': 'P_R4.Blank.png',
    'R_YES': 'R_YES.png',
    'R_NO': 'R_NO.png'
  };
  
  assets.buttons = {};
  Object.entries(buttonImages).forEach(([key, filename]) => {
    safeImageLoad(filename, 
      img => {
        assets.buttons[key] = img;
        assetLoaded(`buttons.${key}`);
      }
    );
  });
  
  // Consumption item images
  const itemImages = {
    'drinkFull': 'D_full.png',
    'drinkMid': 'D_mid.png',
    'drinkEmpty': 'D_empty.png',
    'snackFull': 'S_full.png',
    'snackOneBite': 'S_onebite.png',
    'snackHalf': 'S_half.png',
    'snackCrumbs': 'S_crumbs.png'
  };
  
  assets.items = {};
  Object.entries(itemImages).forEach(([key, filename]) => {
    safeImageLoad(filename, 
      img => {
        assets.items[key] = img;
        assetLoaded(`items.${key}`);
      }
    );
  });
  
  // Background images for mini games
  const miniGameBgs = {
    'miniT1': 'mini_T1.png',
    'miniT2': 'mini_T2.png',
    'miniT3': 'mini_T3.png'
  };
  
  assets.miniGameBgs = {};
  Object.entries(miniGameBgs).forEach(([key, filename]) => {
    safeImageLoad(filename, 
      img => {
        assets.miniGameBgs[key] = img;
        assetLoaded(`miniGameBgs.${key}`);
      }
    );
  });
}

// Safely load an image with error handling
function safeImageLoad(filename, successCallback) {
  totalAssets++;
  
  try {
    loadImage(
      filename,
      img => {
        if (successCallback) successCallback(img);
      },
      error => {
        handleLoadError(filename, error);
        // Create a placeholder transparent image
        const placeholderImg = createImage(100, 100);
        placeholderImg.loadPixels();
        for (let i = 0; i < placeholderImg.width; i++) {
          for (let j = 0; j < placeholderImg.height; j++) {
            placeholderImg.set(i, j, color(0, 0, 0, 0));
          }
        }
        placeholderImg.updatePixels();
        if (successCallback) successCallback(placeholderImg);
      }
    );
  } catch (error) {
    handleLoadError(filename, error);
    // Create a placeholder transparent image
    const placeholderImg = createImage(100, 100);
    placeholderImg.loadPixels();
    for (let i = 0; i < placeholderImg.width; i++) {
      for (let j = 0; j < placeholderImg.height; j++) {
        placeholderImg.set(i, j, color(0, 0, 0, 0));
      }
    }
    placeholderImg.updatePixels();
    if (successCallback) successCallback(placeholderImg);
    assetLoaded(filename); // Mark as loaded anyway
  }
}

// Load all video assets
function loadVideoAssets() {
  console.log("Loading video assets...");
  
  // Intro videos
  safeVideoLoad('BG_startVID.mp4', assets.videos.intro, 'startVid');
  safeVideoLoad('BG_enterToStart.mp4', assets.videos.intro, 'enterToStart');
  safeVideoLoad('BG_introVID.mp4', assets.videos.intro, 'intro');
  
  // Table selection videos
  safeVideoLoad('select table.mp4', assets.videos, 'tableSelect');
  
  // Table 1 videos
  safeVideoLoad('table 1 trans.mp4', assets.videos.table1, 'transition');
  safeVideoLoad('table 1 quit trans.mp4', assets.videos.table1, 'quitTransition');
  safeVideoLoad('table 1 picked trans.mp4', assets.videos.table1, 'pickTransition');
  safeVideoLoad('t1.mp4', assets.videos.table1, 'loop');
  
  // Table 2 videos
  safeVideoLoad('table 2 trans.mp4', assets.videos.table2, 'transition');
  safeVideoLoad('table 2 quit trans.mp4', assets.videos.table2, 'quitTransition');
  safeVideoLoad('table 2 picked trans.mp4', assets.videos.table2, 'pickTransition');
  safeVideoLoad('t2.mp4', assets.videos.table2, 'loop');
  
  // Table 3 videos
  safeVideoLoad('table 3 trans.mp4', assets.videos.table3, 'transition');
  safeVideoLoad('table 3 quit trans.mp4', assets.videos.table3, 'quitTransition');
  safeVideoLoad('table 3 picked trans.mp4', assets.videos.table3, 'pickTransition');
  safeVideoLoad('t3.mp4', assets.videos.table3, 'loop');
  
  // Mini game videos
  const miniGameVideos = [
    // Table videos
    { filename: 'mini_T1.mp4', key: 'mini_T1' },
    { filename: 'mini_T2.mp4', key: 'mini_T2' },
    { filename: 'mini_T3.mp4', key: 'mini_T3' },
    
    // Mini game 1 videos
    { filename: 'mini1_T1.mp4', key: 'mini1_T1' },
    { filename: 'mini1_T2.mp4', key: 'mini1_T2' },
    { filename: 'mini1_T3.mp4', key: 'mini1_T3' },
    { filename: 'mini1_T1.END.mp4', key: 'mini1_T1END' },
    { filename: 'mini1_T2.END.mp4', key: 'mini1_T2END' },
    { filename: 'mini1_T3.END.mp4', key: 'mini1_T3END' },
    { filename: 'mini1_thought.mp4', key: 'mini1_thought' },
    
    // Mini game 2 videos
    { filename: 'mini2_T1.mp4', key: 'mini2_T1' },
    { filename: 'mini2_T2.mp4', key: 'mini2_T2' },
    { filename: 'mini2_T3.mp4', key: 'mini2_T3' },
    { filename: 'mini2_T1draw.mp4', key: 'mini2_T1draw' },
    { filename: 'mini2_T2draw.mp4', key: 'mini2_T2draw' },
    { filename: 'mini2_T3draw.mp4', key: 'mini2_T3draw' },
    { filename: 'mini2_T1.END.mp4', key: 'mini2_T1END' },
    { filename: 'mini2_T2.END.mp4', key: 'mini2_T2END' },
    { filename: 'mini2_T3.END.mp4', key: 'mini2_T3END' },
    { filename: 'mini2_ENDthought.mp4', key: 'mini2_ENDthought' }
  ];
  
  miniGameVideos.forEach(({filename, key}) => {
    safeVideoLoad(filename, assets.videos.miniGame, key);
  });
  
  // Meowchi videos
  const meowchiVideos = [
    { filename: 'M_Q1.mp4', key: 'M_Q1.mp4' },
    { filename: 'M_Q2.mp4', key: 'M_Q2.mp4' },
    { filename: 'M_Q3.mp4', key: 'M_Q3.mp4' },
    { filename: 'M_Q4.1.mp4', key: 'M_Q4.1.mp4' },
    { filename: 'M_Q4.2.mp4', key: 'M_Q4.2.mp4' },
    { filename: 'M_Q5.mp4', key: 'M_Q5.mp4' },
    { filename: 'M_Q5.1.mp4', key: 'M_Q5.1.mp4' },
    { filename: 'M_Q5.2.mp4', key: 'M_Q5.2.mp4' },
    { filename: 'M_Q6.mp4', key: 'M_Q6.mp4' },
    { filename: 'M_Q7.1.mp4', key: 'M_Q7.1.mp4' },
    { filename: 'M_Q7.2.mp4', key: 'M_Q7.2.mp4' },
    { filename: 'M_Q7.3.mp4', key: 'M_Q7.3.mp4' },
    { filename: 'M_Q8.mp4', key: 'M_Q8.mp4' },
    { filename: 'SB_T1.mp4', key: 'SB_T1.mp4' },
    { filename: 'SB_T2.mp4', key: 'SB_T2.mp4' },
    { filename: 'SB_T3.mp4', key: 'SB_T3.mp4' },
    { filename: 'SB_thought.mp4', key: 'SB_thought.mp4' },
    { filename: 'SB_thought2.mp4', key: 'SB_thought2.mp4' }
  ];
  
  meowchiVideos.forEach(({filename, key}) => {
    safeVideoLoad(filename, assets.videos.meowchi, key);
  });
  
  // Pete videos
  const peteVideos = [
    { filename: 'P_Q1.mp4', key: 'P_Q1.mp4' },
    { filename: 'P_Q1.1.mp4', key: 'P_Q1.1.mp4' },
    { filename: 'P_Q1.2.mp4', key: 'P_Q1.2.mp4' },
    { filename: 'P_Q3.mp4', key: 'P_Q3.mp4' },
    { filename: 'P_Q3.R2.mp4', key: 'P_Q3.R2.mp4' },
    { filename: 'P_Q4.mp4', key: 'P_Q4.mp4' },
    { filename: 'P_Q5.1.mp4', key: 'P_Q5.1.mp4' },
    { filename: 'P_Q5.2.mp4', key: 'P_Q5.2.mp4' },
    { filename: 'P_Q5.3.mp4', key: 'P_Q5.3.mp4' },
    { filename: 'P_Q5.4.mp4', key: 'P_Q5.4.mp4' },
    { filename: 'P_Q6.mp4', key: 'P_Q6.mp4' }
  ];
  
  peteVideos.forEach(({filename, key}) => {
    safeVideoLoad(filename, assets.videos.pete, key);
  });
  
  // End screen videos
  const endVideos = [
    { filename: 'BG_endScreenWIN.mp4', key: 'success' },
    { filename: 'BG_endScreenDEAD.mp4', key: 'gameOver' },
    { filename: 'nextday.mp4', key: 'nextDay' },
    { filename: 'END_thought.mp4', key: 'thought' },
    { filename: 'END_T1.mp4', key: 'end_T1' },
    { filename: 'END_T2.mp4', key: 'end_T2' },
    { filename: 'END_T3.mp4', key: 'end_T3' }
  ];
  
  endVideos.forEach(({filename, key}) => {
    safeVideoLoad(filename, assets.videos.end, key);
  });
}

// Safely load a video with error handling
function safeVideoLoad(filename, container, key) {
  totalAssets++;
  
  try {
    // Create video element
    const video = createVideo([filename]);
    
    // Set up event handlers
    video.elt.oncanplaythrough = () => {
      assetLoaded(`video.${key}`);
    };
    
    video.hide(); // Hide video element by default
    container[key] = video;
    
    // Handle video load errors
    video.elt.onerror = (e) => {
      handleLoadError(filename, new Error(`Video error: ${e.message || 'Unknown error'}`));
      // Create a placeholder video to prevent errors
      createPlaceholderVideo(container, key);
      assetLoaded(`video.${key}`);
    };
    
    // Add timeout to handle stalled loading
    setTimeout(() => {
      if (video.elt.readyState === 0) {
        console.warn(`Video loading timeout for: ${filename}`);
        createPlaceholderVideo(container, key);
        assetLoaded(`video.${key}`);
      }
    }, 10000);
    
  } catch (error) {
    handleLoadError(filename, error);
    // Create a placeholder video to prevent errors
    createPlaceholderVideo(container, key);
    assetLoaded(`video.${key}`); // Still mark as loaded
  }
}

// Create a placeholder video for missing videos
function createPlaceholderVideo(container, key) {
  console.warn(`Creating placeholder for missing video: ${key}`);
  
  // Create a minimal mock video object
  container[key] = {
    play: function() { 
      console.log(`Placeholder video playing: ${key}`);
      setTimeout(() => {
        if (this.onendedCallback) this.onendedCallback();
      }, 500);
    },
    stop: function() {},
    loop: function() {},
    noLoop: function() {},
    hide: function() {},
    onended: function(callback) { 
      this.onendedCallback = callback; 
    },
    time: function() { return 0; },
    duration: function() { return 1; }
  };
}

// Mark an asset as loaded
function assetLoaded(assetName) {
  loadedAssets++;
  
  // Calculate loading progress (0-100%)
  const progress = Math.floor((loadedAssets / totalAssets) * 100);
  
  // Use console group to keep console clean
  if (progress % 10 === 0 || loadedAssets === totalAssets) {
    console.log(`Loading progress: ${progress}% (${loadedAssets}/${totalAssets}) - Last: ${assetName}`);
  }
  
  // Update loading progress in window for the loading screen
  window.loadedAssets = loadedAssets;
  window.totalAssets = totalAssets;
}

// Handle load errors
function handleLoadError(assetName, error) {
  console.error(`Failed to load asset: ${assetName}`, error);
  
  // Keep track of errors
  loadingErrors.push({ asset: assetName, error: error.message || 'Unknown error' });
  
  // Still count it as "loaded" to prevent hanging
  assetLoaded(assetName);
}

// Export functions to be accessible to other modules
window.loadGameAssets = loadGameAssets;
window.assets = assets; // Make assets available globally
window.loadedAssets = loadedAssets;
window.totalAssets = totalAssets;