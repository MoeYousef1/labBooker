import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to LabBooker</h1>
      <p className="mb-4">Manage your study room bookings easily!</p>
      <Link to="/signup">
        <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
          Go to Sign Up
        </button>
      </Link>
    </div>
  );
}

export default HomePage;
