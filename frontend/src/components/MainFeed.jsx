import React from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Stack from "react-bootstrap/Stack";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import PostDescCard from "./PostDescCard";
/**
 * The search bar component on the top of the page
 */
const SearchComponent = (setPosts) => {
  /**
   * Requests the backend API for posts which match
   * the given keywords (from form data)
   */
  const searchPosts = async (e) => {
    e.preventDefault();
    try {
      const serverResponse = await fetch("/api/post/search", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: document.querySelector("#formBasicSearch").value,
        }),
      });
      if (serverResponse.ok) {
        const resJSON = await serverResponse.json();
        if (resJSON.posts instanceof Array) {
          setPosts(resJSON.posts);
          return;
        }
      }
    } catch (ex) {
      console.error(ex);
    }
  };
  return (
    <Form className="mb-3">
      <Stack direction="horizontal" gap={3}>
        <Form.Group controlId="formBasicSearch">
          <Form.Control type="text" placeholder="Search posts by header..." />
        </Form.Group>
        <Button variant="primary" type="submit" onClick={searchPosts}>
          Search
        </Button>
      </Stack>
    </Form>
  );
};

const MainFeed = () => {
  const [posts, setPosts] = useState([]);
  const [redirComponent, setRedirComponent] = useState(null);
  /**
   * Fetch all of the posts when the component mounts
   */
  useEffect(() => {
    let mounted = true;
    const fetchPosts = async () => {
      try {
        const serverResponse = await fetch("/api/post/", {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });
        if (serverResponse.ok) {
          const resJSON = await serverResponse.json();
          if (mounted) {
            /**
             * No posts yet if server responds with 200 OK and empty array
             */
            if (resJSON.posts && resJSON.posts.length === 0) {
              setRedirComponent(<Navigate to={"/nopostsyet"} />);
              return;
            }
            setPosts(resJSON.posts);
          }
        } else {
          if (mounted) {
            setRedirComponent(<Navigate to={"/notfound"} />);
          }
        }
      } catch (ex) {
        console.error(ex);
      }
    };
    fetchPosts();
    return () => {
      mounted = false;
    };
  }, []);

  let p;
  /**
   * If not posts, show no posts found...
   */
  if (posts && posts.length === 0) {
    p = (
      <h2 style={{ color: "whitesmoke", textAlign: "center" }}>
        No posts found...
      </h2>
    );
  } else {
    p = posts.map((post) => {
      return <PostDescCard post={post} key={post._id} />;
    });
  }

  return (
    <Container>
      <Row>
        <h1 style={{ textAlign: "center" }} className="mb-3">
          All posts
        </h1>
        <hr style={{ color: "whitesmoke" }} />
        {SearchComponent(setPosts)}
        <hr style={{ color: "whitesmoke" }} />
      </Row>
      <Row>
        <Col>{p}</Col>
      </Row>
      {redirComponent && redirComponent}
    </Container>
  );
};

export default MainFeed;
