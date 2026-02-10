import { useGame } from '@/context/GameContext';
import { StyleSheet, Text, View } from 'react-native';


export default function HomeScreen() {
  const {user} = useGame();

  return (
<View style={styles.container}>
      <Text style={styles.welcome}>¡Bienvenido, {user?.username}!</Text>
      
      <View style={styles.coinBadge}>
        <Text style={styles.coins}> PatioCoins: {user?.monedas}</Text>
      </View>
    </View>  );
    
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Esto hace que el View ocupe toda la pantalla
    justifyContent: 'center', // Centra verticalmente
    alignItems: 'center', // Centra horizontalmente
    backgroundColor: '#f5f5f5',
  },
  welcome: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  coinBadge: {
    backgroundColor: '#ffd700',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  coins: {
    fontWeight: '700',
    color: '#5c4d00',
  },
});