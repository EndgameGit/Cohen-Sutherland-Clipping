const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

var canvasPosition = canvas.getBoundingClientRect();

var lineWidth = 12.5;
var lineColor = "black";
var allLineCoord = [];

function changeWidth(newWidth){
    lineWidth = newWidth/4;
    if(lineWidth == 0) lineWidth = 1;
}

function changeColor(newColor){
    lineColor = newColor;
}



// wait for the content of the window element
// to load, then performs the operations.
// This is considered best practice.
window.addEventListener('load', ()=>{
    document.addEventListener('click', toggleDraw);
});

	
// Stores the initial position of the cursor
let coord = {x:0 , y:0};
let startPoint = {x:0 , y:0};

// This is the flag that we are going to use to
// trigger drawing
let start = true;
	
// Updates the coordianates of the cursor when
// an event e is triggered to the coordinates where
// the said event is triggered.
function mousePosition(event){
coord.x = event.clientX - canvasPosition.left;
coord.y = event.clientY - canvasPosition.top;
}

function toggleDraw(event){
    mousePosition(event);
    if(canvasPosition.left > coord.x || coord.x > canvasPosition.right || coord.y > canvasPosition.bottom) return;
    if(start) {
        startPoint.x = coord.x;
        startPoint.y = coord.y;
        start = false;
    } else {
        sketch(event);
        start = true;
    }
   
}

	
function sketch(event){

ctx.beginPath();
	
ctx.lineWidth = lineWidth;

// Sets the end of the lines drawn
// to a round shape.
ctx.lineCap = 'round';
	
ctx.strokeStyle = lineColor;
	
// The cursor to start drawing
// moves to this coordinate
ctx.moveTo(startPoint.x, startPoint.y);

// The position of the cursor
// gets updated as we move the
// mouse around.
mousePosition(event);

// A line is traced from start
// coordinate to this coordinate
ctx.lineTo(coord.x , coord.y);

console.log("start: "+startPoint.x+", "+startPoint.y+"\nend: "+coord.x+", "+coord.y);
	
// Draws the line.
ctx.stroke();
allLineCoord.push({"sx": startPoint.x, "sy": startPoint.y, "ex": coord.x, "ey": coord.y, "width": lineWidth, "color": lineColor});
}

// 4-bit position coding constants
const INSIDE = 0; // 0000
const LEFT = 1;   // 0001
const RIGHT = 2;  // 0010
const BOTTOM = 4; // 0100
const TOP = 8;    // 1000

function clip() {
    resetCanvas();
    for(let i=0; i < allLineCoord.length;i++){
        console.log(allLineCoord[i]);
        var finished = false;

        while(!finished) {	// loop until both ends of the line have been clipped correctly
    
            var p = getPosition(allLineCoord[i].sx, allLineCoord[i].sy);	// positioncode of the line's starting point
            var q = getPosition(allLineCoord[i].ex, allLineCoord[i].ey);	// positioncode of the line's end point
    
            if (!(p | q)) {		// Bitwise OR is 0. Trivially accept and get out of loop
                //alert("Inside :)\nThis line can stay");
                finished = true;
                drawLine(allLineCoord[i]);
            } else if (p & q) {	// Bitwise AND is not 0. Trivially reject and get out of loop
                //alert("Outside :D\nRemoved!");
                finished = true;
                return;		// delete the line as it's completely outside
            } else {			// oh noes, we got a line crossing borders...
    
                if(p!=INSIDE) {	// p (the starting point of the line) is outside
                    var point = cutOff(p, allLineCoord[i].sx, allLineCoord[i].sy, allLineCoord[i].ex, allLineCoord[i].ey);
                    allLineCoord[i].sx = point[0];
                    allLineCoord[i].sy = point[1];
                } else if(q!=INSIDE) {	// q (the end point of the line) is outside
                    var point = cutOff(q, allLineCoord[i].sx, allLineCoord[i].sy, allLineCoord[i].ex, allLineCoord[i].ey);
                    allLineCoord[i].ex = point[0];
                    allLineCoord[i].ey = point[1];
                }
    
                if( (p=INSIDE) && (q==INSIDE) ) {	// if everything went right both ends of the line are inside -> finished
                    finished = true;
                }
    
            }
        }
        drawLine(allLineCoord[i]);	// draw the clipped line
    }
}

/*
 * Calculate the start and end points of the clipped line
 */
function cutOff(p, sx, sy, ex, ey) {
    var x;
    var y;
    var top = 100;
    var bottom = 400;
    var left = 100;
    var right = 400;

    if (p & TOP) {           // point is above the clip rectangle
        x = sx + ((top-sy)/(ey-sy)) * (ex-sx);
        y = top;
        //alert("top");
    } else if (p & BOTTOM) { // point is below the clip rectangle
        x = sx + ((bottom-sy)/(ey-sy)) * (ex-sx);
        y = bottom;
        //alert("bottom");
    }
    if (p & RIGHT) {  // point is to the right of clip rectangle
        x = right;
        y = sy + ((right-sx)/(ex-sx)) * (ey-sy)
        //alert("right");
    } else if (p & LEFT) {   // point is to the left of clip rectangle
        x = left;
        y = sy + ((left-sx)/(ex-sx)) * (ey-sy)
        //alert("left");
    }

    return new Array(x,y);
}
/*
			 * Determine the position code of the given point
			 */
function getPosition(x,y) {
    var position = INSIDE;
    var top = 100;
    var bottom = 400;
    var left = 100;
    var right = 400;

    if(x < left)
        position += LEFT;
    else if(x > right)
        position += RIGHT;
    if(y < top)
        position += TOP;
    else if(y > bottom)
        position += BOTTOM;

    return position;
}

function drawLine(line){
    ctx.beginPath();
	
    ctx.lineWidth = line.width;
    ctx.lineCap = 'round';
    ctx.strokeStyle = line.color;

    ctx.moveTo(line.sx, line.sy);

    ctx.lineTo(line.ex , line.ey);
    
    ctx.stroke();
}

function resetCanvas(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 1;
    ctx.moveTo(100,100);
    ctx.lineTo(400,100);
    ctx.lineTo(400,400);
    ctx.lineTo(100,400);
    ctx.lineTo(100,100); 
    ctx.stroke();
}
resetCanvas();