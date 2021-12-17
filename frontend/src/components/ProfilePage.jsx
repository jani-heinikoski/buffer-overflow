import React from "react";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Navigate } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import { useState } from "react";
import { DateTime } from "luxon";
/**
 * Tries to parse the user from localStorage
 */
const tryParseUser = () => {
  let user = null;
  try {
    user = JSON.parse(window.localStorage.getItem("user"));
  } catch (ex) {
    console.error(ex);
    user = null;
  }
  return user;
};

const ProfilePage = () => {
  const [alertComponent, setAlertComponent] = useState(null);
  const [redirComponent, setRedirComponent] = useState(null);
  /**
   * Redirects user back to the main feed
   */
  const redirectToMainFeed = () => {
    setRedirComponent(<Navigate to={"/"} />);
  };
  /**
   * Posting requires the user to be authenticated, redirect to login if no auth_token or user info in localStorage
   */
  const authToken = window.localStorage.getItem("auth_token");
  const user = tryParseUser();
  if (!authToken || !user) {
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
        <p>{text}</p>
      </Alert>
    );
  };
  /**
   * Shows a success alert that indicates your profile has been updated
   */
  const showProfileUpdatedAlert = () => {
    setAlertComponent(
      <Alert
        variant="success"
        onClose={() => {
          setAlertComponent(null);
        }}
        dismissible
      >
        <Alert.Heading>Your profile has been updated!</Alert.Heading>
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
   * Sends a PATCH request to the backend
   * (requests to update the profile based on the form data)
   */
  const updateProfile = async (event) => {
    event.preventDefault();
    try {
      const serverResponse = await fetch(`/api/user/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        body: JSON.stringify({
          firstName: document.querySelector("#formBasicFname").value,
          lastName: document.querySelector("#formBasicLname").value,
          username: document.querySelector("#formBasicUsername").value,
          email: document.querySelector("#formBasicEmail").value,
          bio: document.querySelector("#formBasicBio").value,
        }),
      });
      const resJSON = await serverResponse.json();
      if (serverResponse.ok) {
        window.localStorage.setItem("user", JSON.stringify(resJSON.user));
        showProfileUpdatedAlert();
      } else {
        showWarningAlert(resJSON.msg, "Check your form data.");
      }
    } catch (ex) {
      console.error(ex);
      showWarningAlert("Something went wrong!", "Check your form data.");
    }
  };

  return (
    <Container>
      <h2 className="mb-3" style={{ textAlign: "center" }}>
        Profile page
      </h2>
      <h4 style={{ textAlign: "center" }}>
        {`Registered on: ${DateTime.fromISO(user.registered).toLocaleString(
          DateTime.DATETIME_SHORT_WITH_SECONDS
        )}`}
      </h4>
      {alertComponent && alertComponent}
      <Form>
        <Form.Group className="mb-3" controlId="formBasicFname">
          <Form.Label style={{ color: "whitesmoke" }}>First name</Form.Label>
          <Form.Control
            type="text"
            placeholder="First name..."
            defaultValue={user.firstName}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicLname">
          <Form.Label style={{ color: "whitesmoke" }}>Last name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Last name..."
            defaultValue={user.lastName}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicUsername">
          <Form.Label style={{ color: "whitesmoke" }}>Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter username..."
            defaultValue={user.username}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label style={{ color: "whitesmoke" }}>E-mail</Form.Label>
          <Form.Control
            type="email"
            placeholder="E-mail..."
            defaultValue={user.email}
          />
        </Form.Group>
        <Form.Group className="mb-5" controlId="formBasicBio">
          <Form.Label style={{ color: "whitesmoke" }}>Biography</Form.Label>
          <Form.Control
            type="text"
            placeholder="I am a student at..."
            defaultValue={user.bio}
          />
        </Form.Group>
        <Button
          variant="primary"
          type="submit"
          className="mb-3"
          style={{ width: "100%" }}
          onClick={updateProfile}
        >
          Update profile
        </Button>
      </Form>
      {redirComponent && redirComponent}
    </Container>
  );
};

export default ProfilePage;
