import { activeSessions } from './endpoints/active-sessions';
import { activeTimeEntry } from './endpoints/active-time-entry';
import { invitations } from './endpoints/invitations';
import { members } from './endpoints/members';
import { organizations } from './endpoints/organizations';
import { projects } from './endpoints/projects';
import { timeEntriesByMember } from './endpoints/time-entries-by-member';
import { timeEntriesPaginated } from './endpoints/time-entries-paginated';
import { updateAvatar } from './endpoints/update-avatar';
import { createTRPCRouter } from './init';

export const appRouter = createTRPCRouter({
    activeSessions,
    organizations,
    members,
    projects,
    invitations,
    activeTimeEntry,
    timeEntriesPaginated,
    timeEntriesByMember,
    updateAvatar,
});

export type AppRouter = typeof appRouter;
