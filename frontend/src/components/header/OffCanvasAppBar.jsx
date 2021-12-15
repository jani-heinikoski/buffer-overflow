import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/NavBar";
import Container from "react-bootstrap/Container";
import CloseButton from "react-bootstrap/CloseButton";
import Offcanvas from "react-bootstrap/Offcanvas";
import React from "react";
import NavLink from "./NavLink";
import MenuButton from "./MenuButton";
import Brand from "./Brand";

import { useState } from "react";

const OffCanvasAppBar = () => {
  const [showCanvas, setShowCanvas] = useState(false);
  // Functions for opening / closing the OffCanvas side menu
  const closeOffCanvasNav = () => setShowCanvas(false);
  const openOffCanvasNav = () => setShowCanvas(true);
  // Close the OffCanvas nav if the user clicks outside of the menu
  window.addEventListener("click", (event) => {
    if (
      event.target === document.querySelector(".offcanvas-backdrop") &&
      showCanvas
    ) {
      closeOffCanvasNav();
    }
  });

  return (
    <Navbar bg="dark" variant="dark" fixed="top" expand="false">
      <Container fluid>
        <Brand></Brand>
        <MenuButton onClick={openOffCanvasNav} />
        <Navbar.Offcanvas
          id="offcanvasNavbar"
          aria-labelledby="offcanvasNavbarLabel"
          placement="end"
          show={showCanvas}
          style={{ backgroundColor: "#1f1f1f" }}
        >
          <Offcanvas.Header className="fs-3">
            <Offcanvas.Title
              id="offcanvasNavbarLabel"
              style={{ color: "antiquewhite" }}
            >
              Navigation
            </Offcanvas.Title>
            <CloseButton variant="white" onClick={closeOffCanvasNav} />
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav style={{ flexGrow: 1 }}>
              <NavLink text="Home Page" onClick={closeOffCanvasNav}></NavLink>
              <NavLink
                text="Login/Register"
                href="/login"
                onClick={closeOffCanvasNav}
              ></NavLink>
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
};

export default OffCanvasAppBar;
