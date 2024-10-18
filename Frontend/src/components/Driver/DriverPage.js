import React, { useEffect, useState, useRef } from "react";
import DriverLocation from "./DriverLocation";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";

const DriverPage = () => {
  const driverId = localStorage.getItem("driverId");
  const [bookingRequests, setBookingRequests] = useState([]); // State to store multiple booking requests
  const [approvedBookingId, setApprovedBookingId] = useState(null); // Store the approved booking ID

  const socketRef = useRef(null); // Use useRef to store the socket instance
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Initializing socket connection from driver page");

    // Establish socket connection
    socketRef.current = io("http://localhost:5000");

    const socket = socketRef.current; // Get socket from ref

    socket.on("connect", () => {
      console.log("Socket connected successfully with id:", socket.id);

      // Driver joins their own room (driverId)
      socket.emit("joinRoom", { roomId: driverId });
      console.log(`Driver with ID ${driverId} joined room.`);
    });

    // Handle multiple booking requests
    socket.on("newBookingRequest", (bookingData) => {
      console.log("New booking request received:", bookingData);
      setBookingRequests((prevRequests) => [...prevRequests, bookingData]); // Add new booking to the list
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    // Cleanup when the component unmounts
    return () => {
      console.log("Disconnecting socket...");
      socket.disconnect();
    };
  }, [driverId]);

  const approveBooking = (bookingId) => {
    const bookingToApprove = bookingRequests.find(
      (req) => req.bookingId === bookingId
    );

    if (bookingToApprove) {
      // Emit to user's room (userId) to notify the approval
      socketRef.current.emit("approveBooking", {
        bookingId: bookingToApprove.bookingId,
        userId: bookingToApprove.userId, // Target the user's room
        driverId: driverId,
      });
      setApprovedBookingId(bookingId);

      console.log(`Booking approved for user ${bookingToApprove.userId}`);

      // Update state to remove the approved booking
      // setBookingRequests((prevRequests) =>
      //   prevRequests.filter((req) => req.bookingId !== bookingId)
      // );
    }
  };

  const handleTrack = () => {
    navigate(`/tracking/driver/${approvedBookingId}`);
  };

  return (
    <div className=" flex justify-center items-start">
      <DriverLocation driverId={driverId} />
      {bookingRequests.length > 0 ? (
        <div className=" w-1/2 p-6">
          <h3 className=" text-3xl my-4 text-orange-500 font-bold pb-3 border-b-2 border-black mb-6">
            New Booking Requests
          </h3>
          {bookingRequests.map((booking) => (
            <div
              key={booking.bookingId}
              className=" shadow-lg pt-6 pb-4 px-6 mt-4 rounded-lg"
            >
              <div className="flex justify-between  items-center w-full">
                <p className=" text-black text-lg font-semibold">
                  Pickup Location:
                  <br />
                  <span className="text-blue-500">
                    {" "}
                    {booking.pickupLocation.name}
                  </span>
                </p>
                <p className=" text-black text-lg font-semibold">
                  Drop Location:
                  <br />
                  <span className="text-blue-500">
                    {booking.dropLocation.name}
                  </span>
                </p>
              </div>
              <div className="flex justify-between w-full items-center mt-8">
                <h1 className="flex flex-col items-start justify-evenly text-lg font-semibold">
                  {booking.price}
                  {" ₹"}
                  <span className="text-base font-normal ">
                    {booking.distance} km
                  </span>
                </h1>

                <div className="flex gap-6 items-center ">
                  {approvedBookingId === booking.bookingId ? (
                    <>
                      <h1 className="text-green-500 text-xl font-semibold">
                        Accepted
                      </h1>
                      <button
                        className="px-6 py-2 bg-blue-500 text-white text-lg font-semibold rounded-lg"
                        onClick={() => handleTrack()}
                      >
                        Track Booking
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="px-6 py-2 rounded-lg text-lg font-semibold bg-gray-300 text-black">
                        Cancel
                      </button>
                      <button
                        className="px-6 py-2 bg-green-500 text-white text-lg font-semibold rounded-lg"
                        onClick={() => approveBooking(booking.bookingId)}
                      >
                        Accept Booking
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <h1 className="text-blue-600 text-2xl font-bold mt-10">
          No Booking request available at this moment
        </h1>
      )}
    </div>
  );
};

export default DriverPage;
