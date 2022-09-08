import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiService } from './apiService';

const GOOGLE_API_KEY="AIzaSyB-LEbsoKOKJ44XPoLD1tZ5-sYfTcRcoh8";
const GOOGLE_API_LIBRARIES = ["places"];
const center = { lat: -34.397, lng: 150.644 };

function Map(props) {
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        libraries: GOOGLE_API_LIBRARIES,
        googleMapsApiKey: GOOGLE_API_KEY
    });
    const room = props.room;
    const goTo = props.goTo;
    const setGoTo = props.setGoTo;
    const setPlaceId = props.setPlaceId;
    const map = props.map;
    const setMap = props.setMap;

    const pacInput = useRef(null);
    const [markers, setMarkers] = useState([]);

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

            setPlaceId(place.place_id);
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

    async function findMarkers() {
        if (!map || !room) return;

        const response = await ApiService.getPlaces(room);
        if (!response.ok) return;
        const places = await response.json();

        markers.forEach(marker => marker.setMap(null));
        const newMarkers = Object.entries(places)
            .map(place => ({
                marker: new window.google.maps.Marker({
                    position: {
                        lat: parseFloat(place[1].location.lat), 
                        lng: parseFloat(place[1].location.lng)
                    },
                    map
                }),
                placeId: place[0] 
            }));

        newMarkers.forEach(marker => {
            window.google.maps.event.addListener(marker.marker, "click", () => setPlaceId(marker.placeId));
        });

        setMarkers(newMarkers);
    }

    useEffect(() => {
        findMarkers();
    }, [map, room]);

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