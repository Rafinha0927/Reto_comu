import { Bell, User, Wifi, WifiOff, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { useDarkMode } from '../contexts/DarkModeContext';

interface HeaderProps {
  isConnected: boolean;
  unreadNotifications?: number;
}

export function Header({ isConnected, unreadNotifications = 0 }: HeaderProps) {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors">
      <div className="flex items-center justify-between">
        {/* Logo y nombre del proyecto */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white">IoT</span>
          </div>
          <div>
            <h1 className="text-gray-900 dark:text-white">IoT 3D Monitoring Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Sistema de Monitoreo en Tiempo Real</p>
          </div>
        </div>

        {/* Indicadores y acciones */}
        <div className="flex items-center gap-4">
          {/* Estado de conexión - DINÁMICO: se conectará con WebSocket */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="w-5 h-5 text-green-500" />
                <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                  Conectado
                </Badge>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-red-500" />
                <Badge variant="outline" className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800">
                  Desconectado
                </Badge>
              </>
            )}
          </div>

          {/* Toggle modo oscuro */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleDarkMode}
            className="hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </Button>

          {/* Notificaciones */}
          <Button variant="ghost" size="icon" className="relative hover:bg-gray-100 dark:hover:bg-gray-700">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-orange-500 rounded-full text-white text-xs flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </Button>

          {/* Perfil de usuario */}
          <Avatar className="cursor-pointer">
            <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
              <User className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}