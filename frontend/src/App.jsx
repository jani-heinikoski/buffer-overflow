import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import OffCanvasAppBar from "./components/header/OffCanvasAppBar";
import { Routes, Route } from "react-router-dom";
import NotFoundPage from "./components/NotFoundPage";

const App = () => {
  const sampleContent = [];
  for (let i = 0; i < 100; i++) {
    sampleContent.push(
      <Row>
        <Col>
          <div>image here</div>
        </Col>
      </Row>
    );
  }

  return (
    <div
      className="App"
      style={{
        paddingTop: "113px",
      }}
    >
      <Row>
        <Col>
          <OffCanvasAppBar></OffCanvasAppBar>
        </Col>
      </Row>
      <Routes>
        <Route
          exact
          path="/"
          element={<Container fluid>{sampleContent}</Container>}
        ></Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
};

export default App;
