import express from "express";
import Visitor from "../models/visitors.js";

const visitorRoute = express.Router();


const calculateStats = async () => {
  const totalVisits = await Visitor.countDocuments();
  const uniqueVisitors = await Visitor.distinct("userId").then((ids) => ids.length);

  const activeUsers = 20; 
  const dailyVisitors = 10; 
  const returningVisitors = totalVisits - uniqueVisitors;
  const newVisitors = uniqueVisitors;

  return {
    totalVisits,
    newVisitors,
    returningVisitors,
    activeUsers,
    dailyVisitors,
  };
};