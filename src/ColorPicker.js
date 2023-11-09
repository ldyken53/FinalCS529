import React, { useState } from 'react';
import { SketchPicker } from 'react-color';

function ColorPicker({ initialColor, onColorChange }) {
  const [color, setColor] = useState(initialColor);

  const handleChangeComplete = (color) => {
    setColor(color.hex);
    onColorChange(color.hex);
  };

  return (
    <div>
      <SketchPicker color={color} onChangeComplete={handleChangeComplete} />
    </div>
  );
}

export default ColorPicker;
