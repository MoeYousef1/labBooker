import React, { useState } from "react";
import RoomOperations from "../components/roomOperations";
import CreateRoomForm from "../components/createRoomForm";
import UpdateRoomForm from "../components/updateRoomForm";
import DeleteRoomForm from "../components/deleteRoomForm";
import { Sidebar } from "../components/SideBar";
import { motion } from "framer-motion";

const RoomPage = () => {
  const [operation, setOperation] = useState("create");
  const [roomId, setRoomId] = useState("");
  const [roomDetails, setRoomDetails] = useState(null);

  const handleSuccess = (message) => {
    console.log(message);
    setRoomId("");
    setRoomDetails(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Content Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex flex-col items-center justify-center px-6 sm:px-8 md:px-12 mt-16 sm:mt-0 sm:ml-64"
      >
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold text-gray-800 text-center mb-8 mt-4"
        >
          Room Management
        </motion.h1>

        {/* Room Operations */}
        <div className="w-full max-w-4xl">
          <RoomOperations
            setOperation={setOperation}
            setRoomId={setRoomId}
            setRoomDetails={setRoomDetails}
            operation={operation}
          />
        </div>

        {/* Forms */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl mt-6"
        >
          {operation === "create" && (
            <CreateRoomForm operation={operation} onSuccess={handleSuccess} />
          )}
          {operation === "update" && (
            <UpdateRoomForm
              operation={operation}
              roomId={roomId}
              roomDetails={roomDetails}
              setRoomId={setRoomId}
              setRoomDetails={setRoomDetails}
              onSuccess={handleSuccess}
            />
          )}
          {operation === "delete" && (
            <DeleteRoomForm operation={operation} onSuccess={handleSuccess} />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RoomPage;
