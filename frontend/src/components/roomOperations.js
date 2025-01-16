import React from "react";

const RoomOperations = ({ setOperation, setRoomId, setRoomDetails }) => {
  const handleOperationChange = (operation) => {
    setOperation(operation);
    if (operation !== "create") {
      setRoomId("");
      setRoomDetails(null);
    }
  };

  return (
    <div className="sm:flex-1 sm:pl-64 2xl:pl-0 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <button
        onClick={() => handleOperationChange("create")}
        className="px-6 py-3 w-full sm:w-auto bg-gradient-primaryToRight hover:bg-gradient-primaryToLeft text-white rounded-lg"
      >
        Create Room
      </button>
      <button
        onClick={() => handleOperationChange("update")}
        className="px-6 py-3 w-full sm:w-auto bg-gradient-primaryToRight hover:bg-gradient-primaryToLeft text-white rounded-lg"
      >
        Update Room
      </button>
      <button
        onClick={() => handleOperationChange("delete")}
        className="px-6 py-3 w-full sm:w-auto bg-gradient-primaryToRight hover:bg-gradient-primaryToLeft text-white rounded-lg"
      >
        Delete Room
      </button>
    </div>
  );
};

export default RoomOperations;
