import React from "react";
import Card from "react-bootstrap/Card";
import Stack from "react-bootstrap/Stack";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useState } from "react";
import { DateTime } from "luxon";
/**
 * Returns the Card's header with Edit and Delete
 * buttons if the user is authorized to edit
 */
const EditCommentHeader = (
  comment,
  setEditMode,
  setCommentVisibility,
  postId
) => {
  let user;
  try {
    user = JSON.parse(window.localStorage.getItem("user"));
  } catch {
    user = null;
  }
  /**
   * Sends a DELETE request to the server
   * (used for deleting comments)
   */
  const deleteComment = async () => {
    try {
      const serverResponse = await fetch(
        `/api/post/${postId}/comment/${comment._id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: window.localStorage.getItem("auth_token"),
          },
        }
      );
      const resJSON = await serverResponse.json();
      console.log(resJSON.msg);
      if (serverResponse.ok) {
        setCommentVisibility(false);
      }
    } catch (ex) {
      console.error(ex);
    }
  };
  /**
   * Return empty fragment if the user does not have
   * editing rights
   */
  if (user) {
    if (user._id === comment.createdBy._id || user.admin) {
      return (
        <Card.Header>
          <Stack direction="horizontal" gap={3}>
            <Button
              variant="primary"
              onClick={() => {
                setEditMode(true);
              }}
            >
              Edit comment
            </Button>
            <Button variant="danger" onClick={deleteComment}>
              Delete comment
            </Button>
          </Stack>
        </Card.Header>
      );
    }
  }
  return <></>;
};
/**
 * Returns the Card's header when user
 * is not authorized to edit
 */
const NoEditCommentBody = (comment, commentContent) => {
  return (
    <Card.Body>
      <blockquote className="blockquote mb-0">
        <p>{commentContent}</p>
        <footer className="blockquote-footer">
          <cite>{comment.createdBy.username}</cite>
        </footer>
      </blockquote>
    </Card.Body>
  );
};
/**
 * Returns the "Edit Mode" Card's Body
 */
const EditCommentBody = (
  comment,
  setEditMode,
  postId,
  setCommentContent,
  setCommentLastModified
) => {
  /**
   * Used to save the comment based on the edited form data
   */
  const saveComment = async (e) => {
    e.preventDefault();
    const commentContent = document.querySelector(
      "#formBasicEditedComment"
    ).value;
    try {
      const serverResponse = await fetch(
        `/api/post/${postId}/comment/${comment._id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: window.localStorage.getItem("auth_token"),
          },
          body: JSON.stringify({
            content: commentContent,
          }),
        }
      );
      const resJSON = await serverResponse.json();
      console.log(resJSON.msg);
      if (serverResponse.ok) {
        /* If the comment was successfully edited, stop editing and update the state */
        stopEdit();
        comment.content = commentContent;
        comment.lastModifiedDate = new Date(Date.now()).toISOString();
        setCommentContent(comment.content);
        setCommentLastModified(comment.lastModifiedDate);
      }
    } catch (ex) {
      console.error(ex);
    }
  };
  /**
   * Uses the setEditMode to hide the editing mode
   */
  const stopEdit = () => {
    setEditMode(false);
  };

  return (
    <Card.Body>
      <blockquote className="blockquote mb-0">
        <Form>
          <Form.Group className="mb-3" controlId="formBasicEditedComment">
            <Form.Label>Edit your comment below and click save:</Form.Label>
            <Form.Control
              as="textarea"
              defaultValue={comment.content}
              rows={3}
            />
          </Form.Group>
          <Stack direction="horizontal" className="mb-4" gap={3}>
            <Button variant="primary" type="submit" onClick={saveComment}>
              Save
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                stopEdit();
              }}
            >
              Cancel Edit
            </Button>
          </Stack>
        </Form>
        <footer className="blockquote-footer">
          <cite>{comment.createdBy.username}</cite>
        </footer>
      </blockquote>
    </Card.Body>
  );
};

const Comment = ({ comment, postId }) => {
  const [editMode, setEditMode] = useState(false);
  const [commentVisibility, setCommentVisibility] = useState(true);
  const [commentContent, setCommentContent] = useState(comment.content);
  const [commentLastModified, setCommentLastModified] = useState(
    comment.lastModifiedDate
  );
  if (!comment || !commentVisibility) {
    return <></>;
  }
  return (
    <Card className="mb-3 border" bg="dark" text="light">
      {EditCommentHeader(comment, setEditMode, setCommentVisibility, postId)}
      {editMode
        ? EditCommentBody(
            comment,
            setEditMode,
            postId,
            setCommentContent,
            setCommentLastModified
          )
        : NoEditCommentBody(comment, commentContent)}
      <Card.Footer>
        <small className="text-muted">{`Published: ${DateTime.fromISO(
          comment.createdDate
        ).toLocaleString(
          DateTime.DATETIME_SHORT_WITH_SECONDS
        )} | Last edited: ${DateTime.fromISO(
          commentLastModified
        ).toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)}`}</small>
      </Card.Footer>
    </Card>
  );
};

export default Comment;
