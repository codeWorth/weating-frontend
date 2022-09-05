import { faStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarOutline } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef } from "react";

import "./ReviewStars.css";

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

export default ReviewStars;