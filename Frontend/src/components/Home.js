import React from "react";
import { Link } from "react-router-dom";
import truck from "../icons/truck.gif";

const Home = () => {
  return (
    <div className=" w-screen flex justify-center h-screen gap-16 items-center relative">
      {/* <h1 className="absolute top-6 ml-auto mr-auto text-4xl font-bold text-orange-700">Transport your Goods</h1> */}
      <div className=" flex h-full w-1/2 items-center justify-end">
        <div className="pb-10 relative">
          <lord-icon
            src="https://cdn.lordicon.com/mebvgwrs.json"
            trigger="hover"
            style={{ width: "250px", height: "250px" }}
          ></lord-icon>
          <div className="absolute bottom-6 w-full right-0">
            <Link to="/auth/user">
              <button className="px-4 py-2 text-xl button">User Login</button>
            </Link>
          </div>
        </div>
      </div>

      <div className=" flex h-full w-1/2 items-center justify-start">
        <div className="pb-10 relative">
          <lord-icon
            src="https://cdn.lordicon.com/amfpjnmb.json"
            trigger="hover"
            style={{ width: "250px", height: "250px" }}
          ></lord-icon>

          <div className="absolute bottom-6 w-full right-0">
            <Link to="/auth/driver">
              <button className="px-4 py-2 text-xl button">Driver Login</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
