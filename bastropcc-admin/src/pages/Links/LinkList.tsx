import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, GripVertical, ExternalLink } from 'lucide-react';
import { apiClient } from '../../api/client';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAuth } from '../../context/AuthContext';

const SortableItem = ({ link, onEdit, onDelete, canDelete }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: link.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="bg-white border border-gray-200 rounded-md p-4 mb-3 flex items-center shadow-sm relative group z-10">
      <div {...attributes} {...listeners} className="mr-4 cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing">
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium text-gray-900 truncate">{link.title}</p>
          {!link.is_active && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Inactive</span>}
          {link.category && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">{link.category}</span>}
        </div>
        <p className="text-sm text-gray-500 truncate flex items-center mt-1">
          {link.url}
          <a href={link.url} target="_blank" rel="noreferrer" className="ml-2 text-gray-400 hover:text-primary transition-colors cursor-pointer z-20" onPointerDown={e => e.stopPropagation()}>
            <ExternalLink className="w-3 h-3" />
          </a>
        </p>
      </div>
      <div className="ml-4 flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <button onClick={() => onEdit(link.id)} onPointerDown={e => e.stopPropagation()} className="p-1 text-gray-400 hover:text-secondary rounded">
          <Edit2 className="w-4 h-4" />
        </button>
        {canDelete && (
          <button onClick={() => onDelete(link.id, link.title)} onPointerDown={e => e.stopPropagation()} className="p-1 text-gray-400 hover:text-red-500 rounded">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default function LinkList() {
  const [links, setLinks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchLinks = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/links') as any;
      if (res.success) setLinks(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await apiClient.delete(`/links/${id}`);
      setLinks(links.filter(l => l.id !== id));
    } catch (e: any) {
      alert(e?.error || 'Failed to delete');
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex(l => l.id === active.id);
    const newIndex = links.findIndex(l => l.id === over.id);
    
    const newLinks = arrayMove(links, oldIndex, newIndex);
    setLinks(newLinks);

    // Save to backend
    try {
      const updates = newLinks.map((link, index) => ({ id: link.id, sort_order: index }));
      await apiClient.post('/links/reorder', { updates });
    } catch (e) {
      console.error('Failed to reorder', e);
      // Optional: revert state on failure
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-secondary">Links Registry</h1>
          <p className="mt-2 text-sm text-gray-700">Drag and drop to reorder the resources list.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/links/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-dark"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Link
          </Link>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-2 min-h-[400px]">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : links.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">No links found.</div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={links.map(l => l.id)} strategy={verticalListSortingStrategy}>
              {links.map(link => (
                <SortableItem 
                  key={link.id} 
                  link={link} 
                  onEdit={() => window.location.href = `/links/${link.id}`} 
                  onDelete={handleDelete}
                  canDelete={user?.role === 'admin'}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
