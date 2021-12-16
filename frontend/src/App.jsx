import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import OffCanvasAppBar from "./components/header/OffCanvasAppBar";
import { Routes, Route } from "react-router-dom";
import NotFoundPage from "./components/NotFoundPage";
import NoPostsYetPage from "./components/NoPostsYetPage";
import MainFeed from "./components/MainFeed";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import NewPostPage from "./components/NewPostPage";
import LogoutPage from "./components/LogoutPage";
import PostDetailsPage from "./components/PostDetailsPage";
import ProfilePage from "./components/ProfilePage";
import PublicProfilePage from "./components/PublicProfilePage";

const App = () => {
  return (
    <Container
      fluid
      style={{
        paddingTop: "113px",
      }}
    >
      <Row>
        <Col>
          <OffCanvasAppBar></OffCanvasAppBar>
        </Col>
      </Row>
      <Row>
        <Col>
          <Routes>
            <Route exact path="/" element={<MainFeed />}></Route>
            <Route
              exact
              path="/nopostsyet"
              element={<NoPostsYetPage />}
            ></Route>
            <Route exact path="/login" element={<LoginPage />}></Route>
            <Route exact path="/logout" element={<LogoutPage />}></Route>
            <Route exact path="/register" element={<RegisterPage />}></Route>
            <Route exact path="/newpost" element={<NewPostPage />}></Route>
            <Route exact path="/post/:id" element={<PostDetailsPage />}></Route>
            <Route exact path="/profile" element={<ProfilePage />}></Route>
            <Route
              exact
              path="/profile/:username"
              element={<PublicProfilePage />}
            ></Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Col>
      </Row>
    </Container>
  );
};

export default App;
