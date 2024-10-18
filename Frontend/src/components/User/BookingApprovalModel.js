import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";

const BookingApprovalModal = ({ driver, onClose }) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(120); // 2 minutes (120 seconds)
  const [track, setTrack] = useState(false);
  const userId = localStorage.getItem("driverId");
  const [bookingId, setBookingId] = useState(null);
  console.log(userId, "userid in booking model from localstorage");

  useEffect(() => {
    const socket = io("http://localhost:5000", {
      transports: ["websocket"], // Use WebSocket transport
    });

    // Start the countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose(); // Close the modal when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Join the user's room
    socket.on("connect", () => {
      console.log("Connected to Socket.IO server, socket ID:", socket.id);
      socket.emit("joinRoom", { roomId: userId });
    });

    // Handle booking approval messages
    socket.on("bookingApproved", (message) => {
      console.log("got booking approval from server driver", message);
      if (message.driverId === driver._id) {
        setBookingId(message.bookingId);
        console.log(`Booking approved by driver: ${driver.name}`);
        setTrack(true);
        clearInterval(timer); // Stop the countdown on approval
      }
    });

    // Error handling
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // Clean up the interval and socket connection
    return () => {
      clearInterval(timer); // Clear the timer on unmount
      socket.disconnect(); // Disconnect the socket on unmount
    };
  }, [driver._id, driver.name, userId, onClose]);

  const handleTrack = () => {
    console.log(
      "redirecting to the tracking page with boooking Id ",
      bookingId
    );
    navigate(`/tracking/user/${bookingId}`);

    // Add your tracking functionality here
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
      {!track && (
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-lg font-bold mb-2">
            Waiting for Driver Approval
          </h2>
          <p className="text-gray-600">Driver: {driver.name}</p>
          <p className="font-semibold">Time remaining: {countdown} seconds</p>
          <button
            className="mt-4 bg-blue-500 text-white rounded-lg px-4 py-2"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      )}
      {track && (
        <div className="px-10 py-6 rounded-lg bg-white">
          <h2 className="text-3xl mb-4 font-bold  text-green-500">
            Booking Approved
          </h2>
          <p className="text-gray-600 text-base">
            Driver: {driver.name} on the way to pickup
          </p>
          <button
            className="mt-8 float-end bg-blue-500 text-white rounded-lg px-8 py-2"
            onClick={handleTrack}
          >
            Track
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingApprovalModal;
