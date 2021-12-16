import React from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Stack from "react-bootstrap/Stack";
import Container from "react-bootstrap/Container";
import { Navigate } from "react-router-dom";
import { useState } from "react";
import { DateTime } from "luxon";

const PostDescCard = ({ post }) => {
  const [redirComponent, setRedirComponent] = useState(null);

  let desc;
  if (post.description.length > 200) {
    desc = post.description.substring(0, 200) + "......";
  } else {
    desc = post.description;
  }

  const redirectToPostDetails = () => {
    setRedirComponent(<Navigate to={`/post/${post._id}`} />);
  };

  return (
    <Card className="mt-4 border" bg="dark" text="light">
      <Card.Header as="h5">{post.createdBy.username}</Card.Header>
      <Card.Body>
        <Card.Title>{post.header}</Card.Title>
        <Card.Subtitle className="mb-3 text-muted">
          {`Published: ${DateTime.fromISO(post.createdDate).toLocaleString(
            DateTime.DATETIME_SHORT_WITH_SECONDS
          )}`}
        </Card.Subtitle>
        <Card.Text>{desc}</Card.Text>
        <Stack direction="horizontal" gap={3}>
          <Button
            variant="primary"
            style={{ whiteSpace: "nowrap" }}
            onClick={() => {
              redirectToPostDetails();
            }}
          >
            Show more
          </Button>
          <Container>Likes: {post.likes}</Container>
        </Stack>
      </Card.Body>
      {redirComponent && redirComponent}
    </Card>
  );
};

export default PostDescCard;
