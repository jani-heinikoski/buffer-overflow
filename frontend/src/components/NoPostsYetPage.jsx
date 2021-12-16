import React from "react";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";

const NotFoundPage = () => {
  const [redirComponent, setRedirComponent] = useState(null);

  const redirectToLogin = () => {
    setRedirComponent(<Navigate to={"/login"} />);
  };

  const redirectToNewPost = () => {
    setRedirComponent(<Navigate to={"/newpost"} />);
  };

  const authToken = window.localStorage.getItem("auth_token");
  let btn;
  if (authToken) {
    btn = (
      <Button
        variant="primary"
        onClick={() => {
          redirectToNewPost();
        }}
      >
        Be the first - Create a new post now!
      </Button>
    );
  } else {
    btn = (
      <Button
        variant="primary"
        onClick={() => {
          redirectToLogin();
        }}
      >
        Login/Register to create the first one!
      </Button>
    );
  }

  return (
    <Container>
      <Row style={{ justifyContent: "center" }}>
        <h2 style={{ color: "whitesmoke", textAlign: "center" }}>
          {"There are no posts yet :("}
        </h2>
        <Container style={{ width: "auto", marginTop: "16px" }}>
          {btn}
        </Container>
      </Row>
      {redirComponent && redirComponent}
    </Container>
  );
};

export default NotFoundPage;
