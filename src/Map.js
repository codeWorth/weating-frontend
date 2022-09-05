import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useCallback } from 'react';

const GOOGLE_API_KEY="AIzaSyB-LEbsoKOKJ44XPoLD1tZ5-sYfTcRcoh8";
const GOOGLE_API_LIBRARIES = ["places"];
const center = {
    lat: -3.746,
    lng: -38.523
};

function Map(props) {
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        libraries: GOOGLE_API_LIBRARIES,
        googleMapsApiKey: GOOGLE_API_KEY
    });    const setPlaceId = props.setPlaceId;
    const setMap = props.setMap;

    const onLoad = useCallback(map => {
        const bounds = new window.google.maps.LatLngBounds(center);
        map.fitBounds(bounds);
        setMap(map);

        map.addListener("click", async (event) => {
            if (!event.placeId) return;
            event.stop();
            setPlaceId(event.placeId);
        })
    }, []);
  
    const onUnmount = useCallback(map => {
        setMap(null)
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

export default Map;