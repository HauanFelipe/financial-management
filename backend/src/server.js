const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());// permite receber JSON no body
 

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfNextMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 1);
}

app.post("/transactions", async (req, res) => {
  const { kind, description, amount, date } = req.body;

  // validações mínimas (pra não sujar o banco)
  if (!["INCOME", "EXPENSE"].includes(kind)) {
    return res.status(400).json({ error: "kind deve ser INCOME ou EXPENSE" });
  }
  if (!description || typeof description !== "string") {
    return res.status(400).json({ error: "description é obrigatório" });
  }
  if (typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ error: "amount deve ser number > 0" });
  }

  const tx = await prisma.transaction.create({
    data: {
      accountId: 1,
      kind,
      description,
      amount,
      date: date ? new Date(date) : new Date(),
    },
  });

  res.status(201).json(tx);
});

app.get("/summary/month", async (req, res) => {
  const now = new Date();
  const from = startOfMonth(now);
  const to = startOfNextMonth(now);

  const tx = await prisma.transaction.findMany({
    where: { accountId: 1, date: { gte: from, lt: to } },
  });

  let income = 0;
  let expense = 0;

  for (const t of tx) {
    const v = Number(t.amount);
    if (t.kind === "INCOME") income += v;
    else expense += v;
  }

  const net = income - expense;

  let status = "VERMELHO";
  if (net >= 0 && income > 0) {
    const ratio = net / income;
    status = ratio >= 0.1 ? "VERDE" : "AMARELO";
  } else if (net === 0) {
    status = "AMARELO";
  }

  res.json({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    income: Number(income.toFixed(2)),
    expense: Number(expense.toFixed(2)),
    net: Number(net.toFixed(2)),
    status,
  });
});

app.get("/pockets/:id", async (req, res) => {
  const pocketId = Number(req.params.id);

  const pocket = await prisma.pocket.findUnique({
    where: { id: pocketId },
    include: { movements: true },
  });

  if (!pocket) return res.status(404).json({ error: "Pocket não encontrada" });

  let balance = 0;
  for (const m of pocket.movements) {
    const v = Number(m.amount);
    balance += m.type === "DEPOSIT" ? v : -v;
  }

  const rate = Number(pocket.monthlyRate);
  const monthlyYield = balance * rate;

  res.json({
    id: pocket.id,
    name: pocket.name,
    monthlyRate: rate,
    balance: Number(balance.toFixed(2)),
    monthlyYield: Number(monthlyYield.toFixed(2)),
    projectedNextMonth: Number((balance + monthlyYield).toFixed(2)),
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`));
