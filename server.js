const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// conexão com mongodb
mongoose.connect("mongodb://localhost:27017/pedidos", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// schema dos itens
const ItemSchema = new mongoose.Schema({
  productId: Number,
  quantity: Number,
  price: Number
});

// schema do pedido
const OrderSchema = new mongoose.Schema({
  orderId: String,
  value: Number,
  creationDate: Date,
  items: [ItemSchema]
});

const Order = mongoose.model("Order", OrderSchema);

// criar pedido
app.post("/order", async (req, res) => {

  const data = req.body;

  const order = new Order({
    orderId: data.numeroPedido,
    value: data.valorTotal,
    creationDate: data.dataCriacao,
    items: data.items.map(item => ({
      productId: Number(item.idItem),
      quantity: item.quantidadeItem,
      price: item.valorItem
    }))
  });

  await order.save();

  res.status(201).json(order);
});

// buscar pedido
app.get("/order/:id", async (req, res) => {

  const order = await Order.findOne({ orderId: req.params.id });

  if (!order) {
    return res.status(404).json({ message: "Pedido não encontrado" });
  }

  res.json(order);
});

// listar pedidos
app.get("/order/list", async (req, res) => {

  const orders = await Order.find();

  res.json(orders);
});

// atualizar pedido
app.put("/order/:id", async (req, res) => {

  const data = req.body;

  const order = await Order.findOneAndUpdate(
    { orderId: req.params.id },
    {
      value: data.valorTotal,
      creationDate: data.dataCriacao,
      items: data.items.map(item => ({
        productId: Number(item.idItem),
        quantity: item.quantidadeItem,
        price: item.valorItem
      }))
    },
    { new: true }
  );

  if (!order) {
    return res.status(404).json({ message: "Pedido não encontrado" });
  }

  res.json(order);
});

// deletar pedido
app.delete("/order/:id", async (req, res) => {

  const order = await Order.findOneAndDelete({ orderId: req.params.id });

  if (!order) {
    return res.status(404).json({ message: "Pedido não encontrado" });
  }

  res.json({ message: "Pedido removido" });
});
// roda a API
app.listen(3000, () => {
  console.log("API rodando na porta 3000");
});
