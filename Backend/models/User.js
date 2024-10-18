import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: [Number],
  },
});

export default mongoose.model("User", userSchema);
