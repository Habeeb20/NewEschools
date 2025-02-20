
import schoolUsers from "../models/Eschools/schools/schoolUsers.js";
import User from "../models/Eschools/user.js"


import jwt from "jsonwebtoken"

export const isAuthenticate = async (req, res, next) => {
    try {
      const token = req.cookies.access_token; 
  
      if (!token) {
      
        return next(createError(401, "Unauthorized: No token provided"));
      }
  
      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
      
          return next(createError(403, "Forbidden: Invalid token"));
        }
  
        req.user = user; 
        next(); 
      });
    } catch (error) {
   
      next(error);
    }
  };
  
  export const verifyToken = (req, res, next) => {
    let token = req.header('authorization');
  
    token = token.split(' ')[1]
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
   
      req.user = decoded;
      next();
    } catch (e) {
      console.log(e)
      res.status(400).json({ msg: 'Token is not valid' });
    }
  };
  



  
  export const Protect = async (req, res, next) => {
    let token;
  
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        token = req.headers.authorization.split(" ")[1]; // Extract token from header
  
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
        // Attach user info to request
        req.user = await User.findById(decoded.id).select("-password");
        if (!req.user) {
          res.status(401);
          throw new Error("User not found.");
        }
  
        next(); // Proceed to the next middleware/controller
      } catch (error) {
        console.error(error);
        res.status(401);
        throw new Error("Not authorized, token failed.");
      }
    }
  
    if (!token) {
      res.status(401);
      throw new Error("Not authorized, no token provided.");
    }
  };
  

  export const roleBasedAccess = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Access denied" });
        }
        next();
    };
};

export const Protect2 = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1]; // Extract token from header

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user info to request
      req.user = await schoolUsers.findById(decoded.id).select("-password");
      if (!req.user) {
        res.status(401);
        throw new Error("User not found.");
      }

      next(); // Proceed to the next middleware/controller
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error("Not authorized, token failed.");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token provided.");
  }
};
  