require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'dist')));

const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((e) => console.log("MongoDB connection error", e));

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  position: { type: String, required: true },
  salary: { type: Number, required: true }
});

const Employee = mongoose.model('Employee', employeeSchema);

app.get('/api/employeelist', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get employee list' });
  }
});

app.get('/api/employeelist/:id', async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Employee not found' });
    res.json(emp);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching employee' });
  }
});

app.post('/api/employeelist', async (req, res) => {
  try {
    const { name, location, position, salary } = req.body;
    const employee = new Employee({ name, location, position, salary });
    await employee.save();
    res.status(201).json(employee);
  } catch (err) {
    res.status(400).json({ error: 'Error adding employee', details: err });
  }
});

app.put('/api/employeelist/:id', async (req, res) => {
  try {
    const { name, location, position, salary } = req.body;
    const emp = await Employee.findByIdAndUpdate(
      req.params.id,
      { name, location, position, salary },
      { new: true, runValidators: true }
    );
    if (!emp) return res.status(404).json({ error: 'Employee not found' });
    res.json(emp);
  } catch (err) {
    res.status(400).json({ error: 'Error updating employee', details: err });
  }
});

app.delete('/api/employeelist/:id', async (req, res) => {
  try {
    const emp = await Employee.findByIdAndDelete(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Employee not found' });
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Error deleting employee', details: err });
  }
});

app.get('/', (req, res) => {
  res.send(`
    <h1>Employee Backend API is Running!</h1>
    <p>Available endpoints:</p>
    <ul>
      <li><a href="/api/employeelist">GET /api/employeelist</a> - Get all employees</li>
      <li>POST /api/employeelist - Add new employee</li>
      <li>GET /api/employeelist/:id - Get single employee</li>
      <li>PUT /api/employeelist/:id - Update employee</li>
      <li>DELETE /api/employeelist/:id - Delete employee</li>
    </ul>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server started on port ${PORT}`);
});
