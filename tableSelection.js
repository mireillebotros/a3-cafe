// tableSelection.js - Manages the table selection screen and interactions

// State variables for table selection
let tableSelectVideoStarted = false;
let tableSelectCompleted = false;
let currentTable = 0; // 0: none, 1-3: viewing specific table
let tableTransitionActive = false;
let tableQuitTransitionActive = false;
let tablePickTransitionActive = false;

// Initialize the table selection sequence
function initTableSelection() {
  console.log("Initializing table selection");
  tableSelectVideoStarted = false;
  tableSelectCompleted = false;
  currentTable = 0;
  tableTransitionActive = false;
  tableQuitTransitionActive = false;
  tablePickTransitionActive = false;
  
  // Register state callbacks
  registerStateCallbacks(GAME_STATES.TABLE_SELECT, {
    init: setupTableSelection,
    cleanup: cleanupTableSelection,
    videoComplete: handleTableSelectionVideoComplete
  });
  
  // Setup table selection
  setupTableSelection();
}

// Setup the table selection screen
function setupTableSelection() {
  if (!tableSelectVideoStarted && assets.videos && assets.videos.tableSelect) {
    assets.videos.tableSelect.onended(() => {
      assets.videos.tableSelect.loop();
    });
    
    // Play table selection video
    assets.videos.tableSelect.play();
    tableSelectVideoStarted = true;
    console.log("Table selection video started playing");
  } else {
    console.warn("Table selection video asset not ready or already started");
  }
}

// Clean up the table selection
function cleanupTableSelection() {
  // Stop all table selection videos
  if (assets.videos) {
    if (assets.videos.tableSelect) {
      assets.videos.tableSelect.stop();
      assets.videos.tableSelect.hide();
    }
    
    // Stop table 1 videos
    if (assets.videos.table1) {
      for (const key in assets.videos.table1) {
        assets.videos.table1[key].stop();
        assets.videos.table1[key].hide();
      }
    }
    
    // Stop table 2 videos
    if (assets.videos.table2) {
      for (const key in assets.videos.table2) {
        assets.videos.table2[key].stop();
        assets.videos.table2[key].hide();
      }
    }
    
    // Stop table 3 videos
    if (assets.videos.table3) {
      for (const key in assets.videos.table3) {
        assets.videos.table3[key].stop();
        assets.videos.table3[key].hide();
      }
    }
  }
  
  console.log("Table selection cleaned up");
}

// Handle completion of table selection video
function handleTableSelectionVideoComplete(videoId) {
  console.log(`Table selection video completed: ${videoId}`);
  
  // Handle different video completions
  if (videoId.startsWith('table1_')) {
    handleTable1VideoComplete(videoId);
  } else if (videoId.startsWith('table2_')) {
    handleTable2VideoComplete(videoId);
  } else if (videoId.startsWith('table3_')) {
    handleTable3VideoComplete(videoId);
  }
}

// Handle table 1 video completions
function handleTable1VideoComplete(videoId) {
  if (videoId === 'table1_transition') {
    // Transition to table 1 view complete
    tableTransitionActive = false;
    assets.videos.table1.loop.loop();
  } else if (videoId === 'table1_quitTransition') {
    // Return to main selection screen
    tableQuitTransitionActive = false;
    currentTable = 0;
    assets.videos.tableSelect.loop();
  } else if (videoId === 'table1_pickTransition') {
    // Table 1 selected, proceed to mini game
    tablePickTransitionActive = false;
    selectTable(1);
    transitionToState(GAME_STATES.MINI_GAME_1);
  }
}

// Handle table 2 video completions
function handleTable2VideoComplete(videoId) {
  if (videoId === 'table2_transition') {
    // Transition to table 2 view complete
    tableTransitionActive = false;
    assets.videos.table2.loop.loop();
  } else if (videoId === 'table2_quitTransition') {
    // Return to main selection screen
    tableQuitTransitionActive = false;
    currentTable = 0;
    assets.videos.tableSelect.loop();
  } else if (videoId === 'table2_pickTransition') {
    // Table 2 selected, proceed to mini game
    tablePickTransitionActive = false;
    selectTable(2);
    transitionToState(GAME_STATES.MINI_GAME_1);
  }
}

// Handle table 3 video completions
function handleTable3VideoComplete(videoId) {
  if (videoId === 'table3_transition') {
    // Transition to table 3 view complete
    tableTransitionActive = false;
    assets.videos.table3.loop.loop();
  } else if (videoId === 'table3_quitTransition') {
    // Return to main selection screen
    tableQuitTransitionActive = false;
    currentTable = 0;
    assets.videos.tableSelect.loop();
  } else if (videoId === 'table3_pickTransition') {
    // Table 3 selected, proceed to mini game
    tablePickTransitionActive = false;
    selectTable(3);
    transitionToState(GAME_STATES.MINI_GAME_1);
  }
}

// Draw function for table selection state
function drawTableSelection() {
  background(0);
  
  // Main table selection screen
  if (currentTable === 0) {
    if (assets.videos && assets.videos.tableSelect) {
      image(assets.videos.tableSelect, 0, 0, width, height);
    }
  } 
  // Table 1 view
  else if (currentTable === 1) {
    if (tableTransitionActive) {
      // Show transition animation
      if (assets.videos.table1.transition) {
        image(assets.videos.table1.transition, 0, 0, width, height);
      }
    } else if (tableQuitTransitionActive) {
      // Show quit transition animation
      if (assets.videos.table1.quitTransition) {
        image(assets.videos.table1.quitTransition, 0, 0, width, height);
      }
    } else if (tablePickTransitionActive) {
      // Show pick transition animation
      if (assets.videos.table1.pickTransition) {
        image(assets.videos.table1.pickTransition, 0, 0, width, height);
      }
    } else {
      // Show looping table view
      if (assets.videos.table1.loop) {
        image(assets.videos.table1.loop, 0, 0, width, height);
      }
      
      // Draw UI buttons
      if (assets.buttons.lookAtOtherTables) {
        image(assets.buttons.lookAtOtherTables, 160, 850, 400, 133);
      }
      if (assets.buttons.pickThisTable1) {
        image(assets.buttons.pickThisTable1, 160, 690, 400, 133);
      }
    }
  } 
  // Table 2 view
  else if (currentTable === 2) {
    if (tableTransitionActive) {
      // Show transition animation
      if (assets.videos.table2.transition) {
        image(assets.videos.table2.transition, 0, 0, width, height);
      }
    } else if (tableQuitTransitionActive) {
      // Show quit transition animation
      if (assets.videos.table2.quitTransition) {
        image(assets.videos.table2.quitTransition, 0, 0, width, height);
      }
    } else if (tablePickTransitionActive) {
      // Show pick transition animation
      if (assets.videos.table2.pickTransition) {
        image(assets.videos.table2.pickTransition, 0, 0, width, height);
      }
    } else {
      // Show looping table view
      if (assets.videos.table2.loop) {
        image(assets.videos.table2.loop, 0, 0, width, height);
      }
      
      // Draw UI buttons
      if (assets.buttons.lookAtOtherTables) {
        image(assets.buttons.lookAtOtherTables, 160, 850, 400, 133);
      }
      if (assets.buttons.pickThisTable2) {
        image(assets.buttons.pickThisTable2, 160, 690, 400, 133);
      }
    }
  } 
  // Table 3 view
  else if (currentTable === 3) {
    if (tableTransitionActive) {
      // Show transition animation
      if (assets.videos.table3.transition) {
        image(assets.videos.table3.transition, 0, 0, width, height);
      }
    } else if (tableQuitTransitionActive) {
      // Show quit transition animation
      if (assets.videos.table3.quitTransition) {
        image(assets.videos.table3.quitTransition, 0, 0, width, height);
      }
    } else if (tablePickTransitionActive) {
      // Show pick transition animation
      if (assets.videos.table3.pickTransition) {
        image(assets.videos.table3.pickTransition, 0, 0, width, height);
      }
    } else {
      // Show looping table view
      if (assets.videos.table3.loop) {
        image(assets.videos.table3.loop, 0, 0, width, height);
      }
      
      // Draw UI buttons
      if (assets.buttons.lookAtOtherTables) {
        image(assets.buttons.lookAtOtherTables, 160, 850, 400, 133);
      }
      if (assets.buttons.pickThisTable3) {
        image(assets.buttons.pickThisTable3, 160, 690, 400, 133);
      }
    }
  }
}

// Handle mouse clicks in table selection state
function handleTableSelectionClicks() {
  // Main selection screen clicks
  if (currentTable === 0) {
    // Check table 1 area click
    if (mouseX > 400 && mouseX < 925 && mouseY > 120 && mouseY < 420) {
      currentTable = 1;
      tableTransitionActive = true;
      
      if (assets.videos.table1.transition) {
        assets.videos.table1.transition.play();
      }
      
      if (assets.clickSound) {
        assets.clickSound.play();
      }
    }
    
    // Check table 2 area click
    if (mouseX > 995 && mouseX < 1520 && mouseY > 120 && mouseY < 420) {
      currentTable = 2;
      tableTransitionActive = true;
      
      if (assets.videos.table2.transition) {
        assets.videos.table2.transition.play();
      }
      
      if (assets.clickSound) {
        assets.clickSound.play();
      }
    }
    
    // Check table 3 area click
    if (mouseX > 700 && mouseX < 1225 && mouseY > 495 && mouseY < 795) {
      currentTable = 3;
      tableTransitionActive = true;
      
      if (assets.videos.table3.transition) {
        assets.videos.table3.transition.play();
      }
      
      if (assets.clickSound) {
        assets.clickSound.play();
      }
    }
  }
  // Table 1 view clicks
  else if (currentTable === 1 && !tableTransitionActive && !tableQuitTransitionActive && !tablePickTransitionActive) {
    // Look at other tables button
    if (mouseX > 160 && mouseX < 560 && mouseY > 850 && mouseY < 983) {
      tableQuitTransitionActive = true;
      
      if (assets.videos.table1.quitTransition) {
        assets.videos.table1.loop.stop();
        assets.videos.table1.quitTransition.play();
      }
      
      if (assets.clickSound) {
        assets.clickSound.play();
      }
    }
    
    // Pick this table button
    if (mouseX > 160 && mouseX < 560 && mouseY > 690 && mouseY < 823) {
      tablePickTransitionActive = true;
      
      if (assets.videos.table1.pickTransition) {
        assets.videos.table1.loop.stop();
        assets.videos.table1.pickTransition.play();
      }
      
      if (assets.clickSound) {
        assets.clickSound.play();
      }
      
      // Increase anxiety (based on the PDF, picking table 1 adds +2 to anxiety)
      increaseAnxiety(2);
    }
  }
  // Table 2 view clicks
  else if (currentTable === 2 && !tableTransitionActive && !tableQuitTransitionActive && !tablePickTransitionActive) {
    // Look at other tables button
    if (mouseX > 160 && mouseX < 560 && mouseY > 850 && mouseY < 983) {
      tableQuitTransitionActive = true;
      
      if (assets.videos.table2.quitTransition) {
        assets.videos.table2.loop.stop();
        assets.videos.table2.quitTransition.play();
      }
      
      if (assets.clickSound) {
        assets.clickSound.play();
      }
    }
    
    // Pick this table button
    if (mouseX > 160 && mouseX < 560 && mouseY > 690 && mouseY < 823) {
      tablePickTransitionActive = true;
      
      if (assets.videos.table2.pickTransition) {
        assets.videos.table2.loop.stop();
        assets.videos.table2.pickTransition.play();
      }
      
      if (assets.clickSound) {
        assets.clickSound.play();
      }
      
      // Picking table 2 doesn't seem to add anxiety based on the PDFs
    }
  }
  // Table 3 view clicks
  else if (currentTable === 3 && !tableTransitionActive && !tableQuitTransitionActive && !tablePickTransitionActive) {
    // Look at other tables button
    if (mouseX > 160 && mouseX < 560 && mouseY > 850 && mouseY < 983) {
      tableQuitTransitionActive = true;
      
      if (assets.videos.table3.quitTransition) {
        assets.videos.table3.loop.stop();
        assets.videos.table3.quitTransition.play();
      }
      
      if (assets.clickSound) {
        assets.clickSound.play();
      }
    }
    
    // Pick this table button
    if (mouseX > 160 && mouseX < 560 && mouseY > 690 && mouseY < 823) {
      tablePickTransitionActive = true;
      
      if (assets.videos.table3.pickTransition) {
        assets.videos.table3.loop.stop();
        assets.videos.table3.pickTransition.play();
      }
      
      if (assets.clickSound) {
        assets.clickSound.play();
      }
      
      // Increase anxiety (based on the PDF, picking table 3 adds +3 to anxiety)
      increaseAnxiety(3);
    }
  }
}

// Export functions that need to be accessible to other modules
window.initTableSelection = initTableSelection;
window.drawTableSelection = drawTableSelection;
window.handleTableSelectionClicks = handleTableSelectionClicks;