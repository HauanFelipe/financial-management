const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfNextMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 1);
}

async function main() {
  const accountId = 1;
  const now = new Date();

  const from = startOfMonth(now);
  const to = startOfNextMonth(now);

  const tx = await prisma.transaction.findMany({
    where: {
      accountId,
      date: { gte: from, lt: to },
    },
    orderBy: { date: 'asc' },
  });

  let income = 0;
  let expense = 0;

  for (const t of tx) {
    const amount = Number(t.amount);
    if (t.kind === 'INCOME') income += amount;
    else expense += amount;
  }

  const net = income - expense;

  // regra do semáforo (simples e útil)
  // verde: sobra >= 10% das entradas
  // amarelo: sobra entre 0 e 10%
  // vermelho: negativo
  let status = 'VERMELHO';
  if (net >= 0 && income > 0) {
    const ratio = net / income;
    status = ratio >= 0.10 ? 'VERDE' : 'AMARELO';
  } else if (net === 0) {
    status = 'AMARELO';
  }

  console.log(`Mês: ${now.getMonth() + 1}/${now.getFullYear()}`);
  console.log('Entradas: R$', income.toFixed(2));
  console.log('Saídas:   R$', expense.toFixed(2));
  console.log('Saldo:    R$', net.toFixed(2));
  console.log('Status:', status);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
