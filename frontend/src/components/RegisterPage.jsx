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

const RegisterPage = () => {
  const [alertComponent, setAlertComponent] = useState(null);
  const [redirComponent, setRedirComponent] = useState(null);

  const redirectToLogin = () => {
    setRedirComponent(<Navigate to={"/login"} />);
  };

  const register = async (e) => {
    e.preventDefault();
    try {
      const serverResponse = await fetch("api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: document.querySelector("#formBasicFname").value,
          lastName: document.querySelector("#formBasicLname").value,
          username: document.querySelector("#formBasicUsername").value,
          password: document.querySelector("#formBasicPassword").value,
          email: document.querySelector("#formBasicEmail").value,
          bio: document.querySelector("#formBasicBio").value,
        }),
      });
      const resJSON = await serverResponse.json();
      if (serverResponse.ok) {
        console.log(resJSON);
        setAlertComponent(
          <Alert variant="success">
            <Alert.Heading>New account has been created!</Alert.Heading>
            <p style={{ color: "black" }}>
              Login to your account to start posting!
            </p>
            <hr />
            <Button
              variant="success"
              onClick={() => {
                redirectToLogin();
              }}
            >
              Login
            </Button>
          </Alert>
        );
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
              <Alert.Heading>{resJSON.msg}</Alert.Heading>
              <p style={{ color: "black" }}>
                Check the form fields you have filled!
              </p>
            </Alert>
          );
        }
      }
    } catch (ex) {
      console.error(ex);
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
            Register page
          </h2>
          {alertComponent && alertComponent}
          <Form>
            <Form.Group className="mb-3" controlId="formBasicFname">
              <Form.Label style={{ color: "whitesmoke" }}>
                First name
              </Form.Label>
              <Form.Control type="text" placeholder="First name..." />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicLname">
              <Form.Label style={{ color: "whitesmoke" }}>Last name</Form.Label>
              <Form.Control type="text" placeholder="Last name..." />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicUsername">
              <Form.Label style={{ color: "whitesmoke" }}>Username</Form.Label>
              <Form.Control type="text" placeholder="Enter username..." />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label style={{ color: "whitesmoke" }}>Password</Form.Label>
              <Form.Control type="password" placeholder="Password..." />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label style={{ color: "whitesmoke" }}>E-mail</Form.Label>
              <Form.Control type="email" placeholder="E-mail..." />
            </Form.Group>
            <Form.Group className="mb-5" controlId="formBasicBio">
              <Form.Label style={{ color: "whitesmoke" }}>Biography</Form.Label>
              <Form.Control type="text" placeholder="I am a student at..." />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              className="mb-3"
              style={{ width: "100%" }}
              onClick={register}
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

export default RegisterPage;
