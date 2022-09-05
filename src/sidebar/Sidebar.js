import { useState, useRef } from 'react';

import Entry from "./Entry";
import Comments from "./Comments";
import Recents from './Recents';
import PlaceInfo from './PlaceInfo';

function Sidebar(props) {
    const room = props.room;
    const name = props.name;
    const map = props.map;
    const entries = props.entries;
    const placeId = props.placeId;
    const setPlaceId = props.setPlaceId;
    const setUpdateEntries = props.setUpdateEntries;

    const [showComments, setShowComments] = useState(false);
    const entrySubmitter = useRef(null);

    return (
        <div className="Sidebar">
            <div className="Container">
                {placeId === null 
                    ? <Recents 
                        map={map} 
                        setPlaceId={setPlaceId} 
                        entries={entries}
                        entrySubmitter={entrySubmitter}/>
                    : <>
                        <PlaceInfo placeId={placeId} setPlaceId={setPlaceId} map={map} />
                        <Entry 
                            room={room} 
                            name={name} 
                            placeId={placeId} 
                            entries={entries} 
                            entrySubmitter={entrySubmitter}
                            setUpdateEntries={setUpdateEntries}
                            setShowComments={setShowComments} />
                        {showComments
                            ? <div className="Comments">
                                <Comments room={room} name={name} placeId={placeId}/>
                            </div>
                            : <></>
                        }
                    </>
                }
            </div>
        </div>
    );
}

export default Sidebar;