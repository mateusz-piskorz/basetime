'use client';

import { useMember } from '@/lib/hooks/use-member';
import { trpc } from '@/lib/trpc/client';
import { MultiSelect } from './multi-select';
import { ProjectBadge } from './project-badge';

type Props = {
    projects: string[];
    setProjects: (val: string[]) => void;
};

export const ProjectsFilter = ({ projects, setProjects }: Props) => {
    const { orgId } = useMember();

    const { data } = trpc.projects.useQuery({ orgId });
    return (
        <MultiSelect
            options={(data || []).map(({ id, shortName, color }) => ({
                label: <ProjectBadge hex={color} name={shortName} className="border-none px-0" />,
                value: id,
            }))}
            setValues={(val) => setProjects(val)}
            values={projects}
            title="Projects"
        />
    );
};
