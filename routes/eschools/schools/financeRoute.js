import express from "express";
import Income from "../../../models/Eschools/schools/IncomeSchema.js";
import Expense from "../../../models/Eschools/schools/expenseSchema.js";
import { verifyToken } from "../../../middleware/protect";
import User from "../../../models/Eschools/user.js"
import School from "../../../models/Eschools/schools/school.schema.js"
const financeRouter = express.Router();

financeRouter.post("/add-income", verifyToken, async(req, res) => {
    try {
        const {name, reason, amount} = req.body;
        const admin = await 
        const income = new Income({
            name,
            reason,
            amount,
            adminId:req.user.id
        })
        await income.save();
        res.status(201).json({ message: "Income added successfully", income });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
})

financeRouter.post("/add-expense", verifyToken, async(req, res) => {
    try {
        const { name, reason, amount } = req.body;
        const expense = new Expense({ name, reason, amount, adminId: req.user.id });
        await expense.save();
        res.status(201).json({ message: "Expense added successfully", expense });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
})


financeRouter.get("/get-total", verifyToken, async(req, res) => {
    try {
        const incomes = await Income.find({ adminId: req.user.id });
        const expenses = await Expense.find({ adminId: req.user.id });
    
        const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
        const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const balance = totalIncome - totalExpense;
    
        res.json({ totalIncome, totalExpense, balance });
    } catch (error) {
        res.status(500).json({ message: "Error fetching totals" });
    }
})

financeRouter.get("/get-trends", verifyToken, async(req, res) => {
    try {
        const incomes = await Income.find({ adminId: req.user.id });
        const expenses = await Expense.find({ adminId: req.user.id });
    
        const formatData = (records) => {
          return records.reduce((acc, record) => {
            const month = new Date(record.date).toLocaleString("en-US", { month: "short", year: "numeric" });
            acc[month] = (acc[month] || 0) + record.amount;
            return acc;
          }, {});
        };
    
        const incomeTrends = formatData(incomes);
        const expenseTrends = formatData(expenses);
    
        res.json({ incomeTrends, expenseTrends });
      } catch (error) {
        res.status(500).json({ message: "Error fetching trends" });
      }
})

financeRouter.get("/get-filtered-data", verifyToken, async (req, res) => {
    try {
      const { month, year } = req.query;
      const startDate = new Date(`${year}-${month}-01`);
      const endDate = new Date(`${year}-${month}-31`);
  
      const incomes = await Income.find({ adminId: req.user.id, date: { $gte: startDate, $lte: endDate } });
      const expenses = await Expense.find({ adminId: req.user.id, date: { $gte: startDate, $lte: endDate } });
  
      res.json({ incomes, expenses });
    } catch (error) {
      res.status(500).json({ message: "Error fetching filtered data" });
    }
  });
  

export default financeRouter

