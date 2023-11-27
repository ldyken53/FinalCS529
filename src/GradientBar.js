import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';

const GradientBar = ({ color, onSliderChangeLeft, onSliderChangeRight, onFinishChange, sliderPositionLeft, sliderPositionRight, topic }) => {
    const [isDraggingLeft, setIsDraggingLeft] = useState(false);
    const [isDraggingRight, setIsDraggingRight] = useState(false);
    const [sliderColorLeft, setSliderColorLeft] = useState("#ffffff");
    const [sliderColorRight, setSliderColorRight] = useState(color);

    const gradientStyle = {
        background: `linear-gradient(to right, #ffffff, ${color})`,
        height: '20px',
        width: '100%',
        position: 'relative',
        borderRadius: '10px', // Rounded edges
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)' // Box shadow for depth
    };

    const sliderStyleLeft = {
        width: '26px', // Slightly larger than the bar's height
        height: '26px', // Slightly larger than the bar's height
        background: sliderColorLeft,
        borderRadius: '50%', // Circular shape
        position: 'absolute',
        left: `${sliderPositionLeft}%`,
        cursor: 'pointer',
        transform: 'translate(-50%, -50%)', // Centered on the bar
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)', // Shadow effect
        border: '4px solid white', // Thick white border
        boxSizing: 'border-box',
        'margin-top': '8.9px'
    };

    const sliderStyleRight = {
        width: '26px', // Slightly larger than the bar's height
        height: '26px', // Slightly larger than the bar's height
        background: sliderColorRight,
        borderRadius: '50%', // Circular shape
        position: 'absolute',
        left: `${sliderPositionRight}%`,
        cursor: 'pointer',
        transform: 'translate(-50%, -50%)', // Centered on the bar
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)', // Shadow effect
        border: '4px solid white', // Thick white border
        boxSizing: 'border-box',
        'margin-top': '8.9px'
    };

    useEffect(() => {
        const interpolateColor = d3.interpolateRgb("#ffffff", color);
        setSliderColorLeft(interpolateColor(sliderPositionLeft / 100));
        setSliderColorRight(interpolateColor(sliderPositionRight / 100));
    }, [color, sliderPositionLeft, sliderPositionRight]);

    let barRect = null
    const handleMouseDownLeft = (event) => {
        setIsDraggingLeft(true);
    };
    const handleMouseDownRight = (event) => {
        setIsDraggingRight(true);
    };

    const handleMouseUp = (event) => {
        setIsDraggingLeft(false);
        setIsDraggingRight(false);
        onFinishChange();
    };

    const handleMouseMove = (event) => {
        if (isDraggingLeft) {
            barRect = document.getElementById(`colorBar_${topic}`).getBoundingClientRect()
            let newSliderPosition = ((event.clientX - barRect.left) / barRect.width) * 100;
            //console.log("Mouse Position: ", event.clientX, newSliderPosition, barRect.left, barRect.width)
            newSliderPosition = Math.max(0, Math.min(newSliderPosition, sliderPositionRight - 5)); // Clamp between 0 and right slider
            onSliderChangeLeft(newSliderPosition);
        }
        if (isDraggingRight) {
            barRect = document.getElementById(`colorBar_${topic}`).getBoundingClientRect()
            let newSliderPosition = ((event.clientX - barRect.left) / barRect.width) * 100;
            //console.log("Mouse Position: ", event.clientX, newSliderPosition, barRect.left, barRect.width)
            newSliderPosition = Math.max(sliderPositionLeft + 5, Math.min(newSliderPosition, 100)); // Clamp between left slider and 100
            onSliderChangeRight(newSliderPosition);
        }
    };

    useEffect(() => {
        const handleMouseUpGlobal = () => {
            if (isDraggingLeft) {
                setIsDraggingLeft(false);
            }
        };

        window.addEventListener('mouseup', handleMouseUpGlobal);
        return () => {
            window.removeEventListener('mouseup', handleMouseUpGlobal);
        };
    }, [isDraggingLeft]);

    useEffect(() => {
        const handleMouseUpGlobal = () => {
            if (isDraggingRight) {
                setIsDraggingRight(false);
            }
        };

        window.addEventListener('mouseup', handleMouseUpGlobal);
        return () => {
            window.removeEventListener('mouseup', handleMouseUpGlobal);
        };
    }, [isDraggingRight]);

    return (
        <div
            style={gradientStyle}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseUp}
            id={`colorBar_${topic}`}
        >
            <div
                style={sliderStyleLeft}
                onMouseDown={handleMouseDownLeft}
            ></div>
                        <div
                style={sliderStyleRight}
                onMouseDown={handleMouseDownRight}
            ></div>
        </div>
    );
};

export default GradientBar;
