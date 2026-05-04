import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ChevronDown, Trash2 } from "lucide-react";

interface ProjectSidebarProps {
  selectedProject?: number | null;
  selectedSession?: number | null;
  onSelectProject: (projectId: number) => void;
  onSelectSession: (sessionId: number) => void;
}

export default function ProjectSidebar({
  selectedProject,
  selectedSession,
  onSelectProject,
  onSelectSession,
}: ProjectSidebarProps) {
  const [expandedProject, setExpandedProject] = useState<number | null>(null);
  const [newProjectName, setNewProjectName] = useState("");

  const projectsQuery = trpc.projects.list.useQuery();
  const createProjectMutation = trpc.projects.create.useMutation({
    onSuccess: () => {
      projectsQuery.refetch();
      setNewProjectName("");
    },
  });

  const sessionsQuery = trpc.sessions.list.useQuery(
    { projectId: expandedProject! },
    { enabled: !!expandedProject }
  );

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    await createProjectMutation.mutateAsync({ name: newProjectName });
  };

  return (
    <div className="ide-sidebar w-64 overflow-y-auto">
      <div className="border-b border-border p-4">
        <h2 className="font-semibold text-sm mb-3">Проекты</h2>
        <div className="flex gap-2">
          <Input
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Новый проект"
            className="input-base text-xs"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleCreateProject();
              }
            }}
          />
          <Button
            onClick={handleCreateProject}
            disabled={!newProjectName.trim() || createProjectMutation.isPending}
            className="btn-primary px-2 py-1"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {projectsQuery.data?.map((project: any) => (
          <div key={project.id}>
            <button
              onClick={() => {
                onSelectProject(project.id);
                setExpandedProject(expandedProject === project.id ? null : project.id);
              }}
              className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-between ${
                selectedProject === project.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-foreground"
              }`}
            >
              <span>{project.name}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  expandedProject === project.id ? "rotate-180" : ""
                }`}
              />
            </button>

            {expandedProject === project.id && sessionsQuery.data && (
              <div className="ml-2 mt-1 space-y-1 border-l border-border pl-2">
                {sessionsQuery.data.map((session: any) => (
                  <button
                    key={session.id}
                    onClick={() => onSelectSession(session.id)}
                    className={`w-full text-left px-3 py-1 rounded text-xs transition-colors ${
                      selectedSession === session.id
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {session.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
