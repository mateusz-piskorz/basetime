'use client';

import ConfirmDialog from '@/components/common/confirm-dialog';
import { DashboardHeading } from '@/components/common/dashboard-heading';
import { SpinLoader } from '@/components/common/spin-loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useMember } from '@/lib/hooks/use-member';
import { deleteProject } from '@/lib/server-actions/project';
import { trpc } from '@/lib/trpc/client';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ProjectCard } from './project-card';
import { UpsertProjectDialog } from './upsert-project-dialog';

export const SectionProjects = () => {
    const [open, setOpen] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const { organizationId } = useMember();
    const { role } = useMember().member;

    const { data, error, isLoading, refetch } = trpc.projects.useQuery({ organizationId });
    const [selectedId, setSelectedId] = useState<null | string>(null);
    const selectedProject = data?.find((project) => project.id === selectedId);

    const handleRemoveProject = async (projectId: string) => {
        const res = await deleteProject({ projectId });
        if (!res.success) {
            toast.error(res.message);
            return;
        }
        toast.success('Project removed successfully');
        refetch();
        setOpenConfirm(false);
        setSelectedId(null);
    };

    return (
        <>
            <UpsertProjectDialog open={open} setOpen={setOpen} project={selectedProject} />
            {selectedProject && (
                <ConfirmDialog
                    open={openConfirm}
                    setOpen={setOpenConfirm}
                    onContinue={async () => {
                        if (selectedProject.id) {
                            handleRemoveProject(selectedProject.id);
                        }
                    }}
                    title={`Are you sure you want to delete ${selectedProject.name}`}
                    description="This action cannot be undone. Project will be removed permanently"
                />
            )}
            <div className="space-y-8 px-4 md:px-8">
                <div className="flex flex-wrap items-center gap-x-10">
                    <DashboardHeading title="Projects" description="Preview and Manage organization Projects" />
                    {role !== 'EMPLOYEE' && <Button onClick={() => setOpen(true)}>Add new project</Button>}
                </div>
                <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:gap-8">
                    {error && <p className="text-red-500">Error loading projects</p>}
                    {!error && isLoading && <SpinLoader />}
                    {!error &&
                        !isLoading &&
                        data?.map((project) => {
                            return (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    deleteProject={(projectId) => {
                                        setSelectedId(projectId);
                                        setOpenConfirm(true);
                                    }}
                                    manageProject={(projectId) => {
                                        setSelectedId(projectId);
                                        setOpen(true);
                                    }}
                                />
                            );
                        })}
                    {role !== 'EMPLOYEE' && (
                        <Card className="bg-bg dark:bg-card w-full border md:max-w-[325px]">
                            <CardContent className="flex h-full min-h-[200px] items-center justify-center">
                                <Button onClick={() => setOpen(true)} className="h-14 w-14">
                                    <Plus className="size-8" />
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
};
