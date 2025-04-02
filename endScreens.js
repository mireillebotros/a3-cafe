// gameStates.js - Manages game state transitions and setup/cleanup

// Game state constants - Removed MINI_GAME_3 and ORDER_SNACK
const GAME_STATES = {
    LOADING: "loading",
    INTRO: "intro",
    TABLE_SELECT: "tableSelect",
    MINI_GAME_1: "miniGame1",
    ORDER_DRINK: "orderDrink",
    MINI_GAME_2: "miniGame2",
    SUCCESS: "success",
    GAME_OVER: "gameOver"
  };
  
  // Global game state
  let gameState = GAME_STATES.LOADING;
  let selectedTable = 0; // 0: none, 1, 2, 3: table numbers
  let anxietyLevel = 0; // 0-10 anxiety level
  let assets = {}; // Holds all loaded assets
  
  // Export game states to global scope
  window.GAME_STATES = GAME_STATES;
  
  // Initialize callbacks for each state
  const stateCallbacks = {
    // Each state can have these callbacks:
    // init: Function to setup the state
    // cleanup: Function to clean up state resources
    // videoComplete: Function called when main video for that state completes
  };
  
  // Register callbacks for a specific game state
  function registerStateCallbacks(state, callbacks) {
    stateCallbacks[state] = {
      ...stateCallbacks[state],
      ...callbacks
    };
  }
  
  // Transition from one state to another with proper cleanup and initialization
  function transitionToState(nextState) {
    // Check if the state is actually changing
    if (gameState === nextState) {
      console.log(`Already in state: ${nextState}`);
      return;
    }
    
    // Run cleanup for current state if it exists
    if (stateCallbacks[gameState] && stateCallbacks[gameState].cleanup) {
      stateCallbacks[gameState].cleanup();
    }
    
    // Update the game state
    const previousState = gameState;
    gameState = nextState;
    
    // Log the transition (helpful for debugging)
    console.log(`Game state transition: ${previousState} -> ${nextState}`);
    
    // Run initialization for next state if it exists
    if (stateCallbacks[nextState] && stateCallbacks[nextState].init) {
      stateCallbacks[nextState].init();
    }
  }
  
  // Handle a video completion based on current state
  function handleVideoComplete(videoId) {
    if (stateCallbacks[gameState] && stateCallbacks[gameState].videoComplete) {
      stateCallbacks[gameState].videoComplete(videoId);
    }
  }
  
  // Function to check if anxiety level causes game over
  function checkAnxietyGameOver() {
    if (anxietyLevel >= 10) {
      transitionToState(GAME_STATES.GAME_OVER);
      return true;
    }
    return false;
  }
  
  // Add a table selection
  function selectTable(tableNumber) {
    if (tableNumber >= 1 && tableNumber <= 3) {
      selectedTable = tableNumber;
      console.log(`Selected table ${tableNumber}`);
    } else {
      console.error(`Invalid table number: ${tableNumber}`);
    }
  }
  
  // Get the current selected table
  function getSelectedTable() {
    return selectedTable;
  }
  
  // Reset game to initial state
  function resetGame() {
    // Reset game variables
    anxietyLevel = 0;
    selectedTable = 0;
    
    // Stop all audio
    if (assets.backgroundMusic && assets.backgroundMusic.isPlaying()) {
      assets.backgroundMusic.stop();
    }
    
    if (assets.tableAudio) {
      Object.values(assets.tableAudio).forEach(audio => {
        if (audio && audio.isPlaying()) {
          audio.stop();
        }
      });
    }
    
    // Clear any mini-game state
    if (typeof clearDrawingCanvas === 'function') {
      clearDrawingCanvas();
    }
    
    // Transition directly to intro state (changed from table selection)
    transitionToState(GAME_STATES.INTRO);
  }
  
  // Export functions to be accessible to other modules
  window.registerStateCallbacks = registerStateCallbacks;
  window.transitionToState = transitionToState;
  window.handleVideoComplete = handleVideoComplete;
  window.checkAnxietyGameOver = checkAnxietyGameOver;
  window.selectTable = selectTable;
  window.getSelectedTable = getSelectedTable;
  window.resetGame = resetGame;