// Validate verification code
function validateVerificationCode(email, code) {
  const storedData = verificationCodes.get(email);

  if (!storedData) {
    return { status: 400, message: "Invalid or expired verification code" };
  }

  const { verificationCode, expirationTime } = storedData;

  if (Date.now() > expirationTime) {
    verificationCodes.delete(email);
    return { status: 400, message: "Verification code expired" };
  }

  if (parseInt(code, 10) !== verificationCode) {
    return { status: 400, message: "Incorrect verification code" };
  }

  // Code is valid; remove it from storage
  verificationCodes.delete(email);
  return { status: 200, message: "Verification successful" };
}

module.exports = {
  validateVerificationCode,
};
