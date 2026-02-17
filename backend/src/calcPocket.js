const { PrismaClient }  = require('@prisma/client')

const prisma = new PrismaClient();

async function main() {
    const pocketId = 1;
    
    // Buscar caixinha

    const pocket = await prisma.pocket.findUnique({
        where: { id: pocketId },
        include: {
            movements: true
        }
    })

    // Calcular saldo atual 
    let balance = 0;

    for (const mov of pocket.movements) {
        if (mov.type === 'DEPOSIT') {
            balance += Number(mov.amount);
        } else {
            balance -= Number(mov.amount);
        }
    }


    // Calcular rendimento mensal
    const monthlyRate = Number(pocket.monthlyRate);

    const monthYield = balance * monthlyRate;

    const projected = balance + monthYield;

    console.log(`Caixinha: ${pocket.name}`);
    console.log(`Saldo atual: R$ ${balance.toFixed(2)}`);
    console.log(`Rendimento mensal estimado R$ ${monthYield.toFixed(2)}`);
    console.log(`Valor projetado proximo mes R$ ${projected.toFixed(2)}`);

}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())