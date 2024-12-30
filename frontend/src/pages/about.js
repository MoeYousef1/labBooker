import React from "react";
import LabImage from "../assets/labImage.jpg";

const AboutPage = () => {
  return (
    <section className="py-24 relative">
      <div className="w-full max-w-7xl px-4 md:px-5 lg:px-5 mx-auto">
        <div className="w-full justify-start items-center gap-8 grid lg:grid-cols-2 grid-cols-1">
          {/* Text Section */}
          <div className="w-full flex-col justify-start lg:items-start items-center gap-10 inline-flex">
            <div className="w-full flex-col justify-start lg:items-start items-center gap-4 flex">
              <h2 className="text-gray-900 text-4xl font-bold font-manrope leading-normal lg:text-start text-center">
                Simplifying Lab Room Management for Engineering Students
              </h2>
              <p className="text-gray-500 text-base font-normal leading-relaxed lg:text-start text-center">
                Our platform is designed to make it easy for Software
                Engineering students to book lab rooms for study sessions and
                collaborations. By streamlining the booking process, we ensure
                fair access to resources, efficient lab management, and an
                environment conducive to learning and innovation.
              </p>
              <p className="text-gray-500 text-base font-normal leading-relaxed lg:text-start text-center">
                Whether you need to book a lab, cancel a reservation, or explore
                other lab-related services, our web app has got you covered.
                Empowering students and faculty alike, this tool fosters
                collaboration and simplifies resource management within the
                college.
              </p>
            </div>

            <div className="flex flex-row space-x-4">
              {/* Start Booking Now Button */}
              <button
                onClick={() => (window.location.href = "/labrooms")}
                className="sm:w-fit w-full px-3.5 py-2 bg-gradient-primaryToRight hover:bg-gradient-primaryToLeft transition-all duration-700 ease-in-out rounded-lg shadow-[0px_1px_2px_0px_rgba(16,_24,_40,_0.05)] justify-center items-center flex"
              >
                <span className="px-1.5 text-white text-sm font-medium leading-6">
                  Start Booking Now
                </span>
              </button>

              {/* Back to Home Button */}
              <button
                onClick={() => (window.location.href = "/homepage")}
                className="sm:w-fit w-full px-3.5 py-2 bg-gradient-primaryToRight hover:bg-gradient-primaryToLeft transition-all duration-700 ease-in-out rounded-lg shadow-[0px_1px_2px_0px_rgba(16,_24,_40,_0.05)] justify-center items-center flex"
              >
                <span className="px-1.5 text-white text-sm font-medium leading-6">
                  Back to Home
                </span>
              </button>
            </div>
          </div>

          {/* Image Section */}
          <img
            className="lg:mx-0 mx-auto h-full rounded-3xl object-cover"
            src={LabImage}
            alt="Lab Booking App"
          />
        </div>
      </div>
    </section>
  );
};

export default AboutPage;
