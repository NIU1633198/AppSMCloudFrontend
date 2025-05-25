import React, { useState, useEffect } from "react";
import Icon from 'react-native-vector-icons/Ionicons';

import {
  Text,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  StatusBar,
  ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, collection, getDocs, query, orderBy, limit,Timestamp } from "firebase/firestore";
import { app } from '../firebase';

const { width, height } = Dimensions.get('window');

interface UserData {
  name: string;
  points: number;
  level: number;
  streak: number;
  objectsFound: number;
  accuracy: number;
}

interface GameMatch {
  puntos: number;
  fecha: Timestamp;
  objetosCorrectos: number;
  precisionMedia: number;
}

interface RankingItem {
  id: string;
  name: string;
  points: number;
  isCurrentUser?: boolean;
}

export default function Home() {
  const router = useRouter();
  const auth = getAuth();
  const db = getFirestore(app);
  
  const [userData, setUserData] = useState<UserData>({
    name: "",
    points: 0,
    level: 1,
    streak: 0,
    objectsFound: 0,
    accuracy: 0
  });
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Función para calcular el nivel basado en los puntos
  const calculateLevel = (points: number): number => {
    if (points < 500) return 1;
    if (points < 1000) return 2;
    if (points < 2000) return 3;
    if (points < 3500) return 4;
    if (points < 5500) return 5;
    if (points < 8000) return 6;
    if (points < 11000) return 7;
    if (points < 15000) return 8;
    if (points < 20000) return 9;
    return 10;
  };

  // Función para formatear la fecha
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };


  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.log("No hay usuario autenticado");
          setLoading(false);
          return;
        }

        console.log("Cargando datos del usuario:", currentUser.uid);

        // Cargar datos principales del usuario
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userDataFromFirestore = userDoc.data();
          console.log("Datos del usuario:", userDataFromFirestore);

          const points = userDataFromFirestore.puntos || 0;
          const level = calculateLevel(points);

          setUserData({
            name: userDataFromFirestore.nombre || "Usuario",
            points: points,
            level: level,
            streak: 0, // Se calculará desde las partidas más recientes
            objectsFound: userDataFromFirestore.objetosEncontrados || 0,
            accuracy: Math.round(userDataFromFirestore.precision || 0),
          });

          // Cargar las mejores partidas para el ranking
          await loadBestMatches(currentUser.uid);
        } else {
          console.log("No se encontró documento del usuario");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

    const loadBestMatches = async (userId: string) => {
    try {
      const partidasRef = collection(db, "users", userId, "partidas");
      const q = query(partidasRef, orderBy("puntos", "desc"), limit(5));
      const partidasSnapshot = await getDocs(q);

      const bestMatches: RankingItem[] = [];
      let index = 0;

      partidasSnapshot.forEach((doc) => {
        const matchData = doc.data() as GameMatch;

        bestMatches.push({
          id: (index + 1).toString(),
          name: formatDate(matchData.fecha.toDate()), // ✅ OK
          points: matchData.puntos,
          isCurrentUser: index === 0
        });

        index++;
      });

      setRanking(bestMatches);
    } catch (error) {
      console.error("Error loading best matches:", error);
    }
  };


  const handleLogout = () => {
    auth.signOut().then(() => {
      router.replace('/');
    });
  };

  const navigateToSettings = () => {
    router.push('/settings');
  };

  const startGame = (mode: string) => {
    router.push(`/${mode}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#478783" />
          <Text style={styles.loadingText}>Cargando datos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Image 
          source={require('../assets/images/Logo_NF_Blanco.png')} 
          style={styles.headerLogo} 
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Hola, {userData.name}</Text>
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsText}>{userData.points} pts</Text>
          </View>
        </View>
        <TouchableOpacity onPress={navigateToSettings} style={styles.settingsButton}>
          <Icon name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Stats Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Tus estadísticas</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{userData.objectsFound}</Text>
              <Text style={styles.statLabel}>Partidas totales</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{userData.objectsFound}</Text>
              <Text style={styles.statLabel}>Objetos</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{userData.accuracy}%</Text>
              <Text style={styles.statLabel}>Precisión</Text>
            </View>
          </View>
        </View>

        {/* Ranking Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Mis mejores partidas</Text>
          <View style={styles.rankingContainer}>
            {ranking.length > 0 ? (
              ranking.map(match => (
                <View 
                  key={match.id} 
                  style={[
                    styles.rankingRow, 
                    match.isCurrentUser && styles.currentUserRow
                  ]}
                >
                  <Text style={styles.rankingPosition}>{match.id}</Text>
                  <Text style={styles.rankingName}>{match.name}</Text>
                  <Text style={styles.rankingPoints}>{match.points} pts</Text>
                </View>
              ))
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>
                  ¡Juega tu primera partida para aparecer en el ranking!
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Game Modes Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Jugar</Text>
          <View style={styles.gameModes}>
            <TouchableOpacity 
              style={styles.gameButton} 
              onPress={() => startGame('modo-normal')}
            >
              <Text style={styles.gameButtonText}>Modo Normal</Text>
              <Text style={styles.gameButtonSubtext}>Haz la racha más larga que puedas</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.gameButton, styles.timeTrialButton]} 
              onPress={() => startGame('modo-contrarreloj')}
            >
              <Text style={styles.gameButtonText}>Contrarreloj</Text>
              <Text style={styles.gameButtonSubtext}>Encuentra el máximo de objetos en un tiempo determinado</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f8fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#478783',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#478783',
    padding: 15,
    paddingTop: 20,
  },
  headerLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  userInfo: {
    flex: 1,
    marginLeft: 10,
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pointsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  pointsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 5,
  },
  settingsIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  scrollContent: {
    padding: 16,
  },
  sectionContainer: {
    marginBottom: 50,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2f5856',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#478783',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  streakContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  streakCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2f5856',
  },
  streakText: {
    fontSize: 12,
    color: '#2f5856',
  },
  streakMessage: {
    flex: 1,
    fontSize: 16,
    color: '#2f5856',
  },
  rankingContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rankingRow: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  currentUserRow: {
    backgroundColor: '#e6f7f5',
  },
  rankingPosition: {
    width: 24,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#478783',
  },
  rankingName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  rankingPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#478783',
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  gameModes: {
    marginTop: 8,
  },
  gameButton: {
    backgroundColor: '#478783',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timeTrialButton: {
    backgroundColor: '#2f5856',
  },
  gameButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  gameButtonSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});