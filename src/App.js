import "./App.css";
import "./PlaceInfo.css";
import "./Entry.css";
import "./ReviewStars.css";
import "./Comments.css";
import "./ResizeTextbox.css";
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faStar, 
    faEdit,
    faCheck,
    faTimes,
    faTrash,
    faArrowRight,
    faPlus
} from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarOutline } from '@fortawesome/free-regular-svg-icons';
import VALID_TYPES from "./validTypes";

const GOOGLE_API_KEY="AIzaSyB-LEbsoKOKJ44XPoLD1tZ5-sYfTcRcoh8";
const GOOGLE_API_LIBRARIES = ["places"];
const TIMES = [
    ["second", 1000],
    ["minute", 1000 * 60],
    ["hour", 1000 * 60 * 60],
    ["day", 1000 * 60 * 60 * 24],
    ["week", 1000 * 60 * 60 * 24 * 7],
    ["month", Math.ceil(1000 * 60 * 60 * 24 * 365 / 12)],
    ["year", 1000 * 60 * 60 * 24 * 365]
];

function makePlural(count, unit) {
    if (count > 1) {
        return `${count} ${unit}s`;
    } else {
        return `${count} ${unit}`;
    }
}

function datesDiffToString(then, now) {
    if (!then || !now) return "";

    const diffMs = now - then;

    for (let i = TIMES.length - 1; i >= 0; i--) {
        const [unit, value] = TIMES[i];
        const count = Math.floor(diffMs / value);
        if (count > 0) {
            return makePlural(count, unit);
        }
    }
    return "0 seconds";
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

function ReviewStars(props) {
    const rating = props.rating;
    const setRating = props.setRating;
    const editable = props.editable;
    const starCover = useRef(null);
    const starContainer = useRef(null);

    useEffect(() => {
        if (rating === null) return;
        starCover.current.style = `width: ${rating * 20}%`;
    }, [rating]);

    function getRating(e) {
        const rect = starContainer.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = Math.floor(Math.min(Math.max(0, x / rect.width), 1) * 100);
        return Math.round(percent / 10) * 10;
    }

    function adjustCover(e) {
        if (rating !== null) return;
        const quantizedPercent = getRating(e);
        starCover.current.style = `width: ${quantizedPercent}%`;
    }

    function clickRating(e) {
        if (!editable) return;
        const quantizedPercent = getRating(e);
        starCover.current.style = `width: ${quantizedPercent}%`;
        setRating(quantizedPercent / 20);
    }

    return (<div>
        <div ref={starContainer} onMouseMove={adjustCover} onClick={clickRating} className="Rating">
            <FontAwesomeIcon icon={faStarOutline} />
            <FontAwesomeIcon icon={faStarOutline} />
            <FontAwesomeIcon icon={faStarOutline} />
            <FontAwesomeIcon icon={faStarOutline} />
            <FontAwesomeIcon icon={faStarOutline} />
            <div ref={starCover} className="Cover">
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
            </div>
        </div>
    </div>);
}

function Review(props) {
    const entries = props.entries;
    const room = props.room;
    const name = props.name;
    const placeId = props.placeId;
    const entrySubmitter = useRef(null);
    const [review, setReview] = useState(null);

    const [rating, setRating] = useState(null);
    const reviewArea = useRef(null);
    const createdAt = useRef(null);
    const [editable, setEditable] = useState(false);
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        if (!entries || entries.length === 0) {
            entrySubmitter.current = null;
        } else if (entrySubmitter.current === null) {
            entrySubmitter.current = entries[0].submitter;
        } else if (!entries.map(entry => entry.submitter).includes(entrySubmitter.current)) {
            entrySubmitter.current = entries[0].submitter;
        }

        if (entrySubmitter.current !== null) {
            setReview(entries.find(entry => entry.submitter === entrySubmitter.current) || null);
        } else {
            setReview(null);
        }
        setEditable(name === entrySubmitter.current);
    }, [entries]);
    
    useEffect(() => {
        if (review === null) return;
        setRating(review.rating);
        reviewArea.current.value = review.review;
        createdAt.current = new Date(review.createdAt);
    }, [review]);

    async function deleteEntry() {
        const response = await ApiService.deleteEntry(room, name, placeId);
        if (response.ok) {
            props.setEntryMode("REFRESH");
        }
    }

    function editEntry() {
        setEditing(true);
    }

    async function saveEdit() {
        const response = await ApiService.updateEntry(room, name, placeId, rating, reviewArea.current.value);
        if (response.ok) {
            setEditing(false);
            props.setEntryMode("REFRESH");
        }
    }

    function discardEdit() {
        setEditing(false);
        props.setEntryMode("REFRESH");
    }

    function canAddReview() {
        return entries.find(entry => entry.submitter === name) === undefined;
    }

    function createReview() {
        props.setEntryMode("CREATE");
    }

    function nextReview() {
        if (!entries || !entrySubmitter.current) return;

        const currentIndex = entries.findIndex(entry => entry.submitter === entrySubmitter.current);
        const nextIndex = (currentIndex + 1) % entries.length;
        entrySubmitter.current = entries[nextIndex].submitter;
        setReview(entries[nextIndex]);
        setEditable(name === entrySubmitter.current);
    }

    return (review 
        ? <>
            <div className="Header">
                <h1>{review.submitter}:</h1>
                {editable 
                    ? (editing 
                        ? <>
                            <FontAwesomeIcon icon={faCheck} onClick={saveEdit}/>
                            <FontAwesomeIcon icon={faTimes} onClick={discardEdit}/>
                        </>
                        : <>
                            <FontAwesomeIcon icon={faEdit} onClick={editEntry}/>
                            <FontAwesomeIcon icon={faTrash} onClick={deleteEntry}/>
                            {entries && entries.length > 1 ? <FontAwesomeIcon icon={faArrowRight} onClick={nextReview}/> : <></>}
                        </>) 
                    : <>
                        {canAddReview() ? <FontAwesomeIcon icon={faPlus} onClick={createReview}/> : <></>}
                        {entries && entries.length > 1 ? <FontAwesomeIcon icon={faArrowRight} onClick={nextReview}/> : <></>}
                    </>
                }
            </div>
            <ReviewStars rating={rating} setRating={setRating} editable={editing}/>
            <textarea readOnly={!editing} ref={reviewArea}></textarea>
        </>
        : <></>
    );
}

function AddReview(props) {
    const [rating, setRating] = useState(null);
    const reviewArea = useRef(null);

    useEffect(() => {
        reviewArea.current.value = "";
        setRating(null);
    }, [props.placeId]);

    async function submit() {
        if (!props.roomId || !props.placeId) return;
        if (!props.name || props.name.length === 0) {
            alert("Please enter your name first.");
            return;
        }
        if (rating === null) {
            alert("Please select a rating.");
            return;
        }
        const response = await ApiService.addEntry(props.roomId, props.name, props.placeId, rating, reviewArea.current.value);
        if (response.ok) {
            exit();
        }
    }

    function exit() {
        setRating(null);
        reviewArea.current.value = "";
        props.setEntryMode("REFRESH");   
    }

    return (<>
        <div className="Header">
            <h1>Your review:</h1>
            <FontAwesomeIcon icon={faTimes} onClick={exit}/>
        </div>
        <textarea ref={reviewArea}></textarea>
        <div className="SubmitArea">
            <ReviewStars rating={rating} setRating={setRating} editable={true}/>
            <button onClick={submit}>Submit</button>
        </div>
    </>);
}

function ResizeTextbox(props) {
    const value = props.value;
    const setValue = props.setValue;
    const placeholder = props.placeholder || "";
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
        <pre className="Sizer">{sizingValue}</pre>
        <textarea value={value} onChange={e => onChange(e)} placeholder={placeholder}></textarea> 
    </div>);
}

function Comments(props) {
    const room = props.room;
    const placeId = props.placeId;
    const name = props.name;

    const [comments, setComments] = useState([]);
    const [editCommentValue, setEditCommentValue] = useState("");
    const [addCommentValue, setAddCommentValue] = useState("");
    const [editing, setEditing] = useState(null);
    const oldContent = useRef(null);

    async function deleteComment(id) {
        const response = await ApiService.deleteComment(room, id);
        if (response.ok) {
            getComments();
        }
    }

    function editComment(comment) {
        if (editing !== null) {
            discardEdit(editing);
        }

        oldContent.current = comment.content;
        setEditCommentValue(comment.content);
        setEditing(comment);
    }

    async function saveEdit(comment) {
        const response = await ApiService.updateComment(room, comment.id, editCommentValue);
        if (response.ok) {
            setEditing(null);
            getComments();
        }
    }

    function discardEdit(comment) {
        comment.content = oldContent.current;
        oldContent.current = null;
        setEditing(null);
    }

    async function getComments() {
        const response = await ApiService.getCommentsForPlace(room, placeId);
        if (!response.ok) return;
        const comments = await response.json();
        comments.forEach(comment => comment.createdAt = new Date(comment.createdAt));
        comments.forEach(comment => comment.updatedAt = comment.updatedAt ? new Date(comment.updatedAt) : null);

        const now = new Date();
        comments.forEach(comment => comment.createdAtStr = datesDiffToString(comment.createdAt, now));
        comments.forEach(comment => comment.updatedAtStr = datesDiffToString(comment.updatedAt, now));

        comments.sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
        setComments(comments);
    }
    useEffect(() => {
        getComments();
    }, [room, placeId]);

    async function submitComment() {
        const response = await ApiService.addComment(room, placeId, name, addCommentValue);
        if (!response.ok) return;

        setAddCommentValue("");
        getComments();
    }

    return (<div className="ScrollBox">
        <div className="Divider"></div>
        <h1>{comments.length} comments</h1>
        <div className="AddComment">
            <ResizeTextbox value={addCommentValue} setValue={setAddCommentValue} placeholder="Add a comment..."/>
            <FontAwesomeIcon icon={faPlus} onClick={submitComment} />
        </div>
        <div className="CommentsList">
            {comments.map(comment => <div key={comment.id} className="Comment">
                <div key={comment.id} className="Header">
                    <div className="NameContainer">
                        <h2>{comment.commenter}</h2>
                        <h3>{comment.updated ? comment.updatedAtStr + " ago (edited)" : comment.createdAtStr + " ago"}</h3>
                    </div>
                    {comment.commenter === name 
                        ? (editing && editing.id === comment.id 
                            ? <>
                                <FontAwesomeIcon icon={faCheck} onClick={() => saveEdit(comment)}/>
                                <FontAwesomeIcon icon={faTimes} onClick={() => discardEdit(comment)}/>
                            </>
                            : <>
                                <FontAwesomeIcon className="ShouldHide" icon={faEdit} onClick={() => editComment(comment)}/>
                                <FontAwesomeIcon className="ShouldHide" icon={faTrash} onClick={() => deleteComment(comment.id)}/>
                            </>) 
                        : <></>
                    }
                </div>
                <div>
                    {editing && editing.id === comment.id 
                        ? <ResizeTextbox value={editCommentValue} setValue={setEditCommentValue} />
                        : <div className="Content">{comment.content}</div>
                    }
                </div>
            </div>)}
        </div>
    </div>);
}

function Sidebar(props) {
    const room = props.room;
    const map = props.map;
    const entries = props.entries;
    const placeId = props.placeId;

    const [placeEntries, setPlaceEntries] = useState([]);
    const [placeData, setPlaceData] = useState(null);
    const [placePhotoIndex, setPlacePhotoIndex] = useState(0);
    const [name, setName] = useState("");
    const [entryMode, setEntryMode] = useState("VIEW");

    function getName() {
        const promptOut = prompt("Enter your name");
        if (promptOut !== null) setName(promptOut);
    }

    function incImage(inc) {
        const max = placeData.photos.length;
        return () => setPlacePhotoIndex((placePhotoIndex + inc + max) % max);
    }

    async function getPlaceInfo(placeId) {
        if (!placeId) return;

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

    useEffect(() => {
        if (entries === null) return;
        setPlaceEntries(entries.filter(entry => entry.placeId === placeId));
        setEntryMode("VIEW");
    }, [entries, placeId]);

    function createReview() {
        setEntryMode("CREATE");
    }

    useEffect(() => {
        if (entryMode === "REFRESH") {
            props.setUpdateEntries(true);
            setEntryMode("VIEW");
        }
    }, [entryMode]);

    return (
        <div className={props.className}>
            {placeData !== null 
                ? <div className="Container">
                    <div className="PlaceInfo">
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
                    </div>
                    <div className="Entry">
                        {entryMode === "VIEW" && (!placeEntries || placeEntries.length === 0)
                            ? <>
                                <h1>There aren't any reviews yet.</h1>
                                <button className="AddReview" onClick={createReview}>Add a review</button>
                            </>
                            : <></>
                        }
                        {entryMode === "CREATE"
                            ? <AddReview roomId={room} name={name} placeId={placeId} setEntryMode={setEntryMode}/>
                            : <></>
                        }
                        {entryMode === "VIEW"
                            ? <Review entries={placeEntries} room={room} name={name} placeId={placeId} setEntryMode={setEntryMode}/>
                            : <></>
                        }
                    </div>
                    <div className="Comments">
                        <Comments room={room} name={name} placeId={placeId}/>
                    </div>
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
    }, [room, updateEntries]);

    return (
        <div className="Room">
            <Map className="Map" placeId={placeId} setPlaceId={setPlaceId} setMap={setMap}/>
            <Sidebar className="Sidebar" room={room} placeId={placeId} map={map} entries={entries} setUpdateEntries={setUpdateEntries}/>
        </div>
    )
}

export default App;
