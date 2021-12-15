import React from "react";
import Logo from "../Logo";
import Navbar from "react-bootstrap/NavBar";
import { LinkContainer } from "react-router-bootstrap";

const Brand = () => {
  return (
    <LinkContainer to="/">
      <Navbar.Brand>
        <Logo />
      </Navbar.Brand>
    </LinkContainer>
  );
};

export default Brand;
