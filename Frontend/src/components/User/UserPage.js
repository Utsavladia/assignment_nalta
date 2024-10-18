import React, { useState, useEffect } from "react";
import MapLocation from "../MapLocation";
import { LoadScript } from "@react-google-maps/api";
import { FaMapMarkerAlt } from "react-icons/fa";
import { getDriversNearby } from "../../Api";
import DriversList from "./DriversList";
import VehicleOptions from "./vehicleOptions.js";
import axios from "axios";

const VehicleBooking = () => {
  const [queryPickup, setQueryPickup] = useState("");
  const [queryDrop, setQueryDrop] = useState("");

  const [locationPickup, setLocationPickup] = useState({
    lat: 28.7041,
    lng: 77.1025,
  });
  const [locationDrop, setLocationDrop] = useState({
    lat: 28.7041,
    lng: 77.1025,
  });

  const [suggestionsPickup, setSuggestionsPickup] = useState([]);
  const [suggestionsDrop, setSuggestionsDrop] = useState([]);

  const [showSuggestionPickup, setShowSuggestionPickup] = useState(false);
  const [showSuggestionDrop, setShowSuggestionDrop] = useState(false);

  const [showMapPickup, setShowMapPickup] = useState(false);
  const [showMapDrop, setShowMapDrop] = useState(false);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);

  const [drivers, setDrivers] = useState([]);
  const googleApi = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  console.log("google api key is ", googleApi);

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // The search function for pickup and drop
  const searchCity = async (searchQuery, isPickup) => {
    try {
      const response = await fetch(
        `http://api.geonames.org/searchJSON?q=${searchQuery}&maxRows=5&username=utsavladia`
      );
      const data = await response.json();

      if (data.geonames.length > 0) {
        isPickup
          ? setSuggestionsPickup(data.geonames)
          : setSuggestionsDrop(data.geonames);
      } else {
        isPickup ? setSuggestionsPickup([]) : setSuggestionsDrop([]);
      }
    } catch (err) {
      console.error("Error fetching city data:", err);
    }
  };

  const debouncedSearchCityPickup = debounce(
    (query) => searchCity(query, true),
    300
  );
  const debouncedSearchCityDrop = debounce(
    (query) => searchCity(query, false),
    300
  );

  useEffect(() => {
    if (queryPickup) {
      setShowSuggestionPickup(true);
      debouncedSearchCityPickup(queryPickup);
    } else {
      setSuggestionsPickup([]);
    }
  }, [queryPickup]);

  useEffect(() => {
    if (queryDrop) {
      setShowSuggestionDrop(true);
      debouncedSearchCityDrop(queryDrop);
    } else {
      setSuggestionsDrop([]);
    }
  }, [queryDrop]);

  const handleSuggestionClickPickup = (suggestion) => {
    setShowSuggestionPickup(false);
    const { lat, lng } = suggestion;
    setLocationPickup({ lat: parseFloat(lat), lng: parseFloat(lng) });
    setQueryPickup(suggestion.name);
    setSuggestionsPickup([]);
    setShowMapPickup(true);
  };

  const handleSuggestionClickDrop = (suggestion) => {
    setShowSuggestionDrop(false);
    const { lat, lng } = suggestion;
    setLocationDrop({ lat: parseFloat(lat), lng: parseFloat(lng) });
    setQueryDrop(suggestion.name);
    setSuggestionsDrop([]);
    setShowMapDrop(true);
  };

  const onMapClickPickup = async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setLocationPickup({ lat, lng });

    // Fetch the location name using the Geocoding API
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyBciyed0kxMQ8oooPOQr_dizLc3-RPP10g`
      );
      const data = await response.json();

      if (data.results.length > 0) {
        const locationName = data.results[0].formatted_address;
        setQueryPickup(locationName);
      }
    } catch (err) {
      console.error("Error fetching location name:", err);
    }
  };

  const onMapClickDrop = async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setLocationDrop({ lat, lng });

    // Fetch the location name using the Geocoding API
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyBciyed0kxMQ8oooPOQr_dizLc3-RPP10g`
      );
      const data = await response.json();

      if (data.results.length > 0) {
        const locationName = data.results[0].formatted_address;
        setQueryDrop(locationName);
      }
    } catch (err) {
      console.error("Error fetching location name:", err);
    }
  };

  const handleVehicleSearch = async () => {
    if (!locationPickup || !locationPickup.lat || !locationPickup.lng) {
      console.error("Pickup location is not set properly.");
      return;
    }

    try {
      // Assuming you have an API that fetches drivers near the pickup location
      const data = await getDriversNearby(locationPickup);
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

  const getDistance = async () => {
    try {
      const pickup = `${locationPickup.lat},${locationPickup.lng}`;
      const drop = `${locationDrop.lat},${locationDrop.lng}`;

      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${pickup}&destinations=${drop}&key=YOUR_GOOGLE_MAPS_API_KEY`;

      const response = await axios.get(url);

      if (response.data.rows[0].elements[0].status === "OK") {
        const distance = response.data.rows[0].elements[0].distance.text;
        const duration = response.data.rows[0].elements[0].duration.text;
        return { distance, duration };
      } else {
        console.error("Error: Unable to calculate distance.");
        return { distance: 0, duration: 0 }; // Ensure a fallback return
      }
    } catch (error) {
      console.error("Error during Axios request:", error);
      return { distance: 0, duration: 0 }; // Return empty values on error
    }
  };

  useEffect(() => {
    const fetchDistance = async () => {
      try {
        const { distance = 0, duration = 0 } = await getDistance(); // Destructure with default values
        setDistance(distance);
        setDuration(duration);
      } catch (error) {
        console.error("Error in fetchDistance:", error);
      }
    };

    fetchDistance(); // Call the async function within useEffect
  }, [locationDrop, locationPickup]);

  return (
    <div className="py-4 px-20 w-full h-screen overflow-auto flex flex-col items-center justify-start relative">
      <h2 className="font-bold text-3xl mb-2">Book a Vehicle</h2>

      {/* Pickup Location */}
      <div className="w-1/2 gap-2 flex flex-col relative">
        <h1 className="text-lg font-bold">Pickup Location</h1>
        <div className="w-full relative">
          <input
            className="w-full"
            type="text"
            placeholder="Search for a city"
            value={queryPickup}
            onChange={(e) => setQueryPickup(e.target.value)}
          />
          <span
            className="absolute top-2 right-1 text-2xl cursor-pointer"
            onClick={() => setShowMapPickup(true)}
          >
            <FaMapMarkerAlt />
          </span>
          {suggestionsPickup.length > 0 && showSuggestionPickup && (
            <ul className="w-full p-4 border-2 mt-1 border-black rounded-md  bg-white Z-50">
              {suggestionsPickup.map((suggestion) => (
                <li
                  className="p-1 mb-1 cursor-pointer text-md"
                  key={suggestion.geonameId}
                  onClick={() => handleSuggestionClickPickup(suggestion)}
                >
                  {suggestion.name}, {suggestion.country}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Drop Location */}
      <div className="w-1/2 gap-4 flex flex-col mt-6 relative">
        <h1 className="text-lg font-bold">Drop Location</h1>
        <div className="w-full relative">
          <input
            className="w-full"
            type="text"
            placeholder="Search for a city"
            value={queryDrop}
            onChange={(e) => setQueryDrop(e.target.value)}
          />
          <span
            className="absolute top-2 right-1 text-2xl cursor-pointer"
            onClick={() => setShowMapDrop(true)}
          >
            <FaMapMarkerAlt />
          </span>
          {suggestionsDrop.length > 0 && showSuggestionDrop && (
            <ul className="w-full p-4 border-2 mt-1 border-black rounded-md  bg-white z-50 ">
              {suggestionsDrop.map((suggestion) => (
                <li
                  className="p-1 mb-1 cursor-pointer text-md"
                  key={suggestion.geonameId}
                  onClick={() => handleSuggestionClickDrop(suggestion)}
                >
                  {suggestion.name}, {suggestion.country}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="w-1/2 mt-12">
        <button className="button " onClick={handleVehicleSearch}>
          Find Vehicles
        </button>
      </div>

      <div>
        <LoadScript
          googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
        >
          {showMapPickup && (
            <MapLocation
              query={queryPickup}
              setQuery={setQueryPickup}
              location={locationPickup}
              onMapClick={onMapClickPickup}
              setShowMap={setShowMapPickup}
            />
          )}
          {showMapDrop && (
            <MapLocation
              query={queryDrop}
              setQuery={setQueryDrop}
              location={locationDrop}
              onMapClick={onMapClickDrop}
              setShowMap={setShowMapDrop}
            />
          )}
        </LoadScript>
      </div>
      {drivers.length > 0 ? (
        <div className=" flex gap-5  my-4 w-1/2">
          <VehicleOptions />
        </div>
      ) : (
        <h1 className=" text-center font-semibold text-lg mt-4 text-orange-500">
          No available Vehicles at this moment
        </h1>
      )}
      {/* list of drivers */}
      {drivers.length > 0 && (
        <div className=" w-1/2 mt-4">
          <h1 className=" text-xl font-bold my-3 text-center">
            Available vehicles
          </h1>
          <DriversList
            drivers={drivers}
            distance={distance}
            pickup={locationPickup}
            drop={locationDrop}
          />
        </div>
      )}
    </div>
  );
};

export default VehicleBooking;
