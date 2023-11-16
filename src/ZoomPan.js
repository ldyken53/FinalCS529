import React, {useState, useEffect, useMemo, useRef} from 'react';
import {canvasRefL5, canvasRefL6} from App.js;
import * as d3 from 'd3';

// get the canvas and its properties
var canvas = d3.select(canvasRefL5),
    context = canvas.node().getContext("2d"),
    width = canvas.property("width"),
    height = canvas.property("height");

// handle zoom and pan events
let zoom = d3.zoom()
    .on('zoom', handleZoom);


// event handler for zooming and panning
function handleZoom(e) {

    // specify the event is applied to the canvas and transform
    d3.select(canvasRefL5)
        .attr('transform', e.transform);
}

// attach the zoom behavior to the canvas element
d3.select(canvasRefL5)
    .call(zoom);

//import React, {useState, useEffect, useMemo, useRef} from 'react';

// const ZoomAndPan = () => {
//     const canvasRef = useRef(null);

//     useEffect(() => {
//         const canvas = d3.select(canvasRef.current),
//               context = canvas.node().getContext("2d"),
//               width = canvas.property("width"),
//               height = canvas.property("height");

//        var zoom = d3.zoom().on("zoom", handleZoom);

//        canvas.call(zoom);

//        function handleZoom(event, context) {
//             context.save();
//             context.clearRect(0, 0, width, height);
//             context.translate(event.transform.x, event.transform.y);
//             context.scale(event.transform.k, event.transform.k);

//             draw(context) //maybe im show instead?
//             context.restore();
//         }
//     });
// }