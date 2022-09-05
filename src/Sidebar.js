import { useState } from 'react';

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

    const [showComments, setShowComments] = useState(false);

    return (
        <div className="Sidebar">
            <div className="Container">
                {placeId === null 
                    ? <Recents room={room} setPlaceId={setPlaceId} />
                    : <>
                        <PlaceInfo placeId={placeId} setPlaceId={setPlaceId} map={map} />
                        <Entry room={room} name={name} placeId={placeId} entries={entries} setShowComments={setShowComments} />
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