import { AccordionItem } from '@/components/componente-acordeon';
import { useGame } from '@/context/GameContext'; // Ajusta la ruta a tu context
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function perfil() {
  const { user } = useGame();
  const handleLogout = () => {
    console.log("Cerrando sesión...");
    // Aquí irá: auth().signOut() de Firebase
  };
  // Datos simulados (ya los agregaremos al Context después)
  const wins = 10;
  const losses = 5;
  const totalGames = wins + losses;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
  
  // Calculamos cartas únicas del inventario
  const uniqueCards = new Set(user?.inventario.map((card) => card.id)).size;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        
        {/* HEADER: Perfil con iniciales */}
        <View style={styles.headerCard}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.username.substring(0, 2).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.userName}>{user?.username}</Text>
              <Text style={styles.userSub}>Coleccionista de Élite</Text>
            </View>
          </View>

          {/* ESTADÍSTICAS PRINCIPALES (Grid 2x2) */}
          <View style={styles.statsGrid}>
            <StatBox 
              icon={<FontAwesome5 name="coins" size={20} color="#ca8a04" />} 
              value={user?.monedas ?? 0} 
              label="Monedas" 
              color="#fefce8" 
            />
            <StatBox 
              icon={<MaterialCommunityIcons name="cards-playing-outline" size={24} color="#2563eb" />} 
              value={uniqueCards} 
              label="Cartas" 
              color="#eff6ff" 
            />
            <StatBox 
              icon={<Ionicons name="trophy" size={22} color="#16a34a" />} 
              value={wins} 
              label="Victorias" 
              color="#f0fdf4" 
            />
            <StatBox 
              icon={<MaterialCommunityIcons name="target" size={24} color="#9333ea" />} 
              value={`${winRate}%`} 
              label="Win Rate" 
              color="#faf5ff" 
            />
          </View>
        </View>

        {/* SECCIÓN: Estadísticas de Batalla */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estadísticas de Batalla</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Partidas jugadas</Text>
            <Text style={styles.rowValue}>{totalGames}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Derrotas</Text>
            <Text style={[styles.rowValue, { color: '#dc2626' }]}>{losses}</Text>
          </View>
          
          {/* Barra de Progreso Manual */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Progreso de victorias</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${winRate}%` }]} />
            </View>
          </View>
        </View>

        <View style={styles.guideContainer}>
          <View style={styles.guideHeader}>
            <Ionicons name="book-outline" size={24} color="#2563eb" />
            <Text style={styles.sectionTitle}>Guía y Tutoriales</Text>
          </View>

          <AccordionItem title="¿Cómo abrir sobres?">
            <Text style={styles.guideText}>
              Para abrir sobres, ve al tab <Text style={styles.bold}>Home</Text> y haz clic en el botón "Abrir Sobre".{"\n"}
              Cada sobre cuesta <Text style={styles.boldGold}>100 monedas</Text> y contiene <Text style={styles.bold}>5 cartas aleatorias</Text>.
            </Text>
            <View style={styles.listContainer}>
              <Text style={styles.guideText}>• <Text style={styles.bold}>Cartas Base (75%)</Text>: Jugadores estándar</Text>
              <Text style={styles.guideText}>• <Text style={styles.bold}>Cartas Especiales (20%)</Text>: Versiones mejoradas</Text>
              <Text style={styles.guideText}>• <Text style={styles.bold}>Entrenadores (5%)</Text>: Bonificaciones de equipo</Text>
            </View>
          </AccordionItem>

          <AccordionItem title="Tipos de cartas">
            <Text style={[styles.bold, { color: '#2563eb', marginBottom: 4 }]}>Cartas de Jugador</Text>
            <Text style={styles.guideText}>Tienen tres estadísticas clave:</Text>
            <View style={styles.listContainer}>
              <Text style={styles.guideText}>• <Text style={{color: '#2563eb', fontWeight: '700'}}>Overall</Text>: Valoración total</Text>
              <Text style={styles.guideText}>• <Text style={{color: '#16a34a', fontWeight: '700'}}>Ataque</Text>: Poder ofensivo</Text>
              <Text style={styles.guideText}>• <Text style={{color: '#dc2626', fontWeight: '700'}}>Defensa</Text>: Capacidad defensiva</Text>
            </View>
          </AccordionItem>

          <AccordionItem title="Reglas de combate 1v1">
            <Text style={styles.bold}>Formación del equipo</Text>
            <Text style={styles.guideText}>Selecciona 7 jugadores y 1 entrenador antes de la batalla.{"\n"}</Text>
            
            <Text style={styles.bold}>Desarrollo</Text>
            <Text style={styles.guideText}>
              1. Se decide quién empieza al azar.{"\n"}
              2. El atacante elige <Text style={{color: '#16a34a'}}>ATACAR</Text> o <Text style={{color: '#dc2626'}}>DEFENDER</Text>.{"\n"}
              3. Se comparan cartas. El valor más alto anota un GOL.{"\n"}
              4. Gana quien tenga más goles tras 7 rondas.
            </Text>
          </AccordionItem>

          <AccordionItem title="Estrategias y consejos">
            <View style={{ gap: 10 }}>
              <View style={styles.rowAlign}>
                <MaterialCommunityIcons name="zap" size={16} color="#16a34a" />
                <Text style={[styles.bold, { color: '#16a34a' }]}> Estrategia de Ataque</Text>
              </View>
              <Text style={styles.guideText}>Usa tus cartas con mayor ataque cuando seas el jugador activo para romper la defensa rival.</Text>
              
              <View style={styles.rowAlign}>
                <MaterialCommunityIcons name="shield-check" size={16} color="#dc2626" />
                <Text style={[styles.bold, { color: '#dc2626' }]}> Estrategia de Defensa</Text>
              </View>
              <Text style={styles.guideText}>Guarda tus mejores defensores para los turnos donde el oponente tiene la iniciativa.</Text>
            </View>
          </AccordionItem>

          <AccordionItem title="Gestión de la colección">
            <Text style={styles.guideText}>
              En el tab <Text style={styles.bold}>Colección</Text> puedes ver tu progreso. Los duplicados se marcan con un contador y las cartas que te faltan aparecen sombreadas.
            </Text>
          </AccordionItem>
        </View>
        <TouchableOpacity 
  style={styles.logoutButton} 
  onPress={() => handleLogout()}
>
  <MaterialCommunityIcons name="logout" size={20} color="#dc2626" />
  <Text style={styles.logoutText}>Cerrar Sesión</Text>
</TouchableOpacity>



      </ScrollView>
    </SafeAreaView>
  );
}

// Sub-componente para las cajitas de stats (Para no repetir código)
function StatBox({ icon, value, label, color }: any) {
  return (
    <View style={[styles.statBox, { backgroundColor: color }]}>
      {icon}
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1, padding: 20 },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 15 },
  avatar: { 
    width: 70, height: 70, borderRadius: 35, 
    backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center' 
  },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  userSub: { color: '#64748b' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  statBox: { 
    width: '48%', padding: 15, borderRadius: 15, alignItems: 'center', justifyContent: 'center' 
  },
  statValue: { fontSize: 18, fontWeight: 'bold', marginTop: 5 },
  statLabel: { fontSize: 12, color: '#64748b' },
  section: { 
    backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20 
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#1e293b' },
  row: { 
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, 
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9' 
  },
  rowLabel: { color: '#64748b' },
  rowValue: { fontWeight: 'bold', color: '#1e293b' },
  progressContainer: { marginTop: 15 },
  progressLabel: { fontSize: 12, color: '#64748b', marginBottom: 5 },
  progressBarBg: { height: 10, backgroundColor: '#e2e8f0', borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#22c55e' },
  guideContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 40, // Espacio extra al final para que no lo tape el tab bar
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  guideText: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
  boldGold: {
    fontWeight: 'bold',
    color: '#ca8a04',
  },
  listContainer: {
    marginTop: 8,
    paddingLeft: 10,
    gap: 4,
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    padding: 15,
    borderRadius: 15,
    marginTop: 10,
    marginBottom: 50, // Espacio para que no lo tape el tab bar
    gap: 10,
  },
  logoutText: {
    color: '#dc2626',
    fontWeight: 'bold',
    fontSize: 16,
  },
});