import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Wrench,
  Plus,
  PencilLine,
  Trash2,
  FolderPlus,
  Tag,
  Star,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import {
  useSkillGroups,
  useCreateSkillGroup,
  useUpdateSkillGroup,
  useDeleteSkillGroup,
  useCreateSkillSection,
  useUpdateSkillSection,
  useDeleteSkillSection,
  useCreateSkill,
  useUpdateSkill,
  useDeleteSkill,
} from '../../hooks/useDashboardData';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/dashboard/ConfirmModal';
import Skeleton from '../../components/ui/Skeleton';
import { handleServerFormErrors } from '../../utils/formErrors';
import { toast } from 'sonner';
import { cn } from '../../utils/cn';

const SKILL_CATEGORIES = [
  { value: 'FRONTEND', label: 'Frontend' },
  { value: 'BACKEND', label: 'Backend' },
  { value: 'DATABASE', label: 'Database' },
  { value: 'DEVOPS', label: 'DevOps' },
  { value: 'TOOLS', label: 'Tools' },
  { value: 'SOFT_SKILL', label: 'Soft Skill' },
];

export function DashboardSkillsPage() {
  const { data: groups = [], isLoading, isError, error, refetch } = useSkillGroups();

  // Mutations
  const createGroupMutation = useCreateSkillGroup();
  const updateGroupMutation = useUpdateSkillGroup();
  const deleteGroupMutation = useDeleteSkillGroup();

  const createSectionMutation = useCreateSkillSection();
  const updateSectionMutation = useUpdateSkillSection();
  const deleteSectionMutation = useDeleteSkillSection();

  const createSkillMutation = useCreateSkill();
  const updateSkillMutation = useUpdateSkill();
  const deleteSkillMutation = useDeleteSkill();

  // Group Modal state
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  // Section Modal state
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [targetGroupId, setTargetGroupId] = useState(null);

  // Skill Modal state
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [targetSectionId, setTargetSectionId] = useState(null);

  // Generic Confirm Delete state
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'group'|'section'|'skill', id, title }

  // Forms
  const groupForm = useForm({ defaultValues: { title: '', display_order: 0 } });
  const sectionForm = useForm({ defaultValues: { title: '', display_order: 0, group: null } });
  const skillForm = useForm({
    defaultValues: {
      name: '',
      category: 'FRONTEND',
      proficiency: 80,
      icon: '',
      display_order: 0,
      is_featured: false,
    },
  });

  // Group Handlers
  const handleOpenGroupModal = (group = null) => {
    setEditingGroup(group);
    if (group) {
      groupForm.reset({ title: group.title, display_order: group.display_order ?? 0 });
    } else {
      groupForm.reset({ title: '', display_order: 0 });
    }
    setGroupModalOpen(true);
  };

  const onSubmitGroup = async (values) => {
    try {
      if (editingGroup) {
        await updateGroupMutation.mutateAsync({ id: editingGroup.id, payload: values });
        toast.success(`Group "${values.title}" updated.`);
      } else {
        await createGroupMutation.mutateAsync(values);
        toast.success(`Group "${values.title}" created.`);
      }
      setGroupModalOpen(false);
    } catch (err) {
      handleServerFormErrors(err, groupForm.setError, 'Failed to save group.');
    }
  };

  // Section Handlers
  const handleOpenSectionModal = (groupId, section = null) => {
    setTargetGroupId(groupId);
    setEditingSection(section);
    if (section) {
      sectionForm.reset({
        title: section.title,
        display_order: section.display_order ?? 0,
        group: groupId,
      });
    } else {
      sectionForm.reset({ title: '', display_order: 0, group: groupId });
    }
    setSectionModalOpen(true);
  };

  const onSubmitSection = async (values) => {
    try {
      const payload = { ...values, group: targetGroupId };
      if (editingSection) {
        await updateSectionMutation.mutateAsync({ id: editingSection.id, payload });
        toast.success(`Section "${values.title}" updated.`);
      } else {
        await createSectionMutation.mutateAsync(payload);
        toast.success(`Section "${values.title}" created.`);
      }
      setSectionModalOpen(false);
    } catch (err) {
      handleServerFormErrors(err, sectionForm.setError, 'Failed to save section.');
    }
  };

  // Skill Handlers
  const handleOpenSkillModal = (sectionId, skill = null) => {
    setTargetSectionId(sectionId);
    setEditingSkill(skill);
    if (skill) {
      skillForm.reset({
        name: skill.name,
        category: skill.category || 'FRONTEND',
        proficiency: skill.proficiency ?? 50,
        icon: skill.icon || '',
        display_order: skill.display_order ?? 0,
        is_featured: Boolean(skill.is_featured),
      });
    } else {
      skillForm.reset({
        name: '',
        category: 'FRONTEND',
        proficiency: 80,
        icon: '',
        display_order: 0,
        is_featured: false,
      });
    }
    setSkillModalOpen(true);
  };

  const onSubmitSkill = async (values) => {
    try {
      const payload = {
        ...values,
        proficiency: Number(values.proficiency),
        display_order: Number(values.display_order || 0),
        section: targetSectionId,
      };
      if (editingSkill) {
        await updateSkillMutation.mutateAsync({ id: editingSkill.id, payload });
        toast.success(`Skill "${values.name}" updated.`);
      } else {
        await createSkillMutation.mutateAsync(payload);
        toast.success(`Skill "${values.name}" created.`);
      }
      setSkillModalOpen(false);
    } catch (err) {
      handleServerFormErrors(err, skillForm.setError, 'Failed to save skill.');
    }
  };

  // Delete Confirmation Handler
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'group') {
        await deleteGroupMutation.mutateAsync(deleteTarget.id);
        toast.success(`Skill Group "${deleteTarget.title}" deleted.`);
      } else if (deleteTarget.type === 'section') {
        await deleteSectionMutation.mutateAsync(deleteTarget.id);
        toast.success(`Section "${deleteTarget.title}" deleted.`);
      } else if (deleteTarget.type === 'skill') {
        await deleteSkillMutation.mutateAsync(deleteTarget.id);
        toast.success(`Skill "${deleteTarget.title}" deleted.`);
      }
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to delete item.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-mono text-xl font-bold text-text">$ manage_skills</h1>
          <p className="font-mono text-xs text-text-muted mt-1">
            // Nested taxonomy tree: Skill Groups (Boxes) → Sections → Skills
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleOpenGroupModal(null)}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          New Skill Box (Group)
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-border/80 bg-surface/90">
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Card className="border-danger/60 bg-danger/10">
          <CardContent className="p-8 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-danger mx-auto" />
            <p className="font-mono text-xs text-danger">
              Failed to load skill groups: {error?.message || 'Server error'}
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => refetch()}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : groups.length === 0 ? (
        <Card className="border-border/80 bg-surface/90">
          <CardContent className="p-12 text-center text-text-muted font-mono text-xs space-y-3">
            <Wrench className="w-8 h-8 mx-auto text-text-muted/60" />
            <p>No skill groups created yet. Create a group box to start structuring your skills.</p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenGroupModal(null)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add First Group
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {groups.map((group) => (
            <Card key={group.id} className="border-border/80 bg-surface/90 flex flex-col">
              <CardContent className="p-5 flex flex-col flex-1 gap-4">
                {/* Group Box Header */}
                <div className="flex items-center justify-between border-b border-border/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-accent" />
                    <h2 className="font-mono text-base font-bold text-text">
                      {group.title}
                    </h2>
                    <span className="font-mono text-[10px] text-text-muted/70 bg-surface-2 px-1.5 py-0.5 rounded">
                      order: {group.display_order}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenSectionModal(group.id, null)}
                      className="text-xs h-7 px-2 font-mono"
                      leftIcon={<FolderPlus className="w-3 h-3" />}
                    >
                      Add Section
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleOpenGroupModal(group)}
                      className="p-1.5 rounded border border-border hover:border-accent text-text-muted hover:text-accent transition-colors"
                      title="Edit Group"
                    >
                      <PencilLine className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget({ type: 'group', id: group.id, title: group.title })
                      }
                      className="p-1.5 rounded border border-border hover:border-danger text-text-muted hover:text-danger transition-colors cursor-pointer"
                      title="Delete Group"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sections inside this Group Box */}
                <div className="space-y-4 flex-1">
                  {(group.sections || []).length === 0 ? (
                    <p className="font-mono text-xs text-text-muted/60 italic py-2">
                      // No sections inside this box yet. Click "Add Section" above.
                    </p>
                  ) : (
                    group.sections.map((section) => (
                      <div
                        key={section.id}
                        className="p-3.5 rounded-lg border border-border/60 bg-surface-2/40 space-y-3"
                      >
                        {/* Section Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-accent">
                              // {section.title}
                            </span>
                            <span className="font-mono text-[9px] text-text-muted">
                              ({section.skills?.length || 0})
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenSkillModal(section.id, null)}
                              className="text-[10px] h-6 px-1.5 font-mono"
                              leftIcon={<Plus className="w-2.5 h-2.5" />}
                            >
                              Add Skill
                            </Button>
                            <button
                              type="button"
                              onClick={() => handleOpenSectionModal(group.id, section)}
                              className="p-1 text-text-muted hover:text-accent"
                              title="Edit Section"
                            >
                              <PencilLine className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteTarget({
                                  type: 'section',
                                  id: section.id,
                                  title: section.title,
                                })
                              }
                              className="p-1 text-text-muted hover:text-danger cursor-pointer"
                              title="Delete Section"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Skills inside this Section */}
                        <div className="flex flex-wrap gap-2">
                          {(section.skills || []).length === 0 ? (
                            <span className="font-mono text-[11px] text-text-muted/50 italic">
                              No skills added yet.
                            </span>
                          ) : (
                            section.skills.map((skill) => (
                              <div
                                key={skill.id}
                                className="group relative flex items-center gap-2 rounded-md border border-border/70 bg-surface px-2.5 py-1.5 font-mono text-xs"
                              >
                                <span className="font-medium text-text">{skill.name}</span>
                                <span className="text-[10px] text-accent font-semibold">
                                  {skill.proficiency}%
                                </span>
                                {skill.is_featured && (
                                  <Star className="w-2.5 h-2.5 fill-accent text-accent" />
                                )}

                                {/* Hover actions for skill */}
                                <div className="hidden group-hover:flex items-center gap-1 ml-1 pl-1 border-l border-border/60">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenSkillModal(section.id, skill)}
                                    className="p-0.5 text-text-muted hover:text-accent"
                                    title="Edit Skill"
                                  >
                                    <PencilLine className="w-2.5 h-2.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setDeleteTarget({
                                        type: 'skill',
                                        id: skill.id,
                                        title: skill.name,
                                      })
                                    }
                                    className="p-0.5 text-text-muted hover:text-danger cursor-pointer"
                                    title="Delete Skill"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Group Create/Edit Modal */}
      <Modal
        isOpen={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        title={editingGroup ? `Edit Group: ${editingGroup.title}` : 'New Skill Group'}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setGroupModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={createGroupMutation.isPending || updateGroupMutation.isPending}
              onClick={groupForm.handleSubmit(onSubmitGroup)}
            >
              Save Group
            </Button>
          </>
        }
      >
        <form onSubmit={groupForm.handleSubmit(onSubmitGroup)} className="space-y-4">
          <Input
            label="Group Title"
            required
            placeholder="e.g., Backend, Frontend, Database, DevOps"
            error={groupForm.formState.errors.title?.message}
            {...groupForm.register('title', { required: 'Group title is required' })}
          />
          <Input
            label="Display Order"
            type="number"
            min={0}
            error={groupForm.formState.errors.display_order?.message}
            {...groupForm.register('display_order', { valueAsNumber: true })}
          />
        </form>
      </Modal>

      {/* Section Create/Edit Modal */}
      <Modal
        isOpen={sectionModalOpen}
        onClose={() => setSectionModalOpen(false)}
        title={editingSection ? `Edit Section: ${editingSection.title}` : 'New Skill Section'}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setSectionModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={createSectionMutation.isPending || updateSectionMutation.isPending}
              onClick={sectionForm.handleSubmit(onSubmitSection)}
            >
              Save Section
            </Button>
          </>
        }
      >
        <form onSubmit={sectionForm.handleSubmit(onSubmitSection)} className="space-y-4">
          <Input
            label="Section Title"
            required
            placeholder="e.g., Languages Spoken, Frameworks, Cloud Infrastructure"
            error={sectionForm.formState.errors.title?.message}
            {...sectionForm.register('title', { required: 'Section title is required' })}
          />
          <Input
            label="Display Order"
            type="number"
            min={0}
            error={sectionForm.formState.errors.display_order?.message}
            {...sectionForm.register('display_order', { valueAsNumber: true })}
          />
        </form>
      </Modal>

      {/* Skill Create/Edit Modal */}
      <Modal
        isOpen={skillModalOpen}
        onClose={() => setSkillModalOpen(false)}
        title={editingSkill ? `Edit Skill: ${editingSkill.name}` : 'New Skill'}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setSkillModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={createSkillMutation.isPending || updateSkillMutation.isPending}
              onClick={skillForm.handleSubmit(onSubmitSkill)}
            >
              Save Skill
            </Button>
          </>
        }
      >
        <form onSubmit={skillForm.handleSubmit(onSubmitSkill)} className="space-y-4">
          <Input
            label="Skill Name"
            required
            placeholder="e.g., Python, PostgreSQL, Docker"
            error={skillForm.formState.errors.name?.message}
            {...skillForm.register('name', { required: 'Skill name is required' })}
          />

          <div>
            <label className="font-mono text-xs font-medium text-text-muted block mb-1.5">
              Category *
            </label>
            <select
              className="w-full bg-surface-2 border border-border rounded-md px-3 py-2 font-mono text-xs text-text outline-none focus:border-accent"
              {...skillForm.register('category')}
            >
              {SKILL_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-mono text-xs font-medium text-text-muted">
                Proficiency (1–100%) *
              </label>
              <span className="font-mono text-xs text-accent font-bold">
                {skillForm.watch('proficiency')}%
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              className="w-full accent-accent cursor-pointer"
              {...skillForm.register('proficiency', { valueAsNumber: true })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 items-center">
            <Input
              label="Display Order"
              type="number"
              min={0}
              error={skillForm.formState.errors.display_order?.message}
              {...skillForm.register('display_order', { valueAsNumber: true })}
            />

            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="skill_featured"
                className="rounded border-border bg-surface-2 text-accent focus:ring-accent"
                {...skillForm.register('is_featured')}
              />
              <label htmlFor="skill_featured" className="font-mono text-xs text-text cursor-pointer select-none">
                Featured Skill
              </label>
            </div>
          </div>

          <Input
            label="Icon identifier (optional)"
            placeholder="e.g. lucide icon name or slug"
            error={skillForm.formState.errors.icon?.message}
            {...skillForm.register('icon')}
          />
        </form>
      </Modal>

      {/* Generic Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deleteTarget?.type}`}
        message={`Are you sure you want to delete "${deleteTarget?.title}"? All nested child records will also be affected.`}
        confirmText="Confirm Delete"
        isLoading={
          deleteGroupMutation.isPending ||
          deleteSectionMutation.isPending ||
          deleteSkillMutation.isPending
        }
      />
    </div>
  );
}

export default DashboardSkillsPage;
