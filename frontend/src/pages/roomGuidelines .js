import React from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { IoClose } from "react-icons/io5";
import {
  MdReport,
  MdNoFood,
  MdNoiseAware,
  MdOutlinePhonelinkRing,
  MdShare,
  MdEmergencyShare,
  MdContactPhone,
  MdOutlineSmokeFree,
} from "react-icons/md";
import { SiCcleaner } from "react-icons/si";
import { GiHammerBreak } from "react-icons/gi";
import { RiShutDownLine, RiTimeZoneFill } from "react-icons/ri";
import { VscWorkspaceTrusted } from "react-icons/vsc";
import { TbProtocol } from "react-icons/tb";
import { CiBookmarkCheck } from "react-icons/ci";
import { HiIdentification } from "react-icons/hi";

const RoomGuidelines = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0); // Scrolls to the top of the page when the component loads
  }, []);

  const handleClose = () => {
    navigate(-1); // Navigate back to the previous page
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-grayLight to-grayDark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="relative max-w-screen-lg w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-grayMid hover:text-grayLight transition duration-150"
        >
          <IoClose size={28} />
        </button>

        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-grayDark">
            Lab Room Rules & Guidelines
          </h1>
          <p className="mt-2 text-grayMid">
            Follow these rules to maintain a respectful and efficient
            environment for all users.
          </p>
        </div>

        {/* Guidelines Content */}
        <div className="space-y-8">
          {/* Booking and Usage */}
          <div>
            <h2 className="text-2xl font-semibold text-grayDark mb-4">
              Booking and Usage
            </h2>
            <ul className="space-y-2 text-grayMid">
              <li className="flex items-center gap-2">
                <CiBookmarkCheck size={20} className="text-black font-bold" />
                Rooms must be booked in advance through the designated booking
                system.
              </li>
              <li className="flex items-center gap-2">
                <HiIdentification size={20} className="text-black font-bold" />
                Provide valid identification if required at the time of booking.
              </li>
              <li className="flex items-center gap-2">
                <RiTimeZoneFill size={20} className="text-black font-bold" />
                Arrive on time and vacate the room promptly at the end of your
                booking slot.
              </li>
            </ul>
          </div>

          {/* Cleanliness and Maintenance */}
          <div>
            <h2 className="text-2xl font-semibold text-grayDark mb-4">
              Cleanliness and Maintenance
            </h2>
            <ul className="space-y-2 text-grayMid">
              <li className="flex items-center gap-2">
                <SiCcleaner size={20} className="text-black font-bold" />
                Keep the room clean and tidy. Dispose of waste in designated
                bins.
              </li>
              <li className="flex items-center gap-2">
                <MdReport size={20} className="text-black font-bold" />
                Report any damages or malfunctioning equipment immediately.
              </li>
              <li className="flex items-center gap-2">
                <MdNoFood size={20} className="text-black font-bold" />
                Meals and drinks are prohibited inside the lab rooms.
              </li>
              <li className="flex items-center gap-2">
                <MdOutlineSmokeFree
                  size={20}
                  className="text-black font-bold"
                />
                Smoking is prohibited inside the lab rooms.
              </li>
            </ul>
          </div>

          {/* Respect for Others */}
          <div>
            <h2 className="text-2xl font-semibold text-grayDark mb-4">
              Respect for Others
            </h2>
            <ul className="space-y-2 text-grayMid">
              <li className="flex items-center gap-2">
                <MdNoiseAware size={20} className="text-black font-bold" />
                Maintain a quiet environment. Keep noise levels to a minimum.
              </li>
              <li className="flex items-center gap-2">
                <MdShare size={20} className="text-black font-bold" />
                Be respectful of others’ time and space when using shared
                resources.
              </li>
              <li className="flex items-center gap-2">
                <MdOutlinePhonelinkRing
                  size={20}
                  className="text-black font-bold"
                />
                Do not disrupt others with loud conversations or phone usage.
              </li>
            </ul>
          </div>

          {/* Equipment and Facilities */}
          <div>
            <h2 className="text-2xl font-semibold text-grayDark mb-4">
              Equipment and Facilities
            </h2>
            <ul className="space-y-2 text-grayMid">
              <li className="flex items-center gap-2">
                <VscWorkspaceTrusted
                  size={20}
                  className="text-black font-bold"
                />
                Use equipment and facilities only for their intended purposes.
              </li>
              <li className="flex items-center gap-2">
                <GiHammerBreak size={20} className="text-black font-bold" />
                Handle all lab resources with care to avoid damage.
              </li>
              <li className="flex items-center gap-2">
                <RiShutDownLine size={20} className="text-black font-bold" />
                Ensure all devices and systems are shut down after use.
              </li>
            </ul>
          </div>

          {/* Emergency Procedures */}
          <div>
            <h2 className="text-2xl font-semibold text-grayDark mb-4">
              Emergency Procedures
            </h2>
            <ul className="space-y-2 text-grayMid">
              <li className="flex items-center gap-2">
                <MdEmergencyShare size={20} className="text-black font-bold" />
                Familiarize yourself with the lab’s emergency exits and
                equipment.
              </li>
              <li className="flex items-center gap-2">
                <TbProtocol size={20} className="text-black font-bold" />
                Follow all safety protocols and guidelines provided by the
                administration.
              </li>
              <li className="flex items-center gap-2">
                <MdContactPhone size={20} className="text-black font-bold" />
                In case of emergencies, contact the appropriate personnel
                immediately.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-10 text-center">
          <p className="text-grayMid text-sm">
            Failure to adhere to these rules may result in loss of access to lab
            rooms or other penalties.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoomGuidelines;
