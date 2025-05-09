import React, { useState, useEffect } from "react";
import {
  Text,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  StatusBar
} from "react-native";
import { useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const { width, height } = Dimensions.get('window');

// Datos de ejemplo para la vista previa
const mockUserData = {
  name: "Marc",
  points: 2450,
  level: 8,
  streak: 5,
  objectsFound: 42,
  accuracy: 78
};

const mockRanking = [
  { id: "1", name: "05/01/2025", points: 4320 },
  { id: "2", name: "20/03/2025", points: 2450, isCurrentUser: true },
  { id: "3", name: "08/04/2025", points: 2100 },
  { id: "4", name: "01/05/2025", points: 1840 },
  { id: "5", name: "08/05/2025", points: 1650 }
];

export default function Home() {
  const router = useRouter();
  const auth = getAuth();
  const db = getFirestore();
  
  const [userData, setUserData] = useState(mockUserData);
  const [ranking, setRanking] = useState(mockRanking);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userDataFromFirestore = userDoc.data();
            if (userDataFromFirestore) {
              setUserData({
                name: userDataFromFirestore.name || "",
                points: userDataFromFirestore.points || 0,
                level: userDataFromFirestore.level || 0,
                streak: userDataFromFirestore.streak || 0,
                objectsFound: userDataFromFirestore.objectsFound || 0,
                accuracy: userDataFromFirestore.accuracy || 0,
              });
            }
          }
          // En una implementación real, también cargaríamos los datos del ranking desde Firestore
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleLogout = () => {
    auth.signOut().then(() => {
      router.replace('/');
    });
  };

  const navigateToSettings = () => {
    router.push('/settings');
  };

  const startGame = (mode) => {
    // Esta función se implementará cuando desarrolles la página de juego
    alert(`Iniciando juego en modo: ${mode}`);
    // router.push(/game?mode=${mode});
  };

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
          <Image 
            source={require('../assets/images/settings.png')} 
            style={styles.settingsIcon} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Stats Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Tus estadísticas</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{userData.level}</Text>
              <Text style={styles.statLabel}>Nivel</Text>
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

        {/* Streak Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Tu racha actual</Text>
          <View style={styles.streakContainer}>
            <View style={styles.streakCircle}>
              <Text style={styles.streakNumber}>{userData.streak}</Text>
              <Text style={styles.streakText}>días</Text>
            </View>
            <Text style={styles.streakMessage}>
              {userData.streak > 0 
                ? `¡Llevas ${userData.streak} días seguidos jugando!` 
                : "¡Empieza tu racha hoy!"}
            </Text>
          </View>
        </View>

        {/* Ranking Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Ranking</Text>
          <View style={styles.rankingContainer}>
            {ranking.map(player => (
              <View 
                key={player.id} 
                style={[
                  styles.rankingRow, 
                  player.isCurrentUser && styles.currentUserRow
                ]}
              >
                <Text style={styles.rankingPosition}>{player.id}</Text>
                <Text style={styles.rankingName}>{player.name}</Text>
                <Text style={styles.rankingPoints}>{player.points} pts</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Game Modes Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Jugar</Text>
          <View style={styles.gameModes}>
            <TouchableOpacity 
              style={styles.gameButton} 
              onPress={() => startGame('normal')}
            >
              <Text style={styles.gameButtonText}>Modo Normal</Text>
              <Text style={styles.gameButtonSubtext}>Supera retos con tiempo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.gameButton, styles.timeTrialButton]} 
              onPress={() => startGame('timeTrial')}
            >
              <Text style={styles.gameButtonText}>Contrarreloj</Text>
              <Text style={styles.gameButtonSubtext}>Encuentra el máximo de objetos</Text>
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
    marginBottom: 24,
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
    paddingVertical: 12,
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
    color: 'rgba(255, 255, 255, 0.8)',
  },
});