import { faker } from '@faker-js/faker';

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const columns = [
    { id: faker.string.uuid(), name: 'Planned', color: '#6B7280' },
    { id: faker.string.uuid(), name: 'In Progress', color: '#F59E0B' },
    { id: faker.string.uuid(), name: 'Done', color: '#10B981' },
];

const users = Array.from({ length: 4 })
    .fill(null)
    .map(() => ({
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        image: faker.image.avatar(),
    }));

export const exampleFeatures = Array.from({ length: 20 })
    .fill(null)
    .map(() => ({
        id: faker.string.uuid(),
        name: capitalize(faker.company.buzzPhrase()),
        startAt: faker.date.past({ years: 0.5, refDate: new Date() }),
        endAt: faker.date.future({ years: 0.5, refDate: new Date() }),
        column: faker.helpers.arrayElement(columns).id,
        owner: faker.helpers.arrayElement(users),
    }));

export const dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
});

export const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
});
