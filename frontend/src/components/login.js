import React, { useState } from "react";
import axios from "axios";
import collegeBuilding from './assets/collegeBuilding.jpg';
import headerImage from './assets/header-bg.jpg';
import lapLogo from './assets/laptop.png';

const LogInPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' }); // Clear error on input change
    setGeneralError(''); // Clear general error
  };

  // Close the general error message
  const handleCloseError = () => {
    setGeneralError('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      console.log('Success:', response.data); // You can handle successful login here
      alert('Login successful!');
    } catch (error) {
      // Backend errors handling
      if (error.response && error.response.data) {
        const backendErrorMessage = error.response.data.message || 'Something went wrong.';
        setGeneralError(backendErrorMessage);
      } else {
        setGeneralError('An unexpected error occurred.');
      }
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className="min-h-screen bg-blue-50 dark:bg-blue-800"
      style={{
        backgroundImage: `url(${collegeBuilding})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="min-h-screen flex justify-center items-center">
        <div className="w-full max-w-6xl p-4 sm:p-10 bg-black bg-opacity-30 shadow-lg rounded-lg flex flex-col lg:flex-row">
          {/* Left side - Login Form */}
          <div className="w-full lg:w-6/12 p-4 sm:p-6">
            <div className="text-center">
              <img className="mx-auto w-48" src={lapLogo} alt="logo" />
              <h4 className="mb-8 mt-1 pb-1 text-4xl font-extrabold text-white">
                LabBooker
              </h4>
            </div>

            <form onSubmit={handleSubmit}>
              <p className="mb-4 text-white font-semibold">Please login to your account</p>

              {/* Email input */}
              <div className="mb-4 relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`peer w-full p-3 border-[1px] ${errors.email ? 'border-red-500' : 'border-gray-400'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300`}
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="email"
                  className="absolute left-3 top-3 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs peer-focus:text-blue-700 font-semibold"
                >
                  Email
                </label>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Password input */}
              <div className="mb-4 relative">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`peer w-full p-3 border-[1px] ${errors.password ? 'border-red-500' : 'border-gray-400'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300`}
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="password"
                  className="absolute left-3 top-3 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs peer-focus:text-blue-700 font-semibold"
                >
                  Password
                </label>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              {/* Submit button */}
              <div className="mb-12 pb-1 pt-1 text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[rgba(1,84,206,1)] via-[rgba(0,130,180,1)] to-[rgba(1,156,140,1)] text-white py-2 px-4 rounded shadow-md hover:shadow-lg focus:outline-none border-[1px] border-blue-500"
                >
                  {isSubmitting ? 'Logging in...' : 'LogIn'}
                </button>

                {generalError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative mt-1" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{generalError}</span>
                    <button
                      onClick={handleCloseError}
                      className="absolute top-0 bottom-0 right-0 px-4 py-3"
                    >
                      <svg
                        className="fill-current h-6 w-6 text-red-500"
                        role="button"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <title>Close</title>
                        <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Forgot password link */}
                <a href="#!" className="block mt-2 text-sm text-white font-semibold hover:underline">
                  Forgot password?
                </a>
              </div>

              {/* Register button */}
              <div className="flex items-center justify-between pb-6">
                <p className="mb-0 mr-2 text-white font-semibold">Don't have an account?</p>
                <button
                  type="button"
                  className="inline-block rounded border-2 border-blue-500 px-6 py-2 text-xs font-medium text-white hover:bg-gradient-to-r from-[rgba(1,84,206,1)] via-[rgba(0,130,180,1)] to-[rgba(1,156,140,1)] hover:text-white transition duration-150 ease-in-out"
                >
                  Register
                </button>
              </div>
            </form>
          </div>

          {/* Right side - Text description */}
          <div
            className="w-full lg:w-6/12 rounded-b-lg lg:rounded-r-lg lg:rounded-bl-none flex items-center justify-center text-white p-6 mt-6 lg:mt-0"
            style={{
              backgroundImage: `url(${headerImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="text-center">
              <h4 className="mb-4 text-lg md:text-xl font-semibold text-white">
                LabBooker - Azrieli College of Engineering Jerusalem
              </h4>
              <p className="text-sm md:text-base text-white">
                LabBooker is your go-to platform for reserving study rooms at your college's lab. With an easy-to-use interface and real-time availability, managing your study sessions has never been simpler. Log in to get started and book your next study space today!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LogInPage;
