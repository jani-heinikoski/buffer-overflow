import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import { useState, useEffect } from "react";
import { DateTime } from "luxon";
import { Navigate, useParams } from "react-router-dom";

const profile = (user, onClick) => {
  return (
    <Container>
      <Row>
        <h2 style={{ textAlign: "center" }} className="mb-3">
          {`Public profile of ${user.username}`}
        </h2>
        <hr style={{ color: "whitesmoke" }} />
        <h4 style={{ textAlign: "center" }} className="mb-3">
          {`User registered on: ${DateTime.fromISO(
            user.registered
          ).toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)}`}
        </h4>
        <hr style={{ color: "whitesmoke" }} />
        <p style={{ textAlign: "center" }}>{`Biography: ${user.bio}`}</p>
        <hr />
        <Button
          variant="primary"
          onClick={onClick}
          style={{ width: "auto", marginLeft: "auto", marginRight: "auto" }}
        >
          Back to the main feed
        </Button>
      </Row>
    </Container>
  );
};

const PublicProfilePage = () => {
  let { username } = useParams();
  const [redirComponent, setRedirComponent] = useState(null);
  const [user, setUser] = useState(null);
  /**
   * Redirects user back to the main feed
   */
  const redirectToMainFeed = () => {
    setRedirComponent(<Navigate to={"/"} />);
  };
  /**
   * Redirects user to the 404 not found page
   */
  const redirectToNotFound = () => {
    setRedirComponent(<Navigate to={"/notfound"} />);
  };
  useEffect(() => {
    let mounted = true;
    const fetchPost = async () => {
      try {
        const serverResponse = await fetch(`/api/user/${username}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });
        const resJSON = await serverResponse.json();
        if (serverResponse.ok) {
          if (mounted) {
            setUser(resJSON.user);
          }
        } else {
          if (mounted) {
            redirectToNotFound();
          }
        }
      } catch (ex) {
        console.error(ex);
      }
    };
    fetchPost();
    return () => {
      mounted = false;
    };
  }, [username]);

  return (
    <Container>
      {!user && <h2 style={{ textAlign: "center" }}>Fetching user...</h2>}
      {user && profile(user, redirectToMainFeed)}
      {redirComponent && redirComponent}
    </Container>
  );
};

export default PublicProfilePage;
