/**
 * Sources: https://react-bootstrap.github.io/components/forms/
 */
import React from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import { useState } from "react";
import { Navigate } from "react-router-dom";

const LoginPage = () => {
  const [alertComponent, setAlertComponent] = useState(null);
  const [redirComponent, setRedirComponent] = useState(null);

  const redirectToRegister = () => {
    setRedirComponent(<Navigate to={"/register"} />);
  };

  const redirectToMainPage = () => {
    setRedirComponent(<Navigate to={"/"} />);
  };

  const login = async (e) => {
    e.preventDefault();
    const username = document.querySelector("#formBasicUsername").value;
    const password = document.querySelector("#formBasicPassword").value;
    if (username && password && username.length > 0 && password.length > 0) {
      try {
        const serverResponse = await fetch("api/user/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username,
            password: password,
          }),
        });
        const resJSON = await serverResponse.json();
        if (serverResponse.ok) {
          console.log(resJSON);
          window.localStorage.setItem("auth_token", `Bearer ${resJSON.token}`);
          window.localStorage.setItem("user", JSON.stringify(resJSON.user));
          redirectToMainPage();
        } else {
          if (resJSON.msg) {
            setAlertComponent(
              <Alert
                variant="danger"
                onClose={() => {
                  setAlertComponent(null);
                }}
                dismissible
              >
                <Alert.Heading>{resJSON.msg}!</Alert.Heading>
                <p>
                  Make sure you have entered a correct username and password.
                  Register to create a new account first.
                </p>
              </Alert>
            );
          }
        }
      } catch (ex) {
        console.error(ex);
      }
    }
  };

  return (
    <Container>
      <Row>
        <Col>
          <h2
            className="mb-5"
            style={{ color: "whitesmoke", textAlign: "center" }}
          >
            Login page
          </h2>
          {alertComponent && alertComponent}
          <Form>
            <Form.Group className="mb-3" controlId="formBasicUsername">
              <Form.Label style={{ color: "whitesmoke" }}>Username</Form.Label>
              <Form.Control type="text" placeholder="Enter username..." />
              <Form.Text className="text-muted">
                We'll never share your user details with anyone else.
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-5" controlId="formBasicPassword">
              <Form.Label style={{ color: "whitesmoke" }}>Password</Form.Label>
              <Form.Control type="password" placeholder="Password..." />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              className="mb-3"
              style={{ width: "100%" }}
              onClick={login}
            >
              Login
            </Button>
            <Button
              variant="secondary"
              style={{ width: "100%" }}
              onClick={redirectToRegister}
            >
              Register
            </Button>
          </Form>
        </Col>
      </Row>
      {redirComponent && redirComponent}
    </Container>
  );
};

export default LoginPage;
