import { faArrowRight, faCheck, faEdit, faPlus, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";

import "./Entry.css";
import { ApiService } from "../apiService";
import ReviewStars from "../util/ReviewStars";

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
    }, [entries, name]);
    
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
        return name.length > 0 && entries.find(entry => entry.submitter === name) === undefined;
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
            <button onClick={submit}>Post</button>
        </div>
    </>);
}

function Entry(props) {
    const setShowComments = props.setShowComments;
    const room = props.room;
    const name = props.name;
    const placeId = props.placeId;
    const entries = props.entries;
    const setUpdateEntries = props.setUpdateEntries;

    const [entryMode, setEntryMode] = useState("VIEW");
    const [placeEntries, setPlaceEntries] = useState([]);

    useEffect(() => {
        if (entries === null) return;
        setPlaceEntries(entries.filter(entry => entry.placeId === placeId));
        setEntryMode("VIEW");
    }, [entries, placeId]);

    useEffect(() => {
        setShowComments(entryMode === "VIEW" && placeEntries && placeEntries.length > 0);
    }, [entryMode, placeEntries]);

    useEffect(() => {
        if (entryMode === "REFRESH") {
            setUpdateEntries(true);
            setEntryMode("VIEW");
        }
    }, [entryMode]);

    function createReview() {
        setEntryMode("CREATE");
    }

    return (<div className="Entry">
        {entryMode === "VIEW" && (!placeEntries || placeEntries.length === 0)
            ? <>
                <h1>There aren't any reviews yet.</h1>
                {name.length > 0 ? <button className="AddReview" onClick={createReview}>Add a review</button> : <></>}
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
    </div>);
}

export default Entry;