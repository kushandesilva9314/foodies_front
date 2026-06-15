import React, { useState } from "react";
import OrderSummary from "../components/profile-components/order_section";
import AccountSettings from "../components/profile-components/AccountSettings";
import MobileVerification from "../components/profile-components/MobileVerification";

// ── Load current user from localStorage (set on login/refresh/profile update) ──
const getStoredUser = () => {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const Profile = () => {
  const [user, setUser] = useState(getStoredUser() || {
    id: "",
    name: "",
    email: "",
    mobile: "",
    profile_photo: null,
    role: "customer",
    is_verified: true,
    is_mobile_verified: false,
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="mb-12">
          <AccountSettings user={user} setUser={setUser} />
        </div>

        <div className="mb-12">
          <OrderSummary />
        </div>

        <div className="mb-12">
          <MobileVerification
            mobile={user.mobile}
            isVerified={user.is_mobile_verified}
            onVerified={() => {
              const updated = { ...user, is_mobile_verified: true };
              setUser(updated);
              localStorage.setItem("user", JSON.stringify(updated));
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;