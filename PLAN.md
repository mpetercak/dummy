# Plan: Use Custom Image as Snake's Head

## Image Location
**Source Image:** `/home/sprite/images/image_0.jpeg`
- A cute cartoon snake head with green coloring, yellow eyes, rosy cheeks, and tongue out
- Has transparency (checkered background visible)
- Suitable size for game integration

## Current Implementation Analysis

**File:** `index.html` (single-file architecture)
- **Rendering:** HTML5 Canvas 2D Context
- **Grid System:** 20x20 grid, each cell is 20 pixels
- **Current Snake Head:** Simple green rectangle (`#4CAF50`), 18x18 pixels
- **Drawing Location:** Lines 273-287 in the `draw()` function
- **No Image Loading:** Currently no image assets or loading mechanisms

## Implementation Steps

### Step 1: Copy Image to Project
- Create an `assets/` or `images/` directory in `/home/sprite/repo/`
- Copy `/home/sprite/images/image_0.jpeg` to `/home/sprite/repo/assets/snake-head.jpeg`
- This makes the image accessible to the web application

### Step 2: Add Image Preloading
**Location:** After line 125 in `index.html` (after canvas setup, before game state)

**Implementation:**
```javascript
// Load snake head image
const snakeHeadImage = new Image();
snakeHeadImage.src = 'assets/snake-head.jpeg';
let imageLoaded = false;

snakeHeadImage.onload = function() {
    imageLoaded = true;
    console.log('Snake head image loaded successfully');
};

snakeHeadImage.onerror = function() {
    console.error('Failed to load snake head image, using default rectangle');
};
```

**Rationale:** Preload the image before game starts to avoid rendering delays or errors

### Step 3: Modify Snake Head Rendering
**Location:** Lines 273-287 in the `draw()` function

**Current Code:**
```javascript
snake.forEach((segment, index) => {
    if (index === 0) {
        // Head
        ctx.fillStyle = '#4CAF50';
    } else {
        // Body
        ctx.fillStyle = '#8BC34A';
    }
    ctx.fillRect(
        segment.x * GRID_SIZE + 1,
        segment.y * GRID_SIZE + 1,
        GRID_SIZE - 2,
        GRID_SIZE - 2
    );
});
```

**New Code:**
```javascript
snake.forEach((segment, index) => {
    if (index === 0) {
        // Head - draw image if loaded, otherwise use fallback
        if (imageLoaded) {
            // Calculate position
            const x = segment.x * GRID_SIZE;
            const y = segment.y * GRID_SIZE;

            // Draw image scaled to fit grid cell
            ctx.drawImage(snakeHeadImage, x, y, GRID_SIZE, GRID_SIZE);
        } else {
            // Fallback to original rectangle
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(
                segment.x * GRID_SIZE + 1,
                segment.y * GRID_SIZE + 1,
                GRID_SIZE - 2,
                GRID_SIZE - 2
            );
        }
    } else {
        // Body - keep original rectangle rendering
        ctx.fillStyle = '#8BC34A';
        ctx.fillRect(
            segment.x * GRID_SIZE + 1,
            segment.y * GRID_SIZE + 1,
            GRID_SIZE - 2,
            GRID_SIZE - 2
        );
    }
});
```

### Step 4: Optional Enhancements

#### 4a. Directional Rotation (Optional)
Rotate the snake head based on movement direction:

```javascript
if (imageLoaded) {
    const x = segment.x * GRID_SIZE;
    const y = segment.y * GRID_SIZE;

    // Calculate rotation angle based on velocity
    let angle = 0;
    if (velocity.x === 1) angle = 90;      // Moving right
    else if (velocity.x === -1) angle = 270; // Moving left
    else if (velocity.y === 1) angle = 180;  // Moving down
    else if (velocity.y === -1) angle = 0;   // Moving up

    // Save context, rotate, draw, restore
    ctx.save();
    ctx.translate(x + GRID_SIZE/2, y + GRID_SIZE/2);
    ctx.rotate(angle * Math.PI / 180);
    ctx.drawImage(snakeHeadImage, -GRID_SIZE/2, -GRID_SIZE/2, GRID_SIZE, GRID_SIZE);
    ctx.restore();
}
```

#### 4b. Better Image Scaling (Optional)
If image quality is poor at 20x20, consider:
- Increasing GRID_SIZE (e.g., to 25 or 30 pixels)
- Using multiple sizes of the image
- Applying image smoothing settings

### Step 5: Testing Checklist
- [ ] Verify image file is accessible at `assets/snake-head.jpeg`
- [ ] Confirm image loads without console errors
- [ ] Check snake head renders correctly on game start
- [ ] Test that fallback rectangle appears if image fails to load
- [ ] Verify game performance is not impacted
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Ensure snake body still renders as green rectangles
- [ ] Verify the image doesn't look distorted or pixelated

## Technical Considerations

### Image Format
- Current: JPEG (from source)
- Recommendation: Convert to PNG for better transparency support
- The cartoon snake has transparency which may not render well in JPEG

### Performance
- Image drawing (`ctx.drawImage()`) is efficient for small images
- Single image loaded once, drawn every frame
- Minimal performance impact expected

### Browser Compatibility
- `Image()` object and `drawImage()` are universally supported
- No polyfills or fallbacks needed for modern browsers

### Responsive Design
- Current implementation uses fixed 20px grid
- Image will scale to fit 20x20 pixel cell
- May need adjustment if grid size changes

## Alternative Approaches Considered

1. **SVG Instead of Raster Image:** More scalable, but adds complexity
2. **CSS Background Image:** Not suitable for canvas-based rendering
3. **Sprite Sheet:** Overkill for single image, but good for future animations
4. **Multiple Images for Directions:** Better visual quality, but requires 4 images

## Summary

This plan integrates the custom snake head image while maintaining:
- **Backward compatibility:** Fallback to rectangle if image fails
- **Simplicity:** Minimal code changes to existing implementation
- **Performance:** No significant impact on game loop
- **Maintainability:** Clear separation between image loading and rendering

**Estimated Complexity:** Low
**Files Modified:** 1 (`index.html`)
**Files Created:** 1 (image in `assets/` directory)
**Lines Changed:** Approximately 30-40 lines
