import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Rooms() {
  const [rooms, setRooms] = useState([]);


  useEffect(() => {
    axios
      .get('http://localhost:5000/api/rooms')
      .then((response) => setRooms(response.data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <div className='flex flex-col items-center justify-around'>
      <h1 className='text-xl'>Available Rooms</h1>
      <ul className='text-blue-500'>
        {rooms.map((room) => (
          <li key={room.id} >
            {room.name} - Capacity: {room.capacity}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Rooms;
