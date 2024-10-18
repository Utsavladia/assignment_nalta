import React, { useEffect, useState } from "react";
import { sendLocationToServer } from "../../Api";

const DriverLocation = ({ driverId }) => {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [error, setError] = useState("");

  // Function to get driver's location
  const updateDriverLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          sendLocationToServer({
            driverId: driverId,
            location: {
              coordinates: [latitude, longitude],
            },
          });
          console.log("sent driver location as ", location);
        },
        (err) => {
          setError("Location access denied. Please enable location services.");
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  // Run once when component mounts
  useEffect(() => {
    updateDriverLocation();
    const intervalId = setInterval(updateDriverLocation, 1000); // Update every 30 seconds
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  return (
    <div>
      {/* <h3>Driver Location</h3>
      {error && <p>{error}</p>}
      <p>Latitude: {location.latitude}</p>
      <p>Longitude: {location.longitude}</p> */}
    </div>
  );
};

export default DriverLocation;
