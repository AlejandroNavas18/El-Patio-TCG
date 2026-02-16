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
    // --- NUEVAS PROPIEDADES PARA EL SISTEMA DE PARTIDAS ---
    selectedTeam: Card[];
    selectedCoach: Card | null;
    toggleCardToTeam: (card: Card) => void;
    selectCoach: (coach: Card | null) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
    const allCards = data.cartas as unknown as Card[];
// Dentro de GameProvider en GameContext.tsx

const addCoins = (cantidad: number) => {
    setUser(prev => ({ ...prev, monedas: prev.monedas + cantidad }));
};

// No olvides añadirla al "value" del Provider y a la interfaz GameContextType
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
            // Añadimos 2 cartas adicionales del JSON proporcionado
            allCards.find(c => c.id === 15), // Julio (Torbellino)
            allCards.find(c => c.id === 21), // Fuerza SJ (Triple Alianza)
        ].filter(Boolean) as Card[], // .filter(Boolean) evita errores si alguna rareza no existe en el JSON
    });

    // --- ESTADOS DE SELECCIÓN ---
    const [selectedTeam, setSelectedTeam] = useState<Card[]>([]);
    const [selectedCoach, setSelectedCoach] = useState<Card | null>(null);

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

    // 5. Gestión del equipo (Máximo 7 cartas)
    const toggleCardToTeam = (card: Card) => {
        setSelectedTeam(prev => {
            // Si la carta ya está en el equipo, la eliminamos (deseleccionar)
            if (prev.find(c => c.id === card.id)) {
                return prev.filter(c => c.id !== card.id);
            }
            // Si intentamos añadir más de 7, bloqueamos la acción
            if (prev.length >= 7) return prev;
            // Evitamos que se añadan entrenadores al equipo de jugadores
            if (card.rareza === 'Entrenador') return prev;

            return [...prev, card];
        });
    };

    // 6. Selección de Entrenador (Solo 1 y debe ser tipo Entrenador)
    const selectCoach = (coach: Card | null) => {
        if (!coach) {
            setSelectedCoach(null);
            return;
        }
        // Solo permitimos cartas que tengan la rareza específica de Entrenador
        if (coach.rareza === 'Entrenador') {
            setSelectedCoach(coach);
        }
    };

    return (
        <GameContext.Provider value={{
            user,
            agregarCarta,
            gastarMonedas,
            allCards,
            hasCard,
            registrarResultado,
            // Exportación de nuevas funciones y estados
            selectedTeam,
            selectedCoach,
            toggleCardToTeam,
            selectCoach
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