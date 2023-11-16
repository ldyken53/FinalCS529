import React, { useState, useEffect, useMemo, useRef } from 'react';
import './App.css';

import Particle3D from './Particle3D';
import LinkedViewD3 from './LinkedViewD3';
import ColorLegend from './ColorLegend';
import EmptyView from './EmptyView';
import ColorPicker from './ColorPicker';
import GradientBar from './GradientBar';
import { SliderColorProvider, useSliderColor } from './SliderColorContext';

import * as d3 from 'd3';
import * as tiff from 'tiff'

function App() {

  //data
  const [particleData, setParticleData] = useState();
  //states for brushing and linking
  const [brushedCoord, setbrushedCoord] = useState(0);
  const [brushedAxis, setBrushedAxis] = useState('x');

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

  const [hue, setHue] = useState(0); // The base hue for the color
  const [saturation, setSaturation] = useState(100);

  const { sliderColorL5, sliderColorL6 } = useSliderColor();

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

  
  var canvasRefL5 = useRef(null);
  var canvasRefL6 = useRef(null);
  var hiddenRef = useRef(null);
  var dataFetched = false;

  //TODO: Edit this to change the extents of the color scale for the linked view
  //saturated color scale used to color the particles
  const colorRange = ['#c6dbef', '#084594'];

  //how wide the 'brushed' area should be
  const brushedAreaThickness = .5;

  //TODO: for extra credit, set this to false if you want to allow the cross-section plane (brushedAxis) to be toggleable in the Particle3D View
  //otherwise, fix the value to 'x' so the code in LinkedViewD3 doesn't break
  const allowAxisToggle = true;

  function imshow(data, pixelSize, color, canvasRef) {
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
    dstContext.scale(0.2, 0.2);
    dstContext.drawImage(canvas, 0, 0);

    return canvas;
  }

  // useEffect(() => {
  //   fetchData();
  // }, [sliderPositionL5, sliderPositionL6]);

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
        //console.log(data);
        imshow(data, 1, d3.interpolateRgb('#FFFFFF', gradientColorL5), canvasRefL5);
        // if(sliderColorL5)
        // {
        //   imshow(data, 1, d3.interpolateRgb('#FFFFFF', sliderColorL5), canvasRefL5);
        // }
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
        imshow(data, 1, d3.interpolateRgb('#FFFFFF', gradientColorL6), canvasRefL6);
        // if(sliderColorL5)
        // {
        //   imshow(data, 1, d3.interpolateRgb('#FFFFFF', sliderColorL6), canvasRefL5);
        // }
      })
    )
    // if (sliderColorL5 && sliderColorL6) {
    //   imshow(data, 1, d3.interpolateRgb('#FFFFFF', sliderColorL5), canvasRefL5);
    //   imshow(data, 1, d3.interpolateRgb('#FFFFFF', sliderColorL6), canvasRefL6);
    // }
  }

  //wrapper for updating the axis we're slicing through for brushing 
  //reset the coordinate on a toggle
  function toggleBrushedAxis(coord) {
    if (allowAxisToggle & brushedCoord !== coord) {
      setBrushedAxis(coord);
      setbrushedCoord(0);
    }
  }

  //wrapper for increasing brush coordinate position on events
  function incrementBrush(scale) {
    let newY = brushedCoord + brushedAreaThickness * scale;
    setbrushedCoord(newY);
  }
  
  //event handler for key presses (up/down for incrementing brush event)
  function handleKeyPress(e) {
    console.log('e', e)
    e.preventDefault();
    if (e.keyCode === 38) {
      incrementBrush(.1)
    } else if (e.keyCode === 40) {
      incrementBrush(-.1);
    }
  }

  //fetch the dta 
  useEffect(() => {
    if (dataFetched) {
      fetchData();
    }
    dataFetched = true;
  }, []);

  //calculate the extents of the datapoints once
  function getBounds(data) {
    if (data === undefined) {
      return
    }
    var bounds = {};
    data.forEach(function (d) {
      // get the min bounds
      const p = d.position
      bounds.minX = Math.min(bounds.minX || Infinity, p[0]);
      bounds.minY = Math.min(bounds.minY || Infinity, p[2]);
      bounds.minZ = Math.min(bounds.minZ || Infinity, p[1]);

      // get the max bounds
      bounds.maxX = Math.max(bounds.maxX || -Infinity, p[0]);
      bounds.maxY = Math.max(bounds.maxY || -Infinity, p[2]);
      bounds.maxZ = Math.max(bounds.maxZ || -Infinity, p[1]);

      bounds.maxC = Math.max(bounds.maxC || -Infinity, d.concentration);
    });
    return bounds
  }


  //calculate bounds of the data once loaded
  const bounds = useMemo(() => {
    return getBounds(particleData);
  }, [particleData])


  //conditional accessor for the data feature we're using the brush the data
  function getBrushedCoord(d) {
    if (brushedAxis === 'y') {
      return d.position[2] - ((bounds.maxY - bounds.minY) / 2)
    } else if (brushedAxis === 'z') {
      return d.position[1]
    }
    return d.position[0]
  }

  //make buttons that toggle which axis we're using to slice the data
  const axisToggles = ['x', 'y', 'z'].map(c => {
    let active = c === brushedAxis;
    let variant = active ? 'activeButton' : 'inactiveButton';
    return (<button
      onClick={() => toggleBrushedAxis(c)}
      className={variant}
    >{c}</button>)
  })

  //tabIndex is needed to put the keypress event on the div
  return (
    <SliderColorProvider>
    <div
      onKeyUp={handleKeyPress}
      tabIndex={0}
      className="App" style={{ 'height': '100vh', 'width': '100vw' }}
    >
      <div style={{ 'maxHeight': '7vh' }}>
        <h1>{"Visualization of Cortical Cell Expressiveness"}</h1>
      </div>
      <canvas width={512} height={512} ref={canvasRefL5} />
      <canvas width={512} height={512} ref={canvasRefL6} />
      <canvas hidden={true} width={2048} height={2048} ref={hiddenRef} />
      {/* <div 
        className={'shadow'}
        style={{'height':'20vw','width':'calc(49vw - 10em)','maxHeight':'80vh','display':'inline-block','margin':'3px'}}
      >
        <EmptyView
          colorRange={colorRange}
          bounds={bounds}
          data={particleData}
          brushedCoord={brushedCoord}
          brushedAreaThickness={brushedAreaThickness}
          brushedAxis={brushedAxis}
          getBrushedCoord={getBrushedCoord}
        />
        <div style={{'width':'100%','fontSize':'1.5em'}}>
            {'L5 Cell Expression'}
        </div>
      </div> */}
      {/* <div 
        className={'shadow'}
        style={{'height':'20vw','width':'calc(48vw - 10em)','maxHeight':'80vh','display':'inline-block','margin':'3px'}}
      >
        <EmptyView
          colorRange={colorRange}
          bounds={bounds}
          data={particleData}
          brushedCoord={brushedCoord}
          brushedAreaThickness={brushedAreaThickness}
          brushedAxis={brushedAxis}
          getBrushedCoord={getBrushedCoord}
        />
        <div style={{'width':'100%','fontSize':'1.5em'}}>
            {'L6 Cell Expression'}
        </div>
      </div> */}
      <div
        className={'shadow'}
        style={{ 'height': '20vw', 'width': 'calc(49vw - 10em)', 'maxHeight': '80vh', 'display': 'inline-block', 'margin': '3px' }}
      >
        <EmptyView
          colorRange={colorRange}
          bounds={bounds}
          data={particleData}
          brushedCoord={brushedCoord}
          brushedAreaThickness={brushedAreaThickness}
          brushedAxis={brushedAxis}
          getBrushedCoord={getBrushedCoord}
        />
        <div style={{ 'width': '100%', 'fontSize': '1.5em' }}>
          {'Overlay View'}
        </div>
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
                barType="L5"
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
                  onColorChange={setGradientColorL5}
                />
              )}
            </div>

            <div>
              <h3>L6 Cell Color</h3>

              <GradientBar
                color={gradientColorL6}
                sliderPosition={sliderPositionL6}
                onSliderChange={handleSliderChangeL6}
                barType="L6"
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
                  onColorChange={setGradientColorL6}
                />
              )}
            </div>
          </div>

          <div style={{ 'width': '100%', 'height': 'calc(100% - 2em)' }}>
          </div>
        </div>
      </div>
    </div>
    </SliderColorProvider>
  );
}

export default App;
