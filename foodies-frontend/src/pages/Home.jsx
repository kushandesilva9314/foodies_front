import React from "react";
import Navbar from "../components/home-components/navbar";
import Footer from "../components/home-components/footer";


const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-bg-light">
      <Navbar />

      {/* Main content */}
      <main className="flex-grow pt-20">
    
      </main>

      <Footer />
    </div>
  );
};

export default Home;