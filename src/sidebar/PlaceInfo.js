import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

import { MapService } from "../apiService";
import FitImage from "../util/FitImage";
import "./PlaceInfo.css";
import VALID_TYPES from "../validTypes";

function PlaceInfo(props) {
    const placeId = props.placeId;
    const setPlaceId = props.setPlaceId;
    const map = props.map;
    const setGoTo = props.setGoTo;

    const [placeData, setPlaceData] = useState(null);
    const [placePhotoIndex, setPlacePhotoIndex] = useState(0);

    function incImage(inc) {
        const max = placeData.photos.length;
        return () => setPlacePhotoIndex((placePhotoIndex + inc + max) % max);
    }

    async function getPlaceInfo(placeId) {
        if (!placeId) {
            setPlaceData(null);
            return;
        }

        const place = await MapService.getPlaceInfo(placeId, map);
        setGoTo(place.geometry);      
        place.types = place.types
            .filter(type => type in VALID_TYPES)
            .map(type => VALID_TYPES[type])
            .join(", ");
            
        place.photos = place.photos || [];
        setPlaceData(place);
        setPlacePhotoIndex(0);
    }
    useEffect(() => {getPlaceInfo(placeId)}, [placeId]);

    function close() {
        setPlaceId(null);
    }

    return (placeData
        ? <div className="PlaceInfo">
            <div className="Title">
                <h1>{placeData.name}</h1>
                <FontAwesomeIcon className="Close" onClick={close} icon={faTimes} />
            </div>
            <p>{placeData.types}</p>
            <p className="Address">{placeData.formatted_address}</p>
            {placeData.photos.length > 0 
                ? <>
                    <FitImage className="PlaceImage" src={placeData.photos[placePhotoIndex].getUrl()} />
                    <div className="Button Left" onClick={incImage(-1)}></div>
                    <div className="Button Right" onClick={incImage(1)}></div>
                </>
                : <></>
            }
        </div>
        : <></>
    );
}

export default PlaceInfo;