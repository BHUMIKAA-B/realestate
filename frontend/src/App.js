import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "next-themes";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import PropertiesList from "@/pages/PropertiesList";
import PropertyDetail from "@/pages/PropertyDetail";
import BuyerHome from "@/pages/BuyerHome";
import SavedProperties from "@/pages/SavedProperties";
import MyEnquiries from "@/pages/MyEnquiries";
import Services from "@/pages/Services";
import Construction from "@/pages/Construction";
import SellerDashboard from "@/pages/SellerDashboard";
import NewListing from "@/pages/NewListing";
import ListingEdit from "@/pages/ListingEdit";
import SellerEnquiries from "@/pages/SellerEnquiries";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/NotFound";
import ChatPage from "@/pages/ChatPage";
import ChatBot from "@/components/ChatBot";
import { RequireAuth } from "@/components/RequireAuth";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-transition">
      <Routes location={location}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/properties" element={<PropertiesList />} />
        <Route path="/properties/:id" element={<PropertyDetail />} />
        <Route path="/services" element={<Services />} />
        <Route path="/construction" element={<Construction />} />

        {/* Buyer */}
        <Route
          path="/home"
          element={
            <RequireAuth roles={["buyer", "admin"]}>
              <BuyerHome />
            </RequireAuth>
          }
        />
        <Route
          path="/saved"
          element={
            <RequireAuth roles={["buyer", "admin"]}>
              <SavedProperties />
            </RequireAuth>
          }
        />
        <Route
          path="/enquiries"
          element={
            <RequireAuth roles={["buyer", "admin"]}>
              <MyEnquiries />
            </RequireAuth>
          }
        />

        {/* Seller */}
        <Route
          path="/seller/dashboard"
          element={
            <RequireAuth roles={["seller", "admin"]}>
              <SellerDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/seller/listings/new"
          element={
            <RequireAuth roles={["seller", "admin"]}>
              <NewListing />
            </RequireAuth>
          }
        />
        <Route
          path="/seller/listings/:id/edit"
          element={
            <RequireAuth roles={["seller", "admin"]}>
              <ListingEdit />
            </RequireAuth>
          }
        />
        <Route
          path="/seller/enquiries"
          element={
            <RequireAuth roles={["seller", "admin"]}>
              <SellerEnquiries />
            </RequireAuth>
          }
        />

        {/* Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <RequireAuth roles={["admin"]}>
              <AdminDashboard />
            </RequireAuth>
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        <Route path="/chat" element={<ChatPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <div className="App">
        <BrowserRouter>
          <AnimatedRoutes />

          {/* Floating chatbot bubble — visible on all pages except /chat */}
          <ChatBot />
        </BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#171717",
              color: "#fff",
              borderRadius: 8,
              fontSize: "0.9rem",
            },
          }}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
