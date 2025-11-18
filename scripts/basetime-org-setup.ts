import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek.js';
import updateLocale from 'dayjs/plugin/updateLocale.js';

dayjs.extend(updateLocale);
dayjs.extend(isoWeek);

dayjs.updateLocale('en', { weekStart: 1 });

const prisma = new PrismaClient();

const orgId = 'basetime';

const designProject = { color: 'BLUE' as const, name: 'Design', estimatedMinutes: 90000, id: 'basetimeIdProject1' };
const developmentProject = { color: 'GRAY' as const, name: 'Development', estimatedMinutes: 70000, id: 'basetimeIdProject2' };
const researchProject = { color: 'ORANGE' as const, name: 'Research', estimatedMinutes: 40000, id: 'basetimeIdProject3' };

const projectArr = [designProject, developmentProject, researchProject];

const availableTimeEntries = [
    { projectId: designProject.id, name: 'Landing Page Redesign' },
    { projectId: designProject.id, name: 'New Landing Page' },
    { projectId: developmentProject.id, name: 'Backend API Refactor' },
    { projectId: developmentProject.id, name: 'Authentication Module' },
    { projectId: researchProject.id, name: 'Competitor Analysis' },
    { projectId: researchProject.id, name: 'User Behavior Study' },
];

const randomTimeEntry = () => availableTimeEntries[Math.floor(Math.random() * availableTimeEntries.length)];

const getRandomTimeEntries = () => {
    const today = dayjs();
    const startDate = today.subtract(3, 'month').startOf('day');
    const endDate = today.endOf('week');
    const timeEntries = [];

    for (let d = startDate; d.isBefore(endDate); d = d.add(1, 'day')) {
        const weekday = d.day();
        if (weekday === 0 || weekday === 6) continue;

        const numEntries = Math.floor(Math.random() * 6) + 1;
        for (let timeEntryIndex = 0; timeEntryIndex < numEntries; timeEntryIndex++) {
            const { projectId, name } = randomTimeEntry();
            const startHour = 7 + Math.floor(Math.random() * 6) + timeEntryIndex * Math.floor(Math.random() * 3);
            const duration = Math.floor(Math.random() * 4);

            timeEntries.push({
                name,
                projectId,
                start: d.hour(startHour).toDate(),
                end: d.hour(startHour + duration).toDate(),
            });
        }
    }
    return timeEntries;
};

const owner = {
    id: 'basetimeIdOwner',
    memberId: 'basetimeIdOwnerMember',
    name: 'basetime',
    email: 'basetime@gmail.com',
    role: 'OWNER' as const,
    hourlyRate: 40,
    timeEntries: getRandomTimeEntries(),
};
const manager = {
    id: 'basetimeIdManager',
    memberId: 'basetimeIdManagerMember',
    name: 'Elsie Seymour',
    email: 'ElsieSeymour@gmail.com',
    role: 'MANAGER' as const,
    hourlyRate: 50,
    timeEntries: getRandomTimeEntries(),
};
const emp1 = {
    id: 'basetimeIdEmp1',
    memberId: 'basetimeIdEmp1Member',
    name: 'Sharon Bowlin',
    email: 'SharonBowlin@teleworm.us',
    role: 'EMPLOYEE' as const,
    hourlyRate: 40,
    timeEntries: getRandomTimeEntries(),
};
const emp2 = {
    id: 'basetimeIdEmp2',
    memberId: 'basetimeIdEmp2Member',
    name: 'Robert Troy',
    email: 'RobertPTroy@jourrapide.com',
    role: 'EMPLOYEE' as const,
    hourlyRate: 30,
    timeEntries: getRandomTimeEntries(),
};

const users = [owner, manager, emp1, emp2];

async function main() {
    await reset();
    await user();
    await organization();
    await members();
    await projects();
    await timeEntries();

    console.log('Seeding basetime organization completed');
}

async function reset() {
    await prisma.organization.deleteMany({ where: { id: orgId } });
    await prisma.user.deleteMany({ where: { id: { in: users.map((e) => e.id) } } });
}

async function user() {
    const pwHash = await bcrypt.hash(process.env.BT_USER_PASSWORD!, 9);

    await prisma.user.createMany({ data: users.map(({ id, email, name }) => ({ id, email, name, password: pwHash })) });
}

async function organization() {
    await prisma.organization.create({
        data: {
            currency: 'EUR',
            name: 'Base Time',
            id: orgId,
        },
    });
}

async function members() {
    await prisma.member.createMany({
        data: users.map(({ id, memberId, role }) => ({ role, userId: id, id: memberId, organizationId: orgId })),
    });

    for (const { memberId, hourlyRate } of users) {
        await prisma.member.update({ where: { id: memberId }, data: { HourlyRates: { create: { value: hourlyRate } } } });
    }
}

async function projects() {
    await prisma.project.createMany({
        data: projectArr.map(({ color, name, id, estimatedMinutes }, i) => ({
            id,
            color,
            name,
            organizationId: orgId,
            estimatedMinutes,
            shortName: `${name}-${i}`,
        })),
    });

    for (const { id } of projectArr) {
        await prisma.project.update({ where: { id }, data: { Members: { set: users.map(({ memberId }) => ({ id: memberId })) } } });
    }
}

async function timeEntries() {
    for (const { memberId, timeEntries } of users) {
        await prisma.member.update({
            where: { id: memberId },
            data: {
                TimeEntries: {
                    createMany: {
                        data: timeEntries.map(({ end, name, projectId, start }) => ({ name, projectId, organizationId: orgId, start, end })),
                    },
                },
            },
        });
    }
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
