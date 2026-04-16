import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  GripVertical, 
  Eye, 
  EyeOff, 
  Trash2, 
  Plus, 
  User, 
  Settings,
  GraduationCap, 
  Briefcase, 
  Code, 
  Wrench, 
  Trophy, 
  Users, 
  Star 
} from 'lucide-react';
import { useResumeStore } from '../../store/useResumeStore';
import { ResumeSection } from '../../types';
import { cn } from '../../lib/utils';

interface SortableItemProps {
  section: ResumeSection;
}

function SortableItem({ section }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: section.id });

  const { activeSectionId, setActiveSectionId, updateSection, deleteSection } = useResumeStore();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isActive = activeSectionId === (section.id as string | null);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 p-2 rounded-md border transition-all cursor-pointer",
        isActive ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600",
        !section.visible && "opacity-50",
        isDragging && "z-50 shadow-lg"
      )}
      onClick={() => setActiveSectionId(section.id)}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
        <GripVertical className="w-4 h-4" />
      </div>
      
      <span className="flex-1 text-sm font-medium truncate dark:text-gray-200">
        {section.title || '未命名模块'}
      </span>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            updateSection(section.id, { visible: !section.visible });
          }}
          className="p-1 text-gray-400 hover:text-blue-500 rounded"
        >
          {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteSection(section.id);
          }}
          className="p-1 text-gray-400 hover:text-red-500 rounded"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

const SECTION_TEMPLATES = [
  { type: 'education', title: '教育经历', icon: GraduationCap },
  { type: 'experience', title: '工作经历', icon: Briefcase },
  { type: 'projects', title: '项目经历', icon: Code },
  { type: 'skills', title: '专业技能', icon: Wrench },
  { type: 'awards', title: '荣誉奖项', icon: Trophy },
  { type: 'campus', title: '校园经历', icon: Users },
  { type: 'summary', title: '自我评价', icon: Star },
  { type: 'custom', title: '自定义模块', icon: Plus },
];

export default function Sidebar() {
  const { sections, reorderSections, addSection, activeSectionId, setActiveSectionId } = useResumeStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      reorderSections(arrayMove(sections, oldIndex, newIndex));
    }
  };

  return (
    <aside className="w-64 border-r bg-gray-50 dark:bg-gray-900 dark:border-gray-700 flex flex-col h-full print:hidden transition-colors duration-200">
      <div className="p-4 border-b bg-white dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">模块管理</h2>
        
        <div className="space-y-2 mb-4">
          <div 
            className={cn(
              "flex items-center gap-3 p-2 rounded-md border transition-all cursor-pointer",
              (activeSectionId === null || activeSectionId === undefined) ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
            )}
            onClick={() => setActiveSectionId(null)}
          >
            <div className="p-1 text-gray-500 dark:text-gray-400">
              <Settings className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium dark:text-gray-200">全局设置</span>
          </div>

          <div 
            className={cn(
              "flex items-center gap-3 p-2 rounded-md border transition-all cursor-pointer",
              String(activeSectionId) === 'profile' ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
            )}
            onClick={() => setActiveSectionId('profile')}
          >
            <div className="p-1 text-blue-500 dark:text-blue-400">
              <User className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium dark:text-gray-200">基本信息</span>
          </div>
        </div>

        <div className="space-y-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {sections.map((section) => (
                <SortableItem key={section.id} section={section} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">添加模块</h3>
        <div className="grid grid-cols-1 gap-2">
          {SECTION_TEMPLATES.map((template) => (
            <button
              key={template.type}
              onClick={() => addSection(template.type, template.title)}
              className="flex items-center gap-3 p-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-sm rounded-md transition-all text-left border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            >
              <template.icon className="w-4 h-4" />
              <span>{template.title}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
