import {
    BrowserRouter as Router,
    Routes,
    Route,
    useParams,
    useNavigate
} from "react-router-dom";
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useCallback, useEffect, useState } from 'react';

import "./App.css";
import "./MainHeader.css";
import { ApiService } from "./apiService";
import Sidebar from "./Sidebar";

const GOOGLE_API_KEY="AIzaSyB-LEbsoKOKJ44XPoLD1tZ5-sYfTcRcoh8";
const GOOGLE_API_LIBRARIES = ["places"];

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
            event.stop();
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

function Room() {
    let { room } = useParams();
    const [placeId, setPlaceId] = useState(null);
    const [map, setMap] = useState(null);
    const [updateEntries, setUpdateEntries] = useState(true);
    const [entries, setEntries] = useState(null);
    const navigate = useNavigate();

    async function getEntriesForRoom(room) {
        const response = await ApiService.getEntriesForRoom(room);
        if (!response.ok) return;
        return await response.json();
    }
    useEffect(() => {
        if (entries === null || updateEntries) {
            setUpdateEntries(false);
            getEntriesForRoom(room).then(data => setEntries(data));
        }
    }, [room, updateEntries]);

    function goHome() {
        navigate("/");
    }

    return (
        <div className="MainContainer">
            <div className="MainHeader">
                <h1 onClick={goHome}>Weating</h1>
            </div>
            <div className="Room">
                <Map className="Map" placeId={placeId} setPlaceId={setPlaceId} setMap={setMap}/>
                <Sidebar 
                    className="Sidebar" 
                    room={room} 
                    placeId={placeId} 
                    setPlaceId={setPlaceId}
                    map={map} 
                    entries={entries} 
                    setUpdateEntries={setUpdateEntries}/>
            </div>
        </div>
    )
}

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

export default App;
