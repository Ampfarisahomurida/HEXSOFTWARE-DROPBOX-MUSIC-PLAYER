// ===============================
// 1. INSTALL DEPENDENCIES
// ===============================
// Run in terminal:
// npm init -y
// npm install express mongoose cors body-parser

// ===============================
// 2. SERVER SETUP
// ===============================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ===============================
// 3. CONNECT TO MONGODB
// ===============================
mongoose.connect('mongodb://127.0.0.1:27017/onemart', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

// ===============================
// 4. ORDER SCHEMA
// ===============================
const orderSchema = new mongoose.Schema({
  customer: {
    name: String,
    phone: String,
    address: String
  },
  items: Array,
  total: Number,
  date: String
});

const Order = mongoose.model('Order', orderSchema);

// ===============================
// 5. API ROUTES
// ===============================

// CREATE ORDER
app.post('/api/orders', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json({ message: 'Order saved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL ORDERS (ADMIN)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ _id: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// 6. START SERVER
// ===============================
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// ===============================
// 7. FRONTEND CONNECTION (UPDATE YOUR placeOrder FUNCTION)
// ===============================

/* Replace your placeOrder() with this:

async function placeOrder() {
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;

  if (!name || !phone || !address) {
    alert("Please fill all fields");
    return;
  }

  const order = {
    customer: { name, phone, address },
    items: cart,
    total: getTotal(),
    date: new Date().toLocaleString()
  };

  try {
    const res = await fetch("http://localhost:5000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order)
    });

    const data = await res.json();

    alert("Order saved to server! ✅");

    cart = [];
    saveCart();
    closeCheckout();
  } catch (err) {
    alert("Error connecting to server ❌");
    console.error(err);
  }
}

*/
