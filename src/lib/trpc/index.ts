import { activeSessions } from './endpoints/active-sessions';
import { activeTimeEntry } from './endpoints/active-time-entry';
import { blogPostComments } from './endpoints/blog-post-comments';
import { blogPostUpvote } from './endpoints/blog-post-upvote';
import { currentUser } from './endpoints/current-user';
import { invitations } from './endpoints/invitations';
import { members } from './endpoints/members';
import { organizations } from './endpoints/organizations';
import { projects } from './endpoints/projects';
import { tasksPaginated } from './endpoints/tasks-paginated';
import { timeEntriesByMember } from './endpoints/time-entries-by-member';
import { timeEntriesPaginated } from './endpoints/time-entries-paginated';

import { createTRPCRouter } from './init';

export const appRouter = createTRPCRouter({
    blogPostUpvote,
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
    tasksPaginated,
});

export type AppRouter = typeof appRouter;
