// SliderColorContext.js
import React, { createContext, useState, useContext } from 'react';

const SliderColorContext = createContext({}); // Providing an initial value

export const useSliderColor = () => useContext(SliderColorContext);

export const SliderColorProvider = ({ children }) => {
  const [sliderColorL5, setSliderColorL5] = useState('');
  const [sliderColorL6, setSliderColorL6] = useState('');

  const updateSliderColorL5 = (color) => {
    setSliderColorL5(color);
  };

  const updateSliderColorL6 = (color) => {
    setSliderColorL6(color);
  };

  return (
    <SliderColorContext.Provider value={{ sliderColorL5, updateSliderColorL5, sliderColorL6, updateSliderColorL6 }}>
      {children}
    </SliderColorContext.Provider>
  );
};
