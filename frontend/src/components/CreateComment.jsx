import React from "react";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import { useState } from "react";

const CreateComment = ({ post, newCommentCreatedCallback }) => {
  const [alertComponent, setAlertComponent] = useState(null);
  if (!post) {
    return <></>;
  }
  /**
   * Commenting requires you to be authenticated
   */
  const authToken = window.localStorage.getItem("auth_token");
  if (!authToken) {
    return <></>;
  }
  /**
   * Shows an alert indicating that you created a new comment
   */
  const showCommentCreatedAlert = () => {
    setAlertComponent(
      <Alert
        variant="success"
        onClose={() => {
          setAlertComponent(null);
        }}
        dismissible
      >
        <Alert.Heading>New comment posted!</Alert.Heading>
        <p style={{ color: "black" }}>
          You have created a new comment, check all comments below...
        </p>
      </Alert>
    );
  };
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
   * Sends a POST req to the backend with the comment's content in the body
   * (tries to add a new comment to the current post based on the card's form data)
   */
  const postComment = async (e) => {
    e.preventDefault();
    try {
      const serverResponse = await fetch(`/api/post/${post._id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        body: JSON.stringify({
          content: document.querySelector("#formBasicCommentContent").value,
        }),
      });
      const resJSON = await serverResponse.json();
      if (serverResponse.ok) {
        showCommentCreatedAlert();
        // Call the given callback with the new comment as an argument
        // so that parent knows to update its state accordingly
        newCommentCreatedCallback(resJSON.comment);
      } else {
        showWarningAlert(resJSON.msg, "Check your form data.");
      }
    } catch (ex) {
      console.error(ex);
      showWarningAlert("Something went wrong!", "Check your form data.");
    }
  };

  return (
    <Row>
      <hr style={{ color: "whitesmoke" }} />
      {alertComponent && alertComponent}
      <Card className="mb-3 border" bg="dark" text="light">
        <Card.Header>Create a comment</Card.Header>
        <Card.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formBasicCommentContent">
              <Form.Label>Comment</Form.Label>
              <Form.Control as="textarea" rows={3} />
            </Form.Group>
            <Button variant="primary" type="submit" onClick={postComment}>
              Publish comment
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Row>
  );
};

export default CreateComment;
