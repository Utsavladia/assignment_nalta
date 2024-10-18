import React, { useState } from "react";
import { signup, login } from "../Api";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection

const Auth = ({ role }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    basePrice: "",
    pricePerKm: "",
    vehicleType: "",
  });

  const navigate = useNavigate(); // Initialize useNavigate

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const response = await login({
          email: formData.email,
          password: formData.password,
          role: role,
        });
        if (response.data.token) {
          console.log("logged in ", response.data);
          localStorage.setItem("driverId", response.data.userId);
          navigate(`/${role}`);
        } else {
          alert("Login failed: " + response.data.message);
        }
      } else {
        console.log("form data for signup is ", formData);
        const response = await signup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: role,
          basePrice: formData.basePrice,
          pricePerKm: formData.pricePerKm,
          vehicleType: formData.vehicleType,
        });
        alert("Signup successful!");

        // Use navigate to redirect to login page after signup success
        navigate(`/${role}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error during authentication: " + error.message);
    }
  };

  return (
    <div className="w-full h-screen items-center justify-center flex flex-col">
      <div className="flex flex-col justify-center align-top gap-5">
        <h2 className="text-xl font-bold">
          {isLogin
            ? role === "driver"
              ? "Login as Driver"
              : "Login as User"
            : role === "driver"
            ? "Sign Up as Driver"
            : "Sign up as User"}
        </h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {!isLogin && role === "driver" && (
            <div>
              <label htmlFor="vehicleType" className="block mb-1 text-sm">
                Select Vehicle Type
              </label>
              <select
                id="vehicleType"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                required
                className="border-2  p-2 rounded-md border-blue-600 w-full"
              >
                <option value="">Select a vehicle type</option>
                <option value="Mini Truck">Mini Truck</option>
                <option value="Medium Truck">Medium Truck</option>
                <option value="Heavy Truck">Heavy Truck</option>
                <option value="Container Truck">Container Truck</option>
              </select>
              <div className="flex gap-6 ">
                <div>
                  <label
                    htmlFor="basePrice"
                    className="block mb-1 mt-4 text-sm"
                  >
                    Base Price
                  </label>
                  <input
                    type="number"
                    name="basePrice"
                    placeholder="Base Price"
                    value={formData.basePrice}
                    onChange={handleChange}
                    required
                    className=""
                  />
                </div>
                <div>
                  <label
                    htmlFor="pricePerKm"
                    className="block mb-1 mt-4 text-sm"
                  >
                    Price Per KM
                  </label>
                  <input
                    type="number"
                    name="pricePerKm"
                    placeholder="Price Per KM"
                    value={formData.pricePerKm}
                    onChange={handleChange}
                    required
                    className=""
                  />
                </div>
              </div>
            </div>
          )}
          <button className="button" type="submit">
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>
        <p
          className="cursor-pointer"
          onClick={() => setIsLogin((prev) => !prev)}
        >
          Switch to{" "}
          <span className="text-blue-600 font-bold">
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Auth;
