import { execSync } from 'child_process';

execSync('npx prisma migrate reset --force --skip-seed', { stdio: 'inherit' });
