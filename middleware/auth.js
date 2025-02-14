import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import School from "../models/school.js";
import Exam from "../models/exam.js";
import Training from "../models/training.js";
import Teacher from "../models/teacher.js";
import Bookshop from "../models/bookshop.js"
import Tutorial from "../models/tutorial.js";
import Store from "../models/store.js";


export const protect = asyncHandler(async (req, res, next) => {
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
      req.user = await School.findById(decoded.id).select("-password");
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
});


export const protect2 = asyncHandler(async (req, res, next) => {
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
      req.user = await Exam.findById(decoded.id).select("-password");
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
});


export const protect3 = asyncHandler(async (req, res, next) => {
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
      req.user = await Teacher.findById(decoded.id).select("-password");
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
});


export const protect4 = asyncHandler(async (req, res, next) => {
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
      req.user = await Training.findById(decoded.id).select("-password");
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
});



export const protect5 = asyncHandler(async (req, res, next) => {
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
      req.user = await Bookshop.findById(decoded.id).select("-password");
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
});


export const protect6 = asyncHandler(async (req, res, next) => {
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
      req.user = await Tutorial.findById(decoded.id).select("-password");
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
});

export const protect7 = asyncHandler(async (req, res, next) => {
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
      req.user = await Store.findById(decoded.id).select("-password");
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
});



export const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).send('Access Denied');
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch {
    res.status(400).send('Invalid Token');
  }
};