import { activeSessions } from './endpoints/active-sessions';
import { activeTimeEntry } from './endpoints/active-time-entry';
import { blogPostComments } from './endpoints/blog-post-comments';
import { currentUser } from './endpoints/current-user';
import { invitations } from './endpoints/invitations';
import { members } from './endpoints/members';
import { organizations } from './endpoints/organizations';
import { projects } from './endpoints/projects';
import { timeEntriesByMember } from './endpoints/time-entries-by-member';
import { timeEntriesPaginated } from './endpoints/time-entries-paginated';

import { createTRPCRouter } from './init';

export const appRouter = createTRPCRouter({
    blogPostComments,
    currentUser,
    activeSessions,
    organizations,
    members,
    projects,
    invitations,
    activeTimeEntry,
    timeEntriesPaginated,
    timeEntriesByMember,
});

export type AppRouter = typeof appRouter;
