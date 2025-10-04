import { prisma } from '@/lib/prisma';

const seed1 = async () => {
    await prisma.organization.upsert({
        where: { id: 'basetime' },
        create: { currency: 'EUR', name: 'Base Time', id: 'basetime' },
        update: { currency: 'EUR', name: 'Base Time' },
    });
};

const main = async () => {
    console.log('seeding start');
    await seed1();
    console.log('seeding end');
};

main();
