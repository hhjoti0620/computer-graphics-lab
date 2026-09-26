# Interactive Analog Clock

## Computer Graphics Lab — Assignment 1

An interactive real-time analog clock implemented using HTML5 Canvas and JavaScript.

---

## Objective

To use 2D graphics primitives and coordinate transformations to create a live analog clock with:

- Animation
- Rotation
- Translation
- Scaling

---

## Technologies Used

- HTML5
- CSS3
- JavaScript
- HTML5 Canvas

No external graphics library is required.

---

## Required Functionality

### 1. Graphics Primitives

The clock is constructed using Canvas graphics primitives:

- Circles
- Lines
- Text

No pre-rendered clock image is used.

### 2. Real-Time Clock

The application uses the computer's current local time.

The following hands are displayed:

- Hour hand
- Minute hand
- Second hand

The hands automatically update according to the current time.

### 3. Rotation

The clock hands use an explicit coordinate rotation transformation.

The rotation transformation is:

x' = x cos(theta) - y sin(theta)

y' = x sin(theta) + y cos(theta)

### 4. Translation

The complete clock can be repositioned by dragging it with the mouse.

Translation is applied to the actual geometry coordinates.

### 5. Scaling

The clock can be resized using:

- Mouse wheel
- Zoom slider

Scaling is applied to the actual geometry while preserving proportions.

### 6. Stable Interaction

The clock remains within the drawing area during:

- Translation
- Scaling
- Mouse interaction

---

## Coordinate Transformation Pipeline

The project uses the following transformation pipeline:

```text
Local Coordinate
       |
       v
Rotation
       |
       v
Scaling
       |
       v
Translation
       |
       v
Screen Coordinate
