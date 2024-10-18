import React, { useEffect, useState, useRef } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";
import io from "socket.io-client";
import { getBookingDetails } from "../../Api";
import { useParams } from "react-router-dom";
import truck from "../../icons/truck.png";

const UserTracking = () => {
  const { bookingId } = useParams();
  const [driverLocation, setDriverLocation] = useState({
    lat: 0,
    lng: 0,
  });
  const [pickupLocation, setPickupLocation] = useState({
    lat: 40,
    lng: 40,
    name: "",
  });
  const [dropLocation, setDropLocation] = useState({
    lat: -76,
    lng: 40,
    name: "",
  });
  const [directions, setDirections] = useState(null);
  const socketRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [price, setPrice] = useState(null);

  const mapContainerStyle = {
    width: "100%",
    height: "99vh",
  };

  const fetchBookingDetails = async (bookingId) => {
    try {
      console.log("Fetching booking detail with id:", bookingId);
      const response = await getBookingDetails(bookingId);
      const data = response.data;
      setPrice(data.price);

      setPickupLocation({
        name: data.pickupLocation.name,
        lat: data.pickupLocation.lat,
        lng: data.pickupLocation.lng,
      });

      setDropLocation({
        name: data.dropLocation.name,
        lat: data.dropLocation.lat,
        lng: data.dropLocation.lng,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching booking details:", error);
    }
  };

  const fetchDirections = () => {
    if (pickupLocation.lat && dropLocation.lat) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: new window.google.maps.LatLng(
            pickupLocation.lat,
            pickupLocation.lng
          ),
          destination: new window.google.maps.LatLng(
            dropLocation.lat,
            dropLocation.lng
          ),
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            console.error("Error fetching directions:", result);
          }
        }
      );
    }
  };

  useEffect(() => {
    fetchBookingDetails(bookingId);

    // Connect to the socket
    socketRef.current = io("http://localhost:5000");

    // Join the room for this booking
    socketRef.current.emit("joinRoom", { roomId: bookingId });
    console.log("joing booking room by user as ", bookingId);

    // Listen for driver's location updates

    socketRef.current.on("driverLocationUpdate", (driverLocation) => {
      console.log("Received driver location update:", driverLocation);
      setDriverLocation({ lat: driverLocation.lat, lng: driverLocation.lng }); // Ensure `location` object structure is correct
    });

    // Cleanup socket on component unmount
    return () => {
      socketRef.current.disconnect();
    };
  }, [bookingId]);

  useEffect(() => {
    if (!loading && isLoaded) {
      fetchDirections();
    }
  }, [pickupLocation, dropLocation, loading, isLoaded]);

  // LoadScript loading complete callback
  const onLoadScript = () => {
    setIsLoaded(true);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="relative flex w-full h-full">
      <div className="absolute bottom-2 left-2 rounded-lg px-6 py-4 z-50 bg-black bg-opacity-70 text-white  backdrop-blur-lg">
        <p className=" font-semibold text-base my-1">
          Pickup Location: {pickupLocation.name}
        </p>
        <p className="font-semibold text-base my-1">
          Drop Location: {dropLocation.name}
        </p>

        <p className="font-semibold text-base">Price: ₹{price}</p>
      </div>

      <LoadScript
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
        onLoad={onLoadScript} // Callback when the script is loaded
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={pickupLocation}
          zoom={10}
        >
          <Marker position={pickupLocation} label="Pickup" />
          <Marker position={dropLocation} label="Drop" />
          <Marker position={driverLocation} label="Driver" />
          {driverLocation.lat !== 0 && (
            <Marker
              position={driverLocation}
              label="T"
              icon={{
                url: truck, // Path to your car icon in the public folder
                scaledSize: new window.google.maps.Size(44, 30), // Adjust the size as needed
              }}
            />
          )}

          {/* Render directions if available */}
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default UserTracking;
