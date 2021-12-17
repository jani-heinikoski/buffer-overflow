import React from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Navigate, useParams } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import { useState, useEffect } from "react";

const EditPostPage = () => {
  const [post, setPost] = useState(null);
  const [alertComponent, setAlertComponent] = useState(null);
  const [redirComponent, setRedirComponent] = useState(null);
  let { id } = useParams();

  /**
   * Fetch the current post
   */
  useEffect(() => {
    let mounted = true;
    const fetchPost = async () => {
      try {
        const serverResponse = await fetch(`/api/post/${id}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });
        const resJSON = await serverResponse.json();
        if (serverResponse.ok) {
          if (mounted) {
            setPost(resJSON.post);
          }
        } else {
          if (mounted) {
            setRedirComponent(<Navigate to={"/notfound"} />);
          }
        }
      } catch (ex) {
        console.error(ex);
      }
    };
    fetchPost();
    return () => {
      mounted = false;
    };
  }, [id]);

  const redirectToMainFeed = () => {
    setRedirComponent(<Navigate to={"/"} />);
  };
  /**
   * Editing requires the user to be authenticated, redirect to login if no auth_token in localStorage
   */
  const authToken = window.localStorage.getItem("auth_token");
  if (!authToken) {
    return <Navigate to={"/login"} />;
  }
  /**
   * Shows a warning alert
   */
  const showWarningAlert = (header, text) => {
    setAlertComponent(
      <Alert
        variant="danger"
        onClose={() => {
          setAlertComponent(null);
        }}
        dismissible
      >
        <Alert.Heading>{header}</Alert.Heading>
        <p style={{ color: "black" }}>{text}</p>
      </Alert>
    );
  };
  /**
   * Shows a success alert that indicates a the post has been updated
   */
  const showPostUpdatedAlert = () => {
    setAlertComponent(
      <Alert
        variant="success"
        onClose={() => {
          setAlertComponent(null);
        }}
        dismissible
      >
        <Alert.Heading>Post updated successfully!</Alert.Heading>
        <hr />
        <Button
          variant="success"
          onClick={() => {
            redirectToMainFeed();
          }}
        >
          Back to main feed
        </Button>
      </Alert>
    );
  };
  /**
   * Sends the form data to the backend and tries to patch the post.
   */
  const updatePost = async () => {
    try {
      const reqBody = JSON.stringify({
        post: {
          header: document.querySelector("#formBasicHeader").value,
          description: document.querySelector("#formBasicDescription").value,
          code: document.querySelector("#formBasicCode").value,
        },
      });
      const serverResponse = await fetch(`/api/post/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        body: reqBody,
      });
      const resJSON = await serverResponse.json();
      if (serverResponse.ok) {
        showPostUpdatedAlert();
      } else {
        showWarningAlert(resJSON.msg, "Check the form for invalid data!");
      }
    } catch (ex) {
      console.error(ex);
      showWarningAlert(
        "Something went wrong!",
        "Check the form for invalid data!"
      );
    }
    /* Smooth scroll back to the top of the page */
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  if (!post) {
    return <h2 style={{ textAlign: "center" }}>Fetching posts...</h2>;
  }

  return (
    <Container>
      <Row>
        <Col>
          <h2
            className="mb-5"
            style={{ color: "whitesmoke", textAlign: "center" }}
          >
            Edit your post
          </h2>
          {alertComponent && alertComponent}
          <Form>
            <Form.Group className="mb-3" controlId="formBasicHeader">
              <Form.Label style={{ color: "whitesmoke" }}>
                Post header
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="How to center a div?"
                defaultValue={post.header || ""}
                maxLength={50}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicDescription">
              <Form.Label style={{ color: "whitesmoke" }}>
                Post description
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={15}
                defaultValue={post.description || ""}
              />
            </Form.Group>
            <Form.Group className="mb-5" controlId="formBasicCode">
              <Form.Label style={{ color: "whitesmoke" }}>
                Code snippet
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={15}
                defaultValue={post.code || ""}
              />
            </Form.Group>
          </Form>
          <Button
            variant="primary"
            type="submit"
            className="mb-5"
            style={{ width: "100%" }}
            onClick={updatePost}
          >
            Save changes
          </Button>
        </Col>
      </Row>
      {redirComponent && redirComponent}
    </Container>
  );
};

export default EditPostPage;
