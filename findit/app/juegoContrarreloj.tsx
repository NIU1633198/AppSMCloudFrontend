
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { AntDesign } from '@expo/vector-icons';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import {
  getFunctions,
  httpsCallable,
} from 'firebase/functions';
import uuid from 'react-native-uuid';
import app from '../firebase';

const { width } = Dimensions.get('window');

export default function JuegoContrarreloj() {
  const db = getFirestore(app);

  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);
  const [tiempoRestante, setTiempoRestante] = useState(600); // 10 minutos
  const [modalFinal, setModalFinal] = useState(false);
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
    }
  };

  const eliminarImagen = () => {
    setImagenSeleccionada(null);
  };

  const obtenerRetoAleatorio = async () => {
    try {
      const q = query(collection(db, 'retos'), where('activo', '==', true));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs;

      if (docs.length === 0) return;

      const random = Math.floor(Math.random() * docs.length);
      const reto = docs[random].data();
      setRetoActual(reto.palabra);
    } catch (err) {
      console.error('Error obteniendo reto:', err);
    }
  };

  const analizarImagen = async () => {
    if (!imagenSeleccionada) return [];

    try {
      const response = await fetch(imagenSeleccionada);
      const blob = await response.blob();
      const filename = `${uuid.v4()}.jpg`;
      const storage = getStorage();
      const storageRef = ref(storage, `imagenes/${filename}`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      const functions = getFunctions();
      const visionFunction = httpsCallable(functions, 'analizarImagen');
      const result = await visionFunction({ imageUrl: downloadURL }) as { data: { etiquetas: string[] } };

      return result.data.etiquetas.map((et) => et.toLowerCase());
    } catch (err) {
      console.error('Error al analizar imagen:', err);
      return [];
    }
  };

  const comprobarImagen = async () => {
    const etiquetas = await analizarImagen();
    const esCorrecta = etiquetas.includes(retoActual.toLowerCase());

    if (esCorrecta) {
      setRacha((prev) => prev + 1);
      setImagenSeleccionada(null);
      obtenerRetoAleatorio();
    } else {
      setImagenSeleccionada(null);
      obtenerRetoAleatorio(); // continúa con otro reto aunque falle
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

      setModalFinal(true);
      return;
    }

    const intervalo = setInterval(() => {
      setTiempoRestante((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalo);
  }, [tiempoRestante]);

  const reiniciarPartida = () => {
    setModalFinal(false);
    setImagenSeleccionada(null);
    setTiempoRestante(600);
    setRacha(0);
    obtenerRetoAleatorio();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reto actual:</Text>
      <Text style={styles.challenge}>
        📸 Encuentra y sube una imagen de un/una <Text style={styles.highlight}>{retoActual}</Text>
      </Text>

      <Animated.Text style={[styles.timer, { transform: [{ scale: animacion }] }]}>
        ⏳ {formatearTiempo(tiempoRestante)}
      </Animated.Text>

      <Text style={styles.racha}>Puntos: {racha}</Text>

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
        <Text style={styles.uploadButtonText}>
          {imagenSeleccionada ? 'Cambiar imagen' : 'Seleccionar imagen'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.checkButton, { backgroundColor: imagenSeleccionada ? '#478783' : '#ccc' }]}
        onPress={comprobarImagen}
        disabled={!imagenSeleccionada}
      >
        <Text style={styles.uploadButtonText}>Comprobar</Text>
      </TouchableOpacity>

      {modalFinal && (
        <View style={styles.modal}>
          <Text style={styles.modalText}>⏰ ¡Tiempo agotado!</Text>
          <Text style={styles.modalText}>Puntuación final: {racha}</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={reiniciarPartida}>
            <Text style={styles.uploadButtonText}>Volver a jugar</Text>
          </TouchableOpacity>
        </View>
      )}
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
    marginBottom: 10,
  },
  racha: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2f5856',
    marginBottom: 10,
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
  modal: {
    marginTop: 40,
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  modalText: {
    fontSize: 20,
    marginBottom: 12,
    textAlign: 'center',
    color: '#2f5856',
  },
});
