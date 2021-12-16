import React from "react";
import Row from "react-bootstrap/Row";
import Comment from "./Comment";

const Comments = ({ comments, postId }) => {
  return (
    <Row>
      <h4 style={{ color: "whitesmoke" }}>All comments:</h4>
      <hr style={{ color: "whitesmoke" }} />
      {comments &&
        comments.map((comment) => {
          return (
            <Comment key={comment._id} comment={comment} postId={postId} />
          );
        })}
    </Row>
  );
};

export default Comments;
