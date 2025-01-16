import React, { useState } from "react";
import RoomOperations from "../components/roomOperations";
import CreateRoomForm from "../components/createRoomForm";
import UpdateRoomForm from "../components/updateRoomForm";
import DeleteRoomForm from "../components/deleteRoomForm";
import { Sidebar } from "../components/SideBar";

const RoomPage = () => {
  const [operation, setOperation] = useState("create");
  const [roomId, setRoomId] = useState("");
  const [roomDetails, setRoomDetails] = useState(null); // To store room details fetched from the backend

  const handleSuccess = (message) => {
    console.log(message);
    setRoomId("");
    setRoomDetails(null); // Reset room details after success
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-r from-grayLight to-grayDark overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Content Area */}
      <div className="flex-1 px-4 sm:px-6 md:px-8 max-w-screen-xl mx-auto mt-4 sm:mt-6 overflow-hidden">
        <h1 className="sm:flex-1 sm:pl-64 2xl:pl-0 text-4xl font-extrabold text-center text-transparent bg-clip-text text-white mb-8 mt-8">
          Room Management
        </h1>

        <RoomOperations
          setOperation={setOperation}
          setRoomId={setRoomId}
          setRoomDetails={setRoomDetails}
        />

        {/* Conditionally render Create, Update, and Delete forms based on the operation */}
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
      </div>
    </div>
  );
};

export default RoomPage;
