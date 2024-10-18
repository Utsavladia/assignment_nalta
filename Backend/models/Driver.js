import mongoose from "mongoose";

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  available: { type: Boolean, default: true },
  email: { type: String, required: true, unique: true }, // Ensure email is required and unique
  password: { type: String, required: true }, // Ensure password is required
  vehicleType: { type: String, required: true }, // Added vehicleType field
  basePrice: { type: Number, required: true },
  pricePerKm: { type: Number, required: true },
  location: {
    type: {
      type: String, // This is required for GeoJSON data, should always be "Point"
      enum: ["Point"], // 'location.type' must be 'Point'
    },
    coordinates: {
      type: [Number], // Array of numbers: [longitude, latitude]
    },
  },
});

// Create the 2dsphere index for the location field to support geospatial queries
driverSchema.index({ location: "2dsphere" });

export default mongoose.model("Driver", driverSchema);
