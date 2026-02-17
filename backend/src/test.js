const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    
    //Criar um aporte de R$ 1000 na primeira caixinha 
    const movement = await prisma.pocketMovement.create({
        data: {
            pocketId: 1,
            type: 'DEPOSIT',
            amount: 1000,
            date: new Date(),
        }
    });

    console.log('Aporte criado', movement)

}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())