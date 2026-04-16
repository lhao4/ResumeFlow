import Toolbar from '../editor/Toolbar';
import Sidebar from '../editor/Sidebar';
import Canvas from '../editor/Canvas';
import Inspector from '../editor/Inspector';

export default function EditorLayout() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100 text-gray-900">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <Canvas />
        <Inspector />
      </div>
    </div>
  );
}
