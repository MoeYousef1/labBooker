function validatePassword(password) {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password); // At least one uppercase letter
    const hasLowercase = /[a-z]/.test(password); // At least one lowercase letter
    const hasNumber = /\d/.test(password);       // At least one number
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password); // At least one special character
  
    if (password.length < minLength) {
        return "Password must be at least 8 characters long.";
    }
    if (!hasUppercase) {
        return "Password must include at least one uppercase letter.";
    }
    if (!hasLowercase) {
        return "Password must include at least one lowercase letter.";
    }
    if (!hasNumber) {
        return "Password must include at least one number.";
    }
    if (!hasSpecialChar) {
        return "Password must include at least one special character.";
    }
  
    return "Valid";
  }
  module.exports = {
    validatePassword
  };