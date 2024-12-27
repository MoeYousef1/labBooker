function validateRoomData(roomData) {
    const { type, capacity } = roomData;

    if ( type != 'Open' || type != 'Small Seminar' || type != 'Big Seminar') { 
        return { isValid: false, message: 'Room type is invalid' };
    }

    // Check if capacity is a number and greater than 0
    if (typeof capacity !== 'number' || capacity <= 0) {
        return { isValid: false, message: 'Capacity must be a number greater than 0' };
    }

    return { isValid: true, message: 'Validation successful' };
}

module.exports = { validateRoomData };