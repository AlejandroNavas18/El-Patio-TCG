import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  ScrollView, ImageBackground, Image, useWindowDimensions, Animated, Easing 
} from 'react-native';
import { useGame } from '@/context/GameContext';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/types/Card';
import { CARD_IMAGES } from '@/constants/ImageMap';

type FilterType = 'all' | 'owned' | 'missing';

// COMPONENTE PARA LA CARTA ANIMADA
const ShinyCard = ({ item, isOwned, count, cardWidth, cardHeight }: any) => {
  const localImage = CARD_IMAGES[item.id];
  const shineAnim = useRef(new Animated.Value(-1)).current; // Empezamos fuera de la carta

  useEffect(() => {
    if (isOwned) {
      // Configuración de la animación de barrido
      Animated.loop(
        Animated.sequence([
          Animated.timing(shineAnim, {
            toValue: 2, // Cruza hasta el otro lado
            duration: 2500,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.delay(1500), // Pausa antes del siguiente brillo
        ])
      ).start();
    }
  }, [isOwned]);

  // Transformamos el valor de la animación en movimiento diagonal
  const translateX = shineAnim.interpolate({
    inputRange: [-1, 2],
    outputRange: [-cardWidth, cardWidth * 1.5],
  });

  return (
    <View style={[styles.cardWrapper, { width: cardWidth, height: cardHeight }]}>
      <View style={styles.cardMain}>
        <Image 
          source={localImage} 
          style={[styles.cardImage, !isOwned && styles.lockedImage]}
          blurRadius={isOwned ? 0 : 20}
          resizeMode="contain"
        />

        {/* CAPA DE BRILLO (Solo si la tiene) */}
        {isOwned && (
          <View style={StyleSheet.absoluteFill}>
            <Animated.View 
              style={[
                styles.shineGradient,
                {
                  width: cardWidth * 0.4,
                  transform: [
                    { translateX },
                    { rotate: '25deg' },
                    { scaleY: 2 }
                  ],
                }
              ]} 
            />
          </View>
        )}

        <View style={styles.idBadge}>
           <Text style={styles.cardId}>#{item.id}</Text>
        </View>

        {!isOwned && (
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={cardWidth * 0.25} color="rgba(255,255,255,0.3)" />
          </View>
        )}

        {isOwned && count > 1 && (
          <View style={styles.badgeCount}>
            <Text style={styles.badgeText}>x{count}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default function CollectionPage() {
  const { allCards, hasCard, user } = useGame();
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedRareza, setSelectedRareza] = useState<string>('Todas');
  const { width } = useWindowDimensions();

  const isDesktop = width > 768;
  const cardWidth = isDesktop ? 180 : (width / 2) - 20; 
  const cardHeight = cardWidth * 1.4;

  const stats = useMemo(() => {
    if (!user) return { total: 0, owned: 0, percent: 0, duplicates: 0 };
    const total = allCards.length;
    const owned = new Set(user.inventario.map(c => c.id)).size;
    return {
      total,
      owned,
      percent: total > 0 ? (owned / total) * 100 : 0,
      duplicates: user.inventario.length - owned
    };
  }, [user?.inventario, allCards]);

  const filteredCards = useMemo(() => {
    return allCards.filter(card => {
      const matchStatus = 
        filter === 'all' ? true :
        filter === 'owned' ? hasCard(card.id) : !hasCard(card.id);
      const matchRareza = selectedRareza === 'Todas' ? true : card.rareza === selectedRareza;
      return matchStatus && matchRareza;
    });
  }, [filter, selectedRareza, user?.inventario, allCards]);

  return (
    <ImageBackground 
      source={{ uri: 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?q=80&w=1000&auto=format&fit=crop' }}
      style={styles.container}
    >
      <View style={styles.overlay}>
        <View style={[styles.headerCard, isDesktop && styles.headerDesktop]}>
          <Text style={styles.headerTitle}>ÁLBUM EL PATIO</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}><Text style={styles.statsNumber}>{stats.owned}/{stats.total}</Text><Text style={styles.statsLabel}>CARTAS</Text></View>
            <View style={styles.statBox}><Text style={styles.statsNumber}>{Math.round(stats.percent)}%</Text><Text style={styles.statsLabel}>PROGRESO</Text></View>
            <View style={styles.statBox}><Text style={styles.statsNumber}>{stats.duplicates}</Text><Text style={styles.statsLabel}>REPETIDAS</Text></View>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${stats.percent}%` }]} />
          </View>
        </View>

        <View style={[styles.filterTabs, isDesktop && styles.headerDesktop]}>
          {(['all', 'owned', 'missing'] as FilterType[]).map((t) => (
            <TouchableOpacity key={t} onPress={() => setFilter(t)} style={[styles.tabButton, filter === t && styles.tabButtonActive]}>
              <Text style={[styles.tabText, filter === t && styles.tabTextActive]}>{t === 'all' ? 'TODAS' : t === 'owned' ? 'MIS CARTAS' : 'FALTANTES'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.rarezaContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            {['Todas', 'Normal', 'Super Crack', 'Mago', 'Balon de Oro', 'Entrenador', 'Invencible', 'Torbellino', 'Revelación', 'Duo Imparable', 'Triple Alianza', 'Rompe Tibias'].map((r) => (
              <TouchableOpacity key={r} style={[styles.chip, selectedRareza === r && styles.chipActive]} onPress={() => setSelectedRareza(r)}>
                <Text style={[styles.chipText, selectedRareza === r && styles.chipTextActive]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <FlatList
          data={filteredCards}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ShinyCard 
              item={item} 
              isOwned={hasCard(item.id)} 
              count={user?.inventario.filter(c => c.id === item.id).length || 0}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
            />
          )}
          numColumns={isDesktop ? 0 : 2}
          key={isDesktop ? 'desktop' : 'mobile'} 
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay jugadores en esta sección...</Text>}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(10, 15, 25, 0.96)' },
  headerCard: { backgroundColor: '#1e293b', padding: 15, margin: 15, borderRadius: 15, borderWidth: 1, borderColor: '#334155' },
  headerDesktop: { width: 500, alignSelf: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#fbbf24', textAlign: 'center', marginBottom: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  statBox: { alignItems: 'center' },
  statsNumber: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  statsLabel: { fontSize: 8, color: '#94a3b8', fontWeight: 'bold' },
  progressBarBg: { height: 6, backgroundColor: '#0f172a', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#fbbf24' },
  filterTabs: { flexDirection: 'row', marginHorizontal: 15, backgroundColor: '#0f172a', borderRadius: 10, padding: 4, marginBottom: 10 },
  tabButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabButtonActive: { backgroundColor: '#334155' },
  tabText: { color: '#64748b', fontWeight: 'bold', fontSize: 10 },
  tabTextActive: { color: '#fff' },
  rarezaContainer: { marginBottom: 15 },
  filtersScroll: { 
    paddingHorizontal: 15,
    flexGrow: 1, 
    justifyContent: 'center' 
  },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', marginRight: 8, borderWidth: 1, borderColor: '#334155' },
  chipActive: { backgroundColor: '#fbbf24', borderColor: '#fbbf24' },
  chipText: { color: '#94a3b8', fontSize: 10, fontWeight: 'bold' },
  chipTextActive: { color: '#000' },
  grid: { paddingHorizontal: 10, paddingBottom: 100, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  cardWrapper: { margin: 8 },
  cardMain: { flex: 1, position: 'relative', overflow: 'hidden', borderRadius: 12 },
  cardImage: { width: '100%', height: '100%' },
  lockedImage: { opacity: 0.25, tintColor: '#000' },
  
  // ESTILO DEL BRILLO
  shineGradient: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 5,
    position: 'absolute',
  },

  lockOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  idBadge: { position: 'absolute', top: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 4, borderRadius: 4 },
  cardId: { color: '#fff', fontSize: 8, fontWeight: 'bold' },
  badgeCount: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#ef4444', minWidth: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#fff' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#64748b', fontWeight: 'bold' }
});