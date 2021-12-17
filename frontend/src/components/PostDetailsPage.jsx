import React from "react";
import { Navigate, useParams } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Highlight from "react-highlight";
import { useEffect, useState } from "react";
import Comments from "./Comments";
import CreateComment from "./CreateComment";

// const checkEditRights = (post) => {
//   let editRights = false;
//   let user = window.localStorage.getItem("user");

//   try {
//     user = JSON.parse(user);
//   } catch (ex) {
//     user = null;
//   }

//   if (user && post) {
//     if (user._id === post.createdBy) {
//       editRights = true;
//     }
//   }

//   return editRights;
// };

const PostDetailsPage = () => {
  let { id } = useParams();
  const [post, setPost] = useState(null);
  const [redirComponent, setRedirComponent] = useState(null);
  const [comments, setComments] = useState(null);
  /**
   * Fetch the current post
   */
  useEffect(() => {
    let mounted = true;
    const fetchPost = async () => {
      try {
        const serverResponse = await fetch(`/api/post/${id}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });
        const resJSON = await serverResponse.json();
        if (serverResponse.ok) {
          if (mounted) {
            setPost(resJSON.post);
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
    fetchPost();
    return () => {
      mounted = false;
    };
  }, [id]);
  /**
   * Fetch all of the comments for the Comments component
   * when the component first mounts (or id changes)
   */
  useEffect(() => {
    let mounted = true;
    const fetchComments = async () => {
      try {
        const serverResponse = await fetch(`/api/post/${id}/comment`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });
        const resJSON = await serverResponse.json();
        if (serverResponse.ok && mounted) {
          setComments(resJSON.comments);
        }
      } catch (ex) {
        console.error(ex);
      }
    };
    fetchComments();
    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <Container>
      <h2 style={{ color: "whitesmoke", fontStyle: "italic" }}>
        {post && post.header}
      </h2>
      <hr style={{ color: "whitesmoke" }} />
      <h4 style={{ color: "whitesmoke" }}>Description:</h4>
      <p style={{ color: "whitesmoke" }}>{post && post.description}</p>
      <hr style={{ color: "whitesmoke" }} />
      <h4 style={{ color: "whitesmoke" }}>Code snippet:</h4>
      <Highlight>{post && post.code}</Highlight>
      <CreateComment
        post={post}
        newCommentCreatedCallback={(comment) => {
          setComments([comment, ...comments]);
        }}
      />
      <Comments comments={comments} postId={id} />
      {redirComponent && redirComponent}
    </Container>
  );
};

export default PostDetailsPage;
