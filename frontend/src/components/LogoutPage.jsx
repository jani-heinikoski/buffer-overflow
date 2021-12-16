import React from "react";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";

const LogoutPage = () => {
  window.localStorage.removeItem("auth_token");
  window.localStorage.removeItem("user");
  return (
    <Container>
      <Row>
        <Col>
          <h2 style={{ color: "whitesmoke", textAlign: "center" }}>
            You have been logged out!
          </h2>
        </Col>
      </Row>
    </Container>
  );
};

export default LogoutPage;
