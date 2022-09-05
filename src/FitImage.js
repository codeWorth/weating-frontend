import { useEffect, useRef, useState } from "react";

import "./FitImage.css";

function FitImage(props) {
    const { src, className = "", alt = "", ...extraProps } = props;
    const [ratio, setRatio] = useState(1);
    const img = useRef(null);
    const sizer = useRef(null);

    function getAspectRatio() {
        setRatio(img.current.naturalWidth / img.current.naturalHeight);
    }

    useEffect(() => {
        if (img.current && img.current.complete) {
            getAspectRatio();
        }
    }, []);

    return (
        <div className={"FitImage " + className} {...extraProps}>
            <div className="Sizer" ref={sizer} style={{aspectRatio: ratio}}>
                <img ref={img} src={src} onLoad={getAspectRatio} style={{aspectRatio: ratio}} alt={alt} />
            </div>
        </div>
    );
}

export default FitImage;