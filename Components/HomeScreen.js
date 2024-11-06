import React, { useEffect, useState } from "react";
import { View, Text, Button, Alert, TextInput } from "react-native";
import { auth, db } from "../Config/FirebaseConfig"; 
import { ref, get, set } from "firebase/database"; 
import { useIsFocused } from "@react-navigation/native"; 

const HomeScreen = ({ navigation }) => {
  const [flagsGuessed, setFlagsGuessed] = useState(0); 
  const [leaderboard, setLeaderboard] = useState([]);
  const [nickname, setNickname] = useState('');
  const [nicknameInput, setNicknameInput] = useState('');
  const userId = auth.currentUser?.uid;

  const isFocused = useIsFocused(); 



  //Fetches User data from -> users
  const fetchUserData = async () => {
    try {
      const userRef = ref(db, `users/${userId}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        setNickname(userData.nickname || ''); 
        setFlagsGuessed(userData.flagsGuessed || 0); 
      } else {
        // If no data exists, set initial user data
        await set(userRef, { nickname: '', flagsGuessed: 0 });
        setNickname(''); 
        setFlagsGuessed(0); 
      }
    } catch (error) {
      console.error("Error fetching user data: ", error);
    }
  };


   //Fetches data from -> leaderboard
  const fetchLeaderboard = async () => {
    try {
      const leaderboardRef = ref(db, `leaderboard`);
      const snapshot = await get(leaderboardRef);

      if (snapshot.exists()) {
        const leaderboardData = snapshot.val();
        const leaderboardArray = Object.keys(leaderboardData).map(uid => ({
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

  // Makes sure the data is updated when user lands from GameScreen to HomeScreen
  useEffect(() => {
    if (isFocused) {
      fetchUserData();
      fetchLeaderboard();
    }
  }, [isFocused]);


  //Nickname setter
  const handleSetNickname = async () => {
    if (nicknameInput.trim() === '') {
      Alert.alert('Invalid nickname', 'Please enter a valid nickname.');
      return;
    }
    try {
      const userRef = ref(db, `users/${userId}`);
      await set(userRef, {
        nickname: nicknameInput,
        flagsGuessed: flagsGuessed, // Keep the current flags guessed count
      });
      setNickname(nicknameInput); 
      setNicknameInput(''); 
      Alert.alert('Nickname set!', 'Your nickname will be displayed on the leaderboard.');
      fetchLeaderboard(); // Refresh leaderboard after setting nickname
    } catch (error) {
      console.error("Error setting nickname: ", error);
      Alert.alert('Error', 'Could not set nickname. Please try again.');
    }
  };

  return (
    <View>
      <Text>Welcome, {auth.currentUser?.email}</Text>
      <Text>Total Unique Flags Guessed: {flagsGuessed}</Text>
      <Text>Nickname: {nickname || 'No nickname set'}</Text>

      {/* Show nickname input if no nickname is set */}
      {!nickname && (
        <>
          <TextInput
            placeholder="Enter your nickname"
            value={nicknameInput}
            onChangeText={setNicknameInput}
            style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
          />
          <Button title="Set Nickname" onPress={handleSetNickname} />
        </>
      )}

      <Text>Top 5 Leaderboard:</Text>
      {leaderboard.map((user, index) => (
        <Text key={user.uid}>{user.nickname || 'Unknown'}: {user.flagsGuessed} flags guessed</Text>
      ))}

      <Button title="Start Game" onPress={() => navigation.navigate("Game")} />
    </View>
  );
};

export default HomeScreen;
