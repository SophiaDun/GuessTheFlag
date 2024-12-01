import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ImageBackground, Pressable } from "react-native";
import { auth, db } from "../Config/FirebaseConfig";
import { signOut } from "firebase/auth"; 
import { ref, get } from "firebase/database";
import { useIsFocused } from "@react-navigation/native";
import profilePictureMap from "../Components/ProfilePictureMap";
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';


const HomeScreen = ({ navigation }) => {
  const [flagsGuessed, setFlagsGuessed] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [username, setUsername] = useState("");
  const [profilePicture, setProfilePicture] = useState('pp-2.png');
  const userId = auth.currentUser?.uid;

  const isFocused = useIsFocused();

  //Level system: Sets the title based on flags guessed
  const progressTitle = () => {
    if (flagsGuessed < 50) return "Flag Novice";
    if (flagsGuessed >= 50 && flagsGuessed < 100) return "Global Explorer";
    if (flagsGuessed >= 100 && flagsGuessed < 200) return "Continent Specialist";
    if (flagsGuessed >= 200 && flagsGuessed < 250) return "World Diplomat";
    return "Flag Master";
  };

  // Fetches User data from -> users
  const fetchUserData = async () => {
    try {
      const userRef = ref(db, `users/${userId}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        setUsername(userData.username || "Unknown User");
        setFlagsGuessed(userData.flagsGuessed || 0);
        setProfilePicture(userData.profilePicture || 'pp-2.png');
      } else {
        console.error("User data does not exist in the database.");
      }
    } catch (error) {
      console.error("Error fetching user data: ", error);
    }
  };

  // Fetches data from -> leaderboard
  const fetchLeaderboard = async () => {
    try {
      const leaderboardRef = ref(db, `leaderboard`);
      const snapshot = await get(leaderboardRef);

      if (snapshot.exists()) {
        const leaderboardData = snapshot.val();
        const leaderboardArray = Object.keys(leaderboardData).map((uid) => ({
          uid,
          ...leaderboardData[uid],
        }));
        // Sorts the leaderboard to show top 5 users by flags guessed
        leaderboardArray.sort((a, b) => b.flagsGuessed - a.flagsGuessed);
        setLeaderboard(leaderboardArray.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching leaderboard: ", error);
    }
  };


  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate("Index"); // Navigate back to the Login screen
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };


  // Makes sure the data is updated when user lands from GameScreen to HomeScreen
  useEffect(() => {
    if (isFocused) {
      fetchUserData();
      fetchLeaderboard();
    }
  }, [isFocused]);

  return (
    <ImageBackground source={require('../assets/bg-2.png')} style={styles.container}>
      <View style={styles.screenContainer}>

        <View style={styles.settingsIcon}>
          <Ionicons onPress={() => navigation.navigate("Settings")} name="settings" size={30} color="#1a2947" />
        </View>

        <View style={styles.logoContainer}>
        <Image source={require('../assets/logo-text.png')} style={styles.logo} />
        </View>
        
    <View style={styles.userContainer}>
          <Image
            source={profilePictureMap[profilePicture] || profilePictureMap["pp-2.png"]}
            style={styles.profilePicture}
          />

      <View style={styles.userInfo}>
         <Text style={styles.header}>{username}</Text>
          <View style={styles.userInfo}>
            <Text style={styles.userInfoText}>
            <Text style={styles.boldText}>Total Flags Guessed:</Text> {flagsGuessed}/250</Text>
            <Text style={styles.userInfoText}><Text style={styles.boldText}>Level:</Text> {progressTitle()} </Text>
          </View>
      </View>
    </View>

        <Pressable style={styles.startButton} title="Start Game" onPress={() => navigation.navigate("Game")} >
             <FontAwesome name="flag" size={24} color="#338a32" />
          <Text style={styles.startButtonText}>Start Game</Text>
        </Pressable>

        <View style={styles.leaderBoardContainer}>
          <Text style={styles.leaderboardTitle}>Top 5 Leaderboard:</Text>
          <View style={styles.hr} />
          {leaderboard.map((user, index) => (
            <View key={user.uid} style={styles.leaderboardEntry}>
              <Image
                source={profilePictureMap[user.profilePicture] || profilePictureMap["pp-2.png"]}
                style={styles.leaderboardProfilePicture}
              />
              <Text style={styles.leaderboardText}>
                {user.username || "Unknown"}: {user.flagsGuessed} flags guessed
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.logOutButton}>
        <MaterialIcons name="exit-to-app" onPress={handleLogout} size={45} color="#1a2947" />
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop:50,
    justifyContent: 'stat',
    alignItems: 'center',
  },

  settingsIcon: {
    alignItems: "flex-end",
  },

  logo: {
    resizeMode: 'contain',
    width: 220, 
    height:70,
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
   
  },

    logoContainer:{
    alignItems: 'center',
  },

  screenContainer: {
    padding: 20,
    flex: 1,
    flexDirection: "column"
  },

  header: {
    fontSize: 24,
    fontWeight: "bold",
    color:"white"
  },

  userInfoText: {
    color: "#5db83d",
  },

  boldText: {
    fontWeight: "bold",
    color: "white",
  },

  profilePicture: {
   width: 60,
    height: 60,
    marginRight: 20
  },

  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a2947",
    borderRadius: 30,
    padding: 30,
    margin:10
  },

  userInfo: {
    flexDirection: "column",
  },

  levelTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
  },

  startButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dedede",
    borderRadius: 20,
    marginTop: 5,
    marginRight: 10,
    marginBottom: 5,
    marginLeft: 10,
    padding: 25,
    flexDirection: "row",
    gap: 10,
    shadowColor: "#52f258", 
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 9,
  },

  startButtonText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#338a32"
  },

  leaderBoardContainer: {
    margin:10,
    backgroundColor: "#1a2947",
    borderRadius: 30,
    padding: 20,
  
  }, 

  hr: {
    height: 1,
    backgroundColor: "white",
    width: 200,
    marginVertical: 10,
    alignSelf: "center",
  },

  leaderboardEntry: {
    flexDirection: "row",
    left:30,
    alignItems: "center",
    marginVertical: 5,
  },

  leaderboardProfilePicture: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },

  leaderboardText: {
    fontSize: 16,
    color: "white"
  },

  leaderboardTitle: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
    fontWeight: 600
  },

  logOutButton:{
    paddingTop:16,
    alignItems:"center",
  }
});

export default HomeScreen;
