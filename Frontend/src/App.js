import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "./components/Auth";
import DriverTracking from "./components/Driver/DriverTracking";
import Home from "./components/Home";
import DriverPage from "./components/Driver/DriverPage";
import NewUserPage from "./components/User/NewUserPage";
import UserTracking from "./components/User/UserTracking";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth/driver" element={<Auth role={"driver"} />} />
        <Route path="/auth/user" element={<Auth role={"user"} />} />
        <Route
          path="/tracking/driver/:bookingId"
          element={<DriverTracking />}
        />
        <Route path="/tracking/user/:bookingId" element={<UserTracking />} />
        <Route path="/user" element={<NewUserPage />} />
        <Route path="/driver" element={<DriverPage />} />
      </Routes>
    </Router>
  );
};

export default App;
