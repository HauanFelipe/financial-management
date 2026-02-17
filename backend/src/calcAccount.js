const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {

  const account = await prisma.account.findUnique({
    where: { id: 1 },
    include: {
      tx: true
    }
  });

  let balance = 0;
  let totalIncome = 0;
  let totalExpense = 0;

  for (const t of account.tx) {

    const amount = Number(t.amount);

    if (t.kind === 'INCOME') {
      balance += amount;
      totalIncome += amount;
    } else {
      balance -= amount;
      totalExpense += amount;
    }
  }

  console.log('Conta:', account.name);
  console.log('Entradas: R$', totalIncome.toFixed(2));
  console.log('Saídas: R$', totalExpense.toFixed(2));
  console.log('Saldo atual: R$', balance.toFixed(2));

}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
