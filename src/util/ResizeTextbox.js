import { useEffect, useState } from "react";

import "./ResizeTextbox.css";

function ResizeTextbox(props) {
    const value = props.value;
    const setValue = props.setValue;
    const placeholder = props.placeholder || "";
    const maxHeight = !!props.maxHeight;
    const [sizingValue, setSizingValue] = useState("_");

    function onChange(e) {
        const value = e.target.value;
        setValue(value);
    }

    useEffect(() => {
        const lastChar = value.length > 0 ? value[value.length - 1] : "\n";
        setSizingValue(value + (lastChar === "\n" ? "_" : ""));
    }, [value]);

    return (<div className="ResizeContainer">
        <pre className={(maxHeight ? "MaxHeight" : "") + "Sizer"}>{sizingValue}</pre>
        <textarea value={value} onChange={e => onChange(e)} placeholder={placeholder}></textarea> 
    </div>);
}

export default ResizeTextbox;