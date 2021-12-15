import { LinkContainer } from "react-router-bootstrap";
import Nav from "react-bootstrap/Nav";
import React from "react";

const NavLink = ({ href, text, onClick }) => {
  return (
    <LinkContainer to={href || "/"}>
      <Nav.Link className="fs-4" bsPrefix="themed-nav-link" onClick={onClick}>
        {text || ""}
      </Nav.Link>
    </LinkContainer>
  );
};

export default NavLink;
