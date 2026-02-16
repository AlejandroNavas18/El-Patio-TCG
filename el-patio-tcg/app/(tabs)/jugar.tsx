import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, FlatList, 
  ImageBackground, Modal, Image, ScrollView, ActivityIndicator, Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGame } from '@/context/GameContext';
import { CARD_IMAGES } from '@/constants/ImageMap';
import { Card, Rareza } from '@/types/Card';

const { width } = Dimensions.get('window');

type Difficulty = 'FACIL' | 'NORMAL' | 'DIFICIL';

export default function PartidasPage() {
  const { 
    user, 
    selectedTeam, 
    selectedCoach, 
    toggleCardToTeam, 
    selectCoach, 
    registrarResultado,
    addCoins,
    allCards 
  } = useGame();

  // --- ESTADOS DE UI ---
  const [modalVisible, setModalVisible] = useState(false);
  const [selectingType, setSelectingType] = useState<'player' | 'coach'>('player');
  const [gameState, setGameState] = useState<'PREPARING' | 'SEARCHING' | 'BATTLE' | 'RESULT'>('PREPARING');
  const [difficulty, setDifficulty] = useState<Difficulty>('FACIL');
  
  // --- ESTADOS DE PARTIDA ---
  const [round, setRound] = useState(1);
  const [userScore, setUserScore] = useState(0);
  const [rivalScore, setRivalScore] = useState(0);
  const [turnOwner, setTurnOwner] = useState<'USER' | 'RIVAL'>('USER'); 
  const [currentAction, setCurrentAction] = useState<'ATACAR' | 'DEFENDER' | null>(null);
  
  // Gestión de cartas usadas
  const [usedCardsIds, setUsedCardsIds] = useState<string[]>([]); // Cartas del Usuario
  const [rivalDeck, setRivalDeck] = useState<Card[]>([]);        // Mazo fijo del Bot
  const [rivalUsedIds, setRivalUsedIds] = useState<string[]>([]); // Cartas usadas por el Bot

  const [lastBattleDetail, setLastBattleDetail] = useState<{userV: number, rivalV: number, msg: string, rivalCardName: string} | null>(null);

  const openSelector = (type: 'player' | 'coach') => {
    setSelectingType(type);
    setModalVisible(true);
  };

  // --- LÓGICA DE PREPARACIÓN DEL BOT ---
  const generateRivalDeck = (diff: Difficulty): Card[] => {
    let pool: Card[] = [];
    if (diff === 'FACIL') {
      pool = allCards.filter(c => c.total < 150 && c.rareza !== 'Entrenador');
    } else if (diff === 'NORMAL') {
      pool = allCards.filter(c => c.total >= 150 && c.total < 180 && c.rareza !== 'Entrenador');
    } else {
      const topRarezas: Rareza[] = ['Invencible', 'Balon de Oro', 'Triple Alianza', 'Duo Imparable'];
      pool = allCards.filter(c => topRarezas.includes(c.rareza));
    }

    // Mezclar pool y tomar 7 únicas
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 7);
  };

  // --- LÓGICA DE BATALLA ---
  const startSearching = () => {
    // 1. Resetear estados
    setRound(1);
    setUserScore(0);
    setRivalScore(0);
    setUsedCardsIds([]);
    setRivalUsedIds([]);
    setLastBattleDetail(null);
    setCurrentAction(null);
    
    // 2. Generar el mazo que el bot usará toda la partida
    const newRivalDeck = generateRivalDeck(difficulty);
    setRivalDeck(newRivalDeck);

    setGameState('SEARCHING');

    setTimeout(() => {
      setGameState('BATTLE');
      const startsFirst = Math.random() > 0.5 ? 'USER' : 'RIVAL';
      setTurnOwner(startsFirst);
      if (startsFirst === 'RIVAL') simularAccionRival();
    }, 2000);
  };

  const simularAccionRival = () => {
    setCurrentAction(null);
    setTimeout(() => {
      setCurrentAction(Math.random() > 0.5 ? 'ATACAR' : 'DEFENDER');
    }, 1500);
  };

  const handleBattleCardClick = (myCard: Card) => {
    if (usedCardsIds.includes(myCard.id) || !currentAction) return;

    // 1. El bot elige una carta de SU mazo que NO haya usado
    const availableRivalCards = rivalDeck.filter(c => !rivalUsedIds.includes(c.id));
    const rivalCard = availableRivalCards[Math.floor(Math.random() * availableRivalCards.length)];
    
    // 2. Cálculo de valores
    let uVal = 0, rVal = 0;
    if (turnOwner === 'USER') {
      uVal = currentAction === 'ATACAR' ? myCard.ataque : myCard.defensa;
      rVal = currentAction === 'ATACAR' ? rivalCard.defensa : rivalCard.ataque;
    } else {
      uVal = currentAction === 'ATACAR' ? myCard.defensa : myCard.ataque;
      rVal = currentAction === 'ATACAR' ? rivalCard.ataque : rivalCard.defensa;
    }

    const winRound = uVal === rVal ? (myCard.total >= rivalCard.total) : uVal > rVal;

    if (winRound) setUserScore(s => s + 1);
    else setRivalScore(s => s + 1);

    // 3. Registrar cartas como usadas
    setUsedCardsIds([...usedCardsIds, myCard.id]);
    setRivalUsedIds([...rivalUsedIds, rivalCard.id]);

    setLastBattleDetail({ 
      userV: uVal, 
      rivalV: rVal, 
      msg: winRound ? "¡PUNTO TUYO!" : "PUNTO RIVAL",
      rivalCardName: rivalCard.nombre 
    });

    // 4. Pasar de ronda
    setTimeout(() => {
      if (round < 7) {
        setRound(r => r + 1);
        const nextT = turnOwner === 'USER' ? 'RIVAL' : 'USER';
        setTurnOwner(nextT);
        setCurrentAction(null);
        setLastBattleDetail(null);
        if (nextT === 'RIVAL') simularAccionRival();
      } else {
        const victory = userScore > rivalScore;
        registrarResultado(victory);
        if (victory && addCoins) {
          const reward = difficulty === 'DIFICIL' ? 250 : difficulty === 'NORMAL' ? 100 : 50;
          addCoins(reward);
        }
        setGameState('RESULT');
      }
    }, 2000);
  };

  // --- RENDERS (Sin cambios significativos en el return, misma UI) ---

  if (gameState === 'SEARCHING') {
    return (
      <View style={styles.searchingScreen}>
        <ActivityIndicator size="large" color="#fbbf24" />
        <Text style={styles.searchingText}>BUSCANDO RIVAL ({difficulty})...</Text>
      </View>
    );
  }

  if (gameState === 'BATTLE') {
    return (
      <View style={styles.battleContainer}>
        <View style={styles.battleHeader}>
          <View style={styles.scoreBadge}><Text style={styles.scoreName}>TÚ</Text><Text style={styles.scoreValue}>{userScore}</Text></View>
          <View style={styles.roundInfo}><Text style={styles.roundNumber}>RONDA {round}/7</Text></View>
          <View style={[styles.scoreBadge, {alignItems: 'flex-end'}]}><Text style={styles.scoreName}>BOT {difficulty}</Text><Text style={[styles.scoreValue, {color: '#f87171'}]}>{rivalScore}</Text></View>
        </View>

        <View style={styles.actionCenter}>
          {lastBattleDetail ? (
            <View style={styles.resultAnimation}>
              <Text style={styles.resultMsgText}>{lastBattleDetail.msg}</Text>
              <Text style={styles.rivalNameText}>Rival usó: {lastBattleDetail.rivalCardName}</Text>
              <Text style={styles.vsRowText}>{lastBattleDetail.userV} <Text style={{color: '#64748b', fontSize: 16}}>VS</Text> {lastBattleDetail.rivalV}</Text>
            </View>
          ) : turnOwner === 'RIVAL' && !currentAction ? (
            <View style={styles.waitingContainer}>
              <ActivityIndicator color="#fbbf24" />
              <Text style={styles.waitingText}>EL RIVAL PIENSA...</Text>
            </View>
          ) : (
            <View style={{alignItems: 'center'}}>
              <Text style={styles.turnTitleText}>{!currentAction ? "ELIGE UNA ACCIÓN" : `MODO SELECCIONADO: ${currentAction}`}</Text>
              {turnOwner === 'USER' && !currentAction && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={[styles.btnAction, {backgroundColor: '#ef4444'}]} onPress={() => setCurrentAction('ATACAR')}><Text style={styles.btnActionText}>ATACAR</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.btnAction, {backgroundColor: '#22c55e'}]} onPress={() => setCurrentAction('DEFENDER')}><Text style={styles.btnActionText}>DEFENDER</Text></TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.handSection}>
          <ScrollView horizontal contentContainerStyle={styles.handScroll} showsHorizontalScrollIndicator={false}>
            {selectedTeam.map((card) => {
              const used = usedCardsIds.includes(card.id);
              return (
                <TouchableOpacity 
                  key={card.id} 
                  disabled={used || !currentAction || !!lastBattleDetail}
                  onPress={() => handleBattleCardClick(card)}
                  style={[styles.battleCard, used && styles.cardUsed]}
                >
                  <Image source={CARD_IMAGES[card.id]} style={styles.cardImg} resizeMode="contain" />
                  <View style={styles.statsRow}>
                    <View style={[styles.statItem, {backgroundColor: '#ef4444'}]}><Text style={styles.statTxt}>{card.ataque}</Text></View>
                    <View style={[styles.statItem, {backgroundColor: '#22c55e'}]}><Text style={styles.statTxt}>{card.defensa}</Text></View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    );
  }

  if (gameState === 'RESULT') {
    const victory = userScore > rivalScore;
    const coins = difficulty === 'DIFICIL' ? 250 : difficulty === 'NORMAL' ? 100 : 50;
    return (
      <View style={[styles.resultScreen, {backgroundColor: victory ? '#064e3b' : '#450a0a'}]}>
        <Ionicons name={victory ? "trophy" : "close-circle"} size={80} color={victory ? "#fbbf24" : "#f87171"} />
        <Text style={styles.resTitle}>{victory ? "¡VICTORIA!" : "DERROTA"}</Text>
        <Text style={styles.resReward}>{victory ? `+${coins} MONEDAS` : "INTÉNTALO DE NUEVO"}</Text>
        <Text style={styles.resScore}>{userScore} - {rivalScore}</Text>
        <TouchableOpacity style={styles.resBtn} onPress={() => setGameState('PREPARING')}><Text style={styles.resBtnText}>VOLVER AL MENÚ</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?q=80' }} style={styles.container}>
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.mainTitle}>PREPARAR ALINEACIÓN</Text>
          
          <View style={styles.diffContainer}>
            {(['FACIL', 'NORMAL', 'DIFICIL'] as Difficulty[]).map((d) => (
              <TouchableOpacity 
                key={d} 
                onPress={() => setDifficulty(d)}
                style={[styles.diffBtn, difficulty === d && styles.diffBtnActive]}
              >
                <Text style={[styles.diffBtnText, difficulty === d && {color: '#000'}]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.teamGrid}>
            {[...Array(7)].map((_, i) => (
              <TouchableOpacity key={i} style={[styles.cardSlot, selectedTeam[i] && styles.slotFilled]} onPress={() => openSelector('player')}>
                {selectedTeam[i] ? <Image source={CARD_IMAGES[selectedTeam[i].id]} style={styles.slotImage} resizeMode="contain" /> : <Ionicons name="add" size={24} color="#334155" />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.cardSlot, styles.coachSlot]} onPress={() => openSelector('coach')}>
              {selectedCoach ? <Image source={CARD_IMAGES[selectedCoach.id]} style={styles.slotImage} resizeMode="contain" /> : <Ionicons name="shirt-outline" size={24} color="#fbbf24" />}
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.btnPlay, selectedTeam.length < 7 && {opacity: 0.5}]} 
            onPress={startSearching} 
            disabled={selectedTeam.length < 7}
          >
            <Text style={styles.btnPlayText}>INICIAR PARTIDA ({difficulty})</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>TU INVENTARIO</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close-circle" size={35} color="#ef4444" /></TouchableOpacity>
            </View>
            <FlatList
              data={user?.inventario.filter(c => selectingType === 'coach' ? c.rareza === 'Entrenador' : c.rareza !== 'Entrenador')}
              numColumns={3}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.miniCard, (selectedTeam.some(c => c.id === item.id) || selectedCoach?.id === item.id) && {borderColor: '#fbbf24', borderWidth: 2}]} 
                  onPress={() => selectingType === 'coach' ? selectCoach(item) : toggleCardToTeam(item)}
                >
                  <Image source={CARD_IMAGES[item.id]} style={{width: '100%', height: '100%'}} resizeMode="contain" />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

// ... Estilos (los mismos que tenías)
const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(10,15,25,0.96)', padding: 15 },
  scrollContainer: { paddingBottom: 30 },
  mainTitle: { color: '#fbbf24', fontSize: 22, fontWeight: '900', textAlign: 'center', marginVertical: 20, letterSpacing: 1 },
  diffContainer: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 25 },
  diffBtn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 25, borderWidth: 1.5, borderColor: '#fbbf24' },
  diffBtnActive: { backgroundColor: '#fbbf24' },
  diffBtnText: { color: '#fbbf24', fontWeight: '800', fontSize: 13 },
  teamGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  cardSlot: { width: width * 0.20, height: width * 0.30, backgroundColor: '#0f172a', borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  slotFilled: { borderColor: '#fbbf24', backgroundColor: '#1e293b' },
  slotImage: { width: '100%', height: '100%', borderRadius: 8 },
  coachSlot: { borderColor: '#fbbf24', borderWidth: 2, backgroundColor: 'rgba(251, 191, 36, 0.05)' },
  btnPlay: { backgroundColor: '#fbbf24', padding: 18, borderRadius: 15, marginTop: 30, alignItems: 'center' },
  btnPlayText: { color: '#000', fontWeight: '900', fontSize: 16 },
  battleContainer: { flex: 1, backgroundColor: '#0a0f19', paddingTop: 40 },
  battleHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, alignItems: 'center' },
  scoreBadge: { width: 80 },
  scoreValue: { color: '#fbbf24', fontSize: 32, fontWeight: '900' },
  scoreName: { color: '#64748b', fontSize: 11, fontWeight: 'bold' },
  roundInfo: { backgroundColor: '#1e293b', paddingVertical: 6, paddingHorizontal: 15, borderRadius: 12 },
  roundNumber: { color: '#fff', fontSize: 14, fontWeight: '900' },
  actionCenter: { height: 160, justifyContent: 'center', alignItems: 'center' },
  resultAnimation: { alignItems: 'center' },
  resultMsgText: { color: '#fbbf24', fontSize: 24, fontWeight: '900' },
  rivalNameText: { color: '#94a3b8', fontSize: 13 },
  vsRowText: { color: '#fff', fontSize: 38, fontWeight: '900' },
  waitingContainer: { alignItems: 'center' },
  waitingText: { color: '#fbbf24', marginTop: 10, fontWeight: '800' },
  turnTitleText: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 15 },
  actionRow: { flexDirection: 'row', gap: 12 },
  btnAction: { width: width * 0.35, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  btnActionText: { color: '#fff', fontWeight: '900' },
  handSection: { marginTop: 'auto', paddingBottom: 110 }, 
  handScroll: { paddingHorizontal: 20, gap: 15 },
  battleCard: { width: width * 0.32, height: width * 0.48, backgroundColor: '#1e293b', borderRadius: 15, overflow: 'hidden' },
  cardImg: { width: '100%', height: '72%' },
  statsRow: { flexDirection: 'row', height: '28%' },
  statItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statTxt: { color: '#fff', fontWeight: '900' },
  cardUsed: { opacity: 0.1, backgroundColor: '#000' },
  resultScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  resTitle: { color: '#fff', fontSize: 32, fontWeight: '900' },
  resReward: { color: '#fbbf24', fontSize: 18 },
  resScore: { color: '#fff', fontSize: 60, fontWeight: '900' },
  resBtn: { backgroundColor: '#fff', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 15 },
  resBtnText: { fontWeight: '900', color: '#000' },
  searchingScreen: { flex: 1, backgroundColor: '#0a0f19', justifyContent: 'center', alignItems: 'center' },
  searchingText: { color: '#fbbf24', fontWeight: '900', marginTop: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1e293b', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, height: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { color: '#fbbf24', fontWeight: '900' },
  miniCard: { width: '30%', aspectRatio: 0.7, margin: '1.5%', backgroundColor: '#0f172a', borderRadius: 10 }
});