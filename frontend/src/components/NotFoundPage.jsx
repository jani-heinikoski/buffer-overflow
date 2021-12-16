import React from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

const NotFoundPage = () => {
  return (
    <Container>
      <Row>
        <Col>
          <h2 style={{ color: "whitesmoke", textAlign: "center" }}>
            404 - Resource not found...
          </h2>
          ;
        </Col>
      </Row>
    </Container>
  );
};

export default NotFoundPage;
