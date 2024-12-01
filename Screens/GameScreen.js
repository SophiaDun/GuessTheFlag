import React, { useState, useEffect } from "react";
import { View, Alert, Text, TextInput, ImageBackground, Image, StyleSheet, Pressable } from "react-native";
import { auth, db } from "../Config/FirebaseConfig";
import { ref, get, set, update } from "firebase/database";
import FontAwesome from '@expo/vector-icons/FontAwesome';

const GameScreen = ({ navigation }) => {
  const [currentFlag, setCurrentFlag] = useState(null);
  const [flagsGuessed, setFlagsGuessed] = useState(0); // Total flags guessed across all games
  const [currentRoundFlagsGuessed, setCurrentRoundFlagsGuessed] = useState(0); // Flags guessed in the current round
  const [input, setInput] = useState("");
  const [round, setRound] = useState(1);
  const [guessedFlags, setGuessedFlags] = useState(new Set());
  const [message, setMessage] = useState("");
  const [mascotAnimation, setMascotAnimation] = useState("base");
  const userId = auth.currentUser?.uid;


    // Fetches User data from -> users
  useEffect(() => {
    const fetchUserData = async () => {
      const userRef = ref(db, `users/${userId}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        setFlagsGuessed(userData.flagsGuessed || 0);
        setGuessedFlags(new Set(userData.guessedFlags || []));
      }
    };

    fetchUserData();
  }, [userId]);

  useEffect(() => {
    const fetchFlag = async () => {
      const response = await fetch("https://restcountries.com/v3.1/all");
      const data = await response.json();
      const randomFlag = data[Math.floor(Math.random() * data.length)];
      setCurrentFlag(randomFlag);
    };

    if (round <= 10) {
      fetchFlag();
    } else {
      handleGameOver();
    }
  }, [round]);

  const displayMessage = (text, type) => {
    setMessage(text);
    setMascotAnimation(type);

    setTimeout(() => {
      setMessage("");
      setMascotAnimation("base");
    }, 2000);
  };

  const handleGuess = async () => {
    if (round >= 10) return handleGameOver();

    const guessedCorrectly = input.trim().toLowerCase() === currentFlag.name.common.toLowerCase();
    const flagName = currentFlag.name.common;

    if (guessedCorrectly) {
      if (guessedFlags.has(flagName)) {
        displayMessage("Aweer! You've guessed this flag before.", "correct");
      } else {
        const updatedGuessedFlags = new Set(guessedFlags);
        updatedGuessedFlags.add(flagName);

        setGuessedFlags(updatedGuessedFlags);
        setFlagsGuessed(flagsGuessed + 1);
        setCurrentRoundFlagsGuessed(currentRoundFlagsGuessed + 1);
        displayMessage("Awesome! New flag guessed.", "correct");

        const userRef = ref(db, `users/${userId}`);
        const leaderboardRef = ref(db, `leaderboard/${userId}`);

        const userSnapshot = await get(userRef);
        const userData = userSnapshot.val();
        const profilePicture = userData.profilePicture || "default_profile_picture.png";

        await update(userRef, {
          flagsGuessed: flagsGuessed + 1,
          guessedFlags: Array.from(updatedGuessedFlags),
        });

        await set(leaderboardRef, {
          username: userData.username || "Anonymous",
          flagsGuessed: flagsGuessed + 1,
          profilePicture: profilePicture,
        });
      }
    } else {
      displayMessage(`Wrong! The correct answer was: ${flagName}`, "wrong");
    }

    setInput("");
    if (round < 10) {
      setRound(round + 1); 
    }
  };


  const handleGameOver = () => {
    // Display an alert before navigating to Home
    Alert.alert(
      "Game Over",
      `You guessed ${currentRoundFlagsGuessed} new flags!`,
      [
        {
          text: "Go back home", // Button text
          onPress: () => {
            // Send the newly guessed flags to the home screen after the user presses OK
            navigation.navigate("Home", {
              finalFlagsGuessed: currentRoundFlagsGuessed,
              guessedFlags: [...guessedFlags]
            });
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <ImageBackground source={require('../assets/bg-2.png')} style={styles.container}>
      <View style={styles.gameContainer}>
        {message && (
          <View style={styles.messageContainer}>
            <Text style={[styles.messageText, message.includes("Wrong") ? { color: "red" } : { color: "green" }]}>
              {message}
            </Text>
          </View>
        )}

        <View style={styles.borderBacground}>
          <View style={styles.container}>
            <Image source={mascotAnimation === "correct" ? require("../assets/maskot-game-right.gif") : mascotAnimation === "wrong" ? require("../assets/maskot-game-wrong.gif") : require("../assets/maskot-game-base.gif")} style={styles.mascot} />
            <View style={styles.hr} />
            <View style={styles.roundAndGuesses}>
              <Text style={styles.text}>Round: <Text style={styles.boldText}>{round}/10</Text></Text>
              <Text style={styles.text}>New guessed flags: <Text style={styles.boldText}>{currentRoundFlagsGuessed}</Text></Text>
            </View>

            {currentFlag && (
              <>

              <Image source={{ uri: currentFlag.flags.png }} style={styles.flag} />

                <View style={styles.inputContainer}>
                  <TextInput placeholder="Enter country name" placeholderTextColor="#1a2947" value={input} onChangeText={setInput} style={styles.input} />
                  <Pressable style={styles.submitButton} onPress={handleGuess}>
                    <Text style={styles.submitButtonText}>CHECK</Text>
                  </Pressable>
                </View>

              </>
            )}
          </View>
       </View>


      </View>
      <Pressable style={styles.quitButton} onPress={handleGameOver}>
        <Text style={styles.quitButtonText}><FontAwesome name="remove" size={15} color="white" /> Quit</Text>
      </Pressable>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({

  gameContainer: {
    paddingTop: 80,
  },

  roundAndGuesses: {
    display: "flex",
    gap: 20,
    bottom: 8,
    flexDirection: "row",
  },

  hr: {
   height: 1,
    backgroundColor: "#0b0f21",
    width: 330,
    marginVertical: 10,
    alignSelf: "center",
  },

  borderBacground: {
    backgroundColor: "#1a2947",
    borderRadius: 30,
    height: 440,
    width: 330,
    paddingRight: 20,
    paddingLeft: 20,
    marginTop: 90,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 40

  },
  container: {
    flex: 1,
    alignItems: "center",
    position: "relative",
  },

  mascot: {
    width: 120,
    height: 120,
    top: 21,
    shadowColor: "#0bba71", 
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  messageContainer: {
    position: "absolute",
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 10,
    top: 100,
    alignItems: "center",
    justifyContent: "center",
    maxWidth: 320,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,

  },
  messageText: {
    fontSize: 15,
    textAlign: "center",
    fontWeight: "400",
  },

  message: {
    paddingTop: 70,
    fontSize: 18,
    textAlign: "center",
  },

  boldText: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#16801B",
  },
  text: {
    fontSize: 14,
    color: "white",
    marginVertical: 5,
  },

  flag: {
    width: 250,
    height: 140,
  },

  input: {
    borderWidth: 1,
    backgroundColor: "#3b455c",
    width: 179,
    padding: 10,
    borderRadius: 5,
    borderColor: "#16801B",
    color: "white"

  },

  submitButton: {
    padding: 10,
    backgroundColor: "#16801B",
    justifyContent: "center",
    borderRadius: 10,

  },

  submitButtonText: {
    color: "#1a2947",
    fontWeight: 600,
    fontSize: 12

  },

  inputContainer: {
    paddingTop: 16,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10
  },

  quitButton: {
    alignItems: "center",
    padding: 15,
    backgroundColor: "#6b1111",
    justifyContent: "center",
    borderRadius: 10,
  },

  quitButtonText: {
    color: "#ffffff",
    fontWeight: 600,
  }
});

export default GameScreen;
