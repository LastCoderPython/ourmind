import { ChevronDown, X } from 'lucide-react';

export function Header({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 sticky top-0 z-10 bg-app-cream/80 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
          DS
        </div>
        {title && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-800">{title}</span>
            {subtitle && <span className="text-xs text-slate-500">{subtitle}</span>}
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-200/50 cursor-pointer">
          <span className="text-xs font-bold text-slate-600">EN</span>
          <ChevronDown className="w-4 h-4 text-slate-600" />
        </div>
        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors">
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>
    </header>
  );
}
