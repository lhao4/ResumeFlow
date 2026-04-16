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

  const isActive = activeSectionId === section.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 p-2 rounded-md border transition-all cursor-pointer",
        isActive ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300",
        !section.visible && "opacity-50",
        isDragging && "z-50 shadow-lg"
      )}
      onClick={() => setActiveSectionId(section.id)}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600">
        <GripVertical className="w-4 h-4" />
      </div>
      
      <span className="flex-1 text-sm font-medium truncate">
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
    <aside className="w-64 border-r bg-gray-50 flex flex-col h-full print:hidden">
      <div className="p-4 border-b bg-white">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">模块管理</h2>
        
        <div 
          className={cn(
            "flex items-center gap-3 p-2 rounded-md border transition-all cursor-pointer mb-4",
            activeSectionId === 'profile' ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"
          )}
          onClick={() => setActiveSectionId('profile')}
        >
          <div className="p-1 text-blue-500">
            <User className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">基本信息</span>
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
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">添加模块</h3>
        <div className="grid grid-cols-1 gap-2">
          {SECTION_TEMPLATES.map((template) => (
            <button
              key={template.type}
              onClick={() => addSection(template.type, template.title)}
              className="flex items-center gap-3 p-2 text-sm text-gray-600 hover:bg-white hover:text-blue-600 hover:shadow-sm rounded-md transition-all text-left border border-transparent hover:border-gray-200"
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
