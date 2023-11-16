import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import { useSliderColor } from './SliderColorContext';

const GradientBar = ({ color, onSliderChange, sliderPosition, barType }) => {
    const { updateSliderColorL5, updateSliderColorL6 } = useSliderColor();
    const [isDragging, setIsDragging] = useState(false);
    const [sliderColor, setSliderColor] = useState(color);
    useEffect(() => {
        const interpolateColor = d3.interpolateRgb("#ffffff", color);
        const newSliderColor = interpolateColor(sliderPosition / 100);
        setSliderColor(newSliderColor);
    }, [color, sliderPosition]);
    const gradientStyle = {
        background: `linear-gradient(to right, #ffffff, ${color})`,
        height: '20px',
        width: '100%',
        position: 'relative',
        borderRadius: '10px', // Rounded edges
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)' // Box shadow for depth
    };

    const sliderStyle = {
        width: '26px', // Slightly larger than the bar's height
        height: '26px', // Slightly larger than the bar's height
        background: sliderColor,
        borderRadius: '50%', // Circular shape
        position: 'absolute',
        left: `${sliderPosition}%`,
        cursor: 'pointer',
        transform: 'translate(-50%, -50%)', // Centered on the bar
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)', // Shadow effect
        border: '4px solid white', // Thick white border
        boxSizing: 'border-box',
        'margin-top': '8.9px'
    };

    useEffect(() => {
        const interpolateColor = d3.interpolateRgb("#ffffff", color);
        const newSliderColor = interpolateColor(sliderPosition / 100);
        //console.log('New slider color:', sliderColor);
        console.log(`New Slider Color for ${barType}:`, newSliderColor);
        if (barType === 'L5') {
            updateSliderColorL5(newSliderColor);
        } else if (barType === 'L6') {
            updateSliderColorL6(newSliderColor);
        }
    }, [color, sliderPosition, barType, updateSliderColorL5, updateSliderColorL6]);


    let barRect = null
    const handleMouseDown = (event) => {
        setIsDragging(true);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (event) => {
        if (isDragging) {
            barRect = document.getElementById('colorBar').getBoundingClientRect()
            //console.log(event.target)
            let newSliderPosition = ((event.clientX - barRect.left) / barRect.width) * 100;
            //console.log("Mouse Position: ", event.clientX, newSliderPosition, barRect.left, barRect.width)
            newSliderPosition = Math.max(0, Math.min(newSliderPosition, 100)); // Clamp between 0 and 100
            onSliderChange(newSliderPosition);
        }
    };

    useEffect(() => {
        const handleMouseUpGlobal = () => {
            if (isDragging) {
                setIsDragging(false);
            }
        };

        window.addEventListener('mouseup', handleMouseUpGlobal);
        return () => {
            window.removeEventListener('mouseup', handleMouseUpGlobal);
        };
    }, [isDragging]);

    return (
        <div
            style={gradientStyle}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseUp}
            id='colorBar'
        >
            <div
                style={sliderStyle}
                onMouseDown={handleMouseDown}
            ></div>
        </div>
    );
};

export default GradientBar;
