import React, { useState, useEffect, useMemo, useRef } from 'react';
import './App.css';

import ColorPicker from './ColorPicker';
import GradientBar from './GradientBar';

import * as d3 from 'd3';
import * as tiff from 'tiff';
import pointInPolygon from 'point-in-polygon';

import Panzoom from '@panzoom/panzoom';
import Slider from '@mui/material/Slider';
import { Button, ToggleButtonGroup } from '@mui/joy';

function App() {
  const dataW = 2048;
  const dataH = 2048;

  const [colorL5, setColorL5] = useState('#F86A02');
  const [colorL6, setColorL6] = useState('#084594');
  const [colorOverlay, setColorOverlay] = useState('#417505');
  useEffect(() => {
    colorL5Data();
  }, [colorL5]);
  useEffect(() => {
    colorL6Data();
  }, [colorL6]);
  useEffect(() => {
    colorOverlayData();
  }, [colorOverlay]);

  // Initial colors for the gradient bars
  const initialColorL5 = d3.interpolateOranges(0.5); // Midpoint of interpolateOranges
  const initialColorL6 = d3.interpolateBlues(0.5); // Midpoint of interpolatePurples
  const initialColorOverlay = d3.interpolateGreens(0.5); // Midpoint of interpolateGreens

  const [gradientColorL5, setGradientColorL5] = useState(initialColorL5);
  const [gradientColorL6, setGradientColorL6] = useState(initialColorL6);
  const [gradientColorOverlay, setGradientColorOverlay] = useState(initialColorOverlay);

  const [thresholdL5, setThresholdL5] = useState(0.2);
  const [thresholdL6, setThresholdL6] = useState(0.2);
  useEffect(() => {
    imShowL5();
    imShowOverlay();
  }, [thresholdL5]);
  useEffect(() => {
    imShowL6();
    imShowOverlay();
  }, [thresholdL6]);

  const [showColorPickerL5, setShowColorPickerL5] = useState(false);
  const [showColorPickerL6, setShowColorPickerL6] = useState(false);
  const [showColorPickerOverlay, setShowColorPickerOverlay] = useState(false);
  const [hidePolygon, setHidePolygon] = useState('neither');
  useEffect(() => {
    imShowL5();
    imShowL6();
    imShowOverlay();
  }, [hidePolygon]);

  const toggleColorPickerL5 = () => setShowColorPickerL5(!showColorPickerL5);
  const toggleColorPickerL6 = () => setShowColorPickerL6(!showColorPickerL6);
  const toggleColorPickerOverlay = () => setShowColorPickerOverlay(!showColorPickerOverlay);

  const [sliderPositionL5, setSliderPositionL5] = useState(50); // State for L5 slider position
  const [sliderPositionL6, setSliderPositionL6] = useState(50); // State for L6 slider position
  const [sliderPositionOverlay, setSliderPositionOverlay] = useState(50); // State for L6 slider position

  const [colormapBottomL5, setColormapBottomL5] = useState(0.0);
  const [colormapTopL5, setColormapTopL5] = useState(1.0);
  const [colormapBottomL6, setColormapBottomL6] = useState(0.0);
  const [colormapTopL6, setColormapTopL6] = useState(1.0);
  const [colormapBottomOverlay, setColormapBottomOverlay] = useState(0.0);
  const [colormapTopOverlay, setColormapTopOverlay] = useState(1.0);
  useEffect(() => {
    colorL5Data();
  }, [colormapBottomL5, colormapTopL5])
  useEffect(() => {
    colorL6Data();
  }, [colormapBottomL6, colormapTopL6])
  useEffect(() => {
    colorOverlayData();
  }, [colormapBottomOverlay, colormapTopOverlay])

  const [colorDataL5, setColorDataL5] = useState();
  const [colorDataL6, setColorDataL6] = useState();
  const [colorDataOverlay, setColorDataOverlay] = useState();
  useEffect(() => {
    imShowL5();
    imShowOverlay();
  }, [colorDataL5]);
  useEffect(() => {
    imShowL6();
    imShowOverlay();
  }, [colorDataL6]);
  useEffect(() => {
    imShowOverlay();
  }, [colorDataOverlay]);

  const [dataL5, setDataL5] = useState();
  const [dataL6, setDataL6] = useState();
  const [dataOverlay, setDataOverlay] = useState();
  useEffect(() => {
    overlayData();
    colorL5Data();
  }, [dataL5]);
  useEffect(() => {
    overlayData();
    colorL6Data();
  }, [dataL6]);
  useEffect(() => {
    colorOverlayData();
  }, [dataOverlay]);

  const [polyPoints, setPolyPoints] = useState([]);
  useEffect(() => {
    canvasRefL5.current.addEventListener('dblclick', addPolyPointL5);
    canvasRefL6.current.addEventListener('dblclick', addPolyPointL6);
    canvasRefOverlay.current.addEventListener('dblclick', addPolyPointOverlay);

    return () => {
      canvasRefL5.current.removeEventListener('dblclick', addPolyPointL5);
      canvasRefL6.current.removeEventListener('dblclick', addPolyPointL6);
      canvasRefOverlay.current.removeEventListener('dblclick', addPolyPointOverlay);
    }
  }, [polyPoints]);

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
    //console.log("Slider Position:", newPosition);
    setSliderPositionL6(newPosition);
    // Additional logic to convert newPosition to a color for L6, if needed
  };

  const handleSliderChangeOverlay = (newPosition) => {
    setSliderPositionOverlay(newPosition);
    // Additional logic to convert newPosition to a color for L6, if needed
  };

  const handleSliderFinishL5 = () => {
    var bottom = sliderPositionL5 > 50 ? (sliderPositionL5 - 50) / 50 : 0;
    var top = sliderPositionL5 < 50 ? sliderPositionL5 / 50 : 1;
    setColormapBottomL5(bottom);
    setColormapTopL5(top);
  }

  const handleSliderFinishL6 = () => {
    var bottom = sliderPositionL6 > 50 ? (sliderPositionL6 - 50) / 50 : 0;
    var top = sliderPositionL6 < 50 ? sliderPositionL6 / 50 : 1;
    setColormapBottomL6(bottom);
    setColormapTopL6(top);
  }

  const handleSliderFinishOverlay = () => {
    var bottom = sliderPositionOverlay > 50 ? (sliderPositionOverlay - 50) / 50 : 0;
    var top = sliderPositionOverlay < 50 ? sliderPositionOverlay / 50 : 1;
    setColormapBottomOverlay(bottom);
    setColormapTopOverlay(top);
  }

  const setColormapL5 = (newColor) => {
    setColorL5(newColor);
  }

  const setColormapL6 = (newColor) => {
    setColorL6(newColor);
  }

  const setColormapOverlay = (newColor) => {
    setColorOverlay(newColor);
  }

  var canvasRefL5 = useRef(null);
  var canvasRefL6 = useRef(null);
  var canvasRefOverlay = useRef(null);
  var hiddenRef = useRef(null);
  var dataFetched = false;

  function addPolyPointL5 (event) {
    addPolyPoint(canvasRefL5.current, event);
  }
  function addPolyPointL6 (event) {
    addPolyPoint(canvasRefL6.current, event);
  }
  function addPolyPointOverlay (event) {
    addPolyPoint(canvasRefOverlay.current, event);
  }

  function colorL5Data() {
    console.time('color');
    if (dataL5) {
      // Assume sliderPositionL5 is between 0 and 100
      var colorAtSlider = d3.interpolateRgb("#ffffff", colorL5)(sliderPositionL5 / 100);
  
      var colormap = d3.scaleLinear()
                       .domain([0, 1])
                       .range(["#ffffff", colorAtSlider]);
  
      setColorDataL5(dataL5.map(value => d3.color(colormap(value))));
    }
    console.timeEnd('color');
  }

  function colorL6Data() {
    if (dataL6) {
      // Assuming sliderPositionL6 is between 0 and 100
      var colorAtSlider = d3.interpolateRgb("#ffffff", colorL6)(sliderPositionL6 / 100);
  
      var colormap = d3.scaleLinear()
                       .domain([0, 1])
                       .range(["#ffffff", colorAtSlider]);
  
      setColorDataL6(dataL6.map(value => d3.color(colormap(value))));
    }
  }

  function colorOverlayData() {
    if (dataL5 && dataL6) {
      // Assuming sliderPositionOverlay is between 0 and 100
      var colorAtSlider = d3.interpolateRgb("#ffffff", colorOverlay)(sliderPositionOverlay / 100);
  
      var colormap = d3.scaleLinear()
                       .domain([0, 1])
                       .range(["#ffffff", colorAtSlider]);
  
      setColorDataOverlay(dataOverlay.map(value => d3.color(colormap(value))));
    }
  }


  function makeImageData(data, colorData, context, threshold) {
    const imageData = context.createImageData(dataW, dataH);
    for (var i = 0; i < data.length; i++) {
      let color = data[i] > threshold ? colorData[i] : {r: 255, g: 255, b: 255};
      if (hidePolygon != 'neither') {
        var inside = pointInPolygon([(i % dataW) / dataW, (i / dataW) / dataH], polyPoints);
        if ((inside && hidePolygon == 'inside') || (!inside && hidePolygon == 'outside')) {
          color = {r: 255, g: 255, b: 255};
        }
      }
      imageData.data[i * 4] = color.r;
      imageData.data[i * 4 + 1] = color.g;
      imageData.data[i * 4 + 2] = color.b;
      imageData.data[i * 4 + 3] = 255;    
    }
    return imageData;
  }

  function imShowL5() {
    if (colorDataL5) {
      const canvas = canvasRefL5.current;
      const context = canvas.getContext("2d");
      console.time("foreachL5");
      const imageData = makeImageData(dataL5, colorDataL5, context, thresholdL5);
      console.timeEnd("foreachL5");
      context.putImageData(imageData, 0, 0);
    }
  }

  function imShowL6() {
    if (colorDataL6) {
      const canvas = canvasRefL6.current;
      const context = canvas.getContext("2d");
      console.time("foreachL6");
      const imageData = makeImageData(dataL6, colorDataL6, context, thresholdL6);
      console.timeEnd("foreachL6");
      context.putImageData(imageData, 0, 0);
    }
  }

  function imShowOverlay() {
    if (colorDataL5 && colorDataL6 && colorDataOverlay) {
      const canvas = canvasRefOverlay.current;
      const context = canvas.getContext("2d");
      console.time("foreach");
      const imageData = context.createImageData(dataW, dataH);
      for (var i = 0; i < dataOverlay.length; i++) {
        let color = { r: 255, g: 255, b: 255 };
        if (dataL5[i] > thresholdL5) {
          if (dataL6[i] > thresholdL6) {
            color = colorDataOverlay[i];
          } else {
            color = colorDataL5[i];
          }
        } else if (dataL6[i] > thresholdL6) {
          color = colorDataL6[i];
        }
        if (hidePolygon != 'neither') {
          var inside = pointInPolygon([(i % dataW) / dataW, (i / dataW) / dataH], polyPoints);
          if ((inside && hidePolygon == 'inside') || (!inside && hidePolygon == 'outside')) {
            color = {r: 255, g: 255, b: 255};
          }
        }
        imageData.data[i * 4] = color.r;
        imageData.data[i * 4 + 1] = color.g;
        imageData.data[i * 4 + 2] = color.b;
        imageData.data[i * 4 + 3] = 255;
      }  
      console.timeEnd("foreach");
      console.log("reshow overlay");
      context.putImageData(imageData, 0, 0);
      for (var i = 0; i < polyPoints.length; i+=2) {
        drawPolyPoint(polyPoints[i], polyPoints[i + 1]);
      }
    }
  }

  function addPolyPoint(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    drawPolyPoint(x, y);
    setPolyPoints([...polyPoints, x, y]);
  }

  function overlayData() {
    if (dataL5 && dataL6) {
      var data = [];
      for (var i = 0; i < dataL5.length; i++) {
        data.push(dataL5[i] + dataL6[i]);
      }
      const [min, max] = d3.extent(data);
      for (var i = 0; i < data.length; i++) {
        data[i] = (data[i] - min) / (max - min);
      }
      setDataOverlay(data);
    }
  }

  async function fetchData() {
    function processData(raw) {
      var data = [];
      for (var i = 0; i < dataH; i++) {
        for (var j = dataW; j > 0; j--) {
          data.push(raw[i * dataW + j - 1]);
        }
      }
      // Normalize data on fetch
      const [min, max] = d3.extent(data);
      for (var i = 0; i < data.length; i++) {
        data[i] = (data[i] - min) / (max - min);
      }
      return data
    }
    fetch(`L5Cells.TIF`).then((res) =>
      res.arrayBuffer().then(async function (arr) {
        var tif = tiff.decode(arr);
        var data = processData(tif[0].data);
        setDataL5(data);
      })
    )
    fetch(`L6Cells.TIF`).then((res) =>
      res.arrayBuffer().then(function (arr) {
        var tif = tiff.decode(arr);
        var data = processData(tif[0].data);
        setDataL6(data);
      })
    )
  }

  useEffect(() => {
    if (!dataFetched) {
      setControls();
      fetchData();
    }
    dataFetched = true;
  }, []);

  function drawPolyPoint(x, y) {
    var ctx = canvasRefL5.current.getContext("2d");
    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x * canvasRefL5.current.width, y * canvasRefL5.current.height, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx = canvasRefL6.current.getContext("2d");
    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x * canvasRefL6.current.width, y * canvasRefL6.current.height, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx = canvasRefOverlay.current.getContext("2d");
    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x * canvasRefOverlay.current.width, y * canvasRefOverlay.current.height, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  }

  function setControls() {
    const panZoomL5 = Panzoom(canvasRefL5.current, {
      maxScale: 5,
      zoomSpeed: 1,
      minScale: 0.2,
      noBind: true,
      step: 0.1,
      origin: '12.5% 12.5%',
      startX: -750,
      startY: -650
    });
    panZoomL5.zoom(0.25, {
      animate: true
    });
    const panZoomL6 = Panzoom(canvasRefL6.current, {
      maxScale: 5,
      zoomSpeed: 1,
      minScale: 0.2,
      noBind: true,
      step: 0.1,
      origin: '12.5% 12.5%',
      startX: -750,
      startY: -650
    });
    panZoomL6.zoom(0.25, {
      animate: true
    });
    const panZoomOverlay = Panzoom(canvasRefOverlay.current, {
      maxScale: 5,
      zoomSpeed: 1,
      minScale: 0.2,
      noBind: true,
      step: 0.1,
      origin: '12.5% 12.5%',
      startX: -750,
      startY: -650
    });
    panZoomOverlay.zoom(0.25, {
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

  // save canvases as PNGs when the Save Images button is selected
  const saveImages = (e) => {
    e.preventDefault();

    // convert canvases to data URLs
    let urlL5 = canvasRefL5.current.toDataURL();
    let urlL6 = canvasRefL6.current.toDataURL();
    let urlOverlay = canvasRefOverlay.current.toDataURL();

    // create anchors
    const elemL5 = document.createElement("a");
    const elemL6 = document.createElement("a");
    const elemOverlay = document.createElement("a");

    // set the href value to the data URLs
    elemL5.href = urlL5;
    elemL6.href = urlL6;
    elemOverlay.href = urlOverlay;

    // name downloaded files
    elemL5.download = "L5 Image.png";
    elemL6.download = "L6 Image.png";
    elemOverlay.download = "Overlay Image.png";

    // click
    elemL5.click();
    elemL6.click();
    elemOverlay.click();
  }

  return (
    <div
      tabIndex={0}
      className="App" style={{ 'height': '100vh', 'width': '100vw' }}
    >
    <div style={{ 'display': 'flex', 'flex-direction': 'row', 'justifyContent': 'space-between'}}>
      <div style={{'justifyContent': 'left'}}>
      <ToggleButtonGroup
        value={hidePolygon}
        onChange={(event, newValue) => {
          setHidePolygon(newValue);
        }}
      >
        <Button value="inside">Hide Inside of Polygon</Button>
        <Button value="outside">Hide Outside of Polygon</Button>
        <Button value="neither">Neither</Button>
      </ToggleButtonGroup>
      </div>
      <div style= {{'justifyContent': 'right'}}>
        <Button style={{'margin-right': '5px'}}>Load Data</Button>
        <Button onClick={saveImages} style={{'margin-right': '5px'}}>Save Images</Button>
      </div>
    </div>
      <div className="header-container" >
        <h1>{"Visualization of Cortical Cell Expressiveness"}</h1>
      </div>
      <div>{"Click and Drag to Pan, Scroll to Zoom, Double Click to Select Polygon Points"}</div>
      <div className='sliders-container'>
        <div className="slider-section">
          <div className="slider-label">L5 Threshold</div>
          <div className="slider-container">
            <Slider 
              defaultValue={thresholdL5} 
              step={0.01}
              min={0.0}
              max={1.0}
              aria-label="Default" 
              valueLabelDisplay="auto" 
              onChangeCommitted={(event, newValue) => {setThresholdL5(newValue)}}
            />
          </div>
          <div className="slider-label">L6 Threshold</div>
          <div className="slider-container">
            <Slider 
              defaultValue={thresholdL6} 
              step={0.01}
              min={0.0}
              max={1.0}
              aria-label="Default" 
              valueLabelDisplay="auto"  
              onChangeCommitted={(event, newValue) => {setThresholdL6(newValue)}}
            />          
          </div>
        </div>
      </div>
      <div style={{ 'display': 'flex', 'flex-direction': 'row', 'justify-content': 'center' }}>
        <div style={{'border': '5px solid #f0f0f0'}}>
          <canvas width={2048} height={2048} ref={canvasRefL5} />
        </div>
        <div style={{'border': '5px solid #f0f0f0'}}>
          <canvas width={2048} height={2048} ref={canvasRefL6} />
        </div>
        <div style={{'border': '5px solid #f0f0f0'}}>
          <canvas width={2048} height={2048} ref={canvasRefOverlay} />
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
                  onFinishChange={handleSliderFinishL5}
                  topic={"l5"}
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
                  onFinishChange={handleSliderFinishL6}
                  topic={"l6"}
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
                  onFinishChange={handleSliderFinishOverlay}
                  topic={"overlay"}
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
