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
import Sidebar from "./sidebar/Sidebar";
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

function Settings(props) {
    const name = props.name;
    const setName = props.setName;

    return (
        <h1>Settings {name}!</h1>
    );
}

function Room(props) {
    let { room } = useParams();
    const name = props.name;
    const [placeId, setPlaceId] = useState(null);
    const [map, setMap] = useState(null);
    const [updateEntries, setUpdateEntries] = useState(true);
    const [entries, setEntries] = useState(null);

    async function getEntriesForRoom(room) {
        const response = await ApiService.getEntriesForRoom(room);
        if (!response.ok) return;

        const entries = await response.json();
        entries.sort((a, b) => b.createdAt - a.createdAt);
        setEntries(entries);
    }
    useEffect(() => {
        if (entries === null || updateEntries) {
            setUpdateEntries(false);
            getEntriesForRoom(room);
        }
    }, [room, entries, updateEntries]);

    return (
        <div className="Room">
            <Map className="Map" placeId={placeId} setPlaceId={setPlaceId} setMap={setMap}/>
            <Sidebar 
                room={room}
                name={name}
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
    const [name, setName] = useState("");

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
                <Route path="/" element={<Home />} />
                <Route path="/settings" element={<Settings name={name} setName={setName} />} />
                <Route path="/room/:room" element={<Room name={name} />} />
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
