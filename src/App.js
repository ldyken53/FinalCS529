import React, { useState, useEffect, useMemo, useRef } from 'react';
import './App.css';

import ColorPicker from './ColorPicker';
import GradientBar from './GradientBar';

import * as d3 from 'd3';
import * as tiff from 'tiff'

// FIXME: import panzoom
import Panzoom from '@panzoom/panzoom'

function App() {
  const [colorL5, setColorL5] = useState('#c6dbef');
  const [colorL6, setColorL6] = useState('#084594');

  // Initial colors for the gradient bars
  const initialColorL5 = d3.interpolateOranges(0.5); // Midpoint of interpolateOranges
  const initialColorL6 = d3.interpolatePurples(0.5); // Midpoint of interpolatePurples

  const [gradientColorL5, setGradientColorL5] = useState(initialColorL5);
  const [gradientColorL6, setGradientColorL6] = useState(initialColorL6);

  const [showColorPickerL5, setShowColorPickerL5] = useState(false);
  const [showColorPickerL6, setShowColorPickerL6] = useState(false);

  const toggleColorPickerL5 = () => setShowColorPickerL5(!showColorPickerL5);
  const toggleColorPickerL6 = () => setShowColorPickerL6(!showColorPickerL6);

  const [sliderPositionL5, setSliderPositionL5] = useState(50); // State for L5 slider position
  const [sliderPositionL6, setSliderPositionL6] = useState(50); // State for L6 slider position

  const [dataL5, setDataL5] = useState();
  const [dataL6, setDataL6] = useState();

  const [hue, setHue] = useState(0); // The base hue for the color
  const [saturation, setSaturation] = useState(100);

  const handleSaturationChange = (newSaturation) => {
    setSaturation(newSaturation);
  };

  // Function to handle slider position change for L5
  const handleSliderChangeL5 = (newPosition) => {
    setSliderPositionL5(newPosition);
    // Additional logic to convert newPosition to a color for L5, if needed
  };

  // Function to handle slider position change for L6
  const handleSliderChangeL6 = (newPosition) => {
    setSliderPositionL6(newPosition);
    // Additional logic to convert newPosition to a color for L6, if needed
  };

  const setColormapL5 = (newColor) => {
    setColorL5(newColor);
    imshow(dataL5, 1, d3.interpolateRgb("#ffffff", newColor), canvasRefL5, 1);
  }

  const setColormapL6 = (newColor) => {
    setColorL6(newColor);
    imshow(dataL6, 1, d3.interpolateRgb("#ffffff", newColor), canvasRefL6, 1);
  }

  var canvasRefL5 = useRef(null);
  var canvasRefL6 = useRef(null);
  var hiddenRef = useRef(null);
  var dataFetched = false;

  function imshow(data, pixelSize, color, canvasRef, scale) {
    // Flatten 2D input array
    const flat = [].concat.apply([], data);
    // Color Scale & Min-Max normalization
    const [min, max] = d3.extent(flat);
    const normalize = d => ((d - min) / (max - min));
    const colorScale = d => color(normalize(d));
    // Shape of input array
    const shape = { x: data[0].length, y: data.length };

    // Set up canvas element
    const canvas = hiddenRef.current;
    const context = canvas.getContext("2d");
    canvas.style.width = `${shape.x * pixelSize}px`
    canvas.style.height = `${shape.y * pixelSize}px`;
    canvas.style.imageRendering = "pixelated";

    // Draw pixels to the canvas
    const imageData = context.createImageData(shape.x, shape.y);
    flat.forEach((d, i) => {
      let color = isNaN(d) ? { r: 0, g: 0, b: 0 } : d3.color(colorScale(d));
      imageData.data[i * 4] = color.r;
      imageData.data[i * 4 + 1] = color.g;
      imageData.data[i * 4 + 2] = color.b;
      imageData.data[i * 4 + 3] = 255;
    });
    context.putImageData(imageData, 0, 0);
    var dstContext = canvasRef.current.getContext("2d");
    dstContext.scale(scale, scale);
    dstContext.drawImage(canvas, 0, 0);

      // FIXME: use the imported Panzoom to pan and zoom on the L5 and L6 canvases
    var canvasL = canvasRef.current
    const panZoomL = Panzoom(canvasL, {
      maxScale: 5,
      zoomSpeed: 1,
      minScale: 1
    })
    panZoomL.pan(10, 10)
    panZoomL.zoom(2, {
      animate: true
    })

    // FIXME: use event listener; when user scrolls with mousewheel, zoom
    canvasL.addEventListener('wheel', panZoomL.zoomWithWheel)
  
    return canvas;
  }

  //here we parse the data as a list of objects
  //with values position ([x,y,z]), velocity ([x,y,z]) and concentration (number)
  async function fetchData() {
    fetch(`L5Cells.TIF`).then((res) =>
      res.arrayBuffer().then(function (arr) {
        var tif = tiff.decode(arr);
        var data = [];
        for (var i = 0; i < 2048; i++) {
          data.push([]);
          for (var j = 2048; j > 0; j--) {
            data[i].push(tif[0].data[i * 2048 + j - 1]);
          }
        }
        imshow(data, 1, d3.interpolateOranges, canvasRefL5, 0.2);
        setDataL5(data);
      })
    )
    fetch(`L6Cells.TIF`).then((res) =>
      res.arrayBuffer().then(function (arr) {
        var tif = tiff.decode(arr);
        var data = [];
        for (var i = 0; i < 2048; i++) {
          data.push([]);
          for (var j = 2048; j > 0; j--) {
            data[i].push(tif[0].data[i * 2048 + j - 1]);
          }
        }
        imshow(data, 1, d3.interpolatePurples, canvasRefL6, 0.2);
        setDataL6(data);
      })
    )
  }

  useEffect(() => {
    if (!dataFetched) {
      fetchData();
    }
    dataFetched = true;
  }, []);

  return (
    <div
      tabIndex={0}
      className="App" style={{ 'height': '100vh', 'width': '100vw' }}
    >
      <div style={{ 'maxHeight': '7vh' }}>
        <h1>{"Visualization of Cortical Cell Expressiveness"}</h1>
      </div>
      <div style={{'display': 'flex', 'flex-direction': 'row', 'justify-content': 'center'}}>
        <div>
          <canvas width={512} height={512} ref={canvasRefL5}/>
        </div>
        <div>
          <canvas width={512} height={512} ref={canvasRefL6}/>
        </div>
        <canvas hidden={true} width={2048} height={2048} ref={hiddenRef}/>
      </div>
      <div
        style={{ 'height': '50vw', 'width': '20em', 'maxHeight': '80vh', 'display': 'inline-block', 'marginTop': '0px' }}
      >
        <div style={{ 'width': '100%', 'height': 'calc(100% - 9em)' }}>
          <div style={{ 'width': '100%', 'height': '1.5em', 'fontSize': '1.5em' }}>
            {'Color Map for Values'}
            <div>
              <h3>L5 Cell Color</h3>
              <GradientBar
                color={gradientColorL5}
                sliderPosition={sliderPositionL5}
                onSliderChange={handleSliderChangeL5}
              />

              <img
                src="color-picker.png"
                alt="Color Picker"
                style={{ height: '25px' }}
                onClick={toggleColorPickerL5}
              />

              {showColorPickerL5 && (
                <ColorPicker
                  initialColor={gradientColorL5}
                  onColorChange={setColormapL5}
                />
              )}
            </div>

            <div>
              <h3>L6 Cell Color</h3>

              <GradientBar
                color={gradientColorL6}
                sliderPosition={sliderPositionL6}
                onSliderChange={handleSliderChangeL6}
              />

              <img
                src="color-picker.png"
                alt="Color Picker"
                style={{ height: '25px' }}
                onClick={toggleColorPickerL6}
              />

              {showColorPickerL6 && (
                <ColorPicker
                  initialColor={gradientColorL6}
                  onColorChange={setColormapL6}
                />
              )}
            </div>
          </div>

          <div style={{ 'width': '100%', 'height': 'calc(100% - 2em)' }}>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
