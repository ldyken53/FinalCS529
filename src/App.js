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
  const [thresholdL5Inside, setThresholdL5Inside] = useState(0.2);
  const [thresholdL6Inside, setThresholdL6Inside] = useState(0.2);
  const [thresholdL5Outside, setThresholdL5Outside] = useState(0.2);
  const [thresholdL6Outside, setThresholdL6Outside] = useState(0.2);
  useEffect(() => {
    imShowL5();
    imShowOverlay();
  }, [thresholdL5, thresholdL5Inside, thresholdL5Outside]);
  useEffect(() => {
    imShowL6();
    imShowOverlay();
  }, [thresholdL6, thresholdL6Inside, thresholdL6Outside]);
  const polyTypeToThresholdL5 = {
    'inside': thresholdL5Inside,
    'outside': thresholdL5Outside,
    'neither': thresholdL5
  };
  const polyTypeToThresholdL6 = {
    'inside': thresholdL6Inside,
    'outside': thresholdL6Outside,
    'neither': thresholdL6
  };

  const [contrastL5, setContrastL5] = useState(1.0);
  const [contrastL6, setContrastL6] = useState(1.0);
  const [contrastOverlay, setContrastOverlay] = useState(1.0);
  useEffect(() => {
    canvasRefL5.current.style.cssText += `filter:contrast(${contrastL5});`;
  }, [contrastL5]);
  useEffect(() => {
    canvasRefL6.current.style.cssText += `filter:contrast(${contrastL6});`;
  }, [contrastL6]);
  useEffect(() => {
    canvasRefOverlay.current.style.cssText += `filter:contrast(${contrastOverlay});`;
  }, [contrastOverlay]);

  const [opacityL5, setOpacityL5] = useState(0.5);
  const [opacityL6, setOpacityL6] = useState(0.5);
  const [opacityL5Inside, setOpacityL5Inside] = useState(0.5);
  const [opacityL6Inside, setOpacityL6Inside] = useState(0.5);
  const [opacityL5Outside, setOpacityL5Outside] = useState(0.5);
  const [opacityL6Outside, setOpacityL6Outside] = useState(0.5);
  useEffect(() => {
    imShowOverlay();
  }, [opacityL5, opacityL6, opacityL5Inside, opacityL5Outside, opacityL6Inside, opacityL6Outside]);

  const [showColorPickerL5, setShowColorPickerL5] = useState(false);
  const [showColorPickerL6, setShowColorPickerL6] = useState(false);
  const [showColorPickerOverlay, setShowColorPickerOverlay] = useState(false);

  const [toggleInsidePolySliders, setToggleInsidePolySliders] = useState(false);
  const [toggleOutsidePolySliders, setToggleOutsidePolySliders] = useState(false);
  const [toggleNeitherPolySliders, setToggleNeitherPolySliders] = useState(true);
  const polyTypeToToggle = {
    'neither': () => { setToggleInsidePolySliders(false); setToggleOutsidePolySliders(false); setToggleNeitherPolySliders(true) },
    'outside': () => { setToggleInsidePolySliders(false); setToggleOutsidePolySliders(true); setToggleNeitherPolySliders(false) },
    'inside': () => { setToggleInsidePolySliders(true); setToggleOutsidePolySliders(false); setToggleNeitherPolySliders(false) },
  }
  const [polygonType, setPolygonType] = useState('neither');
  useEffect(() => {
    polyTypeToToggle[polygonType]();
    imShowL5();
    imShowL6();
    imShowOverlay();
  }, [polygonType]);
  const [overlayType, setOverlayType] = useState('color');
  useEffect(() => {
    imShowOverlay();
  }, [overlayType]);

  const toggleColorPickerL5 = () => setShowColorPickerL5(!showColorPickerL5);
  const toggleColorPickerL6 = () => setShowColorPickerL6(!showColorPickerL6);
  const toggleColorPickerOverlay = () => setShowColorPickerOverlay(!showColorPickerOverlay);

  const [sliderPositionL5Left, setSliderPositionL5Left] = useState(0); // State for L5 slider position
  const [sliderPositionL6Left, setSliderPositionL6Left] = useState(0); // State for L6 slider position
  const [sliderPositionOverlayLeft, setSliderPositionOverlayLeft] = useState(0); // State for L6 slider position
  const [sliderPositionL5Right, setSliderPositionL5Right] = useState(100); // State for L5 slider position
  const [sliderPositionL6Right, setSliderPositionL6Right] = useState(100); // State for L6 slider position
  const [sliderPositionOverlayRight, setSliderPositionOverlayRight] = useState(100); // State for L6 slider position

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
    imShowL5();
    imShowL6();
    imShowOverlay();

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

  const handleSliderFinishL5 = () => {
    colorL5Data();
  }

  const handleSliderFinishL6 = () => {
    colorL6Data();
  }

  const handleSliderFinishOverlay = () => {
    colorOverlayData();
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

  function addPolyPointL5(event) {
    addPolyPoint(canvasRefL5.current, event);
  }
  function addPolyPointL6(event) {
    addPolyPoint(canvasRefL6.current, event);
  }
  function addPolyPointOverlay(event) {
    addPolyPoint(canvasRefOverlay.current, event);
  }

  function colorL5Data() {
    console.time('color');
    if (dataL5) {
      // Assume sliderPositionL5 is between 0 and 100  
      var bt = d3.color(d3.interpolateRgb("#ffffff", colorL5)(sliderPositionL5Left / 100));
      var tp = d3.color(d3.interpolateRgb("#ffffff", colorL5)(sliderPositionL5Right / 100));
      const colorVal = (prop, value) =>
        Math.round(bt[prop] * (1 - value) + tp[prop] * value);

      setColorDataL5(dataL5.map((value) => {
        return { 'r': colorVal('r', value), 'g': colorVal('g', value), 'b': colorVal('b', value) }
      }));
    }
    console.timeEnd('color');
  }

  function colorL6Data() {
    if (dataL6) {
      // Assume sliderPositionL5 is between 0 and 100  
      var bt = d3.color(d3.interpolateRgb("#ffffff", colorL6)(sliderPositionL6Left / 100));
      var tp = d3.color(d3.interpolateRgb("#ffffff", colorL6)(sliderPositionL6Right / 100));
      const colorVal = (prop, value) =>
        Math.round(bt[prop] * (1 - value) + tp[prop] * value);

      setColorDataL6(dataL6.map((value) => {
        return { 'r': colorVal('r', value), 'g': colorVal('g', value), 'b': colorVal('b', value) }
      }));
    }
  }

  function colorOverlayData() {
    if (dataL5 && dataL6) {
      // Assume sliderPositionL5 is between 0 and 100  
      var bt = d3.color(d3.interpolateRgb("#ffffff", colorOverlay)(sliderPositionOverlayLeft / 100));
      var tp = d3.color(d3.interpolateRgb("#ffffff", colorOverlay)(sliderPositionOverlayRight / 100));
      const colorVal = (prop, value) =>
        Math.round(bt[prop] * (1 - value) + tp[prop] * value);

      setColorDataOverlay(dataOverlay.map((value) => {
        return { 'r': colorVal('r', value), 'g': colorVal('g', value), 'b': colorVal('b', value) }
      }));
    }
  }


  function makeImageData(data, colorData, context, polyTypeToThreshold) {
    const imageData = context.createImageData(dataW, dataH);
    for (var i = 0; i < data.length; i++) {
      let color = { r: 255, g: 255, b: 255 };
      if (polygonType != 'neither') {
        var inside = pointInPolygon([(i % dataW) / dataW, (i / dataW) / dataH], polyPoints);
        if (inside) {
          color = data[i] > polyTypeToThreshold['inside'] ? colorData[i] : { r: 255, g: 255, b: 255 };
        } else {
          color = data[i] > polyTypeToThreshold['outside'] ? colorData[i] : { r: 255, g: 255, b: 255 };
        }
      } else {
        color = data[i] > polyTypeToThreshold['neither'] ? colorData[i] : { r: 255, g: 255, b: 255 };
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
      const imageData = makeImageData(dataL5, colorDataL5, context, polyTypeToThresholdL5);
      console.timeEnd("foreachL5");
      context.putImageData(imageData, 0, 0);
    }
  }

  function imShowL6() {
    if (colorDataL6) {
      const canvas = canvasRefL6.current;
      const context = canvas.getContext("2d");
      console.time("foreachL6");
      const imageData = makeImageData(dataL6, colorDataL6, context, polyTypeToThresholdL6);
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
        var threshL5 = thresholdL5;
        var threshL6 = thresholdL6;
        var opacL5 = opacityL5;
        var opacL6 = opacityL6;
        if (polygonType != 'neither') {
          var inside = pointInPolygon([(i % dataW) / dataW, (i / dataW) / dataH], polyPoints);
          if (inside) {
            threshL5 = thresholdL5Inside;
            threshL6 = thresholdL6Inside;
            opacL5 = opacityL5Inside;
            opacL6 = opacityL6Inside;
          } else {
            threshL5 = thresholdL5Outside;
            threshL6 = thresholdL6Outside;
            opacL5 = opacityL5Outside;
            opacL6 = opacityL6Outside;
          }
        }
        let color = { r: 255, g: 255, b: 255 };
        let a = 1;
        if (dataL5[i] > threshL5) {
          if (dataL6[i] > threshL6) {
            if (overlayType == 'color') {
              color = colorDataOverlay[i];
              a = opacL5 + opacL6 * (1 - opacL5);
            } else {
              a = opacL5 + opacL6 * (1 - opacL5);
              color = {
                r: (opacL5 * colorDataL5[i].r + opacL6 * colorDataL6[i].r * (1 - opacL5)) / a,
                g: (opacL5 * colorDataL5[i].g + opacL6 * colorDataL6[i].g * (1 - opacL5)) / a,
                b: (opacL5 * colorDataL5[i].b + opacL6 * colorDataL6[i].b * (1 - opacL5)) / a,
              };
            }
          } else {
            color = colorDataL5[i];
            a = opacL5;
          }
        } else if (dataL6[i] > threshL6) {
          color = colorDataL6[i];
          a = opacL6;
        }
        imageData.data[i * 4] = color.r;
        imageData.data[i * 4 + 1] = color.g;
        imageData.data[i * 4 + 2] = color.b;
        imageData.data[i * 4 + 3] = a * 255;
      }
      console.timeEnd("foreach");
      console.log("reshow overlay");
      context.putImageData(imageData, 0, 0);
      for (var i = 0; i < polyPoints.length; i += 2) {
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

  const resetPolygon = (e) => {
    e.preventDefault();
    setPolyPoints([]);
  }

  const resetSettings = (e) => {
    e.preventDefault();
    setPolyPoints([]);
    setThresholdL5(0.2);
    setThresholdL5Inside(0.2);
    setThresholdL5Outside(0.2);
    setThresholdL6(0.2);
    setThresholdL6Inside(0.2);
    setThresholdL6Outside(0.2);
    setOpacityL5(0.5);
    setOpacityL5Inside(0.5);
    setOpacityL5Outside(0.5);
    setOpacityL6(0.5);
    setOpacityL6Inside(0.5);
    setOpacityL6Outside(0.5);
    setContrastL5(1.0);
    setContrastL6(1.0);
    setContrastOverlay(1.0);
    setPolygonType('neither');
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

  // TODO: load images by file (not necessary now cause only one data file)
  const loadImages = (e) => {
    e.preventDefault();
    alert("Loading file data disabled for demo!");
  }

  return (
    <div
      tabIndex={0}
      className="App" style={{ 'height': '100vh', 'width': '100vw' }}
    >
      <div className="header-container" >
        <h1>{"Visualization of Cortical Cell Expressiveness"}</h1>
      </div>
      <div className="instructions-text">
        Click and Drag to Pan, Scroll to Zoom, Double Click to Select Polygon Points
      </div>
      <div style={{ 'display': 'flex', 'flex-direction': 'row', 'justifyContent': 'space-between' }}>
        <div style={{ 'justifyContent': 'left' }}>
          <ToggleButtonGroup
            value={polygonType}
            onChange={(event, newValue) => {
              setPolygonType(newValue);
            }}
          >
            <Button value="inside" style={{ 'margin-left': '5px' }}>Change Settings Inside Polygon</Button>
            <Button value="outside">Change Settings Outside Polygon</Button>
            <Button value="neither">Change Settings Everywhere</Button>
          </ToggleButtonGroup>
        </div>
        <div style={{ 'justifyContent': 'left' }}>
          <ToggleButtonGroup
            value={overlayType}
            onChange={(event, newValue) => {
              setOverlayType(newValue);
            }}
          >
            <Button value="color">Overlay Data with Overlap Color</Button>
            <Button value="opacity">Overlay Data with Opacity</Button>
          </ToggleButtonGroup>
        </div>
        <div style={{ 'justifyContent': 'right' }}>
          <Button className="action-button reset-polygon-button" onClick={resetPolygon} style={{ 'margin-right': '2px' }}>Reset Polygon</Button>
          <Button className="action-button reset-settings-button" onClick={resetSettings} style={{ 'margin-right': '2px' }}>Reset Settings</Button>
          <Button className="action-button load-data-button" onClick={loadImages} style={{ 'margin-right': '2px' }}>Load Data</Button>
          <Button className="action-button save-image-button" onClick={saveImages} style={{ 'margin-right': '2px' }}>Save Images</Button>
        </div>
      </div>&nbsp;
      <div className="filters-title">Filters</div>
      {toggleNeitherPolySliders && (
        <div>
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
                  onChangeCommitted={(event, newValue) => { setThresholdL5(newValue) }}
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
                  onChangeCommitted={(event, newValue) => { setThresholdL6(newValue) }}
                />
              </div>
            </div>
          </div>
          <div className='sliders-container'>
            <div className="slider-section">
              <div className="slider-label">L5 Opacity in Overlay</div>
              <div className="slider-container">
                <Slider
                  defaultValue={opacityL5}
                  step={0.05}
                  min={0.0}
                  max={1.0}
                  aria-label="Default"
                  valueLabelDisplay="auto"
                  onChangeCommitted={(event, newValue) => { setOpacityL5(newValue) }}
                />
              </div>
              <div className="slider-label">L6 Opacity in Overlay</div>
              <div className="slider-container">
                <Slider
                  defaultValue={opacityL6}
                  step={0.05}
                  min={0.0}
                  max={1.0}
                  aria-label="Default"
                  valueLabelDisplay="auto"
                  onChangeCommitted={(event, newValue) => { setOpacityL6(newValue) }}
                />
              </div>
            </div>
          </div>
        </div>)}
      {toggleInsidePolySliders && (
        <div>
          <div className='sliders-container'>
            <div className="slider-section1">
              <div className="slider-label">L5 Threshold (Inside Polygon)</div>
              <div className="slider-container">
                <Slider
                  defaultValue={thresholdL5Inside}
                  step={0.01}
                  min={0.0}
                  max={1.0}
                  aria-label="Default"
                  valueLabelDisplay="auto"
                  onChangeCommitted={(event, newValue) => { setThresholdL5Inside(newValue) }}
                />
              </div>
              <div className="slider-label">L6 Threshold (Inside Polygon)</div>
              <div className="slider-container">
                <Slider
                  defaultValue={thresholdL6Inside}
                  step={0.01}
                  min={0.0}
                  max={1.0}
                  aria-label="Default"
                  valueLabelDisplay="auto"
                  onChangeCommitted={(event, newValue) => { setThresholdL6Inside(newValue) }}
                />
              </div>
            </div>
          </div>
          <div className='sliders-container'>
            <div className="slider-section1">
              <div className="slider-label">L5 Opacity in Overlay (Inside Polygon)</div>
              <div className="slider-container">
                <Slider
                  defaultValue={opacityL5Inside}
                  step={0.05}
                  min={0.0}
                  max={1.0}
                  aria-label="Default"
                  valueLabelDisplay="auto"
                  onChangeCommitted={(event, newValue) => { setOpacityL5Inside(newValue) }}
                />
              </div>
              <div className="slider-label">L6 Opacity in Overlay (Inside Polygon)</div>
              <div className="slider-container">
                <Slider
                  defaultValue={opacityL6Inside}
                  step={0.05}
                  min={0.0}
                  max={1.0}
                  aria-label="Default"
                  valueLabelDisplay="auto"
                  onChangeCommitted={(event, newValue) => { setOpacityL6Inside(newValue) }}
                />
              </div>
            </div>
          </div>
        </div>)}
      {toggleOutsidePolySliders && (
        <div>
          <div className='sliders-container'>
            <div className="slider-section1">
              <div className="slider-label">L5 Threshold (Outside Polygon)</div>
              <div className="slider-container">
                <Slider
                  defaultValue={thresholdL5Outside}
                  step={0.01}
                  min={0.0}
                  max={1.0}
                  aria-label="Default"
                  valueLabelDisplay="auto"
                  onChangeCommitted={(event, newValue) => { setThresholdL5Outside(newValue) }}
                />
              </div>
              <div className="slider-label">L6 Threshold (Outside Polygon)</div>
              <div className="slider-container">
                <Slider
                  defaultValue={thresholdL6Outside}
                  step={0.01}
                  min={0.0}
                  max={1.0}
                  aria-label="Default"
                  valueLabelDisplay="auto"
                  onChangeCommitted={(event, newValue) => { setThresholdL6Outside(newValue) }}
                />
              </div>
            </div>
          </div>
          <div className='sliders-container'>
            <div className="slider-section1">
              <div className="slider-label">L5 Opacity in Overlay (Outside Polygon)</div>
              <div className="slider-container">
                <Slider
                  defaultValue={opacityL5Outside}
                  step={0.05}
                  min={0.0}
                  max={1.0}
                  aria-label="Default"
                  valueLabelDisplay="auto"
                  onChangeCommitted={(event, newValue) => { setOpacityL5Outside(newValue) }}
                />
              </div>
              <div className="slider-label">L6 Opacity in Overlay (Outside Polygon)</div>
              <div className="slider-container">
                <Slider
                  defaultValue={opacityL6Outside}
                  step={0.05}
                  min={0.0}
                  max={1.0}
                  aria-label="Default"
                  valueLabelDisplay="auto"
                  onChangeCommitted={(event, newValue) => { setOpacityL6Outside(newValue) }}
                />
              </div>
            </div>
          </div>
        </div>)}
      <div className='sliders-container'>
        <div className="slider-section">
          <div className="slider-label">L5 Contrast</div>
          <div className="slider-container">
            <Slider
              defaultValue={contrastL5}
              step={0.05}
              min={0.8}
              max={1.5}
              aria-label="Default"
              valueLabelDisplay="auto"
              onChangeCommitted={(event, newValue) => { setContrastL5(newValue) }}
            />
          </div>
          <div className="slider-label">L6 Contrast</div>
          <div className="slider-container">
            <Slider
              defaultValue={contrastL6}
              step={0.05}
              min={0.8}
              max={1.5}
              aria-label="Default"
              valueLabelDisplay="auto"
              onChangeCommitted={(event, newValue) => { setContrastL6(newValue) }}
            />
          </div>
          <div className="slider-label">Overlay Contrast</div>
          <div className="slider-container">
            <Slider
              defaultValue={contrastOverlay}
              step={0.05}
              min={0.8}
              max={1.5}
              aria-label="Default"
              valueLabelDisplay="auto"
              onChangeCommitted={(event, newValue) => { setContrastOverlay(newValue) }}
            />
          </div>
        </div>
      </div>
      <div style={{ 'display': 'flex', 'flex-direction': 'row', 'justify-content': 'center' }}>
        <div style={{ 'border': '5px solid #f0f0f0' }}>
          <canvas width={2048} height={2048} ref={canvasRefL5} />
        </div>
        <div style={{ 'border': '5px solid #f0f0f0' }}>
          <canvas width={2048} height={2048} ref={canvasRefL6} />
        </div>
        <div style={{ 'border': '5px solid #f0f0f0' }}>
          <canvas width={2048} height={2048} ref={canvasRefOverlay} />
        </div>
        <canvas hidden={true} width={2048} height={2048} ref={hiddenRef} />
      </div>
      <div
        style={{ 'height': '50vw', 'width': '20em', 'maxHeight': '80vh', 'display': 'inline-block', 'marginTop': '0px' }}
      >
        <div style={{ 'width': '100%', 'height': 'calc(100% - 9em)' }}>

          <div className='gradient-bars-container'>
            <div className="gradient-bar-section">
              <div className="gradient-bar-container">
                <h3>L5 Cell Color</h3>
                <GradientBar
                  color={colorL5}
                  sliderPositionLeft={sliderPositionL5Left}
                  sliderPositionRight={sliderPositionL5Right}
                  onSliderChangeLeft={setSliderPositionL5Left}
                  onSliderChangeRight={setSliderPositionL5Right}
                  onFinishChange={handleSliderFinishL5}
                  topic={"l5"}
                />

                <div className="color-picker-container" onClick={toggleColorPickerL5}>
                  <img
                    src="color-picker.png"
                    alt="Color Picker"
                    style={{ height: '25px' }}
                    id='colorPickerL5'
                  />
                  <label htmlFor='colorPickerL5' className="color-picker-label">Click to Open/Close</label>
                </div>

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
                  sliderPositionLeft={sliderPositionL6Left}
                  sliderPositionRight={sliderPositionL6Right}
                  onSliderChangeLeft={setSliderPositionL6Left}
                  onSliderChangeRight={setSliderPositionL6Right}
                  onFinishChange={handleSliderFinishL6}
                  topic={"l6"}
                />

                <div className="color-picker-container" onClick={toggleColorPickerL6}>
                  <img
                    src="color-picker.png"
                    alt="Color Picker"
                    style={{ height: '25px' }}
                    id='colorPickerL6'
                  />
                  <label htmlFor='colorPickerL6' className="color-picker-label">Click to Open/Close</label>
                </div>


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
                  sliderPositionLeft={sliderPositionOverlayLeft}
                  sliderPositionRight={sliderPositionOverlayRight}
                  onSliderChangeLeft={setSliderPositionOverlayLeft}
                  onSliderChangeRight={setSliderPositionOverlayRight}
                  onFinishChange={handleSliderFinishOverlay}
                  topic={"overlay"}
                />

                <div className="color-picker-container" onClick={toggleColorPickerOverlay}>
                  <img
                    src="color-picker.png"
                    alt="Color Picker"
                    style={{ height: '25px' }}
                    onClick={toggleColorPickerOverlay}
                    id='colorPickerOverlay'
                  />
                  <label htmlFor='colorPickerOverlay' className="color-picker-label">Click to Open/Close</label>
                </div>

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
