import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  pickupLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    name: { type: String },
  },
  dropLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    name: { type: String },
  },
  distance: { type: Number, required: true },
  price: { type: Number, required: true },
  status: {
    type: String,
    default: "booked",
  },
  createdAt: { type: Date, default: Date.now },
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
