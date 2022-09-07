const API_BASE_URL = "http://localhost:8080/api/";
// const API_BASE_URL = "http://52.9.248.195/api/";
const API_CALL_URL = (...path) => API_BASE_URL + path.join("/");
const API_QUERY_PARAMS = (url, params) => url + "?" + new URLSearchParams(params);

class ApiService {
    static createRoom() {
        return fetch(API_CALL_URL("room"), {
            headers: {
                "Accept": "application/json"
            }
        });
    }

    static getEntriesForRoom(roomId) {
        return fetch(API_CALL_URL(roomId, "entries"), {
            headers: {
                "Accept": "application/json"
            }
        });
    }

    static addEntry(roomId, submitter, placeId, rating, review) {
        return fetch(API_CALL_URL(roomId, "entry"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                submitter: submitter,
                placeId: placeId,
                rating: rating,
                review: review
            })
        });
    }

    static updateEntry(roomId, submitter, placeId, rating, review) {
        return fetch(API_CALL_URL(roomId, "entry"), {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                submitter: submitter,
                placeId: placeId,
                changes: {
                    rating: rating,
                    review: review
                }
            })
        });
    }

    static deleteEntry(roomId, submitter, placeId) {
        return fetch(API_QUERY_PARAMS(API_CALL_URL(roomId, "entry"), {
            "submitter": submitter,
            "placeId": placeId
        }), {
            method: "DELETE" 
        });
    }

    static getCommentsForPlace(roomId, placeId) {
        return fetch(API_QUERY_PARAMS(API_CALL_URL(roomId, "comments"), {
            "placeId": placeId
        }), {
            headers: {
                "Accept": "application/json"
            }
        });
    }

    static addComment(roomId, placeId, commenter, comment) {
        return fetch(API_CALL_URL(roomId, "comment"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                placeId: placeId,
                commenter: commenter,
                content: comment
            })
        });
    }

    static updateComment(roomId, commentId, content) {
        return fetch(API_CALL_URL(roomId, "comment"), {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: commentId,
                content: content
            })
        });
    }

    static deleteComment(roomId, commentId) {
        return fetch(API_QUERY_PARAMS(API_CALL_URL(roomId, "comment"), {
            "id": commentId
        }), {
            method: "DELETE" 
        });
    }
}

class MapService {
    static getPlaceInfo(placeId, map) {
        return new Promise((resolve, reject) => {
            new window.google.maps.places.PlacesService(map)
                .getDetails(
                    {
                        placeId: placeId,
                        fields: ["name", "formatted_address", "photo", "type", "geometry"]
                    }, 
                    (place, status) => {
                        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                            resolve(place);
                        } else {
                            reject(status);
                        }
                    }
                );
        });
    }
}

export { ApiService, MapService };