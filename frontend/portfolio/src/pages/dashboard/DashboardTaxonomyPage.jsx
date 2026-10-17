import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Tags,
  FolderTree,
  Plus,
  PencilLine,
  Trash2,
  FileText,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useTags,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
} from '../../hooks/useDashboardData';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input, { Textarea } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/dashboard/ConfirmModal';
import Skeleton from '../../components/ui/Skeleton';
import { handleServerFormErrors } from '../../utils/formErrors';
import { toast } from 'sonner';
import { cn } from '../../utils/cn';

export function DashboardTaxonomyPage() {
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'tags'

  // Queries
  const {
    data: categories = [],
    isLoading: isLoadingCat,
    isError: isErrorCat,
    error: errorCat,
    refetch: refetchCat,
  } = useCategories();

  const {
    data: tags = [],
    isLoading: isLoadingTag,
    isError: isErrorTag,
    error: errorTag,
    refetch: refetchTag,
  } = useTags();

  // Mutations
  const createCatMutation = useCreateCategory();
  const updateCatMutation = useUpdateCategory();
  const deleteCatMutation = useDeleteCategory();

  const createTagMutation = useCreateTag();
  const updateTagMutation = useUpdateTag();
  const deleteTagMutation = useDeleteTag();

  // Modals state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'category'|'tag', id, name }

  // Forms
  const catForm = useForm({ defaultValues: { name: '', description: '' } });
  const tagForm = useForm({ defaultValues: { name: '' } });

  // Category handlers
  const handleOpenCatModal = (cat = null) => {
    setEditingCategory(cat);
    if (cat) {
      catForm.reset({ name: cat.name || '', description: cat.description || '' });
    } else {
      catForm.reset({ name: '', description: '' });
    }
    setCategoryModalOpen(true);
  };

  const onSubmitCat = async (values) => {
    try {
      if (editingCategory) {
        await updateCatMutation.mutateAsync({ id: editingCategory.id, payload: values });
        toast.success(`Category "${values.name}" updated.`);
      } else {
        await createCatMutation.mutateAsync(values);
        toast.success(`Category "${values.name}" created.`);
      }
      setCategoryModalOpen(false);
    } catch (err) {
      handleServerFormErrors(err, catForm.setError, 'Failed to save category.');
    }
  };

  // Tag handlers
  const handleOpenTagModal = (tag = null) => {
    setEditingTag(tag);
    if (tag) {
      tagForm.reset({ name: tag.name || '' });
    } else {
      tagForm.reset({ name: '' });
    }
    setTagModalOpen(true);
  };

  const onSubmitTag = async (values) => {
    try {
      if (editingTag) {
        await updateTagMutation.mutateAsync({ id: editingTag.id, payload: values });
        toast.success(`Tag "${values.name}" updated.`);
      } else {
        await createTagMutation.mutateAsync(values);
        toast.success(`Tag "${values.name}" created.`);
      }
      setTagModalOpen(false);
    } catch (err) {
      handleServerFormErrors(err, tagForm.setError, 'Failed to save tag.');
    }
  };

  // Delete handler (gracefully displays backend 400 error if category is in use by posts)
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'category') {
        await deleteCatMutation.mutateAsync(deleteTarget.id);
        toast.success(`Category "${deleteTarget.name}" deleted.`);
      } else {
        await deleteTagMutation.mutateAsync(deleteTarget.id);
        toast.success(`Tag "${deleteTarget.name}" deleted.`);
      }
      setDeleteTarget(null);
    } catch (err) {
      const serverDetail = err?.response?.data?.detail;
      toast.error(serverDetail || 'Failed to delete taxonomy item.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-mono text-xl font-bold text-text">$ manage_taxonomy</h1>
          <p className="font-mono text-xs text-text-muted mt-1">
            // Blog categories, thematic classification and article hashtags
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() =>
            activeTab === 'categories' ? handleOpenCatModal(null) : handleOpenTagModal(null)
          }
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          {activeTab === 'categories' ? 'New Category' : 'New Tag'}
        </Button>
      </div>

      {/* Tabs */}
      <Card className="border-border/80 bg-surface/90">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('categories')}
              className={cn(
                'flex items-center gap-2 px-3.5 py-1.5 rounded font-mono text-xs transition-colors',
                activeTab === 'categories'
                  ? 'bg-accent text-on-accent font-semibold'
                  : 'bg-surface-2 text-text-muted border border-border hover:text-text'
              )}
            >
              <FolderTree className="w-3.5 h-3.5" />
              Categories ({categories.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tags')}
              className={cn(
                'flex items-center gap-2 px-3.5 py-1.5 rounded font-mono text-xs transition-colors',
                activeTab === 'tags'
                  ? 'bg-accent text-on-accent font-semibold'
                  : 'bg-surface-2 text-text-muted border border-border hover:text-text'
              )}
            >
              <Tags className="w-3.5 h-3.5" />
              Tags ({tags.length})
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Categories Content */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          {isLoadingCat ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border-border/80 bg-surface/90">
                  <CardContent className="p-5 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : isErrorCat ? (
            <Card className="border-danger/60 bg-danger/10">
              <CardContent className="p-8 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-danger mx-auto" />
                <p className="font-mono text-xs text-danger">
                  Failed to load categories: {errorCat?.message || 'Server error'}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => refetchCat()}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : categories.length === 0 ? (
            <Card className="border-border/80 bg-surface/90">
              <CardContent className="p-12 text-center text-text-muted font-mono text-xs space-y-3">
                <FolderTree className="w-8 h-8 mx-auto text-text-muted/60" />
                <p>No categories found. Create a category to organize blog posts.</p>
                <Button variant="primary" size="sm" onClick={() => handleOpenCatModal(null)}>
                  Add First Category
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <Card key={cat.id} className="border-border/80 bg-surface/90 flex flex-col justify-between">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-mono text-sm font-bold text-text">{cat.name}</h2>
                        <span className="font-mono text-[11px] text-text-muted/70">
                          /{cat.slug}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenCatModal(cat)}
                          className="p-1.5 rounded border border-border hover:border-accent text-text-muted hover:text-accent transition-colors"
                          title="Edit Category"
                        >
                          <PencilLine className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget({ type: 'category', id: cat.id, name: cat.name })
                          }
                          className="p-1.5 rounded border border-border hover:border-danger text-text-muted hover:text-danger transition-colors cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {cat.description ? (
                      <p className="font-sans text-xs text-text-muted line-clamp-2">
                        {cat.description}
                      </p>
                    ) : (
                      <p className="font-mono text-[11px] text-text-muted/50 italic">
                        No description provided.
                      </p>
                    )}

                    <div className="pt-2 border-t border-border/60 flex items-center gap-1.5 font-mono text-[11px] text-text-muted">
                      <FileText className="w-3 h-3 text-accent" />
                      <span>{cat.posts_count ?? 0} published post(s)</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tags Content */}
      {activeTab === 'tags' && (
        <div className="space-y-4">
          {isLoadingTag ? (
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-24" />
              ))}
            </div>
          ) : isErrorTag ? (
            <Card className="border-danger/60 bg-danger/10">
              <CardContent className="p-8 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-danger mx-auto" />
                <p className="font-mono text-xs text-danger">
                  Failed to load tags: {errorTag?.message || 'Server error'}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => refetchTag()}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : tags.length === 0 ? (
            <Card className="border-border/80 bg-surface/90">
              <CardContent className="p-12 text-center text-text-muted font-mono text-xs space-y-3">
                <Tags className="w-8 h-8 mx-auto text-text-muted/60" />
                <p>No tags created yet.</p>
                <Button variant="primary" size="sm" onClick={() => handleOpenTagModal(null)}>
                  Add First Tag
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="p-3 rounded-lg border border-border/80 bg-surface flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <span className="font-mono text-xs font-semibold text-text truncate block">
                      #{tag.name}
                    </span>
                    <span className="font-mono text-[10px] text-text-muted">
                      {tag.posts_count ?? 0} post(s)
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenTagModal(tag)}
                      className="p-1 text-text-muted hover:text-accent"
                      title="Edit Tag"
                    >
                      <PencilLine className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ type: 'tag', id: tag.id, name: tag.name })}
                      className="p-1 text-text-muted hover:text-danger cursor-pointer"
                      title="Delete Tag"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category Modal */}
      <Modal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title={editingCategory ? `Edit Category: ${editingCategory.name}` : 'New Category'}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setCategoryModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={createCatMutation.isPending || updateCatMutation.isPending}
              onClick={catForm.handleSubmit(onSubmitCat)}
            >
              Save Category
            </Button>
          </>
        }
      >
        <form onSubmit={catForm.handleSubmit(onSubmitCat)} className="space-y-4">
          <Input
            label="Category Name"
            required
            placeholder="e.g., Software Architecture, DevOps"
            error={catForm.formState.errors.name?.message}
            {...catForm.register('name', { required: 'Category name is required' })}
          />

          <Textarea
            label="Description (Optional)"
            rows={3}
            placeholder="Brief description of articles that belong here..."
            error={catForm.formState.errors.description?.message}
            {...catForm.register('description')}
          />
        </form>
      </Modal>

      {/* Tag Modal */}
      <Modal
        isOpen={tagModalOpen}
        onClose={() => setTagModalOpen(false)}
        title={editingTag ? `Edit Tag: ${editingTag.name}` : 'New Tag'}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setTagModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={createTagMutation.isPending || updateTagMutation.isPending}
              onClick={tagForm.handleSubmit(onSubmitTag)}
            >
              Save Tag
            </Button>
          </>
        }
      >
        <form onSubmit={tagForm.handleSubmit(onSubmitTag)} className="space-y-4">
          <Input
            label="Tag Name (without #)"
            required
            placeholder="e.g., react, django, typescript"
            error={tagForm.formState.errors.name?.message}
            {...tagForm.register('name', { required: 'Tag name is required' })}
          />
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deleteTarget?.type}`}
        message={
          deleteTarget?.type === 'category'
            ? `Are you sure you want to delete category "${deleteTarget?.name}"? If it is currently used by any posts, the system will prevent deletion.`
            : `Are you sure you want to delete tag "#${deleteTarget?.name}"?`
        }
        confirmText="Confirm Delete"
        isLoading={deleteCatMutation.isPending || deleteTagMutation.isPending}
      />
    </div>
  );
}

export default DashboardTaxonomyPage;
