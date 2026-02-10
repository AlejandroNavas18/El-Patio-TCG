import { View, Text, StyleSheet } from 'react-native';

export default function partidas() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pantalla de Partidas</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});