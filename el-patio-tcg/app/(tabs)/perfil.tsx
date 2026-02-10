import { AccordionItem } from '@/components/componente-acordeon';
import { useGame } from '@/context/GameContext';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, ImageBackground } from 'react-native';

export default function Perfil() {
  const { user } = useGame();
  
  const handleLogout = () => {
    console.log("Cerrando sesión...");
  };

  const wins = user?.stats.victorias ?? 0;
  const losses = user?.stats.derrotas ?? 0;
  const totalGames = user?.stats.partidasJugadas ?? 0;
  
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
  
  const uniqueCards = new Set(user?.inventario.map((card) => card.id)).size;

  return (
    <ImageBackground 
      source={{ uri: 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?q=80&w=1000&auto=format&fit=crop' }}
      style={styles.backgroundImage}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            
            {/* HEADER: Perfil con iniciales */}
            <View style={styles.headerCard}>
              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user?.username.substring(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.userName}>{user?.username.toUpperCase()}</Text>
                  <Text style={styles.userSub}>COLECCIONISTA DE ÉLITE</Text>
                </View>
              </View>

              {/* ESTADÍSTICAS PRINCIPALES */}
              <View style={styles.statsGrid}>
                <StatBox 
                  icon={<FontAwesome5 name="coins" size={18} color="#fbbf24" />} 
                  value={user?.monedas ?? 0} 
                  label="MONEDAS" 
                />
                <StatBox 
                  icon={<MaterialCommunityIcons name="cards-playing-outline" size={20} color="#fbbf24" />} 
                  value={uniqueCards} 
                  label="CARTAS" 
                />
                <StatBox 
                  icon={<Ionicons name="trophy" size={20} color="#fbbf24" />} 
                  value={wins} 
                  label="VICTORIAS" 
                />
                <StatBox 
                  icon={<MaterialCommunityIcons name="target" size={20} color="#fbbf24" />} 
                  value={`${winRate}%`} 
                  label="WIN RATE" 
                />
              </View>
            </View>

            {/* SECCIÓN: Estadísticas de Batalla */}
            <View style={styles.darkSection}>
              <Text style={styles.sectionTitle}>ESTADÍSTICAS DE BATALLA</Text>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Partidas jugadas</Text>
                <Text style={styles.rowValue}>{totalGames}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Derrotas</Text>
                <Text style={[styles.rowValue, { color: '#ef4444' }]}>{losses}</Text>
              </View>
              
              <View style={styles.progressContainer}>
                <Text style={styles.progressLabel}>PROGRESO DE VICTORIAS</Text>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${winRate}%` }]} />
                </View>
              </View>
            </View>

            {/* SECCIÓN: Guía y Tutoriales (Textos oscuros para fondo claro) */}
            <View style={styles.darkSection}>
              <View style={styles.guideHeader}>
                <Ionicons name="book" size={22} color="#fbbf24" />
                <Text style={styles.sectionTitle}>GUÍA Y TUTORIALES</Text>
              </View>

              <AccordionItem title="¿Cómo abrir sobres?">
                <Text style={styles.guideTextDark}>
                  Para abrir sobres, ve al tab <Text style={styles.boldDark}>Home</Text> y haz clic en el botón "Abrir Sobre".{"\n"}
                  Cada sobre cuesta <Text style={styles.boldGoldDark}>100 monedas</Text> y contiene <Text style={styles.boldDark}>5 cartas aleatorias</Text>.
                </Text>
                <View style={styles.listContainer}>
                  <Text style={styles.guideTextDark}>• <Text style={styles.boldDark}>Cartas Base (75%)</Text>: Jugadores estándar</Text>
                  <Text style={styles.guideTextDark}>• <Text style={styles.boldDark}>Cartas Especiales (20%)</Text>: Versiones mejoradas</Text>
                  <Text style={styles.guideTextDark}>• <Text style={styles.boldDark}>Entrenadores (5%)</Text>: Bonificaciones de equipo</Text>
                </View>
              </AccordionItem>

              <AccordionItem title="Tipos de cartas">
                <Text style={[styles.boldDark, { color: '#1d4ed8', marginBottom: 4 }]}>Cartas de Jugador</Text>
                <Text style={styles.guideTextDark}>Tienen tres estadísticas clave:</Text>
                <View style={styles.listContainer}>
                  <Text style={styles.guideTextDark}>• <Text style={{color: '#1d4ed8', fontWeight: '700'}}>Overall</Text>: Valoración total</Text>
                  <Text style={styles.guideTextDark}>• <Text style={{color: '#15803d', fontWeight: '700'}}>Ataque</Text>: Poder ofensivo</Text>
                  <Text style={styles.guideTextDark}>• <Text style={{color: '#b91c1c', fontWeight: '700'}}>Defensa</Text>: Capacidad defensiva</Text>
                </View>
              </AccordionItem>

              <AccordionItem title="Reglas de combate 1v1">
                <Text style={styles.boldDark}>Formación del equipo</Text>
                <Text style={styles.guideTextDark}>Selecciona 7 jugadores y 1 entrenador antes de la batalla.{"\n"}</Text>
                
                <Text style={styles.boldDark}>Desarrollo</Text>
                <Text style={styles.guideTextDark}>
                  1. Se decide quién empieza al azar.{"\n"}
                  2. El atacante elige <Text style={{color: '#15803d', fontWeight: 'bold'}}>ATACAR</Text> o <Text style={{color: '#b91c1c', fontWeight: 'bold'}}>DEFENDER</Text>.{"\n"}
                  3. Se comparan cartas. El valor más alto anota un GOL.{"\n"}
                  4. Gana quien tenga más goles tras 7 rondas.
                </Text>
              </AccordionItem>

              <AccordionItem title="Estrategias y consejos">
                <View style={{ gap: 10 }}>
                  <View style={styles.rowAlign}>
                    <MaterialCommunityIcons name="zap" size={16} color="#15803d" />
                    <Text style={[styles.boldDark, { color: '#15803d' }]}> Estrategia de Ataque</Text>
                  </View>
                  <Text style={styles.guideTextDark}>Usa tus cartas con mayor ataque cuando seas el jugador activo para romper la defensa rival.</Text>
                  
                  <View style={styles.rowAlign}>
                    <MaterialCommunityIcons name="shield-check" size={16} color="#b91c1c" />
                    <Text style={[styles.boldDark, { color: '#b91c1c' }]}> Estrategia de Defensa</Text>
                  </View>
                  <Text style={styles.guideTextDark}>Guarda tus mejores defensores para los turnos donde el oponente tiene la iniciativa.</Text>
                </View>
              </AccordionItem>

              <AccordionItem title="Gestión de la colección">
                <Text style={styles.guideTextDark}>
                  En el tab <Text style={styles.boldDark}>Colección</Text> puedes ver tu progreso. Los duplicados se marcan con un contador y las cartas que te faltan aparecen sombreadas.
                </Text>
              </AccordionItem>
            </View>

            {/* BOTÓN CERRAR SESIÓN */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <MaterialCommunityIcons name="logout" size={20} color="#fff" />
              <Text style={styles.logoutText}>CERRAR SESIÓN</Text>
            </TouchableOpacity>

          </ScrollView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

function StatBox({ icon, value, label }: any) {
  return (
    <View style={styles.statBox}>
      {icon}
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.9)' },
  safeArea: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  
  headerCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 25, gap: 15 },
  avatar: { 
    width: 65, height: 65, borderRadius: 12, 
    backgroundColor: '#fbbf24', justifyContent: 'center', alignItems: 'center',
    transform: [{ rotate: '-3deg' }]
  },
  avatarText: { color: '#000', fontSize: 26, fontWeight: '900' },
  userName: { fontSize: 22, fontWeight: '900', color: '#fff' },
  userSub: { color: '#fbbf24', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  statBox: { 
    width: '48%', padding: 15, borderRadius: 15, alignItems: 'center', 
    backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155'
  },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginTop: 5 },
  statLabel: { fontSize: 10, color: '#94a3b8', fontWeight: 'bold' },

  darkSection: { 
    backgroundColor: '#1e293b', borderRadius: 20, padding: 20, marginBottom: 20,
    borderWidth: 1, borderColor: '#334155'
  },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#fbbf24', marginBottom: 15 },
  row: { 
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, 
    borderBottomWidth: 1, borderBottomColor: '#334155' 
  },
  rowLabel: { color: '#94a3b8', fontWeight: '600' },
  rowValue: { fontWeight: 'bold', color: '#fff' },
  
  progressContainer: { marginTop: 15 },
  progressLabel: { fontSize: 10, color: '#94a3b8', marginBottom: 8, fontWeight: 'bold' },
  progressBarBg: { height: 10, backgroundColor: '#0f172a', borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#22c55e' },

  // --- ESTILOS PARA EL CONTENIDO DEL ACORDEÓN (FONDO CLARO) ---
  guideHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  guideTextDark: { 
    color: '#1e293b', // Azul oscuro profundo para fondo blanco
    fontSize: 14, 
    lineHeight: 22,
    fontWeight: '500'
  },
  boldDark: { 
    fontWeight: 'bold', 
    color: '#0f172a' 
  },
  boldGoldDark: { 
    fontWeight: 'bold', 
    color: '#ca8a04' // Dorado más oscuro para que se vea bien en blanco
  },
  listContainer: { marginTop: 8, paddingLeft: 10, gap: 4 },
  rowAlign: { flexDirection: 'row', alignItems: 'center' },

  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#ef4444', padding: 18, borderRadius: 15, gap: 10,
    marginTop: 10
  },
  logoutText: { color: '#fff', fontWeight: '900', fontSize: 15 },
});