import React, { useState } from 'react';
import { Image, Button, TextInput, Pressable, View, StatusBar, Text, StyleSheet, ImageBackground, Animated } from 'react-native';
import { login } from '../Config/AuthService';
import RotatingElement from '../Components/RotatingElement';
import Ionicons from '@expo/vector-icons/Ionicons';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const rotateInterpolate = RotatingElement();//Rotation animation for the globe

  const handleLogin = async () => {
    try {
      await login(email, password);
      navigation.navigate('Home');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/bg-1.png')}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.screenContainer}>
        <View style={styles.goBackButton}>
          <Ionicons name="arrow-back-circle" size={38} color="white" onPress={() => navigation.navigate('Index')} />
        </View>

        <View >
          <View style={styles.logoContainer}>
            <Image source={require('../assets/logo-text.png')} style={styles.logo} />
          </View>

          <Text style={styles.logInText}>Log In</Text>
        </View>
        <View style={styles.formContainer}>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
          {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
          <Pressable
            style={styles.button}
            onPress={handleLogin}>
            <Text style={styles.buttonText}>Log in</Text>
          </Pressable>

          <Button color="white" title="Go to Sign Up" onPress={() => navigation.navigate('Sign Up')} />
        </View>
        <Animated.View style={[styles.indexPlanet, { transform: [{ rotate: rotateInterpolate }] }]}>
          <Image source={require('../assets/index-planet.png')} style={styles.indexPlanet} />
        </Animated.View>
      </View>
    </ImageBackground>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    justifyContent: 'stat',
    alignItems: 'center',
  },

  screenContainer: {
    padding: 20,
    flex: 1,
    flexDirection: "column"
  },

  logoContainer: {
    alignItems: 'center',
  },

  goBackButton: {
    alignItems: "center",
    right: 150,
    paddingBottom: 50
  },

  logInText: {
    fontSize: 30,
    color: "white",
    textAlign: "center",
    fontWeight: 300,
    paddingBottom: 10
  },

  button: {
    backgroundColor: "none",
    paddingVertical: 10,
    marginVertical: 10,
    width: 100,
    borderRadius: 10,
    color: "white",
    borderWidth: 0.9,
    borderColor: "white"
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: "center",
    fontWeight: 600
  },
  formContainer: {
    paddingBottom: 60,
    alignItems: "center"
  },
  indexPlanet: {

    zIndex: 1,
    fontSize: 40,
    width: 700,
    height: 700
  },
  logo: {
    resizeMode: 'contain',
    width: 400,
    height: 100,
    marginBottom: 20,
  },
  input: {
    backgroundColor: "white",
    zIndex: 2,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    width: 230,
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
  },
});
export default LoginScreen;