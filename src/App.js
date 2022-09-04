import './App.css';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    useParams,
    useNavigate
} from "react-router-dom";
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { ApiService, MapService } from "./apiService";
import { useCallback, useEffect, useRef, useState } from 'react';
import VALID_TYPES from "./validTypes";

const GOOGLE_API_KEY="AIzaSyB-LEbsoKOKJ44XPoLD1tZ5-sYfTcRcoh8";
const GOOGLE_API_LIBRARIES = ["places"];

function App() {
  return (
    <div className="App">
        <Router>
            <Routes>
                <Route path="/" element={<Home/>} />
                <Route path="/:room" element={<Room/>} />
            </Routes>
        </Router>
    </div>
  );
}

function Home() {
    const navigate = useNavigate();

    async function createRoom() {
        const response = await ApiService.createRoom();
        if (!response.ok) return;
        const roomId = (await response.json()).roomId;
        navigate("/" + roomId);
    }

    return (
        <div className="Home">
            <button onClick={createRoom}>Create Room</button>
        </div>
    )
}
  
const center = {
    lat: -3.746,
    lng: -38.523
};

function Map(props) {
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        libraries: GOOGLE_API_LIBRARIES,
        googleMapsApiKey: GOOGLE_API_KEY
    });

    const onLoad = useCallback(map => {
        const bounds = new window.google.maps.LatLngBounds(center);
        map.fitBounds(bounds);
        props.setMap(map);

        map.addListener("click", async (event) => {
            if (!event.placeId) return;
            props.setPlaceId(event.placeId);
        })
    }, []);
  
    const onUnmount = useCallback(map => {
        props.setMap(null)
    }, []);

    return isLoaded ? (
        <GoogleMap
            mapContainerClassName={props.className}
            center={center}
            zoom={10}
            onLoad={onLoad}
            onUnmount={onUnmount}>
        </GoogleMap>
    ) : <></>;
}

function Sidebar(props) {
    const room = props.room;
    const map = props.map;
    const entries = props.entries;

    const [placeEntries, setPlaceEntries] = useState([]);
    const [placeData, setPlaceData] = useState(null);
    const [placePhotoIndex, setPlacePhotoIndex] = useState(0);

    function incImage(inc) {
        const max = placeData.photos.length;
        return () => setPlacePhotoIndex((placePhotoIndex + inc + max) % max);
    }

    async function getPlaceInfo(placeId) {
        if (!placeId) return;

        const place = await MapService.getPlaceInfo(placeId, map);
        setPlaceEntries(entries.current.filter(entry => entry.placeId === placeId));
        
        place.types = place.types
            .filter(type => type in VALID_TYPES)
            .map(type => VALID_TYPES[type])
            .join(", ");
            
        place.photos = place.photos || [];
        place.photos = place.photos.map(photo => {return {ratio: photo.width / photo.height, url: photo.getUrl()}});
        setPlaceData(place);
        setPlacePhotoIndex(0);
    }
    useEffect(() => {getPlaceInfo(props.placeId)}, [props.placeId]);

    return (
        <div className={props.className}>
            {placeData !== null ? <div className="PlaceInfo">
                <h1>{placeData.name}</h1>
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
            </div> : <></>}
        </div>
    );
}

function Room() {
    let { room } = useParams();
    const [placeId, setPlaceId] = useState(null);
    const [map, setMap] = useState(null);
    const entries = useRef(null);

    async function getEntriesForRoom(room) {
        const response = await ApiService.getEntriesForRoom(room);
        if (!response.ok) return;
        return await response.json();
    }
    useEffect(() => {
        if (entries.current !== null) return;
        getEntriesForRoom(room).then(data => entries.current = data);
    }, [room])

    return (
        <div className="Room">
            <Map className="Map" placeId={placeId} setPlaceId={setPlaceId} setMap={setMap}/>
            <Sidebar className="Sidebar" room={room} placeId={placeId} map={map} entries={entries}/>
        </div>
    )
}

export default App;
