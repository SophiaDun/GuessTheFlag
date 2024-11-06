import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Image, Alert } from "react-native";
import { auth, db } from "../Config/FirebaseConfig"; 
import { ref, get, set, update } from "firebase/database"; 

const GameScreen = ({ navigation }) => {

  const [currentFlag, setCurrentFlag] = useState(null);
  const [flagsGuessed, setFlagsGuessed] = useState(0); // Counts new flag guesses
  const [input, setInput] = useState("");
  const [round, setRound] = useState(1);
  const [guessedFlags, setGuessedFlags] = useState(new Set()); // Store guessed flag names

  const userId = auth.currentUser?.uid;

  // Fetch current user data to compare for the game logic
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



  // Fetch a random flag for each round
  useEffect(() => {
    const fetchFlag = async () => {
      const response = await fetch("https://restcountries.com/v3.1/all");
      const data = await response.json();
      const randomFlag = data[Math.floor(Math.random() * data.length)];
      setCurrentFlag(randomFlag);
    };

    if (round <= 10) { //After 10 rounds it calls the handleGameOver()
      fetchFlag();
    } else {
      handleGameOver();
    }
  }, [round]);



  const handleGuess = async () => {
    const guessedCorrectly = input.trim().toLowerCase() === currentFlag.name.common.toLowerCase();
    const flagName = currentFlag.name.common;

    if (guessedCorrectly) {
      if (guessedFlags.has(flagName)) {
        Alert.alert("Correct!", "Aweer! You've guessed this flag before."); //If user is correct but has already guessed flags.
      } else {
        guessedFlags.add(flagName); 
        setFlagsGuessed(flagsGuessed + 1);
        Alert.alert("Correct!", "Awesome! New flag guessed."); // If user is correct and has not guessed the flag before

        // Update guessed flags and flag count in the database: users and leaderboard
        const userRef = ref(db, `users/${userId}`);
        const leaderboardRef = ref(db, `leaderboard/${userId}`);

        // Set to array for guessed flag names for users db
        const updatedGuessedFlags = Array.from(guessedFlags);

        // Update the flagsGuessed counter for both users and leaderboard db
        await update(userRef, {
          flagsGuessed: flagsGuessed + 1,
          guessedFlags: updatedGuessedFlags,
        });

        await set(leaderboardRef, {
          nickname: (await get(userRef)).val().nickname || 'Anonymous', // If user has not set nickname
          flagsGuessed: flagsGuessed + 1,
        });
      }
    } else {
      Alert.alert("Wrong!", `The correct answer was: ${flagName}`); //If user guesses the flag wrong
    }
    setInput("");
    setRound(round + 1);
  };

  const handleGameOver = () => {
    navigation.navigate("Home", { finalFlagsGuessed: flagsGuessed }); // After 10 rounds navigate user to HomeSreen
  };

  return (
    <View style={{ padding: 20, alignItems: 'center' }}>
      {currentFlag && (// check if currentFlag has been set -> then render rest content
        <>
          <Text style={{ fontSize: 20 }}>Round: {round}/10</Text>
          <Text style={{ fontSize: 20 }}>Flags Guessed: {flagsGuessed}</Text>
          <Image
            source={{ uri: currentFlag.flags.png }} 
            style={{ width: 150, height: 100 }}
          />
          <TextInput 
            placeholder="Enter country name" 
            value={input} 
            onChangeText={setInput} 
            style={{ borderWidth: 1, marginVertical: 20, width: '100%', padding: 10 }} 
          />
          <Button title="Submit" onPress={handleGuess} />
        </>
      )}
    </View>
  );
};

export default GameScreen;
