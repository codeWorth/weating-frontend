import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import "./PlaceInfo.css";
import { MapService } from "./apiService";
import Entry from "./Entry";
import Comments from "./Comments";
import VALID_TYPES from "./validTypes";

function Sidebar(props) {
    const room = props.room;
    const map = props.map;
    const entries = props.entries;
    const placeId = props.placeId;
    const setPlaceId = props.setPlaceId;

    const [placeData, setPlaceData] = useState(null);
    const [placePhotoIndex, setPlacePhotoIndex] = useState(0);
    const [name, setName] = useState("");
    const [showComments, setShowComments] = useState(false);

    function getName() {
        const promptOut = prompt("Enter your name");
        if (promptOut !== null) setName(promptOut);
    }

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
        place.types = place.types
            .filter(type => type in VALID_TYPES)
            .map(type => VALID_TYPES[type])
            .join(", ");
            
        place.photos = place.photos || [];
        place.photos = place.photos.map(photo => {return {ratio: photo.width / photo.height, url: photo.getUrl()}});
        setPlaceData(place);
        setPlacePhotoIndex(0);
    }
    useEffect(() => {getPlaceInfo(placeId)}, [placeId]);

    function close() {
        setPlaceId(null);
    }

    return (
        <div className={props.className}>
            {placeData !== null 
                ? <div className="Container">
                    <div className="PlaceInfo">
                        <div className="Title">
                            <h1>{placeData.name}</h1>
                            <FontAwesomeIcon className="Close" onClick={close} icon={faTimes} />
                        </div>
                        <p>{placeData.types}</p>
                        <p className="Address">{placeData.formatted_address}</p>
                        {placeData.photos.length > 0 
                            ? <>
                                <div className="CroppedImg">
                                    <div className="Container" style={{aspectRatio: placeData.photos[placePhotoIndex].ratio}}>
                                        <img src={placeData.photos[placePhotoIndex].url} style={{aspectRatio: placeData.photos[placePhotoIndex].ratio}} alt=""/>
                                    </div>
                                </div>
                                <div className="Button Left" onClick={incImage(-1)}></div>
                                <div className="Button Right" onClick={incImage(1)}></div>
                            </>
                            : <></>}
                    </div>
                    <Entry room={room} name={name} placeId={placeId} entries={entries} setShowComments={setShowComments} />
                    {showComments
                        ? <div className="Comments">
                            <Comments room={room} name={name} placeId={placeId}/>
                        </div>
                        : <></>
                    }
                </div> 
                : <div className="Name">
                    {name.length > 0 
                        ? <>
                            <h1>{`Hi, ${name}`}</h1>
                            <button onClick={getName}>Update your name</button>
                        </>
                        : <button onClick={getName}>Set your name</button>
                    }
                </div>
            }
        </div>
    );
}

export default Sidebar;