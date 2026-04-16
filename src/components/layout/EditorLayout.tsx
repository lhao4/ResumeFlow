import Toolbar from '../editor/Toolbar';
import Sidebar from '../editor/Sidebar';
import Canvas from '../editor/Canvas';
import Inspector from '../editor/Inspector';
import { useResumeStore } from '../../store/useResumeStore';
import { cn } from '../../lib/utils';

export default function EditorLayout() {
  const darkMode = useResumeStore(state => state.darkMode);

  return (
    <div className={cn("flex flex-col h-screen bg-gray-100 overflow-hidden", darkMode && "dark")}>
      <Toolbar />
      <div className="flex flex-1 overflow-hidden bg-background text-foreground">
        <Sidebar />
        <Canvas />
        <Inspector />
      </div>
    </div>
  );
}
