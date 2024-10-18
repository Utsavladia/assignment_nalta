import Booking from "../models/Booking.js";
import Driver from "../models/Driver.js";

// Assuming you have initialized io in your main server file
let io; // Declare the io variable

// Function to set io from the main server (called during server setup)
export const setSocketIo = (socketIo) => {
  io = socketIo;
};

// Booking Controller
export const bookDriver = async (req, res) => {
  const { driverId, userId, pickupLocation, dropLocation, price, distance } =
    req.body;

  console.log("Received request to book a driver:", req.body);

  try {
    // Check if the driver exists and is available
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found." });
    }

    // Create a new booking in the database
    const booking = await Booking.create({
      driverId,
      userId,
      pickupLocation,
      dropLocation,
      price,
      distance,
      status: "Pending_Approval",
    });

    // Ensure driver has joined their own room (identified by driverId)
    if (io) {
      console.log("Emitting booking request to driver room:", driverId);

      // Emit a real-time message to the driver for approval
      io.to(driverId).emit("newBookingRequest", {
        bookingId: booking._id,
        userId,
        pickupLocation,
        dropLocation,
        price,
        distance,
      });
    } else {
      console.error("Socket.io is not initialized.");
      return res.status(500).json({ error: "Socket.io not available." });
    }

    // Return success response to the client
    res.status(201).json({
      message: "Booking request sent to driver, awaiting approval.",
      booking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Server error while booking." });
  }
};

export const bookingDetails = async (req, res) => {
  const { bookingId } = req.params; // Get bookingId from the request parameters
  console.log("We have the booking ID to find details as ", bookingId);

  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    console.log("Booking found on server details as ", booking);

    return res.status(200).json({
      pickupLocation: booking.pickupLocation,
      dropLocation: booking.dropLocation,
      driverId: booking.driverId,
      userId: booking.userId,
      status: booking.status,
      price: booking.price,
      distance: booking.distance,
    });
  } catch (error) {
    console.error("Error fetching booking details:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};
