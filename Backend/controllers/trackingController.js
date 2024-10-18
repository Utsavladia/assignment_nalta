export const trackVehicle = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Mock vehicle location updates
    socket.on("trackVehicle", (bookingId) => {
      setInterval(() => {
        const vehicleLocation = { lat: 12.9716, lng: 77.5946 }; // Mock GPS coordinates
        socket.emit("locationUpdate", vehicleLocation);
      }, 5000);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
