import React, { useState, useEffect, useMemo, useRef } from 'react';
import './App.css';

import ColorPicker from './ColorPicker';
import GradientBar from './GradientBar';

import * as d3 from 'd3';
import * as tiff from 'tiff'

// FIXME: import panzoom
import Panzoom from '@panzoom/panzoom'

function App() {
  const [colorL5, setColorL5] = useState('#D03402');
  const [colorL6, setColorL6] = useState('#F8E71C');
  const [colorOverlay, setColorOverlay] = useState('#F5A623');
  const [overlayRendered, setOverlayRendered] = useState(false);

  // Initial colors for the gradient bars
  const initialColorL5 = d3.interpolateOranges(0.5); // Midpoint of interpolateOranges
  const initialColorL6 = d3.interpolateBlues(0.5); // Midpoint of interpolatePurples
  const initialColorOverlay = d3.interpolateGreens(0.5); // Midpoint of interpolatePurples

  const [gradientColorL5, setGradientColorL5] = useState(initialColorL5);
  const [gradientColorL6, setGradientColorL6] = useState(initialColorL6);
  const [gradientColorOverlay, setGradientColorOverlay] = useState(initialColorOverlay);

  const [showColorPickerL5, setShowColorPickerL5] = useState(false);
  const [showColorPickerL6, setShowColorPickerL6] = useState(false);
  const [showColorPickerOverlay, setShowColorPickerOverlay] = useState(false);

  const toggleColorPickerL5 = () => setShowColorPickerL5(!showColorPickerL5);
  const toggleColorPickerL6 = () => setShowColorPickerL6(!showColorPickerL6);
  const toggleColorPickerOverlay = () => setShowColorPickerOverlay(!showColorPickerOverlay);

  const [sliderPositionL5, setSliderPositionL5] = useState(50); // State for L5 slider position
  const [sliderPositionL6, setSliderPositionL6] = useState(50); // State for L6 slider position
  const [sliderPositionOverlay, setSliderPositionOverlay] = useState(50); // State for L6 slider position

  const [dataL5, setDataL5] = useState();
  const [dataL6, setDataL6] = useState();
  useEffect(() => {
    renderOverlay(d3.interpolateRgb("#ffffff", colorL5), d3.interpolateRgb("#ffffff", colorL6), d3.interpolateRgb("#ffffff", colorOverlay));
  }, [dataL6]);

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

  const handleSliderChangeOverlay = (newPosition) => {
    setSliderPositionOverlay(newPosition);
    // Additional logic to convert newPosition to a color for L6, if needed
  };

  const setColormapL5 = (newColor) => {
    setColorL5(newColor);
    imshow(dataL5, 1, d3.interpolateRgb("#ffffff", newColor), canvasRefL5, 1);
    renderOverlay(
      d3.interpolateRgb("#ffffff", newColor),
      d3.interpolateRgb("#ffffff", colorL6),
      d3.interpolateRgb("#ffffff", colorOverlay)
    );
  }

  const setColormapL6 = (newColor) => {
    setColorL6(newColor);
    imshow(dataL6, 1, d3.interpolateRgb("#ffffff", newColor), canvasRefL6, 1);
    renderOverlay(
      d3.interpolateRgb("#ffffff", colorL5),
      d3.interpolateRgb("#ffffff", newColor),
      d3.interpolateRgb("#ffffff", colorOverlay)
    );
  }

  const setColormapOverlay = (newColor) => {
    setColorOverlay(newColor);
    renderOverlay(
      d3.interpolateRgb("#ffffff", colorL5),
      d3.interpolateRgb("#ffffff", colorL6),
      d3.interpolateRgb("#ffffff", newColor)
    );
  }

  var canvasRefL5 = useRef(null);
  var canvasRefL6 = useRef(null);
  var canvasRefOverlay = useRef(null);
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

    return canvas;
  }

  async function fetchData() {
    fetch(`L5Cells.TIF`).then((res) =>
      res.arrayBuffer().then(async function (arr) {
        var tif = tiff.decode(arr);
        var data = [];
        for (var i = 0; i < 2048; i++) {
          data.push([]);
          for (var j = 2048; j > 0; j--) {
            data[i].push(tif[0].data[i * 2048 + j - 1]);
          }
        }
        imshow(data, 1, d3.interpolateRgb("#ffffff", colorL5), canvasRefL5, 0.2);
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
        imshow(data, 1, d3.interpolateRgb("#ffffff", colorL6), canvasRefL6, 0.2);
        setDataL6(data);
      })
    )
  }

  useEffect(() => {
    setControls();
    if (!dataFetched) {
      fetchData();
    }
    dataFetched = true;
  }, []);

  function setControls() {
    const panZoomL5 = Panzoom(canvasRefL5.current, {
      maxScale: 5,
      zoomSpeed: 1,
      minScale: 1,
      noBind: true,
      step: 0.1
    });
    panZoomL5.pan(10, 10)
    panZoomL5.zoom(1, {
      animate: true
    });
    const panZoomL6 = Panzoom(canvasRefL6.current, {
      maxScale: 5,
      zoomSpeed: 1,
      minScale: 1,
      noBind: true,
      step: 0.1
    });
    panZoomL6.pan(10, 10)
    panZoomL6.zoom(1, {
      animate: true
    });
    const panZoomOverlay = Panzoom(canvasRefOverlay.current, {
      maxScale: 5,
      zoomSpeed: 1,
      minScale: 1,
      noBind: true,
      step: 0.1
    });
    panZoomOverlay.pan(10, 10);
    panZoomOverlay.zoom(1, {
      animate: true
    });

    canvasRefL5.current.addEventListener('pointerdown', panZoomL5.handleDown)
    canvasRefL5.current.addEventListener('pointerdown', panZoomL6.handleDown)
    canvasRefL5.current.addEventListener('pointerdown', panZoomOverlay.handleDown)
    canvasRefL6.current.addEventListener('pointerdown', panZoomL5.handleDown)
    canvasRefL6.current.addEventListener('pointerdown', panZoomL6.handleDown)
    canvasRefL6.current.addEventListener('pointerdown', panZoomOverlay.handleDown)
    canvasRefOverlay.current.addEventListener('pointerdown', panZoomL5.handleDown)
    canvasRefOverlay.current.addEventListener('pointerdown', panZoomL6.handleDown)
    canvasRefOverlay.current.addEventListener('pointerdown', panZoomOverlay.handleDown)
    document.addEventListener('pointermove', panZoomL5.handleMove)
    document.addEventListener('pointerup', panZoomL5.handleUp)
    document.addEventListener('pointermove', panZoomL6.handleMove)
    document.addEventListener('pointerup', panZoomL6.handleUp)
    document.addEventListener('pointermove', panZoomOverlay.handleMove)
    document.addEventListener('pointerup', panZoomOverlay.handleUp)

    // FIXME: use event listener; when user scrolls with mousewheel, zoom
    canvasRefL5.current.addEventListener('wheel', (event) => {
      if (event.deltaY > 0) {
        panZoomL5.zoomIn({ animate: false });
        panZoomL6.zoomIn({ animate: false });
        panZoomOverlay.zoomIn({ animate: false });
      } else {
        panZoomL5.zoomOut({ animate: false });
        panZoomL6.zoomOut({ animate: false });
        panZoomOverlay.zoomOut({ animate: false });
      }
    });
    canvasRefL6.current.addEventListener('wheel', (event) => {
      if (event.deltaY > 0) {
        panZoomL5.zoomIn({ animate: false });
        panZoomL6.zoomIn({ animate: false });
        panZoomOverlay.zoomIn({ animate: false });
      } else {
        panZoomL5.zoomOut({ animate: false });
        panZoomL6.zoomOut({ animate: false });
        panZoomOverlay.zoomOut({ animate: false });
      }
    });
    canvasRefOverlay.current.addEventListener('wheel', (event) => {
      if (event.deltaY > 0) {
        panZoomL5.zoomIn({ animate: false });
        panZoomL6.zoomIn({ animate: false });
        panZoomOverlay.zoomIn({ animate: false });
      } else {
        panZoomL5.zoomOut({ animate: false });
        panZoomL6.zoomOut({ animate: false });
        panZoomOverlay.zoomOut({ animate: false });
      }
    });
  }

  function renderOverlay(colorL5, colorL6, colorOverlay) {
    if (dataL5 && dataL6) {
      let scale = 0.2;
      if (overlayRendered) {
        scale = 1.0;
      }
      const flatL5 = [].concat.apply([], dataL5);
      const flatL6 = [].concat.apply([], dataL6);

      // Color Scale & Min-Max normalization
      const [minL5, maxL5] = d3.extent(flatL5);
      const normalizeL5 = d => ((d - minL5) / (maxL5 - minL5));
      const colorScaleL5 = d => colorL5(normalizeL5(d));
      const [minL6, maxL6] = d3.extent(flatL6);
      const normalizeL6 = d => ((d - minL6) / (maxL6 - minL6));
      const colorScaleL6 = d => colorL6(normalizeL6(d));
      // Shape of input array
      const shape = { x: dataL5[0].length, y: dataL5.length };

      // Set up canvas element
      const canvas = hiddenRef.current;
      const context = canvas.getContext("2d");
      canvas.style.width = `${shape.x}px`
      canvas.style.height = `${shape.y}px`;
      canvas.style.imageRendering = "pixelated";

      // Draw pixels to the canvas
      const imageData = context.createImageData(shape.x, shape.y);
      flatL5.forEach((d, i) => {
        let color = { r: 255, g: 255, b: 255 };
        if (normalizeL5(d) > 0.2) {
          if (normalizeL6(flatL6[i]) > 0.2) {
            color = d3.color(colorOverlay((normalizeL5(d) + normalizeL6(flatL6[i])) / 2));
          } else {
            color = d3.color(colorScaleL5(d));
          }
        } else if (normalizeL6(flatL6[i]) > 0.2) {
          color = d3.color(colorScaleL6(flatL6[i]));
        }
        imageData.data[i * 4] = color.r;
        imageData.data[i * 4 + 1] = color.g;
        imageData.data[i * 4 + 2] = color.b;
        imageData.data[i * 4 + 3] = 255;
      });
      context.putImageData(imageData, 0, 0);
      var dstContext = canvasRefOverlay.current.getContext("2d");
      console.log(scale);
      dstContext.scale(scale, scale);
      dstContext.drawImage(canvas, 0, 0);

      setOverlayRendered(true);
    }
  }

  return (
    <div
      tabIndex={0}
      className="App" style={{ 'height': '100vh', 'width': '100vw' }}
    >
      <div className="header-container" >
        <h1>{"Visualization of Cortical Cell Expressiveness"}</h1>
      </div>
      <div>{"Click and Drag to Pan, Scroll to Zoom"}</div>
      <div style={{ 'display': 'flex', 'flex-direction': 'row', 'justify-content': 'center' }}>
        <div>
          <canvas width={512} height={512} ref={canvasRefL5} />
        </div>
        <div>
          <canvas width={512} height={512} ref={canvasRefL6} />
        </div>
        <div>
          <canvas width={512} height={512} ref={canvasRefOverlay} />
        </div>
        <canvas hidden={true} width={2048} height={2048} ref={hiddenRef} />
      </div>
      <div
        style={{ 'height': '50vw', 'width': '20em', 'maxHeight': '80vh', 'display': 'inline-block', 'marginTop': '0px' }}
      >
        <div style={{ 'width': '100%', 'height': 'calc(100% - 9em)' }}>

          <div className='gradient-bars-container'>
            <div className='color-map-title-container'>
              <div className="color-map-title">{'Color Map for Values'}</div>
            </div>
            <div className="gradient-bar-section">
              <div className="gradient-bar-container">
                <h3>L5 Cell Color</h3>
                <GradientBar
                  color={colorL5}
                  sliderPosition={sliderPositionL5}
                  onSliderChange={handleSliderChangeL5}
                />

                <img
                  src="color-picker.png"
                  alt="Color Picker"
                  style={{ height: '25px' }}
                  onClick={toggleColorPickerL5}
                  id='colorPickerL5'
                />
                <label onClick={toggleColorPickerL5} htmlFor='colorPickerL5'>Click to Open/Close</label>

                {showColorPickerL5 && (
                  <ColorPicker
                    initialColor={colorL5}
                    onColorChange={setColormapL5}
                  />
                )}
              </div>

              <div className="gradient-bar-container">
                <h3>L6 Cell Color</h3>

                <GradientBar
                  color={colorL6}
                  sliderPosition={sliderPositionL6}
                  onSliderChange={handleSliderChangeL6}
                />

                <img
                  src="color-picker.png"
                  alt="Color Picker"
                  style={{ height: '25px' }}
                  onClick={toggleColorPickerL6}
                  id='colorPickerL6'
                />
                <label onClick={toggleColorPickerL6} htmlFor='colorPickerL6'>Click to Open/Close</label>

                {showColorPickerL6 && (
                  <ColorPicker
                    initialColor={colorL6}
                    onColorChange={setColormapL6}
                  />
                )}
              </div>
              <div className="gradient-bar-container">
                <h3>Overlap Color</h3>

                <GradientBar
                  color={colorOverlay}
                  sliderPosition={sliderPositionOverlay}
                  onSliderChange={handleSliderChangeOverlay}
                />

                <img
                  src="color-picker.png"
                  alt="Color Picker"
                  style={{ height: '25px' }}
                  onClick={toggleColorPickerOverlay}
                  id='colorPickerOverlay'
                />
                <label onClick={toggleColorPickerOverlay} htmlFor='colorPickerOverlay'>Click to Open/Close</label>

                {showColorPickerOverlay && (
                  <ColorPicker
                    initialColor={colorOverlay}
                    onColorChange={setColormapOverlay}
                  />
                )}
              </div>
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
