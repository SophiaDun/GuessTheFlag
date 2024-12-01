import React, { useState, useEffect } from "react";
import { View, Text, Pressable, TextInput, StyleSheet, Modal, TouchableOpacity, Image,ImageBackground, Alert } from "react-native";
import { auth, db } from "../Config/FirebaseConfig";
import { ref, update, get } from "firebase/database";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import profilePictureMap from "../Components/ProfilePictureMap";
import Ionicons from '@expo/vector-icons/Ionicons';

const SettingsScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState("");
  const [profilePicture, setProfilePicture] = useState("pp-2.png");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(""); 

  const userId = auth.currentUser?.uid;

  const reauthenticate = async (currentPassword) => {
    try {
      // Ensure user is signed in and has the necessary credentials
      if (!auth.currentUser) {
        throw new Error("User is not authenticated.");
      }

      // Create credential for reauthentication
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);

      // Reauthenticate using current password
      await reauthenticateWithCredential(auth.currentUser, credential);
    } catch (error) {
      setError("Reauthentication failed. Please check your current password.");
      throw new Error("Reauthentication failed: " + error.message);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const userRef = ref(db, `users/${userId}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        setUsername(userData.username);
        setProfilePicture(userData.profilePicture || "pp-2.png");
      }
    };

    fetchUserData();
  }, [userId]);

  const handleChangeUsername = async () => {
    if (!username.trim()) {
      alert("Username cannot be empty!");
      return;
    }

    try {
      const userRef = ref(db, `users/${userId}`);
      await update(userRef, { username });


      const leaderboardRef = ref(db, `leaderboard/${userId}`);
      // Fetch leaderboard data to confirm if the user exists in the leaderboard
      const snapshot = await get(leaderboardRef);
      if (snapshot.exists()) {
        // User exists in the leaderboard, update the username
        await update(leaderboardRef, { username });
        alert("Username updated successfully!");
      } else {
        alert("User not found in leaderboard.");
      }

      setModalVisible(false);
    } catch (error) {
      alert("Failed to update username. Try again.");
      console.error("Error updating username: ", error);
    }
  };


  const handleProfilePictureChange = (pictureUri) => {
    setProfilePicture(pictureUri);

    // Update the user's profile picture in the 'users' node
    const userRef = ref(db, `users/${userId}`);
    update(userRef, { profilePicture: pictureUri })
      .then(() => {
        const leaderboardRef = ref(db, `leaderboard/${userId}`);

        // Fetch leaderboard data to confirm if the user exists in the leaderboard
        get(leaderboardRef).then((snapshot) => {
          if (snapshot.exists()) {
            // User exists in the leaderboard, update the profile picture
            update(leaderboardRef, { profilePicture: pictureUri })
              .then(() => {
                alert("Profile picture updated successfully!");
                setModalVisible(false); 
              })
              .catch((error) => {
                console.error("Error updating leaderboard profile picture: ", error);
                alert("Error updating profile picture in leaderboard.");
              });
          } else {
            alert("User not found in leaderboard.");
          }
        });
      })
      .catch((error) => {
        console.error("Error updating profile picture: ", error);
        alert("Error updating profile picture.");
      });
  };





  const handleChangePassword = async () => {
    if (!newPassword || !currentPassword) {
      setError("Please provide both a new password and your current password.");
      return;
    }

    try {
      // Reauthenticate the user using their current password
      await reauthenticate(currentPassword);
      await updatePassword(auth.currentUser, newPassword);

      // Clear password inputs and show success alert
      setNewPassword(""); 
      setCurrentPassword("");
      Alert.alert("Password updated successfully!");

      setModalVisible(false);
    } catch (error) {
      setError(error.message); 
    }
  };

  return (
    <ImageBackground source={require('../assets/bg-2.png')} style={styles.container}>
     <Pressable style={styles.goBackContainer} onPress={() => navigation.navigate('Home')}>
  <Ionicons name="arrow-back-circle" size={38} color="#1a2947" />
  <Text style={styles.goBackText}>Home</Text>
</Pressable>

      <View style={styles.borderBackground}>
      <Text style={styles.header}>Settings</Text>
      <View style={styles.hr} />

      <TouchableOpacity onPress={() => { setModalType("profilePicture"); setModalVisible(true); }}>
        <Image source={profilePictureMap[profilePicture] || profilePictureMap["pp-2.png"]} style={styles.profilePicture} />
        <Text style={styles.editText}>Edit Profile Picture</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => { setModalType("username"); setModalVisible(true); }}>
        <Text style={styles.buttonText}>Edit Username</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => { setModalType("password"); setModalVisible(true); }}>
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          {modalType === "profilePicture" && (
            <>
              <Text style={styles.modalTitle}>Choose Profile Picture</Text>
              <View style={styles.pictureOptions}>
                {["pp-1.png", "pp-2.png", "pp-3.png", "pp-4.png", "pp-5.png"].map((image, index) => (
                  <TouchableOpacity key={index} onPress={() => handleProfilePictureChange(image)}>
                    <Image source={profilePictureMap[image]} style={styles.pictureOption} />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {modalType === "username" && (
            <>
              <Text style={styles.modalTitle}>Change Username</Text>
              <TextInput
                placeholder="New Username"
                value={username}
                onChangeText={setUsername}
                style={styles.input}
              />
              <TouchableOpacity style={styles.modalButton} onPress={handleChangeUsername}>
                <Text style={styles.modalButtonText}>Update Username</Text>
              </TouchableOpacity>
            </>
          )}

          {modalType === "password" && (
            <>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TextInput
                placeholder="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                style={styles.input}
              />
              <TextInput
                placeholder="Current Password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                style={styles.input}
              />
              <TouchableOpacity style={styles.modalButton} onPress={handleChangePassword}>
                <Text style={styles.modalButtonText}>Update Password</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.modalButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop:70
  },
  goBackContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
   marginLeft:40,
   paddingBottom:10,
    alignSelf: 'flex-start', 
  },
  goBackText: {
    fontSize: 18, 
    color: '#1a2947', 
    marginLeft: 8, 
    fontWeight: 'bold', 
  },
  
  borderBackground:{
    alignItems: "center",
    backgroundColor: "#dedede",
    borderRadius: 30,
    padding: 30,
    margin:10
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1a2947"
  },

  hr: {

    height: 1,
    backgroundColor: "#1a2947",
    width: 200,
    marginVertical: 10,
    alignSelf: "center",
    marginBottom:30
  },

  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: "center",
    marginBottom: 10,
  },
  editText: {
    textAlign:"center",
    color: "#1a2947",
    fontSize: 16,
    marginBottom: 20,
  },

  button: {
    backgroundColor: "#1a2947",
    padding: 15,
    borderRadius: 10,
    width:250,
    alignItems: "center",
    marginVertical: 10,
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  errorText: {
    color: "red",
    marginVertical: 10,
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "white",
    width: "80%",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },

  modalButton: {
    backgroundColor: "#338a32",
    padding: 15,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
    marginBottom: 10,
  },

  cancelButton: {
    backgroundColor: "#d9534f",
    padding: 15,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },

  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  pictureOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
   
  pictureOption: {
    width: 70,
    height: 70,
    borderRadius: 35,
    margin: 10,
    borderWidth: 2,
    borderColor: "white",
  },
});

export default SettingsScreen;