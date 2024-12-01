import { Image, StatusBar, Animated, View, Text,StyleSheet,Pressable,ImageBackground   } from 'react-native';
import RotatingElement from '../Components/RotatingElement';

const IndexScreen = ({ navigation }) => {
    const rotateInterpolate = RotatingElement();//Rotation animation for the globe


  return (
    <ImageBackground
    source={require('../assets/bg-1.png')} 
    style={styles.container} 
  >
    <StatusBar barStyle="light-content"/>
    <View style={styles.container}>

        <Image source={require('../assets/logo-text.png')} style={styles.logo} />
        <Image source={require('../assets/maskot-logo.gif')} style={styles.mascotGif} />
  
        <Animated.View style={[styles.indexPlanet, { transform: [{ rotate: rotateInterpolate }] }]}>
          <Image source={require('../assets/index-planet.png')} style={styles.indexPlanet} />
        </Animated.View>
   <View style={styles.buttonContainer}>
        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Log in</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate('Sign Up')}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </Pressable>
      </View>
    </View>
     </ImageBackground>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop:80,
    justifyContent: 'stat',
    alignItems: 'center',
  },

  logoContainer: {
    alignItems: 'center', 
    marginBottom: 20, 
  },

  logo: {
    resizeMode: 'contain',
    width: 300, 
    height: 100, 
    marginBottom: 10, 
  },
  
  indexPlanet:{
    zIndex:1,
    fontSize:40,
     width: 700,
     height: 700
   },

   buttonContainer: {
    position: 'absolute',
    zIndex: 2, 
    bottom:88,
    alignItems: 'center',
    width: '100%',
  },

  button:{
    backgroundColor: "#1a2947",
    paddingVertical: 15,
    marginVertical: 10,
    width:110,
    borderRadius: 10,
    color:"white",

  },

  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign:"center",
    fontWeight:600
  },

   mascotGif: {
    zIndex:1,
    width: 300,  
    height: 300, 
    top:7
  },

  input: {
    borderWidth: 1,
    padding: 10,
    width: '80%',
    marginBottom: 10,
  },

  errorText: {
    color: 'red',
  },
});
export default IndexScreen;