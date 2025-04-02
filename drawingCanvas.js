// drawingCanvas.js - Handles drawing functionality for mini-games

// Drawing state variables
let drawingMode = true; // true for drawing, false for erasing
let drawingCanvas; // p5.Graphics object for drawing area
let drawingActive = false; // Whether drawing is currently enabled
let drawingBounds = { x: 0, y: 0, width: 0, height: 0 }; // Drawing area boundaries
let hasDrawing = false; // Flag to track if user has drawn anything
let drawingLineWidth = 2; // Width for drawing lines
let eraserLineWidth = 4; // Width for eraser

// Drawing history for undo functionality
let drawingHistory = [];
let currentDrawing = null;

// Initialize the drawing canvas
function initDrawingCanvas() {
  // Create graphics buffer for drawing
  drawingCanvas = createGraphics(width, height);
  drawingCanvas.clear();
  drawingCanvas.stroke(0);
  drawingCanvas.strokeWeight(drawingLineWidth);
  drawingCanvas.noFill();
  
  // Default to drawing mode
  setDrawingMode(true);
  
  console.log("Drawing canvas initialized");
}

// Setup the drawing canvas for specific mini-game
function setupDrawingCanvas(bounds) {
  drawingBounds = bounds || { x: 380, y: 220, width: 520, height: 320 }; // Default drawing area
  
  // Reset canvas
  clearDrawingCanvas();
  
  // Activate drawing
  drawingActive = true;
  
  console.log("Drawing canvas setup with bounds:", drawingBounds);
}

// Clear the drawing canvas
function clearDrawingCanvas() {
  if (drawingCanvas) {
    drawingCanvas.clear();
    hasDrawing = false;
    drawingHistory = [];
    currentDrawing = null;
  }
}
// Undo/Redo stacks
let undoStack = [];
let redoStack = [];

// Save current canvas state to history
function saveDrawingState() {
  // Only save if there's an actual change
  if (currentDrawing && currentDrawing.points.length > 0) {
    // Clear redo stack when a new action is taken
    redoStack = [];
    
    drawingHistory.push(currentDrawing);
    currentDrawing = null;
    
    // Limit history size to avoid memory issues
    if (drawingHistory.length > 20) {
      drawingHistory.shift();
    }
  }
}

// Undo the last drawing action
function undoDrawing() {
  if (drawingHistory.length > 0) {
    // Get the last drawing action
    const lastAction = drawingHistory.pop();
    
    // Add to redo stack
    undoStack.push(lastAction);
    
    // Redraw canvas from scratch with remaining history
    redrawCanvas();
    
    // Check if all drawing has been undone
    checkIfDrawingEmpty();
  }
}

// Redo a previously undone drawing action
function redoDrawing() {
  if (undoStack.length > 0) {
    // Get the last undone action
    const actionToRedo = undoStack.pop();
    
    // Add it back to history
    drawingHistory.push(actionToRedo);
    
    // Draw the redone action
    applyDrawingAction(actionToRedo);
    
    // Set hasDrawing flag
    hasDrawing = true;
  }
}

// Redraw the entire canvas based on current history
function redrawCanvas() {
  // Clear the canvas
  drawingCanvas.clear();
  
  // Redraw all actions in history
  drawingHistory.forEach(action => {
    applyDrawingAction(action);
  });
}

// Apply a single drawing action to the canvas
function applyDrawingAction(action) {
  if (action.points.length < 2) return;
  
  // Set the appropriate drawing mode
  if (action.mode === 'draw') {
    drawingCanvas.stroke(0);
    drawingCanvas.strokeWeight(drawingLineWidth);
  } else if (action.mode === 'erase') {
    drawingCanvas.erase();
    drawingCanvas.strokeWeight(eraserLineWidth);
  }
  
  // Draw all points as line segments
  for (let i = 1; i < action.points.length; i++) {
    const p1 = action.points[i-1];
    const p2 = action.points[i];
    
    drawingCanvas.line(
      p1.x + drawingBounds.x, 
      p1.y + drawingBounds.y, 
      p2.x + drawingBounds.x, 
      p2.y + drawingBounds.y
    );
  }
  
  // Reset erase mode if needed
  if (action.mode === 'erase') {
    drawingCanvas.noErase();
  }
}

// Export the new functions
window.undoDrawing = undoDrawing;
window.redoDrawing = redoDrawing;
// Set drawing mode (draw or erase)
function setDrawingMode(isDraw) {
  drawingMode = isDraw;
  
  if (drawingCanvas) {
    if (isDraw) {
      drawingCanvas.stroke(0);
      drawingCanvas.strokeWeight(drawingLineWidth);
    } else {
      // Use same color as background for eraser
      drawingCanvas.stroke(255);
      drawingCanvas.strokeWeight(eraserLineWidth);
    }
  }
  
  console.log(`Drawing mode set to: ${isDraw ? 'draw' : 'erase'}`);
}

// Handle mouse drag for drawing
function handleCanvasDrag() {
  if (!drawingActive || !drawingCanvas) return;
  
  // Check if within drawing bounds
  if (mouseX >= drawingBounds.x && 
      mouseX <= drawingBounds.x + drawingBounds.width &&
      mouseY >= drawingBounds.y && 
      mouseY <= drawingBounds.y + drawingBounds.height) {
    
    // Calculate position within the drawing area
    const x = mouseX - drawingBounds.x;
    const y = mouseY - drawingBounds.y;
    
    if (drawingMode) {
      // Drawing mode
      drawingCanvas.stroke(0);
      drawingCanvas.strokeWeight(drawingLineWidth);
      
      // Start a new line segment if needed
      if (!currentDrawing) {
        currentDrawing = { points: [], mode: 'draw' };
      }
      
      // Add point to current line
      currentDrawing.points.push({x, y});
      
      // Draw on canvas
      if (currentDrawing.points.length >= 2) {
        const p1 = currentDrawing.points[currentDrawing.points.length - 2];
        const p2 = currentDrawing.points[currentDrawing.points.length - 1];
        
        drawingCanvas.line(
          p1.x + drawingBounds.x, 
          p1.y + drawingBounds.y, 
          p2.x + drawingBounds.x, 
          p2.y + drawingBounds.y
        );
      }
      
      hasDrawing = true;
    } else {
      // Erasing mode
      drawingCanvas.erase();
      drawingCanvas.strokeWeight(eraserLineWidth);
      
      // Start a new erase segment if needed
      if (!currentDrawing) {
        currentDrawing = { points: [], mode: 'erase' };
      }
      
      // Add point to current erase
      currentDrawing.points.push({x, y});
      
      // Erase on canvas
      if (currentDrawing.points.length >= 2) {
        const p1 = currentDrawing.points[currentDrawing.points.length - 2];
        const p2 = currentDrawing.points[currentDrawing.points.length - 1];
        
        drawingCanvas.line(
          p1.x + drawingBounds.x, 
          p1.y + drawingBounds.y, 
          p2.x + drawingBounds.x, 
          p2.y + drawingBounds.y
        );
      }
      
      drawingCanvas.noErase();
      
      // Check if we've erased everything
      checkIfDrawingEmpty();
    }
  } else {
    // If we move outside the drawing area, save the current drawing
    if (currentDrawing && currentDrawing.points.length > 0) {
      saveDrawingState();
    }
  }
}

// Handle mouse release to save drawing state
function handleCanvasMouseRelease() {
  if (currentDrawing && currentDrawing.points.length > 0) {
    saveDrawingState();
  }
}

// Check if the canvas is empty (used after erasing)
function checkIfDrawingEmpty() {
  // This is an approximation - for a real implementation,
  // you would need to analyze the pixels on the canvas
  
  // For now, we'll just check if the user has completely erased
  // all pixels in the drawing bounds
  
  // This is a simplified implementation
  if (drawingHistory.length === 0 && !currentDrawing) {
    hasDrawing = false;
  }
}

// Draw the canvas to the screen
function drawCanvas() {
  if (drawingCanvas) {
    // Draw the canvas content
    image(drawingCanvas, 0, 0);
    
    // Draw the canvas border if needed
    noFill();
    stroke(200);
    strokeWeight(1);
    rect(drawingBounds.x, drawingBounds.y, drawingBounds.width, drawingBounds.height);
  }
}

// Check if user has drawn anything
function hasUserDrawn() {
  return hasDrawing;
}

// Get current drawing data for saving between mini-games
function saveDrawingData() {
  if (drawingCanvas) {
    return drawingCanvas.get();
  }
  return null;
}

// Load previously saved drawing data
function loadDrawingData(savedDrawing) {
  if (drawingCanvas && savedDrawing) {
    drawingCanvas.image(savedDrawing, 0, 0);
    hasDrawing = true;
  }
}

// Export functions that need to be accessible to other modules
window.initDrawingCanvas = initDrawingCanvas;
window.setupDrawingCanvas = setupDrawingCanvas;
window.clearDrawingCanvas = clearDrawingCanvas;
window.setDrawingMode = setDrawingMode;
window.handleCanvasDrag = handleCanvasDrag;
window.handleCanvasMouseRelease = handleCanvasMouseRelease;
window.drawCanvas = drawCanvas;
window.hasUserDrawn = hasUserDrawn;
window.saveDrawingData = saveDrawingData;
window.loadDrawingData = loadDrawingData;