'use client';

import { projectColor } from '@/lib/constants/project-color';
import { useMember } from '@/lib/hooks/use-member';
import { trpc } from '@/lib/trpc/client';
import { MultiSelect } from './multi-select';

type Props = {
    projects: string[];
    setProjects: (val: string[]) => void;
};

export const ProjectsFilter = ({ projects, setProjects }: Props) => {
    const { orgId } = useMember();

    const { data } = trpc.projects.useQuery({ orgId });
    return (
        <MultiSelect
            options={(data || []).map(({ id, name, color }) => ({
                label: (
                    <>
                        <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: projectColor[color] }} />
                        {name}
                    </>
                ),
                value: id,
            }))}
            setValues={(val) => setProjects(val)}
            values={projects}
            title="Projects"
        />
    );
};
