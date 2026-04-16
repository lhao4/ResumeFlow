import Toolbar from '../editor/Toolbar';
import Sidebar from '../editor/Sidebar';
import Canvas from '../editor/Canvas';
import Inspector from '../editor/Inspector';
import { useResumeStore } from '../../store/useResumeStore';
import { cn } from '../../lib/utils';

export default function EditorLayout() {
  const darkMode = useResumeStore(state => state.darkMode);

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      <div className={cn(darkMode && "dark")}>
        <Toolbar />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className={cn("h-full", darkMode && "dark")}>
          <Sidebar />
        </div>
        <Canvas />
        <div className={cn("h-full", darkMode && "dark")}>
          <Inspector />
        </div>
      </div>
    </div>
  );
}
