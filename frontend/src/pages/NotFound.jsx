import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NotFound = () => (
  <div className="min-h-screen bg-[#fafaf7] flex flex-col">
    <Navbar />
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
      <div className="font-display text-7xl font-bold text-[#0D7A6B]">404</div>
      <h1 className="mt-2 font-display text-2xl text-[#0F2340]">Page not found</h1>
      <Link to="/" className="btn-primary mt-6">
        Back to home
      </Link>
    </div>
    <Footer />
  </div>
);

export default NotFound;
