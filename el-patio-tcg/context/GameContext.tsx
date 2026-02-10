import { Card } from '@/types/Card';
import { User } from '@/types/User';
import React, { createContext, useContext, useState } from 'react';
import data from '@/assets/data/cards.json';

interface GameContextType {
    user: User | null;
    agregarCarta: (nuevaCarta: Card) => void;
    gastarMonedas: (cantidad: number) => boolean;
    allCards: Card[];
    hasCard: (id: string) => boolean;
    registrarResultado: (gano: boolean) => void; // Agregada a la interfaz
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const allCards = data.cartas as unknown as Card[];

  const [user, setUser] = useState<User>({
    id: '1',
    username: 'Jugador 1',
    password: '',
    email: 'test@test.com',
    monedas: 500,
    stats: { victorias: 5, derrotas: 2, partidasJugadas: 7 },
    // Lógica de prueba: Filtramos una de cada rareza para el inventario
    inventario: [
        allCards.find(c => c.rareza === 'Normal'),
        allCards.find(c => c.rareza === 'Super Crack'),
        allCards.find(c => c.rareza === 'Mago'),
        allCards.find(c => c.rareza === 'Entrenador'),
        allCards.find(c => c.rareza === 'Balon de Oro'),
        allCards.find(c => c.rareza === 'Invencible'),
    ].filter(Boolean) as Card[], // .filter(Boolean) evita errores si alguna rareza no existe en el JSON
});

    // 1. Verificar si tiene la carta
    const hasCard = (id: string) => {
        return user.inventario.some(c => c.id === id);
    };

    // 2. Agregar carta al inventario
    const agregarCarta = (nuevaCarta: Card) => {
        setUser(prev => ({
            ...prev,
            inventario: [...prev.inventario, nuevaCarta]
        }));
    };

    // 3. Lógica de monedas
    const gastarMonedas = (cantidad: number) => {
        if (user.monedas >= cantidad) {
            setUser(prev => ({ ...prev, monedas: prev.monedas - cantidad }));
            return true;
        }
        return false;
    };

    // 4. Registrar resultados de batallas
    const registrarResultado = (gano: boolean) => {
        setUser(prev => ({
            ...prev,
            stats: {
                partidasJugadas: prev.stats.partidasJugadas + 1,
                victorias: gano ? prev.stats.victorias + 1 : prev.stats.victorias,
                derrotas: !gano ? prev.stats.derrotas + 1 : prev.stats.derrotas,
            }
        }));
    };

    return (
        <GameContext.Provider value={{ 
            user, 
            agregarCarta, 
            gastarMonedas, 
            allCards, 
            hasCard, 
            registrarResultado 
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) throw new Error('useGame debe usarse dentro de GameProvider');
    return context;
};