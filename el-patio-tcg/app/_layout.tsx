import { Stack } from 'expo-router';
import { GameProvider } from '../context/GameContext'; // Ajusta la ruta

export default function RootLayout() {
  return (
    // Envolvemos TODO con el Provider. 
    // Ahora cualquier pantalla de cualquier Tab podrá usar useGame()
    <GameProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </GameProvider>
  );
}