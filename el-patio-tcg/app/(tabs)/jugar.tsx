import React, { useState, useMemo } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, FlatList, 
  ImageBackground, Modal, Image, ScrollView, ActivityIndicator, Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGame } from '@/context/GameContext';
import { CARD_IMAGES } from '@/constants/ImageMap';
import { Card } from '@/types/Card';

const { width } = Dimensions.get('window');

export default function PartidasPage() {
  const { 
    user, 
    selectedTeam, 
    selectedCoach, 
    toggleCardToTeam, 
    selectCoach, 
    registrarResultado 
  } = useGame();

  // --- ESTADOS DE UI ---
  const [modalVisible, setModalVisible] = useState(false);
  const [selectingType, setSelectingType] = useState<'player' | 'coach'>('player');
  const [gameState, setGameState] = useState<'PREPARING' | 'SEARCHING' | 'BATTLE' | 'RESULT'>('PREPARING');
  
  // --- ESTADOS DE PARTIDA ---
  const [round, setRound] = useState(1);
  const [userScore, setUserScore] = useState(0);
  const [rivalScore, setRivalScore] = useState(0);
  const [turnOwner, setTurnOwner] = useState<'USER' | 'RIVAL'>('USER'); 
  const [currentAction, setCurrentAction] = useState<'ATACAR' | 'DEFENDER' | null>(null);
  const [usedCardsIds, setUsedCardsIds] = useState<number[]>([]);
  const [lastBattleDetail, setLastBattleDetail] = useState<{userV: number, rivalV: number, msg: string} | null>(null);

  // --- FUNCIONES DE SELECCIÓN (Definidas aquí para evitar el error "not defined") ---
  const openSelector = (type: 'player' | 'coach') => {
    setSelectingType(type);
    setModalVisible(true);
  };

  const handleSelectCoach = (card: Card) => {
    if (selectedCoach && selectedCoach.id === card.id) {
      selectCoach(null); // Deseleccionar si ya estaba puesto
    } else {
      selectCoach(card);
    }
  };

  // --- LÓGICA DE BATALLA ---
  const startSearching = () => {
    // REINICIO TOTAL PARA PARTIDA NUEVA
    setRound(1);
    setUserScore(0);
    setRivalScore(0);
    setUsedCardsIds([]);
    setLastBattleDetail(null);
    setCurrentAction(null);
    
    setGameState('SEARCHING');

    setTimeout(() => {
      setGameState('BATTLE');
      const startsFirst = Math.random() > 0.5 ? 'USER' : 'RIVAL';
      setTurnOwner(startsFirst);
      if (startsFirst === 'RIVAL') simularAccionRival();
    }, 2500);
  };

  const simularAccionRival = () => {
    setCurrentAction(null);
    setTimeout(() => {
      setCurrentAction(Math.random() > 0.5 ? 'ATACAR' : 'DEFENDER');
    }, 2000);
  };

  const handleBattleCardClick = (myCard: Card) => {
    if (usedCardsIds.includes(myCard.id) || !currentAction) return;

    // Simular carta rival del inventario
    const rivalCard = user?.inventario[Math.floor(Math.random() * user.inventario.length)] || myCard;
    
    let uVal = 0, rVal = 0;
    if (turnOwner === 'USER') {
      uVal = currentAction === 'ATACAR' ? myCard.ataque : myCard.defensa;
      rVal = currentAction === 'ATACAR' ? rivalCard.defensa : rivalCard.ataque;
    } else {
      uVal = currentAction === 'ATACAR' ? myCard.defensa : myCard.ataque;
      rVal = currentAction === 'ATACAR' ? rivalCard.ataque : rivalCard.defensa;
    }

    // Desempate por total
    const uTotal = myCard.ataque + myCard.defensa;
    const rTotal = rivalCard.ataque + rivalCard.defensa;
    const winRound = uVal === rVal ? (uTotal >= rTotal) : uVal > rVal;

    if (winRound) setUserScore(s => s + 1);
    else setRivalScore(s => s + 1);

    setUsedCardsIds([...usedCardsIds, myCard.id]);
    setLastBattleDetail({ userV: uVal, rivalV: rVal, msg: winRound ? "¡PUNTO TUYO!" : "PUNTO RIVAL" });

    setTimeout(() => {
      if (round < 7) {
        setRound(r => r + 1);
        const nextT = turnOwner === 'USER' ? 'RIVAL' : 'USER';
        setTurnOwner(nextT);
        setCurrentAction(null);
        setLastBattleDetail(null);
        if (nextT === 'RIVAL') simularAccionRival();
      } else {
        registrarResultado(userScore > rivalScore);
        setGameState('RESULT');
      }
    }, 2200);
  };

  // --- VISTAS ---

  if (gameState === 'SEARCHING') {
    return (
      <View style={styles.searchingScreen}>
        <ActivityIndicator size="large" color="#fbbf24" />
        <Text style={styles.searchingText}>BUSCANDO RIVAL...</Text>
      </View>
    );
  }

  if (gameState === 'BATTLE') {
    return (
      <View style={styles.battleContainer}>
        <View style={styles.battleHeader}>
          <View style={styles.scoreBadge}><Text style={styles.scoreName}>TÚ</Text><Text style={styles.scoreValue}>{userScore}</Text></View>
          <View style={styles.roundInfo}><Text style={styles.roundNumber}>RONDA {round}/7</Text></View>
          <View style={[styles.scoreBadge, {alignItems: 'flex-end'}]}><Text style={styles.scoreName}>RIVAL</Text><Text style={[styles.scoreValue, {color: '#f87171'}]}>{rivalScore}</Text></View>
        </View>

        <View style={styles.actionCenter}>
          {lastBattleDetail ? (
            <View style={styles.resultAnimation}>
              <Text style={styles.resultMsgText}>{lastBattleDetail.msg}</Text>
              <Text style={styles.vsRowText}>{lastBattleDetail.userV} <Text style={{color: '#64748b', fontSize: 20}}>VS</Text> {lastBattleDetail.rivalV}</Text>
            </View>
          ) : turnOwner === 'RIVAL' && !currentAction ? (
            <View style={styles.waitingContainer}>
              <ActivityIndicator color="#fbbf24" />
              <Text style={styles.waitingText}>EL RIVAL ESTÁ DECIDIENDO...</Text>
            </View>
          ) : (
            <View style={{alignItems: 'center'}}>
              <Text style={styles.turnTitleText}>{!currentAction ? "ELIGE TU ACCIÓN" : `MODO: ${currentAction}`}</Text>
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
                    <View style={[styles.statItem, {backgroundColor: '#3b82f6'}]}><Text style={styles.statTxt}>{card.ataque + card.defensa}</Text></View>
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
    return (
      <View style={[styles.resultScreen, {backgroundColor: victory ? '#064e3b' : '#450a0a'}]}>
        <Ionicons name={victory ? "trophy" : "close-circle"} size={100} color={victory ? "#fbbf24" : "#f87171"} />
        <Text style={styles.resTitle}>{victory ? "¡VICTORIA!" : "DERROTA"}</Text>
        <Text style={styles.resScore}>{userScore} - {rivalScore}</Text>
        <TouchableOpacity style={styles.resBtn} onPress={() => setGameState('PREPARING')}><Text style={styles.resBtnText}>CONTINUAR</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?q=80' }} style={styles.container}>
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.mainTitle}>PREPARAR BATALLA</Text>
          <View style={styles.teamGrid}>
            {[...Array(7)].map((_, i) => (
              <TouchableOpacity key={i} style={[styles.cardSlot, selectedTeam[i] && styles.slotFilled]} onPress={() => openSelector('player')}>
                {selectedTeam[i] ? <Image source={CARD_IMAGES[selectedTeam[i].id]} style={styles.slotImage} resizeMode="contain" /> : <Ionicons name="add" size={30} color="#334155" />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.cardSlot, styles.coachSlot]} onPress={() => openSelector('coach')}>
              {selectedCoach ? <Image source={CARD_IMAGES[selectedCoach.id]} style={styles.slotImage} resizeMode="contain" /> : <Ionicons name="shirt-outline" size={30} color="#fbbf24" />}
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[styles.btnPlay, selectedTeam.length < 7 && {opacity: 0.5}]} onPress={startSearching} disabled={selectedTeam.length < 7}>
            <Text style={styles.btnPlayText}>BUSCAR PARTIDA</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>SELECCIONAR</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close-circle" size={35} color="#ef4444" /></TouchableOpacity>
            </View>
            <FlatList
              data={user?.inventario.filter(c => selectingType === 'coach' ? c.rareza === 'Entrenador' : c.rareza !== 'Entrenador')}
              numColumns={3}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.miniCard, (selectedTeam.some(c => c.id === item.id) || selectedCoach?.id === item.id) && {borderColor: '#fbbf24', borderWidth: 2}]} 
                  onPress={() => selectingType === 'coach' ? handleSelectCoach(item) : toggleCardToTeam(item)}
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(10,15,25,0.95)', padding: 20 },
  mainTitle: { color: '#fbbf24', fontSize: 22, fontWeight: '900', textAlign: 'center', marginVertical: 20 },
  teamGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  cardSlot: { width: width * 0.18, height: width * 0.25, backgroundColor: '#0f172a', borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  slotFilled: { borderColor: '#fbbf24' },
  slotImage: { width: '100%', height: '100%', borderRadius: 6 },
  coachSlot: { borderColor: '#fbbf24', borderWidth: 2 },
  btnPlay: { backgroundColor: '#fbbf24', padding: 18, borderRadius: 15, marginTop: 30, alignItems: 'center' },
  btnPlayText: { color: '#000', fontWeight: '900' },
  
  battleContainer: { flex: 1, backgroundColor: '#0a0f19', paddingTop: 40 },
  battleHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 25 },
  scoreValue: { color: '#fbbf24', fontSize: 32, fontWeight: '900' },
  scoreName: { color: '#64748b', fontSize: 10, fontWeight: 'bold' },
  roundNumber: { color: '#fff', fontSize: 16, fontWeight: 'bold', backgroundColor: '#1e293b', padding: 8, borderRadius: 10 },

  actionCenter: { height: 180, justifyContent: 'center', alignItems: 'center' },
  resultMsgText: { color: '#fbbf24', fontSize: 24, fontWeight: '900' },
  vsRowText: { color: '#fff', fontSize: 40, fontWeight: '900' },
  waitingText: { color: '#fbbf24', marginTop: 10, fontWeight: 'bold' },
  turnTitleText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  actionRow: { flexDirection: 'row', gap: 15, marginTop: 20 },
  btnAction: { width: width * 0.35, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  btnActionText: { color: '#fff', fontWeight: '900' },

  handSection: { marginTop: 'auto', paddingBottom: 170 }, // Más arriba para evitar tabs
  handScroll: { paddingHorizontal: 20, gap: 15 },
  battleCard: { width: width * 0.45, height: width * 0.65, backgroundColor: '#1e293b', borderRadius: 15, overflow: 'hidden' },
  cardImg: { width: '100%', height: '75%' },
  statsRow: { flexDirection: 'row', height: '25%' },
  statItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statTxt: { color: '#fff', fontWeight: '900', fontSize: 18 },
  cardUsed: { opacity: 0.15 },

  resultScreen: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  resTitle: { color: '#fff', fontSize: 32, fontWeight: '900', marginVertical: 20 },
  resScore: { color: '#fbbf24', fontSize: 60, fontWeight: '900' },
  resBtn: { backgroundColor: '#fff', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 15, marginTop: 40 },
  resBtnText: { fontWeight: '900' },

  searchingScreen: { flex: 1, backgroundColor: '#0a0f19', justifyContent: 'center', alignItems: 'center' },
  searchingText: { color: '#fbbf24', fontWeight: '900', marginTop: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1e293b', borderRadius: 20, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  modalTitle: { color: '#fbbf24', fontWeight: 'bold' },
  miniCard: { width: '30%', aspectRatio: 0.7, margin: '1.5%', backgroundColor: '#0f172a', borderRadius: 8 }
});