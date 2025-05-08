import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Animated, StyleSheet,
  ImageBackground, StatusBar, Dimensions, Image, Keyboard, Alert,
  TouchableWithoutFeedback, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function AuthScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(params.mode === 'login');
  const toggleAnim = useRef(new Animated.Value(isLogin ? 0 : 1)).current;

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repetirContrasena, setRepetirContrasena] = useState('');
  const [mensajeError, setMensajeError] = useState('');

  useEffect(() => {
    if (params.mode) {
      const newMode = params.mode === 'login';
      setIsLogin(newMode);
      Animated.timing(toggleAnim, {
        toValue: newMode ? 0 : 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [params.mode]);

  const switchForm = (newMode: boolean) => {
    if (isLogin !== newMode) {
      setIsLogin(newMode);
      setMensajeError('');
      setEmail('');
      setPassword('');
      setRepetirContrasena('');
      setNombre('');
      setTelefono('');
  
      Animated.timing(toggleAnim, {
        toValue: newMode ? 0 : 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleRegister = () => {
    setMensajeError('');

    if (!nombre || !telefono || !email || !password || !repetirContrasena) {
      setMensajeError('Por favor, completa todos los campos');
      return;
    }

    if (!/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]{3,}$/.test(nombre)) {
      setMensajeError("El nombre debe contener solo letras y al menos 3 caracteres.");
      return;
    }

    if (!/^\+?[0-9]+$/.test(telefono)) {
      setMensajeError("El teléfono solo puede contener números y el símbolo '+'.");
      return;
    }

    if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      setMensajeError("El correo electrónico no es válido.");
      return;
    }

    if (password.length < 8) {
      setMensajeError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== repetirContrasena) {
      setMensajeError("Las contraseñas no coinciden");
      return;
    }

    Alert.alert('Registro simulado', '¡Usuario registrado correctamente!');
    setTimeout(() => {
      router.replace('/');
    }, 1000);
  };

  const handleLogin = () => {
    setMensajeError('');

    if (!email || !password) {
      setMensajeError('Por favor, completa todos los campos');
      return;
    }

    if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      setMensajeError("El correo electrónico no es válido.");
      return;
    }

    if (password.length < 8) {
      setMensajeError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    Alert.alert('Login simulado', 'Inicio de sesión correcto');
    setTimeout(() => {
      router.replace('/');
    }, 1000);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.containerBackground}>
        <View style={styles.imageContainer}>
          <ImageBackground source={require('../../assets/images/background.jpg')} style={styles.background}>
            <View style={styles.overlayBackground} />
            <Image source={require('../../assets/images/Logo_NF_Blanco.png')} style={styles.logo} />
          </ImageBackground>
        </View>

        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="light-content" />
          <View style={[styles.container, isLogin && { height: '110%' }]}>
            <View style={styles.toggleContainer}>
              <Animated.View
                style={[
                  styles.toggleBackground,
                  {
                    left: toggleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '50%'],
                    }),
                  },
                ]}
              />
              <TouchableOpacity style={styles.toggleButton} onPress={() => switchForm(true)}>
                <Text style={[styles.toggleText, isLogin && styles.activeText]}>Iniciar sesión</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toggleButton} onPress={() => switchForm(false)}>
                <Text style={[styles.toggleText, !isLogin && styles.activeText]}>Registrarse</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.title}>Bienvenido a FindIt</Text>

            {!isLogin ? (
              <>
                <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                  <View style={styles.inputContainer}><TextInput style={styles.input} placeholder="Nombre" placeholderTextColor="#213e3d" value={nombre} onChangeText={setNombre} /></View>
                  <View style={styles.inputContainer}><TextInput style={styles.input} placeholder="Teléfono" placeholderTextColor="#213e3d" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" /></View>
                  <View style={styles.inputContainer}><TextInput style={styles.input} placeholder="Correo electrónico" placeholderTextColor="#213e3d" value={email} onChangeText={setEmail} keyboardType="email-address" /></View>
                  <View style={styles.inputContainer}><TextInput style={styles.input} placeholder="Contraseña" placeholderTextColor="#213e3d" secureTextEntry textContentType="newPassword" autoComplete="off" value={password} onChangeText={setPassword} /></View>
                  <View style={styles.inputContainer}><TextInput style={styles.input} placeholder="Repetir contraseña" placeholderTextColor="#213e3d" secureTextEntry textContentType="newPassword" autoComplete="off" value={repetirContrasena} onChangeText={setRepetirContrasena} /></View>
                </ScrollView>

                {mensajeError ? <Text style={styles.warningText}>{mensajeError}</Text> : null}

                <TouchableOpacity style={styles.button} onPress={handleRegister}>
                  <Text style={styles.buttonText}>Crear cuenta</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={{ height: 10 }} />

                <View style={styles.inputContainer}><TextInput style={styles.input} placeholder="Correo electrónico" placeholderTextColor="#213e3d" value={email} onChangeText={setEmail} keyboardType="email-address" /></View>
                <View style={styles.inputContainer}><TextInput style={styles.input} placeholder="Contraseña" placeholderTextColor="#213e3d" secureTextEntry textContentType="password" autoComplete="off" value={password} onChangeText={setPassword} /></View>
                {mensajeError ? <Text style={styles.warningText}>{mensajeError}</Text> : null}
                <View style={{ height: mensajeError ? 10 : 40 }} />
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                  <Text style={styles.buttonText}>Iniciar sesión</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  containerBackground: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: height * 0.5,
    borderBottomLeftRadius: 38,
    borderBottomRightRadius: 38,
    overflow: 'hidden',
  },
  background: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  logo: {
    width: '100%',
    height: '19%',
    resizeMode: 'contain',
    marginTop: height * 0.12,
  },
  safeArea: {
    flex: 1,
    width: '90%',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#c7d1d8',
    width: '100%',
    height: '165%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: -height * 0.28,
  },
  toggleContainer: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#839197',
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 10,
    position: 'relative',
  },
  toggleBackground: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    backgroundColor: '#478783',
    borderRadius: 25,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    zIndex: 1,
  },
  toggleText: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  activeText: {
    color: '#FFF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2f5856',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    paddingVertical: height * 0.015,
    borderBottomWidth: 1,
    borderBottomColor: '#213e3d',
    marginBottom: height * 0.02,
    fontSize: height * 0.02,
    flex: 1,
  },
  inputContainer: {
    width: '95%', // 🔹 Define un ancho consistente para todos los inputs
    flexDirection: 'row', // 🔹 Asegura que el input se expanda dentro de su View
},
  button: {
    backgroundColor: '#478783',
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    borderRadius: 30,
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  warningText: {
    color: '#D9534F',
    textAlign: 'center',
    marginBottom: 10,
  },
  scrollContainer: {
    width: '100%',
    alignItems: 'center',
  },
});
