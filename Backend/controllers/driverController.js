import Driver from "../models/Driver.js";

export const driverLocation = async (req, res) => {
  const { driverId, location } = req.body;

  if (!driverId || !location) {
    return res
      .status(400)
      .json({ message: "Driver ID and valid location are required" });
  }

  try {
    // Update driver's location in the database
    const driver = await Driver.findByIdAndUpdate(
      driverId,
      {
        $set: {
          location: {
            type: "Point",
            coordinates: location.coordinates, // [longitude, latitude]
          },
        },
      },
      { new: true } // Return the updated driver document
    );

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }
    console.log("Driver location set as ", driver);

    // Log and respond with the updated driver info
    return res
      .status(200)
      .json({ message: "Location updated successfully", driver });
  } catch (error) {
    console.error("Error updating driver location:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const nearbyDriver = async (req, res) => {
  const { lat, lng } = req.query;

  try {
    // Find drivers within a 10km radius of the pickup location
    const drivers = await Driver.find({
      available: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: 100000000, // Distance in meters
        },
      },
    });
    console.log("Found nearby drivers as ", drivers);

    res.json({ drivers });
  } catch (error) {
    console.error("Error finding nearby drivers:", error);
    res.status(500).json({ error: "Error finding nearby drivers." });
  }
};
