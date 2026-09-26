// =====================================================
// Interactive Analog Clock
// Computer Graphics Lab - Assignment 1
//
// Concepts:
// 2D Primitives
// Rotation
// Scaling
// Translation
// Real-Time Animation
// Mouse Interaction
// =====================================================


// =====================================================
// CANVAS SETUP
// =====================================================

const canvas =
    document.getElementById("clockCanvas");

const ctx =
    canvas.getContext("2d");


// =====================================================
// UI ELEMENTS
// =====================================================

const resetBtn =
    document.getElementById("resetBtn");

const centerBtn =
    document.getElementById("centerBtn");

const zoomSlider =
    document.getElementById("zoomSlider");

const zoomValue =
    document.getElementById("zoomValue");

const digitalTime =
    document.getElementById("digitalTime");

const dateDisplay =
    document.getElementById("dateDisplay");


// =====================================================
// CLOCK PARAMETERS
// =====================================================

const BASE_RADIUS = 200;

let clockX = 0;
let clockY = 0;

let scale = 1;

let initialized = false;


// =====================================================
// DRAG VARIABLES
// =====================================================

let isDragging = false;

let dragOffsetX = 0;
let dragOffsetY = 0;


// =====================================================
// COLORS
// =====================================================

const COLORS = {

    face: "#f8f9fa",

    border: "#20242b",

    tick: "#20242b",

    hourHand: "#20242b",

    minuteHand: "#2878f6",

    secondHand: "#e53935",

    center: "#e53935",

    centerInner: "#ffffff"
};


// =====================================================
// CANVAS RESIZE
// =====================================================

function resizeCanvas() {

    const rect =
        canvas.getBoundingClientRect();

    const dpr =
        window.devicePixelRatio || 1;


    canvas.width =
        rect.width * dpr;

    canvas.height =
        rect.height * dpr;


    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );


    // Initial center
    if (!initialized) {

        clockX =
            rect.width / 2;

        clockY =
            rect.height / 2;

        initialized = true;
    }


    // Keep clock inside drawing area
    constrainClock();
}


window.addEventListener(
    "resize",
    resizeCanvas
);


// =====================================================
// TRANSFORMATION 1 — ROTATION
// =====================================================

/*
    Rotates a local point around origin.

    x' = x cos(theta) - y sin(theta)
    y' = x sin(theta) + y cos(theta)
*/

function rotatePoint(x, y, angle) {

    const cosTheta =
        Math.cos(angle);

    const sinTheta =
        Math.sin(angle);


    return {

        x:
            x * cosTheta
            -
            y * sinTheta,

        y:
            x * sinTheta
            +
            y * cosTheta
    };
}


// =====================================================
// TRANSFORMATION 2 + 3
// Scaling + Translation
// =====================================================

/*
    After rotation:

    Scaling:
        x' = x * scale
        y' = y * scale

    Translation:
        X = clockX + x'
        Y = clockY + y'
*/

function transformPoint(
    x,
    y,
    rotation = 0
) {

    // Rotation
    const rotated =
        rotatePoint(
            x,
            y,
            rotation
        );


    // Scaling
    const scaledX =
        rotated.x * scale;

    const scaledY =
        rotated.y * scale;


    // Translation
    return {

        x:
            clockX + scaledX,

        y:
            clockY + scaledY
    };
}


// =====================================================
// DRAW LINE USING TRANSFORMATION
// =====================================================

function drawLine(
    x1,
    y1,
    x2,
    y2,
    color,
    width,
    rotation = 0
) {

    const p1 =
        transformPoint(
            x1,
            y1,
            rotation
        );


    const p2 =
        transformPoint(
            x2,
            y2,
            rotation
        );


    ctx.beginPath();

    ctx.moveTo(
        p1.x,
        p1.y
    );

    ctx.lineTo(
        p2.x,
        p2.y
    );


    ctx.strokeStyle =
        color;

    ctx.lineWidth =
        width * scale;

    ctx.lineCap =
        "round";

    ctx.stroke();
}


// =====================================================
// DRAW CIRCLE
// =====================================================

function drawCircle(
    radius,
    color,
    lineWidth = 0
) {

    const center =
        transformPoint(
            0,
            0
        );


    ctx.beginPath();

    ctx.arc(
        center.x,
        center.y,
        radius * scale,
        0,
        Math.PI * 2
    );


    if (lineWidth === 0) {

        ctx.fillStyle =
            color;

        ctx.fill();

    } else {

        ctx.strokeStyle =
            color;

        ctx.lineWidth =
            lineWidth * scale;

        ctx.stroke();
    }
}


// =====================================================
// DRAW CLOCK FACE
// =====================================================

function drawClockFace() {

    // -----------------------------------------------
    // Face
    // -----------------------------------------------

    drawCircle(
        BASE_RADIUS,
        COLORS.face
    );


    // -----------------------------------------------
    // Outer border
    // -----------------------------------------------

    drawCircle(
        BASE_RADIUS,
        COLORS.border,
        6
    );


    // -----------------------------------------------
    // Inner border
    // -----------------------------------------------

    drawCircle(
        BASE_RADIUS - 12,
        "#777777",
        2
    );


    // -----------------------------------------------
    // Tick marks
    // -----------------------------------------------

    for (
        let i = 0;
        i < 60;
        i++
    ) {

        const angle =
            (i * 6 - 90)
            * Math.PI / 180;


        let innerRadius;
        let outerRadius;
        let lineWidth;


        if (i % 5 === 0) {

            innerRadius =
                BASE_RADIUS - 40;

            outerRadius =
                BASE_RADIUS - 15;

            lineWidth = 4;

        } else {

            innerRadius =
                BASE_RADIUS - 29;

            outerRadius =
                BASE_RADIUS - 18;

            lineWidth = 2;
        }


        const x1 =
            Math.cos(angle)
            * innerRadius;

        const y1 =
            Math.sin(angle)
            * innerRadius;


        const x2 =
            Math.cos(angle)
            * outerRadius;

        const y2 =
            Math.sin(angle)
            * outerRadius;


        drawLine(
            x1,
            y1,
            x2,
            y2,
            COLORS.tick,
            lineWidth
        );
    }


    // -----------------------------------------------
    // Numbers
    // -----------------------------------------------

    const numberRadius =
        BASE_RADIUS - 68;


    ctx.fillStyle =
        "#20242b";

    ctx.font =
        "bold 23px Arial";

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";


    for (
        let number = 1;
        number <= 12;
        number++
    ) {

        const angle =
            (number * 30 - 90)
            * Math.PI / 180;


        const localX =
            Math.cos(angle)
            * numberRadius;

        const localY =
            Math.sin(angle)
            * numberRadius;


        const point =
            transformPoint(
                localX,
                localY
            );


        ctx.fillText(
            number,
            point.x,
            point.y
        );
    }
}


// =====================================================
// DRAW CLOCK HAND
// =====================================================

function drawHand(
    value,
    maxValue,
    length,
    color,
    width
) {

    /*
        Convert clock value to angle.

        12 o'clock = -90 degrees
        Clockwise = positive
    */

    const angle =
        (
            value / maxValue * 360
            - 90
        )
        * Math.PI / 180;


    /*
        Hand initially points
        along positive X-axis.

        Rotate the geometry
        by the calculated angle.
    */

    drawLine(
        0,
        0,
        length,
        0,
        color,
        width,
        angle
    );
}


// =====================================================
// DRAW REAL-TIME HANDS
// =====================================================

function drawHands() {

    const now =
        new Date();


    // -----------------------------------------------
    // Smooth second value
    // -----------------------------------------------

    const seconds =
        now.getSeconds()
        +
        now.getMilliseconds()
        / 1000;


    // -----------------------------------------------
    // Smooth minute value
    // -----------------------------------------------

    const minutes =
        now.getMinutes()
        +
        seconds / 60;


    // -----------------------------------------------
    // Smooth hour value
    // -----------------------------------------------

    const hours =
        (
            now.getHours() % 12
        )
        +
        minutes / 60;


    // -----------------------------------------------
    // Hour Hand
    // -----------------------------------------------

    drawHand(
        hours,
        12,
        105,
        COLORS.hourHand,
        9
    );


    // -----------------------------------------------
    // Minute Hand
    // -----------------------------------------------

    drawHand(
        minutes,
        60,
        145,
        COLORS.minuteHand,
        6
    );


    // -----------------------------------------------
    // Second Hand
    // -----------------------------------------------

    drawHand(
        seconds,
        60,
        170,
        COLORS.secondHand,
        3
    );


    // -----------------------------------------------
    // Center
    // -----------------------------------------------

    drawCircle(
        9,
        COLORS.center
    );


    drawCircle(
        4,
        COLORS.centerInner
    );
}


// =====================================================
// DIGITAL CLOCK
// BANGLADESH TIME — 12 HOUR FORMAT
// =====================================================

function updateDigitalClock() {

    const now =
        new Date();


    /*
        Bangladesh Time Zone:
        Asia/Dhaka

        12-hour format:
        01:30:25 PM
    */

    const timeString =
        now.toLocaleTimeString(
            "en-US",
            {
                timeZone: "Asia/Dhaka",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true
            }
        );


    digitalTime.textContent =
        timeString;


    // -----------------------------------------------
    // Bangladesh Date
    // -----------------------------------------------

    dateDisplay.textContent =
        now.toLocaleDateString(
            "en-US",
            {
                timeZone: "Asia/Dhaka",
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );
}


// =====================================================
// KEEP CLOCK INSIDE DRAWING AREA
// =====================================================

function constrainClock() {

    const rect =
        canvas.getBoundingClientRect();


    const scaledRadius =
        BASE_RADIUS * scale;


    // Left boundary

    if (
        clockX - scaledRadius < 0
    ) {

        clockX =
            scaledRadius;
    }


    // Right boundary

    if (
        clockX + scaledRadius > rect.width
    ) {

        clockX =
            rect.width
            -
            scaledRadius;
    }


    // Top boundary

    if (
        clockY - scaledRadius < 0
    ) {

        clockY =
            scaledRadius;
    }


    // Bottom boundary

    if (
        clockY + scaledRadius > rect.height
    ) {

        clockY =
            rect.height
            -
            scaledRadius;
    }
}


// =====================================================
// MAIN DRAW LOOP
// =====================================================

function draw() {

    const rect =
        canvas.getBoundingClientRect();


    // Clear drawing area

    ctx.clearRect(
        0,
        0,
        rect.width,
        rect.height
    );


    // Canvas background

    ctx.fillStyle =
        "#171c24";

    ctx.fillRect(
        0,
        0,
        rect.width,
        rect.height
    );


    // Clock

    drawClockFace();

    drawHands();


    // UI

    updateDigitalClock();


    // Animation

    requestAnimationFrame(
        draw
    );
}


// =====================================================
// MOUSE DRAG — TRANSLATION
// =====================================================

canvas.addEventListener(
    "mousedown",
    function(event) {

        const rect =
            canvas.getBoundingClientRect();


        const mouseX =
            event.clientX
            -
            rect.left;


        const mouseY =
            event.clientY
            -
            rect.top;


        const distance =
            Math.sqrt(
                Math.pow(
                    mouseX - clockX,
                    2
                )
                +
                Math.pow(
                    mouseY - clockY,
                    2
                )
            );


        // Start dragging only
        // if cursor is inside clock

        if (
            distance
            <=
            BASE_RADIUS * scale
        ) {

            isDragging = true;


            dragOffsetX =
                mouseX - clockX;


            dragOffsetY =
                mouseY - clockY;


            canvas.style.cursor =
                "grabbing";
        }
    }
);


// =====================================================
// MOUSE MOVE — TRANSLATION
// =====================================================

canvas.addEventListener(
    "mousemove",
    function(event) {

        if (!isDragging) {
            return;
        }


        const rect =
            canvas.getBoundingClientRect();


        const mouseX =
            event.clientX
            -
            rect.left;


        const mouseY =
            event.clientY
            -
            rect.top;


        // Translation

        clockX =
            mouseX
            -
            dragOffsetX;


        clockY =
            mouseY
            -
            dragOffsetY;


        // Keep inside canvas

        constrainClock();
    }
);


// =====================================================
// MOUSE RELEASE
// =====================================================

canvas.addEventListener(
    "mouseup",
    function() {

        isDragging = false;

        canvas.style.cursor =
            "grab";
    }
);


canvas.addEventListener(
    "mouseleave",
    function() {

        isDragging = false;

        canvas.style.cursor =
            "grab";
    }
);


// =====================================================
// MOUSE WHEEL — SCALING
// =====================================================

canvas.addEventListener(
    "wheel",
    function(event) {

        event.preventDefault();


        if (
            event.deltaY < 0
        ) {

            scale += 0.05;

        } else {

            scale -= 0.05;
        }


        // Scaling limits

        scale =
            Math.max(
                0.5,
                Math.min(
                    2.0,
                    scale
                )
            );


        zoomSlider.value =
            scale;


        updateZoomDisplay();


        // Keep clock inside

        constrainClock();
    }
);


// =====================================================
// ZOOM SLIDER
// =====================================================

zoomSlider.addEventListener(
    "input",
    function() {

        scale =
            parseFloat(
                zoomSlider.value
            );


        updateZoomDisplay();


        constrainClock();
    }
);


// =====================================================
// UPDATE ZOOM TEXT
// =====================================================

function updateZoomDisplay() {

    zoomValue.textContent =
        Math.round(
            scale * 100
        )
        +
        "%";
}


// =====================================================
// RESET
// =====================================================

function resetClock() {

    const rect =
        canvas.getBoundingClientRect();


    clockX =
        rect.width / 2;


    clockY =
        rect.height / 2;


    scale = 1;


    zoomSlider.value =
        1;


    updateZoomDisplay();
}


resetBtn.addEventListener(
    "click",
    resetClock
);


// =====================================================
// CENTER
// =====================================================

centerBtn.addEventListener(
    "click",
    function() {

        const rect =
            canvas.getBoundingClientRect();


        clockX =
            rect.width / 2;


        clockY =
            rect.height / 2;
    }
);


// =====================================================
// KEYBOARD — R TO RESET
// =====================================================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "r"
            ||
            event.key === "R"
        ) {

            resetClock();
        }
    }
);


// =====================================================
// INITIALIZATION
// =====================================================

resizeCanvas();

updateZoomDisplay();

draw();
