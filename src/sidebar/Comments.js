import { faCheck, faEdit, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";

import "./Comments.css";
import { ApiService } from "../apiService";
import ResizeTextbox from "../util/ResizeTextbox";
import datesDiffToString from "../util/ago";

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
        if (editCommentValue.length === 0) {
            discardEdit(comment);
            return;
        }

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
        if (addCommentValue.length === 0) return;
        const response = await ApiService.addComment(room, placeId, name, addCommentValue);
        if (!response.ok) return;

        setAddCommentValue("");
        getComments();
    }

    return (<div className="ScrollBox">
        <div className="Divider"></div>
        <h1>{comments.length} comments</h1>
        {name.length > 0 
            ? <div className="AddComment">
                <ResizeTextbox value={addCommentValue} setValue={setAddCommentValue} placeholder="Add a comment..."/>
                {addCommentValue.length > 0 ? <button onClick={submitComment}>Post</button> : <></>}
            </div>
            : <></>
        }
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

export default Comments;