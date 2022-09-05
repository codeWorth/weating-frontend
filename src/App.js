import {
    BrowserRouter as Router,
    Routes,
    Route,
    useParams,
    useNavigate
} from "react-router-dom";
import { useEffect, useState } from 'react';

import "./App.css";
import "./MainHeader.css";
import { ApiService } from "./apiService";
import Sidebar from "./Sidebar";
import Map from "./Map";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";

function Home() {
    const navigate = useNavigate();

    async function createRoom() {
        const response = await ApiService.createRoom();
        if (!response.ok) return;
        const roomId = (await response.json()).roomId;
        navigate("/room/" + roomId);
    }

    return (
        <div className="Home">
            <button onClick={createRoom}>Create Room</button>
        </div>
    )
}

function Settings() {
    return (
        <h1>Settings!</h1>
    )
}

function Room() {
    let { room } = useParams();
    const [placeId, setPlaceId] = useState(null);
    const [map, setMap] = useState(null);
    const [updateEntries, setUpdateEntries] = useState(true);
    const [entries, setEntries] = useState(null);

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
    }, [room, entries, updateEntries]);

    return (
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
    )
}

function Page() {
    const navigate = useNavigate();

    function goHome() {
        navigate("/");
    }

    function goSettings() {
        navigate("/settings");
    }

    return (
        <div className="MainContainer">
            <div className="MainHeader">
                <h1 onClick={goHome}>Weating</h1>
                <FontAwesomeIcon icon={faGear} onClick={goSettings} />
            </div>
        
            <Routes>
                <Route path="/" element={<Home/>} />
                <Route path="/settings" element={<Settings/>} />
                <Route path="/room/:room" element={<Room/>} />
            </Routes>
        </div>
    );
}

function App() {
    return (
        <div className="App">
            <Router>
                <Page />
            </Router>
        </div>
    );
}

export default App;
