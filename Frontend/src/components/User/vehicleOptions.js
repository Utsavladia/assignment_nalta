import React from "react";

const VehicleOptions = () => {
  const vehicals = [
    {
      type: "Mini Truck",
      weightRange: "50-500 kg",
      features: "city transport",
    },
    {
      type: "Medium Truck",
      weightRange: "500-2,000 kg",
      features: "commercial goods",
    },
    {
      type: "Heavy Truck",
      weightRange: "2,000-5,000 kg",
      features: "industrial goods",
    },
    {
      type: "Container ",
      weightRange: "5,000+ kg",
      features: "international",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 w-full">
      {vehicals.map((vehicle, index) => (
        <div
          key={index}
          className="border border-gray-300 cursor-pointer p-4 rounded-lg shadow-md text-center bg-white hover:shadow-lg transition-shadow flex flex-col align-middle justify-between"
        >
          <h3 className="text-base font-bold mb-2">{vehicle.type}</h3>
          <p className="text-gray-600 text-sm mt-4 "> {vehicle.weightRange}</p>
          <p className="text-gray-600 text-xs mt-4 font-semibold">
            {" "}
            {vehicle.features}
          </p>
        </div>
      ))}
    </div>
  );
};

export default VehicleOptions;
