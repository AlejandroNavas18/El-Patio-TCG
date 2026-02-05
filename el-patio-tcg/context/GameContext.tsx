import { Card } from '@/types/Card';
import { User } from '@/types/User';
import React, { createContext, useContext, useState } from 'react';

interface GameContextType{
    user: User|null;
    agregarCarta: (nuevaCarta: Card) => void;
    gastarMonedas: (cantidad: number) => boolean;
}

const GameContext= createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User>({
      id: '1',
      username: 'Jugador 1',
      password: '',
      email: 'test@test.com',
      inventario: [],
      monedas: 500, // Saldo inicial
    });
  
    const agregarCarta = (nuevaCarta: Card) => {
      setUser(prev => ({
        ...prev,
        inventario: [...prev.inventario, nuevaCarta]
      }));
    };
  
    const gastarMonedas = (cantidad: number) => {
      if (user.monedas >= cantidad) {
        setUser(prev => ({ ...prev, monedas: prev.monedas - cantidad }));
        return true;
      }
      return false;
    };
  
    return (
      <GameContext.Provider value={{ user, agregarCarta, gastarMonedas }}>
        {children}
      </GameContext.Provider>
    );
  };
  
  // Hook personalizado para usar el contexto fácilmente
  export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) throw new Error('useGame debe usarse dentro de GameProvider');
    return context;
  };