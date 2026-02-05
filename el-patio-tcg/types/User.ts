import { Card } from "./Card";

export interface User {
    id: string;
    username: string;
    password: string;
    email: string;
    inventario: Card[]; // Cartas que posee
    monedas: number;      // Para comprar sobres
  }