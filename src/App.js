import {
    BrowserRouter as Router,
    Routes,
    Route,
    useParams,
    useNavigate
} from "react-router-dom";
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faGear, faTimes } from "@fortawesome/free-solid-svg-icons";

import "./App.css";
import "./MainHeader.css";
import { ApiService } from "./apiService";
import Sidebar from "./sidebar/Sidebar";
import Map from "./Map";

const MAX_NAME_LEN = 24;

const setCookie = (name, value, path = '/') => {
    document.cookie = name + '=' + encodeURIComponent(value) + '; path=' + path;
}
  
const getCookie = (name) => {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
}

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
    const open = props.open;
    const setOpen = props.setOpen;

    const [inputName, setInputName] = useState(name);
    const changeInputName = (e) => setInputName(e.target.value.slice(0, MAX_NAME_LEN));

    function saveEdit() {
        if (inputName.length > 0) {
            setName(inputName);
            setOpen(false);
        }
    }

    function discardEdit() {
        setInputName(name);
        setOpen(false);
    }

    return (open ? <div className="Settings">
        <div className="SettingsArea">
            <div className="Header">
                <h1>Settings</h1>
                <FontAwesomeIcon icon={faCheck} onClick={saveEdit}/>
                <FontAwesomeIcon icon={faTimes} onClick={discardEdit}/>
            </div>
            <textarea 
                value={inputName} 
                onChange={changeInputName} 
                placeholder="Enter your name..."
            ></textarea>
        </div>
    </div>: <></>);
}

function Room(props) {
    let { room } = useParams();
    const name = props.name;
    const [placeId, setPlaceId] = useState(null);
    const [map, setMap] = useState(null);
    const [updateEntries, setUpdateEntries] = useState(true);
    const [entries, setEntries] = useState(null);
    const [goTo, setGoTo] = useState(null);

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
            <Map
                className="Map" 
                room={room}
                placeId={placeId} 
                setPlaceId={setPlaceId} 
                map={map}
                setMap={setMap}
                goTo={goTo}
                setGoTo={setGoTo}/>
            <Sidebar 
                room={room}
                name={name}
                placeId={placeId} 
                setPlaceId={setPlaceId}
                map={map} 
                entries={entries}
                setGoTo={setGoTo}
                setUpdateEntries={setUpdateEntries}/>
        </div>
    )
}

function Page() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [settingsOpen, setSettingsOpen] = useState(false);

    function goHome() {
        navigate("/");
    }

    function goSettings() {
        setSettingsOpen(true);
    }

    useEffect(() => {
        if (name.length > 0) setCookie("user-name", name);
    }, [name]);

    useEffect(() => {
        const cookie = getCookie("user-name");
        if (cookie && cookie.length > 0) setName(cookie);
    }, [])

    return (
        <div className="MainContainer">
            <div className="MainHeader">
                <h1 onClick={goHome}>Weating</h1>
                <FontAwesomeIcon icon={faGear} onClick={goSettings} />
            </div>
            <Settings name={name} setName={setName} open={settingsOpen} setOpen={setSettingsOpen} />
        
            <Routes>
                <Route path="/" element={<Home />} />
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
