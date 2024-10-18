import React, { useState, useEffect } from "react";
import { bookDriver } from "../../Api";
import BookingApprovalModal from "./BookingApprovalModel";

const DriversList = ({ drivers, distance, pickup, drop }) => {
  const [availableDrivers, setAvailableDrivers] = useState(drivers);
  const [showModal, setShowModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  const calculatePrice = (base, perKm) => {
    return base + perKm * distance;
  };

  const handleBook = async (driver) => {
    const price = distance
      ? calculatePrice(driver.basePrice, driver.pricePerKm)
      : driver.basePrice;
    const bookingData = {
      driverId: driver._id,
      userId: localStorage.getItem("driverId"),
      pickupLocation: pickup,
      dropLocation: drop,
      distance,
      price,
    };

    try {
      const response = await bookDriver(bookingData);
      if (response.status === 201) {
        // Show modal for driver approval
        setSelectedDriver(driver);
        setShowModal(true);
        // Remove the booked driver from the available drivers list
        // setAvailableDrivers((prevDrivers) =>
        //   prevDrivers.filter((d) => d._id !== driver._id)
        // );
      } else {
        alert("Booking failed. Please try again.");
      }
    } catch (error) {
      console.error("Booking error: ", error);
      alert("Error occurred while booking. Please try again.");
    }
  };

  const handleCloseModel = () => {
    setShowModal(false);
    setSelectedDriver(null);
  };
  return (
    <div className="flex flex-col gap-5 ">
      {availableDrivers.map((driver, index) => (
        <div key={index} className="bg-blue-300 rounded-lg px-4  p-2 ">
          <div className="flex justify-between p-2  text-black mb-2">
            <div className=" flex flex-col align-baseline">
              <h1 className=" text-lg font-bold">{driver.name}</h1>
              <p className=" text-base font-semibold text-gray-700">
                {driver.vehicleType}
              </p>
            </div>

            <div className="flex flex-col ">
              <h2 className="font-bold text-lg text-gray-800">
                Price: ₹ {calculatePrice(driver.basePrice, driver.pricePerKm)}
              </h2>
              {/* <h3 className="font-semibold text-sm text-gray-700">
                Distance: {distance} km
              </h3> */}
            </div>
          </div>
          <button
            onClick={(e) => handleBook(driver)}
            className=" bg-orange-500 float-right rounded-lg px-10 py-2 text-base font-semibold"
          >
            Book
          </button>
        </div>
      ))}

      {/* Modal for booking approval */}
      {showModal && (
        <BookingApprovalModal
          driver={selectedDriver}
          onClose={handleCloseModel}
        />
      )}
    </div>
  );
};

export default DriversList;
