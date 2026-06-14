import React from "react";
import OrderSummary from "../components/profile-components/order_section";
import AccountSettings from "../components/profile-components/AccountSettings";

const Profile = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="mb-12">
          <AccountSettings />
        </div>
        <OrderSummary />
      </div>
    </div>
  );
};

export default Profile;
