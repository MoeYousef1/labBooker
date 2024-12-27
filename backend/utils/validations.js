function validateRoomData(roomData) {
  const { name, type, capacity } = roomData;
  const validTypes = ['Open', 'Open Study Room', 'Collaborative Workspace', 'Seminar Room'];

  if (!name || typeof name !== 'string') {
    return { isValid: false, message: 'Invalid room name' };
  }

  if (!validTypes.includes(type)) {
    return { isValid: false, message: 'Room type is invalid' };
  }

  if (!capacity || typeof capacity !== 'number') {
    return { isValid: false, message: 'Invalid room capacity' };
  }

  return { isValid: true, message: 'Room data is valid' };
}

module.exports = {
  validateRoomData
};