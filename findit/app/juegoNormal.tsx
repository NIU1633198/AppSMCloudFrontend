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

const { width } = Dimensions.get('window');

export default function Juego() {
  const router = useRouter();

  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);
  const [tiempoRestante, setTiempoRestante] = useState(300); // 5 minutos
  const [modalTiempoAgotado, setModalTiempoAgotado] = useState(false);
  const [modalIncorrecto, setModalIncorrecto] = useState(false);
  const [modalCorrecto, setModalCorrecto] = useState(false);
  const [racha, setRacha] = useState(0);
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

  const comprobarImagen = () => {
    // TODO: Llamar a Cloud Function para analizar la imagen
    // Simulamos que la imagen es incorrecta o correcta:
    const esCorrecta = true; // Cambiar según respuesta del backend

    if (esCorrecta) {
      setRacha((prev) => prev + 1);
      setModalCorrecto(true);
    } else {
      setModalIncorrecto(true);
      // TODO: Guardar resultado en Firestore
    }
  };

  const formatearTiempo = (seg: number) => {
    const m = Math.floor(seg / 60).toString().padStart(2, '0');
    const s = (seg % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

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
    // TODO: Obtener nuevo reto desde Firestore
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reto actual:</Text>
      <Text style={styles.challenge}>📸 Encuentra y sube una imagen de una <Text style={styles.highlight}>cuchara</Text></Text>

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

      {/* Modal: Tiempo Agotado */}
      <Modal visible={modalTiempoAgotado} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>⏱ Tiempo agotado</Text>
            <Text style={styles.modalText}>La partida ha terminado. ¡Intenta mejorar tu racha en la próxima!</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setModalTiempoAgotado(false);
                // TODO: Guardar resultado final en Firestore
                router.replace('/home');
              }}
            >
              <Text style={styles.modalButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal: Objeto Incorrecto */}
      <Modal visible={modalIncorrecto} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>❌ Objeto incorrecto</Text>
            <Text style={styles.modalText}>La imagen no coincide con el reto. ¡Suerte para la próxima!</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setModalIncorrecto(false);
                // TODO: Guardar resultado final en Firestore
                router.replace('/home');
              }}
            >
              <Text style={styles.modalButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal: Acierto */}
      <Modal visible={modalCorrecto} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>🎉 ¡Bien hecho!</Text>
            <Text style={styles.modalText}>Seleccione aceptar cuando estés listo para el siguiente reto.</Text>
            <TouchableOpacity style={styles.modalButton} onPress={iniciarNuevoReto}>
              <Text style={styles.modalButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2f5856',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  modalButton: {
    backgroundColor: '#478783',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
