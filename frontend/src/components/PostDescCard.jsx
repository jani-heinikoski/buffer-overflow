import React from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Stack from "react-bootstrap/Stack";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Nav from "react-bootstrap/Nav";
import { Navigate } from "react-router-dom";
import { useState } from "react";
import { DateTime } from "luxon";
/**
 * Tries to parse the user from localStorage
 */
const getUser = () => {
  let user;
  try {
    user = JSON.parse(window.localStorage.getItem("user"));
  } catch {
    user = null;
  }
  return user;
};
/**
 * Delete button for the post description card
 * (only shown if user is logged in and has created the post)
 */
const DeleteButton = (post, setVisibility) => {
  if (!post) {
    return <></>;
  }
  /**
   * Sends a delete request to the backend, requesting to delete the post
   */
  const deletePost = async () => {
    try {
      const serverResponse = await fetch(`/api/post/${post._id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: window.localStorage.getItem("auth_token"),
        },
      });
      const resJSON = await serverResponse.json();
      if (serverResponse.ok) {
        /**
         * If post was deleted successfully, remove it from the main feed
         */
        setVisibility(false);
      } else {
        console.log(resJSON.msg);
      }
    } catch (ex) {
      console.error(ex);
    }
  };
  let user = getUser();
  if (user) {
    if (user._id === post.createdBy._id || user.admin) {
      return (
        <Button
          variant="danger"
          onClick={deletePost}
          style={{ width: "auto", marginLeft: "auto" }}
        >
          Delete post
        </Button>
      );
    }
  }
  return <></>;
};
/**
 * Edit button for the post description card
 * (only shown if user is logged in and has created the post)
 */
const EditButton = (post, redirectToEditPost) => {
  if (!post) {
    return <></>;
  }
  const editPost = () => {
    redirectToEditPost();
  };
  let user = getUser();
  if (user) {
    if (user._id === post.createdBy._id || user.admin) {
      return (
        <Button
          variant="primary"
          onClick={editPost}
          style={{ width: "auto", marginLeft: "16px" }}
        >
          Edit post
        </Button>
      );
    }
  }
  return <></>;
};

const PostDescCard = ({ post }) => {
  const [redirComponent, setRedirComponent] = useState(null);
  const [visibility, setVisibility] = useState(true);
  if (!visibility) {
    return <></>;
  }
  /**
   * Show only maximum of 200 first chars of the description
   */
  let desc;
  if (post.description.length > 200) {
    desc = post.description.substring(0, 200) + "......";
  } else {
    desc = post.description;
  }

  const redirectToPostDetails = () => {
    setRedirComponent(<Navigate to={`/post/${post._id}`} />);
  };

  const redirectToEditPost = () => {
    setRedirComponent(<Navigate to={`/post/edit/${post._id}`} />);
  };

  const redirectToPublicProfile = (username) => {
    setRedirComponent(<Navigate to={`/profile/${username}`} />);
  };

  return (
    <Card className="mt-4 border" bg="dark" text="light">
      <Card.Header>
        <Row>
          <Col>
            <Nav>
              <Nav.Link
                className="fs-4"
                bsPrefix="themed-nav-link"
                onClick={() => {
                  redirectToPublicProfile(post.createdBy.username);
                }}
              >
                {post.createdBy.username}
              </Nav.Link>
            </Nav>
          </Col>
          <Col>
            <Row>
              {DeleteButton(post, setVisibility)}
              {EditButton(post, redirectToEditPost)}
            </Row>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body>
        <Card.Title>{post.header}</Card.Title>
        <Card.Subtitle className="mb-3 text-muted">
          {`Published: ${DateTime.fromISO(post.createdDate).toLocaleString(
            DateTime.DATETIME_SHORT_WITH_SECONDS
          )} | Last edited: ${DateTime.fromISO(
            post.lastModifiedDate
          ).toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)}`}
        </Card.Subtitle>
        <Card.Text>{desc}</Card.Text>
        <Stack direction="horizontal" gap={3}>
          <Button
            variant="primary"
            style={{ whiteSpace: "nowrap" }}
            onClick={() => {
              redirectToPostDetails();
            }}
          >
            Show more
          </Button>
        </Stack>
      </Card.Body>
      {redirComponent && redirComponent}
    </Card>
  );
};

export default PostDescCard;
