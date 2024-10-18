import React from "react";
import { Link } from "react-router-dom";

const Header = ({ role }) => {
  return (
    <header>
      <nav className="flex gap-6">
        <Link to="/">Home</Link>
        <Link to="/auth">Auth</Link>
        <Link to="/booking">Book a Ride</Link>
        <Link to="/tracking">Track a Ride</Link>
      </nav>
    </header>
  );
};

export default Header;
