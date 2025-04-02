// meowchiDialog.js - Handles the dialog with Meowchi for ordering a drink
// Updated with Pixellari font support

// Dialog state variables
let currentDialogState = ""; // Current dialog screen
let dialogOptions = []; // Current response options
let responseSelected = false; // Flag to track if a response was selected
let inputTextValue = ""; // Value for text input fields
let dialogTransitionTimer = 0; // Timer for dialog transitions
let dialogAnxietyTimer = 0; // Timer for anxiety changes
let dialogVideoEnded = false; // Flag to track if the current video has ended

// Dialog state constants
const DIALOG_STATES = {
  START: "start",
  Q1: "q1",
  Q2: "q2",
  Q3: "q3",
  Q4_1: "q4_1",
  Q4_2: "q4_2",
  Q5: "q5",
  Q5_1: "q5_1",
  Q5_2: "q5_2",
  Q6: "q6",
  Q7_1: "q7_1",
  Q7_2: "q7_2",
  Q7_3: "q7_3",
  Q8: "q8",
  DONE: "done"
};

// Response option class
class ResponseOption {
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

// Text input response option
class TextInputOption extends ResponseOption {
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
    
    text(inputTextValue, this.x + 10, this.y + this.height/2);
    
    // Draw blinking cursor if active
    if (frameCount % 60 < 30) {
      // Calculate text width with Pixellari font if available
      let textW;
      if (pixellariFont) {
        textFont(pixellariFont);
        textW = textWidth(inputTextValue);
      } else {
        textW = textWidth(inputTextValue);
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
    this.showCheckMark = inputTextValue.length > 0 && inputTextValue.length <= this.maxLength;
    
    if (this.showCheckMark && this.requiredWords) {
      const lowerInput = inputTextValue.toLowerCase();
      this.showCheckMark = this.requiredWords.some(word => lowerInput.includes(word.toLowerCase()));
    }
  }
  
  isCheckMarkClicked() {
    return this.showCheckMark && 
           mouseX >= this.x + this.width + 10 && mouseX <= this.x + this.width + 50 && 
           mouseY >= this.y && mouseY <= this.y + 40;
  }
}

// Initialize the Meowchi dialog
function initOrderDrink() {
  console.log("Initializing Meowchi dialog");
  
  // Reset dialog variables
  currentDialogState = DIALOG_STATES.START;
  dialogOptions = [];
  responseSelected = false;
  inputTextValue = "";
  dialogTransitionTimer = 0;
  dialogAnxietyTimer = 0;
  dialogVideoEnded = false;
  
  // Register state callbacks
  registerStateCallbacks(GAME_STATES.ORDER_DRINK, {
    init: setupOrderDrink,
    cleanup: cleanupOrderDrink,
    videoComplete: handleOrderDrinkVideoComplete
  });
  
  // Setup order drink dialog
  setupOrderDrink();
}

// Setup the order drink dialog
function setupOrderDrink() {
  // Start with the first dialog state
  setDialogState(DIALOG_STATES.Q1);
}

// Clean up the order drink dialog
function cleanupOrderDrink() {
  // Stop all dialog videos
  if (assets.videos && assets.videos.meowchi) {
    Object.values(assets.videos.meowchi).forEach(video => {
      if (video) {
        video.stop();
        video.hide();
      }
    });
  }
  
  console.log("Meowchi dialog cleaned up");
}

// Set the current dialog state
function setDialogState(state) {
  currentDialogState = state;
  dialogOptions = [];
  responseSelected = false;
  dialogVideoEnded = false;
  
  console.log(`Setting dialog state to: ${state}`);
  
  // Set up the appropriate dialog state
  switch(state) {
    case DIALOG_STATES.START:
      // This is just a placeholder, we'll immediately go to Q1
      setDialogState(DIALOG_STATES.Q1);
      break;
    
    case DIALOG_STATES.Q1:
      // Meowchi speaks in Meowish
      playDialogVideo("M_Q1.mp4", () => {
        setDialogState(DIALOG_STATES.Q2);
      });
      break;
    
    case DIALOG_STATES.Q2:
      // Meowchi "meow meow me-meow meow?" - NOTE: Changed from image to video as requested
      playDialogVideo("M_Q2.mp4", () => {
        dialogVideoEnded = true;
        // Add response options
        dialogOptions = [
          new ResponseOption("r1_1", "Display Captions", "M_R1.1", 100, 500, 250, 50, DIALOG_STATES.Q2, 0)
        ];
      });
      break;
    
    case DIALOG_STATES.Q3:
      // Meowchi confused "meow meow me-meow meow?"
      playDialogVideo("M_Q3.mp4", () => {
        dialogVideoEnded = true;
        // Add response options depending on the previous choice
        dialogOptions = [
          new ResponseOption("r2_2", "Meow", "M_R2.2", 100, 500, 250, 50, DIALOG_STATES.Q4_1, 1),
          new ResponseOption("r2_3", "Subtitle Translation", "M_R2.3", 100, 560, 250, 50, DIALOG_STATES.Q3, 1)
        ];
      });
      break;
    
      case DIALOG_STATES.Q4_1:
        // Meowchi confused then "meow......meow meow"
        playDialogVideo("M_Q4.1.mp4", () => {
          // After this, we should go back to the table
          const tableNum = getSelectedTable();
          if (tableNum >= 1 && tableNum <= 3) {
            // Play thought bubble videos first
            playDialogVideo("SB_thought.mp4", () => {
              playDialogVideo("SB_thought2.mp4", () => {
                // Play appropriate sent-back video
                playDialogVideo(`SB_T${tableNum}.mp4`, () => {
                  // Decrease anxiety based on which table
                  if (tableNum === 1) decreaseAnxiety(1);
                  else if (tableNum === 3) decreaseAnxiety(2);
                  
                  // Show try again or quit options
                  dialogOptions = [
                    new ResponseOption("try_again", "Try Again", "B_tryagain", 100, 500, 250, 50, DIALOG_STATES.Q1, 0),
                    new ResponseOption("quit", "Quit", "B_quit", 100, 560, 250, 50, DIALOG_STATES.DONE, 0)
                  ];
                  dialogVideoEnded = true;
                });
              });
            });
          } else {
            console.error("Invalid table number");
            setDialogState(DIALOG_STATES.DONE);
          }
        });
        break;
    
    case DIALOG_STATES.Q4_2:
      // Meowchi "Que voulez-vous boire"
      playDialogVideo("M_Q4.2.mp4", () => {
        dialogVideoEnded = true;
        // Add response options
        dialogOptions = [
          new ResponseOption("r4_1", "For here", "M_R4.1", 100, 500, 250, 50, DIALOG_STATES.Q5, 0),
          new ResponseOption("r4_2", "A drink", "M_R4.2", 100, 560, 250, 50, DIALOG_STATES.Q5, 1)
        ];
      });
      break;
    
    case DIALOG_STATES.Q5:
      // Meowchi "D'accord. Vous êtes prêt?"
      playDialogVideo("M_Q5.mp4", () => {
        dialogVideoEnded = true;
        // Add response options
        dialogOptions = [
          new ResponseOption("yes", "Yes", "M_YES", 100, 500, 250, 50, DIALOG_STATES.Q5_2, 0),
          new ResponseOption("no", "No", "M_NO", 100, 560, 250, 50, DIALOG_STATES.Q5_1, 1)
        ];
      });
      break;
    
    case DIALOG_STATES.Q5_1:
      // Meowchi "Oh d'accord alors…bye?"
      playDialogVideo("M_Q5.1.mp4", () => {
        dialogVideoEnded = true;
        // Add response options (give some time for anxiety update)
        dialogTransitionTimer = millis() + 3000; // 3 second delay
        responseSelected = true; // Don't allow clicks during timer
      });
      break;
    
    case DIALOG_STATES.Q5_2:
      // Meowchi "Quelle boisson veux-tu?"
      playDialogVideo("M_Q5.2.mp4", () => {
        dialogVideoEnded = true;
        // Add response options
        dialogOptions = [
          new ResponseOption("r5_1", "Whisker Matcha", "M_R5.1", 100, 500, 250, 50, DIALOG_STATES.Q6, -1),
          new ResponseOption("r5_2", "PURspresso", "M_R5.2", 100, 560, 250, 50, DIALOG_STATES.Q6, -1),
          new ResponseOption("r5_3", "Catnip Tea", "M_R5.3", 100, 620, 250, 50, DIALOG_STATES.Q6, -1)
        ];
      });
      break;
    
    case DIALOG_STATES.Q6:
      // Meowchi "Puis-je avoir ton n-BLENDERRRR"
      playDialogVideo("M_Q6.mp4", () => {
        dialogVideoEnded = true;
        // Add response options
        dialogOptions = [
          new TextInputOption("text_input", "M_R6.Blank", 100, 500, 300, 40, DIALOG_STATES.Q7_3, 0),
          new ResponseOption("r6", "WHAT DID YOU SAY?", "M_R6", 100, 560, 250, 50, DIALOG_STATES.Q7_2, 1)
        ];
      });
      break;
    
    case DIALOG_STATES.Q7_1:
      // Meowchi "Name? hmmm"
      playDialogVideo("M_Q7.1.mp4", () => {
        setDialogState(DIALOG_STATES.Q7_3);
      });
      break;
    
    case DIALOG_STATES.Q7_2:
      // Meowchi "...votre nom?"
      playDialogVideo("M_Q7.2.mp4", () => {
        dialogVideoEnded = true;
        // Add text input response option
        dialogOptions = [
          new TextInputOption("text_input", "M_R6.Blank", 100, 500, 300, 40, DIALOG_STATES.Q7_3, 1)
        ];
      });
      break;
    
    case DIALOG_STATES.Q7_3:
      // Meowchi "*name*, d'accord"
      playDialogVideo("M_Q7.3.mp4", () => {
        setDialogState(DIALOG_STATES.Q8);
      });
      break;
    
    case DIALOG_STATES.Q8:
      // Meowchi "*name*, votre boisson est prête"
      playDialogVideo("M_Q8.mp4", () => {
        transitionToState(GAME_STATES.MINI_GAME_2);
      });
      break;
    
    case DIALOG_STATES.DONE:
      // Transition to the next state
      transitionToState(GAME_STATES.MINI_GAME_2);
      break;
      
    default:
      console.error(`Unknown dialog state: ${state}`);
      break;
  }
}

// Play a dialog video with optional callback
function playDialogVideo(videoName, callback) {
  if (!assets.videos || !assets.videos.meowchi || !assets.videos.meowchi[videoName]) {
    console.error(`Dialog video not found: ${videoName}`);
    if (callback) callback();
    return;
  }
  
  const video = assets.videos.meowchi[videoName];
  video.onended(() => {
    dialogVideoEnded = true;
    if (callback) callback();
  });
  
  video.play();
  console.log(`Playing dialog video: ${videoName}`);
}

// Handle dialog video completion
function handleOrderDrinkVideoComplete(videoId) {
  console.log(`Dialog video completed: ${videoId}`);
  dialogVideoEnded = true;
}

// Draw function for order drink state
function drawOrderDrink() {
  background(0);
  
  // Draw the current dialog video or image
  const videoKey = getDialogVideoKey();
  if (videoKey && assets.videos && assets.videos.meowchi && assets.videos.meowchi[videoKey]) {
    image(assets.videos.meowchi[videoKey], 0, 0, width, height);
  }
  
  // If there's a timer running for transitions, check it
  if (dialogTransitionTimer > 0 && millis() >= dialogTransitionTimer) {
    dialogTransitionTimer = 0;
    
    // Show try again or quit options
    dialogOptions = [
      new ResponseOption("try_again", "Try Again", "B_tryagain", 100, 500, 250, 50, DIALOG_STATES.Q1, 0),
      new ResponseOption("quit", "Quit", "B_quit", 100, 560, 250, 50, DIALOG_STATES.DONE, 0)
    ];
    responseSelected = false;
  }
  
  // If there's a timer running for anxiety changes, check it
  if (dialogAnxietyTimer > 0 && millis() >= dialogAnxietyTimer) {
    dialogAnxietyTimer = 0;
    
    // Apply the pending anxiety change
    if (window.pendingAnxietyChange) {
      if (window.pendingAnxietyChange > 0) {
        increaseAnxiety(window.pendingAnxietyChange);
      } else if (window.pendingAnxietyChange < 0) {
        decreaseAnxiety(Math.abs(window.pendingAnxietyChange));
      }
      window.pendingAnxietyChange = 0;
    }
  }
  
  // Draw dialog options if video has ended
  if (dialogVideoEnded && dialogOptions.length > 0) {
    dialogOptions.forEach(option => {
      option.draw();
    });
  }
  
  // Display name in Q8 state using Pixellari font
  if (dialogVideoEnded && currentDialogState === DIALOG_STATES.Q8 && window.playerName) {
    // Use Pixellari font for player name if available
    if (pixellariFont) {
      textFont(pixellariFont);
    }
    
    fill(255);
    textAlign(CENTER, BOTTOM);
    textSize(24);
    text(`Order for: ${window.playerName}`, width/2, height - 50);
    
    // Reset to default font
    textFont('default');
  }
}

// Get the video key for the current dialog state
function getDialogVideoKey() {
    switch(currentDialogState) {
      case DIALOG_STATES.Q1: return "M_Q1.mp4";
      case DIALOG_STATES.Q2: return "M_Q2.mp4"; // Changed from PNG to MP4
      case DIALOG_STATES.Q3: return "M_Q3.mp4";
      case DIALOG_STATES.Q4_1: return "M_Q4.1.mp4";
      case DIALOG_STATES.Q4_2: return "M_Q4.2.mp4"; // Changed from PNG to MP4
      case DIALOG_STATES.Q5: return "M_Q5.mp4";
      case DIALOG_STATES.Q5_1: return "M_Q5.1.mp4";
      case DIALOG_STATES.Q5_2: return "M_Q5.2.mp4";
      case DIALOG_STATES.Q6: return "M_Q6.mp4";
      case DIALOG_STATES.Q7_1: return "M_Q7.1.mp4";
      case DIALOG_STATES.Q7_2: return "M_Q7.2.mp4";
      case DIALOG_STATES.Q7_3: return "M_Q7.3.mp4";
      case DIALOG_STATES.Q8: return "M_Q8.mp4";
      default: return null;
    }
  }

// Handle mouse clicks in order drink state
function handleOrderDrinkClicks() {
  // Don't process clicks if in transition or video is still playing
  if (responseSelected || !dialogVideoEnded) return;
  
  // Check if any dialog option was clicked
  for (let i = 0; i < dialogOptions.length; i++) {
    const option = dialogOptions[i];
    
    // Special case for the "English not available" option (R3.2)
    if (option.id === "r3_2" && option.imageName === "M_R3.2") {
      // This should add anxiety each time it's clicked, but not change state
      responseSelected = false;
      increaseAnxiety(1);
      
      // Play the English not available sound
      if (assets.englishNotAvailableSound) {
        assets.englishNotAvailableSound.play();
      }
    }
    
    if (option.isTextInput) {
      // Check if the text input check mark was clicked
      if (option.isCheckMarkClicked()) {
        responseSelected = true;
        
        // Apply anxiety change after a delay
        if (option.anxietyChange !== 0) {
          window.pendingAnxietyChange = option.anxietyChange;
          dialogAnxietyTimer = millis() + 1000; // 1 second delay
        }
        
        // Store the name for future reference
        window.playerName = inputTextValue;
        
        // Transition to next state after delay
        setTimeout(() => {
          setDialogState(option.nextState);
        }, 500);
        
        if (assets.clickSound) {
          assets.clickSound.play();
        }
        
        break;
      }
    } else if (option.isMouseOver()) {
      responseSelected = true;
      
      // Apply anxiety change after a delay
      if (option.anxietyChange !== 0) {
        window.pendingAnxietyChange = option.anxietyChange;
        dialogAnxietyTimer = millis() + 1000; // 1 second delay
      }
      
      // Special case for the "English not available" option (R3.2)
      if (option.id === "r3_2" && option.imageName === "M_R3.2") {
        // This should add anxiety each time it's clicked, but not change state
        responseSelected = false;
        increaseAnxiety(1);
      } else {
        // Transition to next state after delay
        setTimeout(() => {
          setDialogState(option.nextState);
        }, 500);
      }
      
      if (assets.clickSound) {
        assets.clickSound.play();
      }
      
      break;
    }
  }
}

// Handle key presses in order drink state
function handleOrderDrinkKeyPress() {
  // Only process key presses for text input if dialog options are showing
  if (!dialogVideoEnded || dialogOptions.length === 0) return;
  
  // Find text input option if any
  const textInputOption = dialogOptions.find(option => option.isTextInput);
  if (!textInputOption) return;
  
  // Handle key presses
  if (keyCode === BACKSPACE) {
    // Remove last character
    if (inputTextValue.length > 0) {
      inputTextValue = inputTextValue.substring(0, inputTextValue.length - 1);
      textInputOption.updateCheckMarkVisibility();
    }
  } else if (keyCode === ENTER) {
    // Submit if check mark is visible
    if (textInputOption.showCheckMark) {
      handleOrderDrinkClicks(); // Simulate clicking the check mark
    }
  } else if (keyCode >= 32 && keyCode <= 126) { // Printable ASCII characters
    // Add character if within length limit
    if (inputTextValue.length < textInputOption.maxLength) {
      inputTextValue += key;
      textInputOption.updateCheckMarkVisibility();
    }
  }
}

// Export functions that need to be accessible to other modules
window.initOrderDrink = initOrderDrink;
window.drawOrderDrink = drawOrderDrink;
window.handleOrderDrinkClicks = handleOrderDrinkClicks;
window.handleOrderDrinkKeyPress = handleOrderDrinkKeyPress;
window.pendingAnxietyChange = 0; // For delayed anxiety changes
window.playerName = ""; // Store player name