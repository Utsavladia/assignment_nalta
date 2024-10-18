import express from "express";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";
import { trackVehicle } from "./controllers/trackingController.js";
import cors from "cors";
import dotenv from "dotenv";
import {
  bookDriver,
  bookingDetails,
  setSocketIo,
} from "./controllers/bookingController.js";
import Booking from "./models/Booking.js";

dotenv.config();

const app = express();
const server = http.createServer(app); // Pass the Express app to http.createServer
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust according to your frontend URL
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to the database
connectDB();

// Define routes
app.use("/api/auth", authRoutes);
app.use("/api/driver", driverRoutes);
app.use("/api/booking", bookDriver);

// Correct route for fetching booking details
app.get("/api/detail/booking/:bookingId", bookingDetails); // Use app.get instead of app.use

// Initialize tracking functionality with Socket.IO
trackVehicle(io);
setSocketIo(io);

// WebSocket connection handler
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join the room for each user or driver based on their ID
  socket.on("joinRoom", ({ roomId }) => {
    socket.join(roomId); // Room for either user or driver
    console.log("User joined room with ID ", roomId);
  });

  // Handle approval from the driver
  socket.on("approveBooking", async ({ bookingId, userId, driverId }) => {
    try {
      // Find the booking by ID and update its status to "Booked"
      const updatedBooking = await Booking.findByIdAndUpdate(
        bookingId,
        { status: "Booked", driverId: driverId }, // Update status and driverId
        { new: true } // Return the updated booking document
      );

      if (!updatedBooking) {
        console.log(`Booking with ID ${bookingId} not found`);
        return;
      }

      // Log details for testing purposes
      console.log(`Booking approved! Details:`);
      console.log(`Booking ID: ${bookingId}`);
      console.log(`User ID: ${userId}`);
      console.log(`Driver ID: ${driverId}`);

      // Emit the approval message to the user's room
      io.to(userId).emit("bookingApproved", {
        bookingId: updatedBooking._id,
        driverId: updatedBooking.driverId,
        message: "Your booking has been approved by the driver!",
      });

      console.log(`Approval sent to user ${userId} for booking ${bookingId}`);
    } catch (error) {
      console.error("Error approving booking:", error);
    }
  });

  // When the driver sends their location
  socket.on("driverLocationUpdate", ({ roomId, driverLocation }) => {
    // Broadcast to the user in the same room
    socket.to(roomId).emit("driverLocationUpdate", driverLocation);
    console.log("send to driverId room with location ", driverLocation);
  });

  // Disconnect handler
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
