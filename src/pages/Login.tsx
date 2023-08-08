import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ImageBackground,
} from "react-native";
import firebase from "./firebaseConfig";
import "@react-native-firebase/auth";
import "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

const MyComponent: React.FC = () => {
  const [fullNameVisible, setFullNameVisible] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const navigation = useNavigation();

  const register = async () => {
    if (!validateEmail(email) || !validatePassword(password)) {
      Alert.alert("Email or Password is invalid!");
      return;
    }
    if (!validateField(fullName)) {
      Alert.alert("Full Name is required!");
      return;
    }

    try {
      const userCredential = await firebase
        .auth()
        .createUserWithEmailAndPassword(email, password);

      if (userCredential && userCredential.user) {
        const user = userCredential.user;

        await firebase.firestore().collection("users").doc(user.uid).set({
          fullName,
        });

        Alert.alert("User Created!!");
      }
    } catch (error) {
      Alert.alert("Error creating user");
    }
  };

  const login = async () => {
    if (!validateEmail(email) || !validatePassword(password)) {
      Alert.alert("Email or Password is invalid!");
      return;
    }

    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);

      Alert.alert("Logged in successfully!");

      navigation.navigate("HomePage" as never);
    } catch (error) {
      Alert.alert("Error logging in:");
    }
  };

  const validateEmail = (email: string): boolean => {
    const expression = /^[^@]+@\w+(\.\w+)+\w$/;
    return expression.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const validateField = (field: string): boolean => {
    return field.trim() !== "";
  };

  const handleButtonClick = () => {
    if (fullNameVisible) {
      register();
    } else {
      login();
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../platformAssets/runtime/img.png")}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
        }}
      ></ImageBackground>
      <View style={styles.formContainer}>
        <View style={styles.formHeaderContainer}>
          <Text style={styles.formHeader}>Login/Register</Text>
        </View>
        <View style={styles.formContentContainer}>
          <View style={styles.formContentInnerContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              onChangeText={(text) => setEmail(text)}
              value={email}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={"black"}
              secureTextEntry={true}
              onChangeText={(text) => setPassword(text)}
              value={password}
            />
            {fullNameVisible && (
              <View style={styles.fullNameContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  onChangeText={(text) => setFullName(text)}
                  value={fullName}
                />
              </View>
            )}
            <View style={styles.buttonContainer}>
              <Button title="Login" onPress={handleButtonClick} />
              <Button
                title={fullNameVisible ? "Create User" : "Register"}
                onPress={() => setFullNameVisible(!fullNameVisible)}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    width: "80%",
    padding: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
  formHeaderContainer: {
    marginBottom: 10,
  },
  formHeader: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: `#006400`,
  },
  formContentContainer: {
    marginTop: 10,
  },
  formContentInnerContainer: {},
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  fullNameContainer: {
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default MyComponent;
