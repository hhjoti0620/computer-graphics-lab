// ============================================================
// INTERACTIVE 3D CUBE
// Computer Graphics Lab — Assignment 2
//
// 3D Graphics Pipeline:
//
// 3D Geometry
//      ↓
// X/Y/Z Rotation
//      ↓
// 3D Scaling
//      ↓
// Camera / View Transformation
//      ↓
// Perspective Projection
//      ↓
// Depth Sorting + Surface Shading
//      ↓
// 2D Canvas Rendering
//
// No WebGL / 3D rendering library is used.
// ============================================================


const canvas =
    document.getElementById("cubeCanvas");

const ctx =
    canvas.getContext("2d");


/* ============================================================
   UI ELEMENTS
   ============================================================ */

const controls = {

    rotX:
        document.getElementById("rotX"),

    rotY:
        document.getElementById("rotY"),

    rotZ:
        document.getElementById("rotZ"),

    scale:
        document.getElementById("scale"),

    cameraDistance:
        document.getElementById("cameraDistance"),

    cameraYaw:
        document.getElementById("cameraYaw"),

    cameraPitch:
        document.getElementById("cameraPitch"),

    autoRotate:
        document.getElementById("autoRotate"),

    shaded:
        document.getElementById("shaded"),

    wireframe:
        document.getElementById("wireframe"),

    resetBtn:
        document.getElementById("resetBtn"),

    viewBtn:
        document.getElementById("viewBtn")
};


const outputs = {

    rotX:
        document.getElementById("rotXValue"),

    rotY:
        document.getElementById("rotYValue"),

    rotZ:
        document.getElementById("rotZValue"),

    scale:
        document.getElementById("scaleValue"),

    cameraDistance:
        document.getElementById(
            "cameraDistanceValue"
        ),

    cameraYaw:
        document.getElementById(
            "cameraYawValue"
        ),

    cameraPitch:
        document.getElementById(
            "cameraPitchValue"
        ),

    fps:
        document.getElementById("fpsText")
};


/* ============================================================
   3D CUBE GEOMETRY
   ============================================================

   A cube has:

   8 vertices
   12 edges
   6 faces
*/


const baseVertices = [

    { x: -1, y: -1, z: -1 }, // 0
    { x:  1, y: -1, z: -1 }, // 1
    { x:  1, y:  1, z: -1 }, // 2
    { x: -1, y:  1, z: -1 }, // 3

    { x: -1, y: -1, z:  1 }, // 4
    { x:  1, y: -1, z:  1 }, // 5
    { x:  1, y:  1, z:  1 }, // 6
    { x: -1, y:  1, z:  1 }  // 7

];


const faces = [

    {
        indices: [4, 5, 6, 7],
        name: "Front",
        base: [63, 132, 246]
    },

    {
        indices: [1, 0, 3, 2],
        name: "Back",
        base: [112, 93, 218]
    },

    {
        indices: [0, 4, 7, 3],
        name: "Left",
        base: [52, 168, 126]
    },

    {
        indices: [5, 1, 2, 6],
        name: "Right",
        base: [240, 160, 70]
    },

    {
        indices: [3, 7, 6, 2],
        name: "Top",
        base: [224, 91, 117]
    },

    {
        indices: [0, 1, 5, 4],
        name: "Bottom",
        base: [82, 184, 189]
    }

];


const edges = [

    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],

    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],

    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7]

];


/* ============================================================
   LIGHT DIRECTION
   ============================================================ */

const lightDirection =
    normalize3({

        x: -0.45,

        y: -0.75,

        z: 1.0

    });


/* ============================================================
   GLOBAL VARIABLES
   ============================================================ */

let width = 0;

let height = 0;

let dragging = false;

let lastMouseX = 0;

let lastMouseY = 0;

let lastTime =
    performance.now();

let frameCounter = 0;

let fpsTimer =
    lastTime;


/* ============================================================
   VECTOR OPERATIONS
   ============================================================ */


function add3(a, b) {

    return {

        x: a.x + b.x,

        y: a.y + b.y,

        z: a.z + b.z

    };

}


function sub3(a, b) {

    return {

        x: a.x - b.x,

        y: a.y - b.y,

        z: a.z - b.z

    };

}


function mul3(v, scalar) {

    return {

        x: v.x * scalar,

        y: v.y * scalar,

        z: v.z * scalar

    };

}


function dot3(a, b) {

    return (

        a.x * b.x +

        a.y * b.y +

        a.z * b.z

    );

}


function cross3(a, b) {

    return {

        x:
            a.y * b.z -
            a.z * b.y,

        y:
            a.z * b.x -
            a.x * b.z,

        z:
            a.x * b.y -
            a.y * b.x

    };

}


function length3(v) {

    return Math.sqrt(
        dot3(v, v)
    );

}


function normalize3(v) {

    const len =
        length3(v) || 1;

    return mul3(
        v,
        1 / len
    );

}


/* ============================================================
   X-AXIS ROTATION
   ============================================================

   y' = y cosθ - z sinθ

   z' = y sinθ + z cosθ
*/


function rotateX(p, angle) {

    const c =
        Math.cos(angle);

    const s =
        Math.sin(angle);


    return {

        x: p.x,

        y:
            p.y * c -
            p.z * s,

        z:
            p.y * s +
            p.z * c

    };

}


/* ============================================================
   Y-AXIS ROTATION
   ============================================================

   x' = x cosθ + z sinθ

   z' = -x sinθ + z cosθ
*/


function rotateY(p, angle) {

    const c =
        Math.cos(angle);

    const s =
        Math.sin(angle);


    return {

        x:
            p.x * c +
            p.z * s,

        y:
            p.y,

        z:
            -p.x * s +
            p.z * c

    };

}


/* ============================================================
   Z-AXIS ROTATION
   ============================================================

   x' = x cosθ - y sinθ

   y' = x sinθ + y cosθ
*/


function rotateZ(p, angle) {

    const c =
        Math.cos(angle);

    const s =
        Math.sin(angle);


    return {

        x:
            p.x * c -
            p.y * s,

        y:
            p.x * s +
            p.y * c,

        z:
            p.z

    };

}


/* ============================================================
   3D SCALING
   ============================================================ */


function scale3D(p, scale) {

    return {

        x: p.x * scale,

        y: p.y * scale,

        z: p.z * scale

    };

}


/* ============================================================
   OBJECT TRANSFORMATION
   ============================================================ */


function transformVertex(
    vertex,
    rx,
    ry,
    rz,
    scale
) {

    let p = {
        ...vertex
    };


    // X rotation
    p =
        rotateX(
            p,
            rx
        );


    // Y rotation
    p =
        rotateY(
            p,
            ry
        );


    // Z rotation
    p =
        rotateZ(
            p,
            rz
        );


    // 3D scaling
    p =
        scale3D(
            p,
            scale
        );


    return p;

}


/* ============================================================
   CAMERA / VIEW TRANSFORMATION
   ============================================================ */


function cameraTransform(
    point,
    yaw,
    pitch,
    distance
) {

    let p = {
        ...point
    };


    // Inverse camera yaw
    p =
        rotateY(
            p,
            -yaw
        );


    // Inverse camera pitch
    p =
        rotateX(
            p,
            -pitch
        );


    // Move cube away from camera
    p.z += distance;


    return p;

}


/* ============================================================
   PERSPECTIVE PROJECTION
   ============================================================

   screenX =
       focalLength * x / z

   screenY =
       focalLength * y / z
*/


function perspectiveProject(point) {

    const focalLength =
        Math.min(
            width,
            height
        ) * 0.95;


    const safeZ =
        Math.max(
            point.z,
            0.1
        );


    return {

        x:
            width / 2 +
            (
                point.x *
                focalLength
            ) / safeZ,

        y:
            height / 2 -
            (
                point.y *
                focalLength
            ) / safeZ,

        depth:
            safeZ

    };

}


/* ============================================================
   FACE NORMAL
   ============================================================ */


function faceNormal(
    a,
    b,
    c
) {

    return normalize3(

        cross3(

            sub3(b, a),

            sub3(c, a)

        )

    );

}


/* ============================================================
   FACE COLOR SHADING
   ============================================================ */


function shadeColor(
    base,
    brightness
) {

    const r =
        Math.max(
            0,
            Math.min(
                255,
                Math.round(
                    base[0] *
                    brightness
                )
            )
        );


    const g =
        Math.max(
            0,
            Math.min(
                255,
                Math.round(
                    base[1] *
                    brightness
                )
            )
        );


    const b =
        Math.max(
            0,
            Math.min(
                255,
                Math.round(
                    base[2] *
                    brightness
                )
            )
        );


    return `rgb(${r}, ${g}, ${b})`;

}


/* ============================================================
   CANVAS RESIZE
   ============================================================ */


function resizeCanvas() {

    const rect =
        canvas.getBoundingClientRect();


    const dpr =
        window.devicePixelRatio || 1;


    width =
        rect.width;

    height =
        rect.height;


    canvas.width =
        Math.max(
            1,
            Math.floor(
                width * dpr
            )
        );


    canvas.height =
        Math.max(
            1,
            Math.floor(
                height * dpr
            )
        );


    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

}


window.addEventListener(
    "resize",
    resizeCanvas
);


/* ============================================================
   GET CURRENT STATE
   ============================================================ */


function getState() {

    return {

        rx:
            Number(
                controls.rotX.value
            ) *
            Math.PI / 180,


        ry:
            Number(
                controls.rotY.value
            ) *
            Math.PI / 180,


        rz:
            Number(
                controls.rotZ.value
            ) *
            Math.PI / 180,


        scale:
            Number(
                controls.scale.value
            ),


        cameraDistance:
            Number(
                controls.cameraDistance.value
            ),


        cameraYaw:
            Number(
                controls.cameraYaw.value
            ) *
            Math.PI / 180,


        cameraPitch:
            Number(
                controls.cameraPitch.value
            ) *
            Math.PI / 180

    };

}


/* ============================================================
   UPDATE OUTPUT VALUES
   ============================================================ */


function updateOutputs() {

    outputs.rotX.textContent =
        `${controls.rotX.value}°`;


    outputs.rotY.textContent =
        `${controls.rotY.value}°`;


    outputs.rotZ.textContent =
        `${controls.rotZ.value}°`;


    outputs.scale.textContent =
        `${Number(
            controls.scale.value
        ).toFixed(2)}×`;


    outputs.cameraDistance.textContent =
        Number(
            controls.cameraDistance.value
        ).toFixed(1);


    outputs.cameraYaw.textContent =
        `${controls.cameraYaw.value}°`;


    outputs.cameraPitch.textContent =
        `${controls.cameraPitch.value}°`;

}


document
    .querySelectorAll(
        'input[type="range"]'
    )
    .forEach(input => {

        input.addEventListener(
            "input",
            updateOutputs
        );

    });


/* ============================================================
   MAIN RENDER FUNCTION
   ============================================================ */


function render() {

    const state =
        getState();


    /* -------------------------
       Background
       ------------------------- */

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            height
        );


    gradient.addColorStop(
        0,
        "#101722"
    );


    gradient.addColorStop(
        1,
        "#080c12"
    );


    ctx.fillStyle =
        gradient;


    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    /* -------------------------
       Grid
       ------------------------- */

    drawGrid();


    /* -------------------------
       Step 1:
       Object transformation
       ------------------------- */

    const transformed =
        baseVertices.map(
            vertex =>

                transformVertex(

                    vertex,

                    state.rx,

                    state.ry,

                    state.rz,

                    state.scale

                )
        );


    /* -------------------------
       Step 2:
       Camera transformation
       ------------------------- */

    const viewed =
        transformed.map(
            vertex =>

                cameraTransform(

                    vertex,

                    state.cameraYaw,

                    state.cameraPitch,

                    state.cameraDistance

                )
        );


    /* -------------------------
       Step 3:
       Perspective projection
       ------------------------- */

    const projected =
        viewed.map(
            point =>
                perspectiveProject(
                    point
                )
        );


    /* -------------------------
       Step 4:
       Build face data
       ------------------------- */

    const faceData =
        faces.map(face => {

            const [
                a,
                b,
                c
            ] =
                face.indices.map(
                    i =>
                        viewed[i]
                );


            const normal =
                faceNormal(
                    a,
                    b,
                    c
                );


            const averageDepth =
                face.indices.reduce(
                    (sum, i) =>
                        sum +
                        viewed[i].z,
                    0
                ) /
                face.indices.length;


            /*
             * Back-face visibility.
             */
            const visible =
                normal.z < 0;


            return {

                ...face,

                normal,

                averageDepth,

                visible

            };

        });


    /* -------------------------
       Painter's Algorithm
       ------------------------- */

    faceData.sort(
        (a, b) =>
            b.averageDepth -
            a.averageDepth
    );


    /* -------------------------
       Draw visible faces
       ------------------------- */

    faceData.forEach(
        face => {

            if (!face.visible)
                return;


            drawFace(
                face,
                projected
            );

        }
    );


    /* -------------------------
       Wireframe
       ------------------------- */

    if (
        controls
            .wireframe
            .checked
    ) {

        drawWireframe(
            projected
        );

    }


    drawViewportInfo();

}


/* ============================================================
   DRAW FACE
   ============================================================ */


function drawFace(
    face,
    projected
) {

    const points =
        face.indices.map(
            i =>
                projected[i]
        );


    ctx.beginPath();


    ctx.moveTo(
        points[0].x,
        points[0].y
    );


    for (
        let i = 1;
        i < points.length;
        i++
    ) {

        ctx.lineTo(
            points[i].x,
            points[i].y
        );

    }


    ctx.closePath();


    /* -------------------------
       Shading
       ------------------------- */

    if (
        controls
            .shaded
            .checked
    ) {

        const brightness =
            0.38 +
            0.72 *
            Math.max(
                0,
                dot3(
                    face.normal,
                    lightDirection
                )
            );


        ctx.fillStyle =
            shadeColor(
                face.base,
                brightness
            );

    } else {

        ctx.fillStyle =
            "rgba(85,150,230,0.55)";

    }


    ctx.fill();


    /* -------------------------
       Face outline
       ------------------------- */

    ctx.strokeStyle =
        "rgba(230,240,255,0.55)";


    ctx.lineWidth =
        1.2;


    ctx.stroke();

}


/* ============================================================
   DRAW WIREFRAME
   ============================================================ */


function drawWireframe(
    projected
) {

    ctx.strokeStyle =
        "#f1f6ff";


    ctx.lineWidth =
        1.7;


    edges.forEach(
        ([a, b]) => {

            ctx.beginPath();


            ctx.moveTo(
                projected[a].x,
                projected[a].y
            );


            ctx.lineTo(
                projected[b].x,
                projected[b].y
            );


            ctx.stroke();

        }
    );

}


/* ============================================================
   VIEWPORT GRID
   ============================================================ */


function drawGrid() {

    const spacing = 50;


    ctx.save();


    ctx.strokeStyle =
        "rgba(130,150,180,0.07)";


    ctx.lineWidth = 1;


    /* Vertical */

    for (
        let x = width / 2;
        x < width;
        x += spacing
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            0
        );

        ctx.lineTo(
            x,
            height
        );

        ctx.stroke();

    }


    for (
        let x =
            width / 2 - spacing;
        x >= 0;
        x -= spacing
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            0
        );

        ctx.lineTo(
            x,
            height
        );

        ctx.stroke();

    }


    /* Horizontal */

    for (
        let y = height / 2;
        y < height;
        y += spacing
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            width,
            y
        );

        ctx.stroke();

    }


    for (
        let y =
            height / 2 - spacing;
        y >= 0;
        y -= spacing
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            width,
            y
        );

        ctx.stroke();

    }


    ctx.restore();

}


/* ============================================================
   VIEWPORT INFORMATION
   ============================================================ */


function drawViewportInfo() {

    ctx.save();


    ctx.fillStyle =
        "rgba(220,230,245,0.45)";


    ctx.font =
        "11px Arial";


    ctx.fillText(
        "X",
        width - 18,
        height / 2 - 8
    );


    ctx.fillText(
        "Y",
        width / 2 + 8,
        17
    );


    ctx.restore();

}


/* ============================================================
   AUTO ROTATION
   ============================================================ */


function animate(timestamp) {

    const deltaSeconds =
        Math.min(
            (timestamp - lastTime) / 1000,
            0.1
        );


    lastTime =
        timestamp;


    if (
        controls
            .autoRotate
            .checked
    ) {

        let y =
            Number(
                controls.rotY.value
            );


        y +=
            deltaSeconds * 35;


        if (y > 180) {

            y -= 360;

        }


        controls.rotY.value =
            y.toFixed(0);


        updateOutputs();

    }


    render();


    /* FPS */

    frameCounter++;


    if (
        timestamp -
        fpsTimer >=
        1000
    ) {

        outputs.fps.textContent =
            `${frameCounter} FPS`;


        frameCounter = 0;


        fpsTimer =
            timestamp;

    }


    requestAnimationFrame(
        animate
    );

}


/* ============================================================
   MOUSE CAMERA CONTROL
   ============================================================ */


canvas.addEventListener(
    "mousedown",
    event => {

        dragging = true;

        lastMouseX =
            event.clientX;

        lastMouseY =
            event.clientY;

    }
);


window.addEventListener(
    "mouseup",
    () => {

        dragging = false;

    }
);


window.addEventListener(
    "mousemove",
    event => {

        if (!dragging)
            return;


        const dx =
            event.clientX -
            lastMouseX;


        const dy =
            event.clientY -
            lastMouseY;


        lastMouseX =
            event.clientX;


        lastMouseY =
            event.clientY;


        let yaw =
            Number(
                controls.cameraYaw.value
            ) +
            dx * 0.35;


        let pitch =
            Number(
                controls.cameraPitch.value
            ) +
            dy * 0.25;


        yaw =
            Math.max(
                -80,
                Math.min(
                    80,
                    yaw
                )
            );


        pitch =
            Math.max(
                -60,
                Math.min(
                    60,
                    pitch
                )
            );


        controls.cameraYaw.value =
            yaw.toFixed(0);


        controls.cameraPitch.value =
            pitch.toFixed(0);


        updateOutputs();

    }
);


/* ============================================================
   MOUSE WHEEL
   ============================================================ */


canvas.addEventListener(
    "wheel",
    event => {

        event.preventDefault();


        let distance =
            Number(
                controls
                    .cameraDistance
                    .value
            );


        distance +=
            event.deltaY * 0.006;


        distance =
            Math.max(
                3.5,
                Math.min(
                    12,
                    distance
                )
            );


        controls
            .cameraDistance
            .value =
            distance.toFixed(1);


        updateOutputs();

    },
    {
        passive: false
    }
);


/* ============================================================
   DOUBLE CLICK RESET
   ============================================================ */


canvas.addEventListener(
    "dblclick",
    resetAll
);


/* ============================================================
   DEFAULT TRANSFORM
   ============================================================ */


function setDefaultTransform() {

    controls.rotX.value =
        25;

    controls.rotY.value =
        -25;

    controls.rotZ.value =
        0;

    controls.scale.value =
        1;

}


/* ============================================================
   DEFAULT CAMERA
   ============================================================ */


function setDefaultCamera() {

    controls
        .cameraDistance
        .value =
        6;


    controls
        .cameraYaw
        .value =
        0;


    controls
        .cameraPitch
        .value =
        0;

}


/* ============================================================
   RESET EVERYTHING
   ============================================================ */


function resetAll() {

    setDefaultTransform();

    setDefaultCamera();


    controls
        .autoRotate
        .checked =
        false;


    controls
        .shaded
        .checked =
        true;


    controls
        .wireframe
        .checked =
        false;


    updateOutputs();

}


/* ============================================================
   BUTTON EVENTS
   ============================================================ */


controls.resetBtn.addEventListener(
    "click",
    resetAll
);


controls.viewBtn.addEventListener(
    "click",
    () => {

        setDefaultCamera();

        updateOutputs();

    }
);


/* ============================================================
   INITIALIZATION
   ============================================================ */


resizeCanvas();

updateOutputs();

requestAnimationFrame(
    animate
);
