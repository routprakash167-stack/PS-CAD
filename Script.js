const canvas = new fabric.Canvas('canvas', {
    backgroundColor: '#ffffff',
    selection: true
});

canvas.setWidth(window.innerWidth);
canvas.setHeight(window.innerHeight - 50);

let currentTool = 'select';
let isDrawing = false;
let startX, startY;
let shape;
const gridSize = 20;

/* ---------------- GRID SYSTEM ---------------- */

function drawGrid() {
    for (let i = 0; i < (canvas.width / gridSize); i++) {
        canvas.add(new fabric.Line([ i * gridSize, 0, i * gridSize, canvas.height], {
            stroke: '#eee',
            selectable: false,
            evented: false
        }));
        canvas.add(new fabric.Line([ 0, i * gridSize, canvas.width, i * gridSize], {
            stroke: '#eee',
            selectable: false,
            evented: false
        }));
    }
}

drawGrid();

/* ---------------- SNAP FUNCTION ---------------- */

function snap(value) {
    return Math.round(value / gridSize) * gridSize;
}

/* ---------------- TOOL SWITCH ---------------- */

function setTool(tool) {
    currentTool = tool;
}

/* ---------------- DRAWING ---------------- */

canvas.on('mouse:down', function(o) {

    if (currentTool === 'select') return;

    isDrawing = true;
    const pointer = canvas.getPointer(o.e);
    startX = snap(pointer.x);
    startY = snap(pointer.y);

    if (currentTool === 'line') {
        shape = new fabric.Line([startX, startY, startX, startY], {
            stroke: 'black',
            strokeWidth: 2
        });
    }

    if (currentTool === 'rect') {
        shape = new fabric.Rect({
            left: startX,
            top: startY,
            width: 0,
            height: 0,
            fill: 'transparent',
            stroke: 'black',
            strokeWidth: 2
        });
    }

    if (currentTool === 'circle') {
        shape = new fabric.Circle({
            left: startX,
            top: startY,
            radius: 1,
            fill: 'transparent',
            stroke: 'black',
            strokeWidth: 2
        });
    }

    if (currentTool === 'wall') {
        shape = new fabric.Rect({
            left: startX,
            top: startY,
            width: 0,
            height: 10,
            fill: '#999'
        });
    }

    canvas.add(shape);
});

canvas.on('mouse:move', function(o) {
    if (!isDrawing) return;

    const pointer = canvas.getPointer(o.e);
    const x = snap(pointer.x);
    const y = snap(pointer.y);

    if (currentTool === 'line') {
        shape.set({ x2: x, y2: y });
    }

    if (currentTool === 'rect') {
        shape.set({
            width: x - startX,
            height: y - startY
        });
    }

    if (currentTool === 'circle') {
        const radius = Math.sqrt(
            Math.pow(x - startX, 2) +
            Math.pow(y - startY, 2)
        ) / 2;
        shape.set({ radius: radius });
    }

    if (currentTool === 'wall') {
        shape.set({
            width: x - startX
        });
    }

    canvas.renderAll();
});

canvas.on('mouse:up', function() {
    isDrawing = false;
});

/* ---------------- DELETE KEY ---------------- */

document.addEventListener('keydown', function(e) {
    if (e.key === "Delete") {
        const active = canvas.getActiveObject();
        if (active) {
            canvas.remove(active);
        }
    }
});

/* ---------------- ZOOM ---------------- */

canvas.on('mouse:wheel', function(opt) {
    const delta = opt.e.deltaY;
    let zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > 3) zoom = 3;
    if (zoom < 0.5) zoom = 0.5;
    canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
});

/* ---------------- PAN (ALT + DRAG) ---------------- */

canvas.on('mouse:move', function(opt) {
    if (opt.e.altKey && opt.e.buttons === 1) {
        const delta = new fabric.Point(opt.e.movementX, opt.e.movementY);
        canvas.relativePan(delta);
    }
});

/* ---------------- CLEAR ---------------- */

function clearCanvas() {
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    drawGrid();
}
