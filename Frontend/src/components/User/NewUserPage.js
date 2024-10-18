import React, { useState, useRef, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Autocomplete,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { getDriversNearby } from "../../Api";
import DriversList from "./DriversList";

const MapWithAutoComplete = () => {
  const [pickupLocation, setPickupLocation] = useState({
    lat: null,
    lng: null,
    name: "",
  });
  const [dropLocation, setDropLocation] = useState({
    lat: null,
    lng: null,
    name: "",
  });
  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null); // State to hold directions
  const [distance, setDistance] = useState(100);
  const [drivers, setDrivers] = useState([]);

  const pickupAutocompleteRef = useRef(null);
  const dropAutocompleteRef = useRef(null);

  const handlePlaceChanged = async (autocompleteRef, setLocation) => {
    const place = autocompleteRef.current.getPlace();
    if (place.geometry) {
      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        name: place.name,
      };
      await setLocation(location);

      // Check if map is set before calling panTo
      if (map) {
        map.panTo({ lat: location.lat, lng: location.lng });
      }
    } else {
      console.error(
        "No geometry available for the selected place:",
        place.name
      );
    }
  };

  // Effect to fetch directions when either pickup or drop location changes
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

            // Extract distance from the route's legs
            const route = result.routes[0]; // First route in the result
            if (route.legs && route.legs.length > 0) {
              const distance = route.legs[0].distance.text; // Distance in a readable format
              const duration = route.legs[0].duration.text; // Duration in a readable format
              console.log(`Distance: ${distance}, Duration: ${duration}`);

              // You can set the distance and duration to state if needed
              setDistance(distance); // Example state for distance
            }
          } else {
            console.error("Error fetching directions:", result);
          }
        }
      );
    }
  };

  useEffect(() => {
    fetchDirections();
  }, [pickupLocation, dropLocation]);

  // vehicle search
  const handleVehicleSearch = async () => {
    if (!pickupLocation || !pickupLocation.lat || !pickupLocation.lng) {
      console.error("Pickup location is not set properly.");
      return;
    }

    try {
      // Assuming you have an API that fetches drivers near the pickup location
      const data = await getDriversNearby(pickupLocation);
      console.log("found Nearby drivers as ", data);

      if (data.data.drivers && data.data.drivers.length > 0) {
        console.log("Nearby drivers:", data.data.drivers);
        // Display the list of drivers (you can update state to show the drivers)
        setDrivers(data.data.drivers);
      } else {
        console.log("No nearby drivers found.");
      }
    } catch (error) {
      console.error("Error fetching nearby drivers:", error);
    }
  };

  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
      libraries={["places", "geometry"]}
    >
      <div className="w-full h-full flex items-center justify-between ">
        <div className=" h-full max-w-1/2 overflow-hidden flex items-center justify-center flex-col">
          <GoogleMap
            center={
              pickupLocation.lat && pickupLocation.lng
                ? { lat: pickupLocation.lat, lng: pickupLocation.lng }
                : { lat: 20.5937, lng: 78.9629 }
            }
            zoom={5}
            mapContainerStyle={{ width: "50vw", height: "99vh" }}
            onLoad={(mapInstance) => setMap(mapInstance)}
          >
            {pickupLocation.lat && (
              <Marker
                position={{ lat: pickupLocation.lat, lng: pickupLocation.lng }}
                label="Pickup"
              />
            )}
            {dropLocation.lat && (
              <Marker
                position={{ lat: dropLocation.lat, lng: dropLocation.lng }}
                label="Drop"
              />
            )}

            {/* Render Directions */}
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
        </div>
        <div className=" flex justify-between max-h-screen overflow-y-auto w-1/2 items-center p-8 flex-col gap-8">
          <div className="flex flex-col items-start gap-4">
            <h1 className="text-black font-bold text-xl">Pickup Location</h1>

            <Autocomplete
              onLoad={(autocomplete) =>
                (pickupAutocompleteRef.current = autocomplete)
              }
              onPlaceChanged={() =>
                handlePlaceChanged(pickupAutocompleteRef, setPickupLocation)
              }
            >
              <input
                type="text"
                placeholder="Enter Pickup Location"
                className="w-96"
              />
            </Autocomplete>
          </div>

          <div className="flex flex-col gap-4">
            <h1 className="text-black font-bold text-xl">Drop Location</h1>
            <Autocomplete
              onLoad={(autocomplete) =>
                (dropAutocompleteRef.current = autocomplete)
              }
              onPlaceChanged={() =>
                handlePlaceChanged(dropAutocompleteRef, setDropLocation)
              }
            >
              <input
                className=" w-96"
                type="text"
                placeholder="Enter Drop Location"
              />
            </Autocomplete>
          </div>
          <div className="w-auto mt-6">
            <button
              className="py-2 bg-orange-500 text-lg font-bold rounded-lg  text-orange-950 w-96"
              onClick={handleVehicleSearch}
            >
              Find Vehicles
            </button>
          </div>
          {drivers.length > 0 && (
            <div className="mt-10 w-full p-10">
              <h1 className="text-2xl my-4 font-bold text-green-500">
                Available Drivers
              </h1>
              <DriversList
                drivers={drivers}
                distance={120}
                pickup={pickupLocation}
                drop={dropLocation}
              />
            </div>
          )}
        </div>
      </div>
    </LoadScript>
  );
};

export default MapWithAutoComplete;
