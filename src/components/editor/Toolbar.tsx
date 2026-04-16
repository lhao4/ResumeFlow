import { Download, RotateCcw, Layout, Undo2, Redo2 } from 'lucide-react';
import { useResumeStore } from '../../store/useResumeStore';
import { useStore } from 'zustand';
import { useEffect } from 'react';

export default function Toolbar() {
  const meta = useResumeStore(state => state.meta);
  const updateMeta = useResumeStore(state => state.updateMeta);
  const resetResume = useResumeStore(state => state.resetResume);
  
  const { undo, redo, pastStates, futureStates } = useStore(useResumeStore.temporal);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-50 print:hidden">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <Layout className="text-white w-5 h-5" />
          </div>
          <input
            type="text"
            value={meta.title}
            onChange={(e) => updateMeta({ title: e.target.value })}
            className="font-semibold text-lg bg-transparent border-none focus:ring-0 focus:outline-none w-48"
          />
        </div>

        <div className="flex items-center gap-1 border-l pl-6">
          <button
            onClick={() => undo()}
            disabled={pastStates.length === 0}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="撤销 (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => redo()}
            disabled={futureStates.length === 0}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="重做 (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={resetResume}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          title="重置简历"
        >
          <RotateCcw className="w-4 h-4" />
          <span>重置</span>
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>导出 PDF</span>
        </button>
      </div>
    </header>
  );
}
