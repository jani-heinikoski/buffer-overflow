import React from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import PostDescCard from "./PostDescCard";

const MainFeed = () => {
  const [posts, setPosts] = useState([]);
  const [redirComponent, setRedirComponent] = useState(null);

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

  if (posts && posts.length === 0) {
    p = (
      <h2 style={{ color: "whitesmoke", textAlign: "center" }}>
        Fetching posts...
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
        <Col>{p}</Col>
      </Row>
      {redirComponent && redirComponent}
    </Container>
  );
};

export default MainFeed;
