// middleware/roleMiddleware.js
const roleMiddleware = {
    checkRole: (...allowedRoles) => {
      return (req, res, next) => {
        try {
          if (!req.user) {
            return res.status(401).json({ message: "Unauthorized - No user found" });
          }
  
          const hasRole = allowedRoles.includes(req.user.role);
          if (!hasRole) {
            return res.status(403).json({ 
              message: "Forbidden - You don't have the required role to access this resource" 
            });
          }
  
          next();
        } catch (error) {
          console.error('Role middleware error:', error);
          return res.status(500).json({ 
            message: "Internal server error in role verification",
            error: error.message 
          });
        }
      };
    }
  };
  
  module.exports = roleMiddleware;