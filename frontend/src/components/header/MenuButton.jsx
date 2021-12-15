import React from "react";

const MenuButton = ({ onClick, className, style }) => {
  let cn = className;
  if (className) {
    cn += " hamburger-menu";
  } else {
    cn = "hamburger-menu";
  }

  return (
    <div onClick={onClick} className={cn} style={{ ...style }}>
      <div className="hamburger-menu-line top-line"></div>
      <div className="hamburger-menu-line mid-line"></div>
      <div className="hamburger-menu-line bot-line"></div>
    </div>
  );
};

export default MenuButton;
