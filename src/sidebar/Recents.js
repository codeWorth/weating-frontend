import { useEffect, useState } from "react";

import "./Recents.css";
import ReviewStars from "../util/ReviewStars"; 
import datesDiffToString from "../util/ago";
import { MapService } from "../apiService";

const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;
const REVIEW_MAX_CHARS = 160;

function Recents(props) {
    const map = props.map;
    const entries = props.entries;
    const entrySubmitter = props.entrySubmitter;
    const setPlaceId = props.setPlaceId;

    const [items, setItems] = useState([]);
    const [places, setPlaces] = useState({});

    function ellipses(content, maxLength) {
        if (content.length > maxLength) {
            return content.slice(0, maxLength) + "...";
        } else {
            return content;
        }
    }

    async function getInfo(placeId) {
        const place = await MapService.getPlaceInfo(placeId, map);
        place.photo = place.photos && place.photos.length > 0 ? place.photos[0] : null;
        return {[placeId]: place};
    }

    async function getInfos(items) {
        const placeIds = [...new Set(items
            .map(item => item.placeId)
            .filter(placeId => !places[placeId]))];

        if (placeIds.length === 0) return;

        const newPlaces = await Promise.all(placeIds.map(getInfo));
        setPlaces(newPlaces.reduce((infos, info) => ({...infos, ...info}), places));
    }

    function goEntry(item) {
        entrySubmitter.current = item.submitter;
        setPlaceId(item.placeId);
    }

    useEffect(() => {
        if (!entries) {
            setItems([]);
            return;
        }
        if (!map) return;

        const now = new Date();
        const newItems = entries.slice(0,10)
            .filter(entry => (now - new Date(entry.createdAt)) < ONE_WEEK)
            .map(entry => {
                return {
                    ...entry,
                    review: ellipses(entry.review, REVIEW_MAX_CHARS),
                    ago: datesDiffToString(new Date(entry.createdAt), now),
                };
            });

        setItems(newItems);
        getInfos(newItems);
    }, [entries, map]);

    return (<div className="Recents">
        {items.map(item => (
            <div key={item.submitter + item.placeId} className="RecentEntry" onClick={() => goEntry(item)}>
                <div className="NameContainer">
                    <h2>{places[item.placeId] ? places[item.placeId].name : ""}</h2>
                    <h3>{item.submitter + ", " + item.ago + " ago"}</h3>
                </div>
                <ReviewStars className="Stars" rating={item.rating} />
                <div className="ReviewContainer">
                    <div className="Review">{item.review}</div>
                </div>
            </div>
        ))}
    </div>);
}

export default Recents;