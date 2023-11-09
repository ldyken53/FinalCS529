import React, {useEffect, useRef,useMemo,useState,useLayoutEffect} from 'react';

//helper function to  wait for window resize
function useWindowSize() {
    const [size, setSize] = useState([0, 0]);
    useLayoutEffect(() => {
      function updateSize() {
        setSize([window.innerWidth, window.innerHeight]);
      }
      window.addEventListener('resize', updateSize);
      updateSize();
      return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
}

// Create a new empty view
export default function EmptyView(props){
    const container = useRef(null);

    const [screensize] = useWindowSize();
    const [height,setHeight] = useState(0);
    const [width,setWidth] = useState(0);
    const [scene,setScene] = useState();

    //get the size of the canvas
    useEffect( () => {
        //wait for mounting to calculate parent container size
        if(!container.current){ return; }
        var h = container.current.clientHeight*.99;
        var w = container.current.clientWidth;

        setHeight(h);
        setWidth(w);

    },[container.current,screensize]);

    return (
        <div
            className={"d3-component"}
            style={{'height':'99%','width':'99%'}}
            ref={container}
        ></div>
    );
}
