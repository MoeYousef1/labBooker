import React, { useState } from "react";
import axios from "axios";
import collegeBuilding from './assets/collegeBuilding.jpg';
import headerImage from './assets/header-bg.jpg';
import lapLogo from './assets/laptop.png';
import collegeLogoWhite from './assets/collegeLogoWhite.png'

const LogInPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setGeneralError('');
  };

  const handleCloseError = () => setGeneralError('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      console.log('Success:', response.data);
      alert('Login successful!');
    } catch (error) {
      const backendError = error.response?.data?.message || 'An unexpected error occurred.';
      setGeneralError(backendError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "peer w-full p-3 border-[1px] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300";
  const labelClasses = "absolute left-3 top-1 text-xs text-blue-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-focus:top-1 peer-focus:text-xs peer-focus:text-blue-700 font-semibold";

  return (
    <section
      className="min-h-screen"
      style={{
        backgroundImage: `url(${collegeBuilding})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="min-h-screen flex justify-center items-center">
        <div className="w-full max-w-6xl p-10 bg-black bg-opacity-30 shadow-lg rounded-lg flex flex-col lg:flex-row">

          {/* Left: Login Form */}
          <div className="w-full lg:w-6/12 p-6">
            <div className="text-center">
              <img className="mx-auto w-48" src={lapLogo} alt="logo" />
              <h4 className="mb-8 mt-1 text-4xl font-extrabold text-white">LabBooker</h4>
            </div>

            <form onSubmit={handleSubmit}>
              <p className="mb-4 text-white font-semibold">Please login to your account</p>

              {/* Email Input */}
              <div className="mb-4 relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`${inputClasses} ${errors.email ? 'border-red-500' : 'border-gray-400'}`}
                  placeholder=" "
                  required
                />
                <label htmlFor="email" className={labelClasses}>Email</label>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Password Input */}
              <div className="mb-4 relative">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`${inputClasses} ${errors.password ? 'border-red-500' : 'border-gray-400'}`}
                  placeholder=" "
                  required
                />
                <label htmlFor="password" className={labelClasses}>Password</label>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              {/* Submit Button */}
              <div className="mb-6 text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white py-2 px-4 rounded shadow-md hover:shadow-lg transition"
                >
                  {isSubmitting ? 'Logging in...' : 'Log In'}
                </button>
                {generalError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mt-1 relative" role="alert">
                    <span>{generalError}</span>
                    <button onClick={handleCloseError} className="absolute top-0 right-0 px-4 py-3">
                      <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <title>Close</title>
                        <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

<div className="flex flex-col lg:flex-row items-center justify-between">
  {/* Forgot Password */}
  <a href="#" className="text-sm text-white font-semibold hover:underline mb-2 lg:mb-0">
    Forgot password?
  </a>

  {/* Don't have an account? and Register Button */}
  <div className="flex items-center mt-2 lg:mt-0">
    <p className="text-white font-semibold mr-6">Don't have an account?</p>
    <button
      type="button"
      onClick={() => window.location.href = '/signup'}
      className="rounded border-2 border-blue-500 px-6 py-2 text-xs font-medium text-white hover:bg-blue-500 transition"
    >
      Register
    </button>
  </div>
</div>


            </form>
          </div>

          {/* Right: Description */}
          <div
            className="w-full lg:w-6/12 flex flex-col items-center justify-center text-white p-6 mt-6 lg:mt-0"
            style={{
              backgroundImage: `url(${headerImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="text-center">
              <h4 className="mb-4 text-lg font-semibold">LabBooker - Azrieli College of Engineering Jerusalem</h4>
              <p className="text-sm mb-4 ">LabBooker is your go-to platform for reserving study rooms. Sign up to get started and book your next study space today!</p>
            </div>
            <div className="mt-2">
              <img src={collegeLogoWhite} alt="collegeLogoWhite" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default LogInPage;
