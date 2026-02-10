// Tipos de rareza para controlar las probabilidades
export type Rareza = 'Normal' | 'Super Crack' | 'Balon de Oro' | 'Mago' | 'Torbellino' | 'Duo Imparable' | 'Triple Alianza' | 'Invencible' | 'Entrenador'
| 'Revelación' | 'Rompe Tibias';

// Estructura de una Carta
export interface Card {
  id: string;
  nombre: string;
  imagen: string;
  rareza: Rareza;
  ataque: number;
  defensa: number;
  total: number;
  posicion: 'DEL' | 'DEF' | 'CEN'; 
}         