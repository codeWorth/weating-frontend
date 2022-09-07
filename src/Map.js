import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useCallback, useEffect, useRef } from 'react';

const GOOGLE_API_KEY="AIzaSyB-LEbsoKOKJ44XPoLD1tZ5-sYfTcRcoh8";
const GOOGLE_API_LIBRARIES = ["places"];
const center = { lat: -34.397, lng: 150.644 };

function Map(props) {
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        libraries: GOOGLE_API_LIBRARIES,
        googleMapsApiKey: GOOGLE_API_KEY
    });
    const goTo = props.goTo;
    const setGoTo = props.setGoTo;
    const setPlaceId = props.setPlaceId;
    const map = props.map;
    const setMap = props.setMap;
    const pacInput = useRef(null);

    const onLoad = useCallback(map => {
        setMap(map);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                map.setCenter({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                map.setZoom(15);
            });
        }

        const autocomplete = new window.google.maps.places.Autocomplete(pacInput.current, {
            fields: ["place_id", "geometry"],
        });

        autocomplete.bindTo("bounds", map);
        map.controls[window.google.maps.ControlPosition.LEFT_TOP].push(pacInput.current);

        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();

            if (!place.geometry || !place.geometry.location) {
                return;
            }

            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
            } else {
                map.setCenter(place.geometry.location);
                map.setZoom(17);
            }

            setPlaceId(place.placeId);
        });

        map.addListener("click", async (event) => {
            if (!event.placeId) return;
            event.stop();
            setPlaceId(event.placeId);
        })
    }, []);
  
    const onUnmount = useCallback(map => {
        setMap(null)
    }, []);

    useEffect(() => {
        if (!map) return;
        if (!goTo) return;

        if (goTo.viewport) {
            map.fitBounds(goTo.viewport);
        } else {
            map.setCenter(goTo.location);
            map.setZoom(17);
        }

        setGoTo(null);
    }, [goTo, map]);

    return isLoaded ? (<>
        <div style={{display: "none"}}>
            <input
                ref={pacInput}
                className="controls"
                type="text"
                placeholder="Enter a location"
            />
        </div>
        <GoogleMap
            mapContainerClassName={props.className}
            center={center}
            zoom={10}
            onLoad={onLoad}
            onUnmount={onUnmount}>
        </GoogleMap>
    </>) : <></>;
}

export default Map;