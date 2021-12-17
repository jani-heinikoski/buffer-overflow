import React from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Navigate } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import { useState } from "react";

const NewPostPage = () => {
  const [alertComponent, setAlertComponent] = useState(null);
  const [redirComponent, setRedirComponent] = useState(null);
  const redirectToMainFeed = () => {
    setRedirComponent(<Navigate to={"/"} />);
  };
  /**
   * Posting requires the user to be authenticated, redirect to login if no auth_token in localStorage
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
   * Shows a success alert that indicates a new post has been created
   */
  const showPostCreatedAlert = () => {
    setAlertComponent(
      <Alert
        variant="success"
        onClose={() => {
          setAlertComponent(null);
        }}
        dismissible
      >
        <Alert.Heading>A new post has been created!</Alert.Heading>
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
   * Sends the form data to the backend and tries to publish the new post.
   */
  const post = async () => {
    try {
      const reqBody = JSON.stringify({
        post: {
          header: document.querySelector("#formBasicHeader").value,
          description: document.querySelector("#formBasicDescription").value,
          code: document.querySelector("#formBasicCode").value,
        },
      });
      const serverResponse = await fetch("/api/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        body: reqBody,
      });
      const resJSON = await serverResponse.json();
      if (serverResponse.ok) {
        showPostCreatedAlert();
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
    /**
     * Smooth scroll bag to top of the page
     */
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  return (
    <Container>
      <Row>
        <Col>
          <h2
            className="mb-5"
            style={{ color: "whitesmoke", textAlign: "center" }}
          >
            Create a new post
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
                maxLength={50}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicDescription">
              <Form.Label style={{ color: "whitesmoke" }}>
                Post description
              </Form.Label>
              <Form.Control as="textarea" rows={15} />
            </Form.Group>
            <Form.Group className="mb-5" controlId="formBasicCode">
              <Form.Label style={{ color: "whitesmoke" }}>
                Code snippet
              </Form.Label>
              <Form.Control as="textarea" rows={15} />
            </Form.Group>
          </Form>
          <Button
            variant="primary"
            type="submit"
            className="mb-5"
            style={{ width: "100%" }}
            onClick={post}
          >
            Publish new post
          </Button>
        </Col>
      </Row>
      {redirComponent && redirComponent}
    </Container>
  );
};

export default NewPostPage;
