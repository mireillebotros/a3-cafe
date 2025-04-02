// peteDialog.js - Handles the dialog with Pete for ordering a snack
// Updated with Pixellari font support

// Dialog state variables
let currentPeteDialogState = ""; // Current dialog screen
let peteDialogOptions = []; // Current response options
let peteResponseSelected = false; // Flag to track if a response was selected
let peteInputTextValue = ""; // Value for text input fields
let peteDialogTransitionTimer = 0; // Timer for dialog transitions
let peteDialogAnxietyTimer = 0; // Timer for anxiety changes
let peteDialogVideoEnded = false; // Flag to track if the current video has ended
let peteSnackChoice = ""; // Track which snack was ordered

// Dialog state constants
const PETE_DIALOG_STATES = {
  START: "start",
  Q1: "q1",
  Q1_1: "q1_1",
  Q1_2: "q1_2",
  Q3: "q3",
  Q3_R2: "q3_r2",
  Q4: "q4",
  Q5_1: "q5_1",
  Q5_2: "q5_2",
  Q5_3: "q5_3",
  Q6: "q6",
  DONE: "done"
};

// Response option class for Pete dialog (reused from meowchiDialog.js)
class PeteResponseOption {
  constructor(id, text, imageName, x, y, width, height, nextState, anxietyChange = 0) {
    this.id = id;
    this.text = text;
    this.imageName = imageName;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.nextState = nextState;
    this.anxietyChange = anxietyChange;
    this.isSelectable = true;
  }
  
  draw() {
    // Load and draw the image if available
    if (assets.buttons && assets.buttons[this.imageName]) {
      image(assets.buttons[this.imageName], this.x, this.y, this.width, this.height);
    } else {
      // Fallback to drawing a button with text
      fill(200);
      rect(this.x, this.y, this.width, this.height, 5);
      
      // Use Pixellari font for button text if available
      if (pixellariFont) {
        textFont(pixellariFont);
      }
      
      fill(0);
      textAlign(CENTER, CENTER);
      textSize(16);
      text(this.text, this.x + this.width/2, this.y + this.height/2);
      
      // Reset to default font
      textFont('default');
    }
  }
  
  isMouseOver() {
    return mouseX >= this.x && mouseX <= this.x + this.width && 
           mouseY >= this.y && mouseY <= this.y + this.height;
  }
}

// Text input response option for Pete dialog
class PeteTextInputOption extends PeteResponseOption {
  constructor(id, imageName, x, y, width, height, nextState, anxietyChange = 0, requiredWords = null) {
    super(id, "", imageName, x, y, width, height, nextState, anxietyChange);
    this.isTextInput = true;
    this.requiredWords = requiredWords; // Array of words required in input
    this.showCheckMark = false;
    this.maxLength = 10; // Maximum allowed input length
  }
  
  draw() {
    // Draw input box
    fill(255);
    stroke(0);
    rect(this.x, this.y, this.width, this.height, 5);
    
    // Draw input text with Pixellari font if available
    fill(0);
    textAlign(LEFT, CENTER);
    textSize(18);
    
    if (pixellariFont) {
      textFont(pixellariFont);
    }
    
    text(peteInputTextValue, this.x + 10, this.y + this.height/2);
    
    // Draw blinking cursor if active
    if (frameCount % 60 < 30) {
      // Calculate text width with Pixellari font if available
      let textW;
      if (pixellariFont) {
        textFont(pixellariFont);
        textW = textWidth(peteInputTextValue);
      } else {
        textW = textWidth(peteInputTextValue);
      }
      
      stroke(0);
      line(this.x + 10 + textW, this.y + 10, this.x + 10 + textW, this.y + this.height - 10);
    }
    
    // Reset to default font
    textFont('default');
    
    // Draw check mark if conditions are met
    if (this.showCheckMark && assets.buttons && assets.buttons.check) {
      image(assets.buttons.check, this.x + this.width + 10, this.y, 40, 40);
    }
  }
  
  updateCheckMarkVisibility() {
    // Show check mark if there's text and required words are found (if any)
    this.showCheckMark = peteInputTextValue.length > 0 && peteInputTextValue.length <= this.maxLength;
    
    if (this.showCheckMark && this.requiredWords) {
      const lowerInput = peteInputTextValue.toLowerCase();
      this.showCheckMark = this.requiredWords.some(word => lowerInput.includes(word.toLowerCase()));
    }
  }
  
  isCheckMarkClicked() {
    return this.showCheckMark && 
           mouseX >= this.x + this.width + 10 && mouseX <= this.x + this.width + 50 && 
           mouseY >= this.y && mouseY <= this.y + 40;
  }
}

// Initialize the Pete dialog
function initOrderSnack() {
  console.log("Initializing Pete dialog");
  
  // Reset dialog variables
  currentPeteDialogState = PETE_DIALOG_STATES.START;
  peteDialogOptions = [];
  peteResponseSelected = false;
  peteInputTextValue = "";
  peteDialogTransitionTimer = 0;
  peteDialogAnxietyTimer = 0;
  peteDialogVideoEnded = false;
  peteSnackChoice = "";
  
  // Register state callbacks
  registerStateCallbacks(GAME_STATES.ORDER_SNACK, {
    init: setupOrderSnack,
    cleanup: cleanupOrderSnack,
    videoComplete: handleOrderSnackVideoComplete
  });
  
  // Setup order snack dialog
  setupOrderSnack();
}

// Setup the order snack dialog
function setupOrderSnack() {
  // Start with the first dialog state
  setPeteDialogState(PETE_DIALOG_STATES.Q1);
}

// Clean up the order snack dialog
function cleanupOrderSnack() {
  // Stop all dialog videos
  if (assets.videos && assets.videos.pete) {
    Object.values(assets.videos.pete).forEach(video => {
      if (video) {
        video.stop();
        video.hide();
      }
    });
  }
  
  console.log("Pete dialog cleaned up");
}

// Set the current Pete dialog state
function setPeteDialogState(state) {
  currentPeteDialogState = state;
  peteDialogOptions = [];
  peteResponseSelected = false;
  peteDialogVideoEnded = false;
  
  console.log(`Setting Pete dialog state to: ${state}`);
  
  // Set up the appropriate dialog state
  switch(state) {
    case PETE_DIALOG_STATES.START:
      // This is just a placeholder, we'll immediately go to Q1
      setPeteDialogState(PETE_DIALOG_STATES.Q1);
      break;
    
    case PETE_DIALOG_STATES.Q1:
      // Pete "Can I take your order please?"
      playPeteDialogVideo("P_Q1.mp4", () => {
        peteDialogVideoEnded = true;
        // Add response options
        peteDialogOptions = [
          new PeteResponseOption("r1_1", "Can you repeat that please?", "P_R1.1", 100, 500, 250, 50, PETE_DIALOG_STATES.Q1_1, 1)
        ];
      });
      break;
    
    case PETE_DIALOG_STATES.Q1_1:
      // Pete repeats "Can I take your order please?" (first repeat)
      playPeteDialogVideo("P_Q1.1.mp4", () => {
        peteDialogVideoEnded = true;
        // Add response options
        peteDialogOptions = [
          new PeteResponseOption("r1_1", "Can you repeat that please?", "P_R1.1", 100, 500, 250, 50, PETE_DIALOG_STATES.Q1_2, 2),
          new PeteResponseOption("yes", "Yea?", "P_YES", 100, 560, 250, 50, PETE_DIALOG_STATES.Q3, 0),
          new PeteResponseOption("no", "No?", "P_NO", 100, 620, 250, 50, PETE_DIALOG_STATES.Q3_R2, 4)
        ];
      });
      break;
    
    case PETE_DIALOG_STATES.Q1_2:
      // Pete repeats "Can I take your order please?" (second repeat)
      playPeteDialogVideo("P_Q1.2.mp4", () => {
        peteDialogVideoEnded = true;
        // Add response options - repeated request would increase anxiety by 4
        peteDialogOptions = [
          new PeteResponseOption("r1_1", "Can you repeat that please?", "P_R1.1", 100, 500, 250, 50, PETE_DIALOG_STATES.Q1_2, 4),
          new PeteResponseOption("yes", "Yea?", "P_YES", 100, 560, 250, 50, PETE_DIALOG_STATES.Q3, 0),
          new PeteResponseOption("no", "No?", "P_NO", 100, 620, 250, 50, PETE_DIALOG_STATES.Q3_R2, 4)
        ];
      });
      break;
    
    case PETE_DIALOG_STATES.Q3:
      // Pete "What can I get you?"
      playPeteDialogVideo("P_Q3.mp4", () => {
        peteDialogVideoEnded = true;
        // Add response options
        peteDialogOptions = [
          new PeteResponseOption("r3_1", "Slow croissant", "P_R3.1", 100, 500, 250, 50, PETE_DIALOG_STATES.Q4, -1),
          new PeteResponseOption("r3_2", "Bamboo croissant", "P_R3.2", 100, 560, 250, 50, PETE_DIALOG_STATES.Q4, -1),
          new PeteResponseOption("r3_3", "Black eye croissant", "P_R3.3", 100, 620, 250, 50, PETE_DIALOG_STATES.Q4, -1)
        ];
      });
      break;
    
    case PETE_DIALOG_STATES.Q3_R2:
      // Pete "OK THEN.. NEXT CUSTOMER!"
      playPeteDialogVideo("P_Q3.R2.mp4", () => {
        // After this, we should go back to the table
        const tableNum = getSelectedTable();
        if (tableNum >= 1 && tableNum <= 3) {
          // Play appropriate sent-back video
          playPeteDialogVideo(`SB_T${tableNum}.mp4`, () => {
            // Decrease anxiety based on table
            decreaseAnxiety(1);
            
            // Empty the mug for "sent back" visualization
            playPeteDialogVideo("D_empty.mp4", () => {
              // Show try again or quit options
              peteDialogOptions = [
                new PeteResponseOption("try_again", "Try Again", "B_tryagain", 100, 500, 250, 50, PETE_DIALOG_STATES.Q1, 0),
                new PeteResponseOption("quit", "Quit", "B_quit", 100, 560, 250, 50, PETE_DIALOG_STATES.DONE, 0)
              ];
              peteDialogVideoEnded = true;
            });
          });
        } else {
          console.error("Invalid table number");
          setPeteDialogState(PETE_DIALOG_STATES.DONE);
        }
      });
      break;
    
    case PETE_DIALOG_STATES.Q4:
      // Pete "and is that for... * steammm*"
      playPeteDialogVideo("P_Q4.mp4", () => {
        peteDialogVideoEnded = true;
        // Add response options
        peteDialogOptions = [
          new PeteTextInputOption("text_input", "P_R4.Blank", 100, 500, 300, 40, PETE_DIALOG_STATES.Q5_3, 0),
          new PeteResponseOption("r4_2", "I didn't catch that, can you repeat?", "P_R4.2", 100, 560, 300, 50, PETE_DIALOG_STATES.Q5_1, 0)
        ];
      });
      break;
    
    case PETE_DIALOG_STATES.Q5_1:
      // Pete "what? no... for HERE, or TO GO? - confused"
      playPeteDialogVideo("P_Q5.1.mp4", () => {
        peteDialogVideoEnded = true;
        // Add text input with required words
        peteDialogOptions = [
          new PeteTextInputOption("text_input", "P_R4.Blank", 100, 500, 300, 40, PETE_DIALOG_STATES.Q5_3, 3, ["here", "to go"])
        ];
      });
      break;
    
    case PETE_DIALOG_STATES.Q5_2:
      // Pete "FOR HERE? OR TO GO????? - angry"
      playPeteDialogVideo("P_Q5.2.mp4", () => {
        peteDialogVideoEnded = true;
        // Add text input with required words and higher anxiety impact
        peteDialogOptions = [
          new PeteTextInputOption("text_input", "P_R4.Blank", 100, 500, 300, 40, PETE_DIALOG_STATES.Q5_3, 4, ["here", "to go"])
        ];
      });
      break;
    
    case PETE_DIALOG_STATES.Q5_3:
      // Pete "can i grab a name for the order?"
      playPeteDialogVideo("P_Q5.3.mp4", () => {
        peteDialogVideoEnded = true;
        // Add text input for name
        peteDialogOptions = [
          new PeteTextInputOption("text_input", "P_R4.Blank", 100, 500, 300, 40, PETE_DIALOG_STATES.Q6, 0)
        ];
      });
      break;
    
      case PETE_DIALOG_STATES.Q6:
        // Use player name from Meowchi dialog if available
        const playerName = window.playerName || peteInputTextValue;
        
        // Pete "*what was saved to variable 'your name'* Here's your drink."
        playPeteDialogVideo("P_Q6.mp4", () => {
          // MODIFIED: Transition directly to SUCCESS instead of MINI_GAME_3
          transitionToState(GAME_STATES.SUCCESS);
        });
        break;
      
      case PETE_DIALOG_STATES.DONE:
        // Check if anxiety is full - if so, go to game over
        if (getAnxietyLevel() >= 10) {
          transitionToState(GAME_STATES.GAME_OVER);
        } else {
          // MODIFIED: Go directly to SUCCESS instead of MINI_GAME_3
          transitionToState(GAME_STATES.SUCCESS);
        }
        break;  
      
    default:
      console.error(`Unknown Pete dialog state: ${state}`);
      break;
  }
}

// Play a Pete dialog video with optional callback
function playPeteDialogVideo(videoName, callback) {
  if (!assets.videos || !assets.videos.pete || !assets.videos.pete[videoName]) {
    console.error(`Pete dialog video not found: ${videoName}`);
    if (callback) callback();
    return;
  }
  
  const video = assets.videos.pete[videoName];
  video.onended(() => {
    peteDialogVideoEnded = true;
    if (callback) callback();
  });
  
  video.play();
  console.log(`Playing Pete dialog video: ${videoName}`);
}

// Handle Pete dialog video completion
function handleOrderSnackVideoComplete(videoId) {
  console.log(`Pete dialog video completed: ${videoId}`);
  peteDialogVideoEnded = true;
}

// Draw function for order snack state
function drawOrderSnack() {
  background(0);
  
  // Draw the current dialog video or image
  const videoKey = getPeteDialogVideoKey();
  if (videoKey && assets.videos && assets.videos.pete && assets.videos.pete[videoKey]) {
    image(assets.videos.pete[videoKey], 0, 0, width, height);
  }
  
  // If there's a timer running for transitions, check it
  if (peteDialogTransitionTimer > 0 && millis() >= peteDialogTransitionTimer) {
    peteDialogTransitionTimer = 0;
    
    // Show try again or quit options
    peteDialogOptions = [
      new PeteResponseOption("try_again", "Try Again", "B_tryagain", 100, 500, 250, 50, PETE_DIALOG_STATES.Q1, 0),
      new PeteResponseOption("quit", "Quit", "B_quit", 100, 560, 250, 50, PETE_DIALOG_STATES.DONE, 0)
    ];
    peteResponseSelected = false;
  }
  
  // If there's a timer running for anxiety changes, check it
  if (peteDialogAnxietyTimer > 0 && millis() >= peteDialogAnxietyTimer) {
    peteDialogAnxietyTimer = 0;
    
    // Apply the pending anxiety change
    if (window.petePendingAnxietyChange) {
      if (window.petePendingAnxietyChange > 0) {
        increaseAnxiety(window.petePendingAnxietyChange);
      } else if (window.petePendingAnxietyChange < 0) {
        decreaseAnxiety(Math.abs(window.petePendingAnxietyChange));
      }
      window.petePendingAnxietyChange = 0;
    }
  }
  
  // Draw dialog options if video has ended
  if (peteDialogVideoEnded && peteDialogOptions.length > 0) {
    peteDialogOptions.forEach(option => {
      option.draw();
    });
  }
  
  // Display snack choice and name in Q6 state
  if (peteDialogVideoEnded && currentPeteDialogState === PETE_DIALOG_STATES.Q6) {
    // Use Pixellari font for order details if available
    if (pixellariFont) {
      textFont(pixellariFont);
    }
    
    fill(255);
    textAlign(CENTER, BOTTOM);
    textSize(24);
    
    const playerName = window.playerName || peteInputTextValue;
    const snackName = peteSnackChoice || "Croissant";
    
    text(`Order for: ${playerName}`, width/2, height - 80);
    text(`Item: ${snackName}`, width/2, height - 50);
    
    // Reset to default font
    textFont('default');
  }
}

// Get the video key for the current Pete dialog state
function getPeteDialogVideoKey() {
  switch(currentPeteDialogState) {
    case PETE_DIALOG_STATES.Q1: return "P_Q1.mp4";
    case PETE_DIALOG_STATES.Q1_1: return "P_Q1.1.mp4";
    case PETE_DIALOG_STATES.Q1_2: return "P_Q1.2.mp4";
    case PETE_DIALOG_STATES.Q3: return "P_Q3.mp4";
    case PETE_DIALOG_STATES.Q3_R2: return "P_Q3.R2.mp4";
    case PETE_DIALOG_STATES.Q4: return "P_Q4.mp4";
    case PETE_DIALOG_STATES.Q5_1: return "P_Q5.1.mp4";
    case PETE_DIALOG_STATES.Q5_2: return "P_Q5.2.mp4";
    case PETE_DIALOG_STATES.Q5_3: return "P_Q5.3.mp4";
    case PETE_DIALOG_STATES.Q6: return "P_Q6.mp4";
    default: return null;
  }
}

// Handle mouse clicks in order snack state
function handleOrderSnackClicks() {
  // Don't process clicks if in transition or video is still playing
  if (peteResponseSelected || !peteDialogVideoEnded) return;
  
  // Check if any dialog option was clicked
  for (let i = 0; i < peteDialogOptions.length; i++) {
    const option = peteDialogOptions[i];
    
    if (option.isTextInput) {
      // Check if the text input check mark was clicked
      if (option.isCheckMarkClicked()) {
        peteResponseSelected = true;
        
        // Apply anxiety change after a delay
        if (option.anxietyChange !== 0) {
          window.petePendingAnxietyChange = option.anxietyChange;
          peteDialogAnxietyTimer = millis() + 1000; // 1 second delay
        }
        
        // Store the input for certain states
        if (currentPeteDialogState === PETE_DIALOG_STATES.Q5_3) {
          window.snackOrderName = peteInputTextValue;
        }
        
        // Transition to next state after delay
        setTimeout(() => {
          setPeteDialogState(option.nextState);
        }, 500);
        
        if (assets.clickSound) {
          assets.clickSound.play();
        }
        
        break;
      }
    } else if (option.isMouseOver()) {
      peteResponseSelected = true;
      
      // Store snack choice if selecting a croissant
      if (option.id === "r3_1" || option.id === "r3_2" || option.id === "r3_3") {
        peteSnackChoice = option.text;
      }
      
      // Apply anxiety change after a delay
      if (option.anxietyChange !== 0) {
        window.petePendingAnxietyChange = option.anxietyChange;
        peteDialogAnxietyTimer = millis() + 1000; // 1 second delay
      }
      
      // Transition to next state after delay
      setTimeout(() => {
        setPeteDialogState(option.nextState);
      }, 500);
      
      if (assets.clickSound) {
        assets.clickSound.play();
      }
      
      break;
    }
  }
}

// Handle key presses in order snack state
function handleOrderSnackKeyPress() {
  // Only process key presses for text input if dialog options are showing
  if (!peteDialogVideoEnded || peteDialogOptions.length === 0) return;
  
  // Find text input option if any
  const textInputOption = peteDialogOptions.find(option => option.isTextInput);
  if (!textInputOption) return;
  
  // Handle key presses
  if (keyCode === BACKSPACE) {
    // Remove last character
    if (peteInputTextValue.length > 0) {
      peteInputTextValue = peteInputTextValue.substring(0, peteInputTextValue.length - 1);
      textInputOption.updateCheckMarkVisibility();
    }
  } else if (keyCode === ENTER) {
    // Submit if check mark is visible
    if (textInputOption.showCheckMark) {
      handleOrderSnackClicks(); // Simulate clicking the check mark
    }
  } else if (keyCode >= 32 && keyCode <= 126) { // Printable ASCII characters
    // Add character if within length limit
    if (peteInputTextValue.length < textInputOption.maxLength) {
      peteInputTextValue += key;
      textInputOption.updateCheckMarkVisibility();
    }
  }
}

// Export functions that need to be accessible to other modules
window.initOrderSnack = initOrderSnack;
window.drawOrderSnack = drawOrderSnack;
window.handleOrderSnackClicks = handleOrderSnackClicks;
window.handleOrderSnackKeyPress = handleOrderSnackKeyPress;
window.petePendingAnxietyChange = 0; // For delayed anxiety changes
window.snackOrderName = ""; // Store snack order name
window.peteSnackChoice = ""; // Track which snack was ordered