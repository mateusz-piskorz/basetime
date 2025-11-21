import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const email = 'admin@basetime.online';

async function main() {
    const pwHash = await bcrypt.hash(process.env.ADMIN_USER_PASSWORD!, 9);

    await prisma.user.deleteMany({ where: { email } });

    await prisma.user.create({ data: { email, name: 'admin', password: pwHash, role: 'ADMIN' } });

    console.log('creating admin user completed');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
