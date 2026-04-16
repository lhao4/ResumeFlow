import { Download, Plus, RotateCcw, Save, Layout } from 'lucide-react';
import { useResumeStore } from '../../store/useResumeStore';

export default function Toolbar() {
  const { resetResume, meta, updateMeta } = useResumeStore();

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-50 print:hidden">
      <div className="flex items-center gap-4">
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
