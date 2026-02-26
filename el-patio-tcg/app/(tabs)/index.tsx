import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ImageBackground,
  Alert, Modal, ScrollView, Dimensions, Image, Animated
} from 'react-native';
import { useGame } from '@/context/GameContext';
import { SOBRE_IMAGE, CARD_IMAGES } from '@/constants/ImageMap';
import { Card, Rareza } from '@/types/Card';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Definimos un tipo local para manejar el flag "isNew" sin errores
type CardWithNewFlag = Card & { isNew: boolean };

export default function HomeScreen() {
  const { user, gastarMonedas, agregarCarta, allCards, hasCard } = useGame();

  // --- ESTADOS ---
  const [isOpening, setIsOpening] = useState(false);
  const [newCards, setNewCards] = useState<CardWithNewFlag[]>([]);

  // --- ANIMACIONES ---
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // --- LÓGICA DE PROBABILIDADES (Weighted Random) ---
  const getRandomCard = () => {
    const rand = Math.random() * 100;
    let rarezaSel: Rareza;

    if (rand < 1) rarezaSel = 'Invencible';           // 1%
    else if (rand < 4) rarezaSel = 'Balon de Oro';     // 3%
    else if (rand < 10) rarezaSel = 'Triple Alianza';  // 6%
    else if (rand < 16) rarezaSel = 'Duo Imparable';   // 6%
    else if (rand < 26) rarezaSel = 'Mago';             // 10%
    else if (rand < 36) rarezaSel = 'Torbellino';       // 10%
    else if (rand < 46) rarezaSel = 'Rompe Tibias';     // 10%
    else if (rand < 60) rarezaSel = 'Super Crack';      // 14%
    else if (rand < 70) rarezaSel = 'Revelación';       // 10%
    else if (rand < 85) rarezaSel = 'Entrenador';       // 15%
    else rarezaSel = 'Normal';                          // 15%

    const pool = allCards.filter(c => c.rareza === rarezaSel);
    if (pool.length === 0) return allCards.filter(c => c.rareza === 'Normal')[0];
    return pool[Math.floor(Math.random() * pool.length)];
  };

  // --- ACCIÓN: COMPRAR SOBRE CON DELAY ---
  const handleOpenPack = () => {
    const COSTO = 100;
    if (user && user.monedas >= COSTO) {
      // 1. Iniciamos vibración
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 15, duration: 45, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -15, duration: 45, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 15, duration: 45, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 45, useNativeDriver: true }),
      ]).start(() => {

        // 2. Generamos cartas y calculamos si son nuevas ANTES de agregarlas
        const rawRewards = [getRandomCard(), getRandomCard(), getRandomCard()];
        const seenIdsInThisPack = new Set<string>();
        const rewardsWithCheck = rawRewards.map(card => {
          const cardId = String(card.id);
          // Es nueva si: no la tienes en el álbum YA y no ha salido antes en ESTE sobre
          const isNew = !hasCard(cardId) && !seenIdsInThisPack.has(cardId);
          seenIdsInThisPack.add(cardId); // La marcamos como vista para las siguientes del sobre
          return { ...card, isNew };
        });

        // 3. Gastamos las monedas inmediatamente
        if (gastarMonedas(COSTO)) {
          setNewCards(rewardsWithCheck);
          setIsOpening(true);

          // 4. EL RETRASO (DELAY):
          // Esperamos 600ms para agregar las cartas al álbum oficial.
          // Esto garantiza que el Modal ya se pintó con los "tags" correctos.
          setTimeout(() => {
            rawRewards.forEach(c => agregarCarta(c));
          }, 600);
        }
      });
    } else {
      Alert.alert("¡Ups!", "No tienes suficientes PatioCoins.");
    }
  };

  const getRarezaColor = (rareza: string) => {
    switch (rareza) {
      case 'Invencible': return '#ef4444';
      case 'Balon de Oro': return '#fbbf24';
      case 'Mago': return '#a855f7';
      case 'Torbellino': return '#3b82f6';
      case 'Triple Alianza': return '#10b981';
      default: return '#94a3b8';
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?q=80' }}
      style={styles.container}
    >
      <View style={styles.overlay}>

        <View style={styles.topBar}>
          <View style={styles.coinBadge}>
            <Ionicons name="flash" size={18} color="black" />
            <Text style={styles.coinText}>{user?.monedas} COINS</Text>
          </View>
        </View>

        <View style={styles.shopSection}>
          <Text style={styles.shopTitle}>TIENDA DE SOBRES</Text>
          <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
            <TouchableOpacity onPress={handleOpenPack} activeOpacity={0.85}>
              <Image source={SOBRE_IMAGE} style={styles.sobreImg} resizeMode="contain" />
              <View style={styles.priceTag}>
                <Text style={styles.priceText}>100 COINS</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
          <Text style={styles.shopSubtitle}>CONTIENE 3 CARTAS</Text>
        </View>

        <Modal visible={isOpening} animationType="slide" transparent={false}>
          <View style={styles.modalBody}>
            <Text style={styles.modalHeader}>¡SOBRE ABIERTO!</Text>

            <ScrollView contentContainerStyle={styles.rewardList} showsVerticalScrollIndicator={false}>
              {newCards.map((item, index) => (
                <View key={index} style={styles.rewardItem}>
                  <View style={styles.cardFrame}>
                    <Image
                      source={CARD_IMAGES[parseInt(item.id)]}
                      style={styles.cardImgSmall}
                      resizeMode="contain"
                    />
                    {/* Usamos item.isNew que calculamos justo al abrir */}
                    {item.isNew && (
                      <View style={styles.newTag}>
                        <Text style={styles.newTagText}>¡NUEVA!</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardNameText}>{item.nombre}</Text>
                    <Text style={[styles.cardRarezaText, { color: getRarezaColor(item.rareza) }]}>
                      {item.rareza.toUpperCase()}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.collectBtn} onPress={() => setIsOpening(false)}>
              <Text style={styles.collectBtnText}>CONTINUAR</Text>
            </TouchableOpacity>
          </View>
        </Modal>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.85)', paddingHorizontal: 20 },
  topBar: { marginTop: 60, alignItems: 'flex-end' },
  coinBadge: { backgroundColor: '#fbbf24', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, gap: 5 },
  coinText: { fontWeight: '900', fontSize: 14 },
  shopSection: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  shopTitle: { color: '#fbbf24', fontSize: 24, fontWeight: '900', marginBottom: 40, letterSpacing: 2 },
  sobreImg: { width: width * 0.55, height: height * 0.35 },
  priceTag: { backgroundColor: '#ef4444', alignSelf: 'center', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 5, marginTop: -20, transform: [{ rotate: '-5deg' }] },
  priceText: { color: 'white', fontWeight: '900', fontSize: 12 },
  shopSubtitle: { color: '#94a3b8', marginTop: 25, fontWeight: 'bold', fontSize: 12 },
  modalBody: { flex: 1, backgroundColor: '#020617', alignItems: 'center', paddingVertical: 50 },
  modalHeader: { color: '#fbbf24', fontSize: 22, fontWeight: '900', marginBottom: 30 },
  rewardList: { paddingBottom: 40 },
  rewardItem: { flexDirection: 'row', backgroundColor: '#1e293b', width: width * 0.9, borderRadius: 20, marginBottom: 15, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  cardFrame: { width: 100, height: 140 },
  cardImgSmall: { width: '100%', height: '100%' },
  cardInfo: { marginLeft: 20, flex: 1 },
  cardNameText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  cardRarezaText: { fontWeight: '900', fontSize: 12, marginTop: 5 },
  newTag: { position: 'absolute', top: -5, right: -5, backgroundColor: '#ef4444', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5, zIndex: 10 },
  newTagText: { color: 'white', fontSize: 10, fontWeight: '900' },
  collectBtn: { backgroundColor: '#fbbf24', width: '90%', padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 'auto' },
  collectBtnText: { fontWeight: '900', fontSize: 16, color: '#000' }
});