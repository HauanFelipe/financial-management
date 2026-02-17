const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {

    const tx =  await prisma.transaction.create({
        data: {
            accountId: 1,
            kind: 'INCOME',
            description: 'Salario',
            amount: 2500,
            date: new Date()
        }
    });

    console.log(`Transacao criada ${tx}`);

}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())