import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  Modal,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import app from '../firebase';

const { width } = Dimensions.get('window');

export default function Juego() {
  const router = useRouter();
  const db = getFirestore(app);

  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);
  const [tiempoRestante, setTiempoRestante] = useState(300); // 5 minutos
  const [modalTiempoAgotado, setModalTiempoAgotado] = useState(false);
  const [modalIncorrecto, setModalIncorrecto] = useState(false);
  const [modalCorrecto, setModalCorrecto] = useState(false);
  const [racha, setRacha] = useState(0);
  const [retoActual, setRetoActual] = useState<string>('');
  const animacion = useRef(new Animated.Value(1)).current;

  const seleccionarImagen = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'image/*',
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const uri = result.assets[0].uri;
      setImagenSeleccionada(uri);
      // TODO: Subir a Firebase Storage
    }
  };

  const eliminarImagen = () => {
    setImagenSeleccionada(null);
    // TODO: Borrar de Firebase Storage
  };

  const obtenerRetoAleatorio = async () => {
    try {
      const q = query(collection(db, 'retos'), where('activo', '==', true));
      const snapshot = await getDocs(q);
      const documentos = snapshot.docs;

      if (documentos.length === 0) {
        console.warn('No hay retos disponibles');
        return;
      }

      const indiceAleatorio = Math.floor(Math.random() * documentos.length);
      const reto = documentos[indiceAleatorio].data();

      setRetoActual(reto.palabra); // usar idiomas[idioma] si necesitas multilingüe
    } catch (error) {
      console.error('Error obteniendo reto aleatorio:', error);
    }
  };

  const comprobarImagen = () => {
    // TODO: Llamar a Cloud Function para analizar la imagen
    // Simulamos que la imagen es correcta o incorrecta:
    const esCorrecta = true; // sustituir por resultado real del backend

    if (esCorrecta) {
      setRacha((prev) => prev + 1);
      setModalCorrecto(true);
      // TODO: Guardar progreso en Firestore
    } else {
      setModalIncorrecto(true);
      // TODO: Guardar fallo en Firestore
    }
  };

  const formatearTiempo = (seg: number) => {
    const m = Math.floor(seg / 60).toString().padStart(2, '0');
    const s = (seg % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    obtenerRetoAleatorio();
  }, []);

  useEffect(() => {
    if (tiempoRestante <= 0) {
      Animated.sequence([
        Animated.timing(animacion, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(animacion, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      setModalTiempoAgotado(true);
      // TODO: Guardar datos de la partida
      return;
    }

    const intervalo = setInterval(() => {
      setTiempoRestante((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalo);
  }, [tiempoRestante]);

  const iniciarNuevoReto = () => {
    setModalCorrecto(false);
    setImagenSeleccionada(null);
    setTiempoRestante(300);
    obtenerRetoAleatorio();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reto actual:</Text>
      <Text style={styles.challenge}>📸 Encuentra y sube una imagen de un/una <Text style={styles.highlight}>{retoActual}</Text></Text>

      <Animated.Text style={[styles.timer, { transform: [{ scale: animacion }] }]}>⏳ {formatearTiempo(tiempoRestante)}</Animated.Text>

      <View style={styles.box}>
        {imagenSeleccionada ? (
          <>
            <Image source={{ uri: imagenSeleccionada }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.deleteButton} onPress={eliminarImagen}>
              <AntDesign name="closecircle" size={24} color="#D9534F" />
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.boxText}>Toca aquí para seleccionar una imagen</Text>
        )}
      </View>

      <TouchableOpacity style={styles.uploadButton} onPress={seleccionarImagen}>
        <Text style={styles.uploadButtonText}>{imagenSeleccionada ? 'Cambiar imagen' : 'Seleccionar imagen'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.checkButton, { backgroundColor: imagenSeleccionada ? '#478783' : '#ccc' }]}
        onPress={comprobarImagen}
        disabled={!imagenSeleccionada}
      >
        <Text style={styles.uploadButtonText}>Comprobar</Text>
      </TouchableOpacity>

      {/* Modales (idénticos a los anteriores, sin cambios) */}
      {/* ...modalTiempoAgotado... */}
      {/* ...modalIncorrecto... */}
      {/* ...modalCorrecto... */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f6f8fa',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 30,
    color: '#2f5856',
  },
  challenge: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
    lineHeight: 26,
  },
  highlight: {
    color: '#478783',
    fontWeight: 'bold',
  },
  timer: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D9534F',
    marginBottom: 20,
  },
  box: {
    width: width * 0.8,
    height: width * 0.6,
    borderWidth: 2,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    position: 'relative',
    overflow: 'hidden',
  },
  boxText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  deleteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  uploadButton: {
    marginTop: 20,
    backgroundColor: '#478783',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  checkButton: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
