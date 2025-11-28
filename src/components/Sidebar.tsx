import { Box, Gauge, History, AlertTriangle, Settings } from 'lucide-react';
import { cn } from './ui/utils';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: 'vista3d', label: 'Vista 3D', icon: Box },
  { id: 'sensores', label: 'Sensores', icon: Gauge },
  { id: 'historico', label: 'Histórico', icon: History },
  { id: 'alertas', label: 'Alertas', icon: AlertTriangle },
  { id: 'configuracion', label: 'Configuración', icon: Settings },
];

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <aside className="bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 w-64 p-4 transition-colors">
      {/* DINÁMICO: Secciones que se conectan a diferentes vistas del dashboard */}
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                isActive
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}