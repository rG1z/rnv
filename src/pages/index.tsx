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
import firebaseApp from "./firebaseConfig";
import "firebase/firestore";
import { useRouter } from "next/router";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { isPlatformWeb } from "@rnv/renative";

isPlatformWeb && { height: "100vh" };

const MyComponent: React.FC = () => {
  const [fullNameVisible, setFullNameVisible] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const router = useRouter();
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);

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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (userCredential && userCredential.user) {
        const user = userCredential.user;

        await setDoc(doc(firestore, "users", user.uid), {
          fullName,
        });

        Alert.alert("User Created!!");
        console.log(userCredential);
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error creating user");
    }
  };

  const login = async () => {
    if (!validateEmail(email) || !validatePassword(password)) {
      Alert.alert("Email or Password is invalid!");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);

      Alert.alert("Logged in successfully!");

      router.push("/HomePage");
    } catch (error) {
      console.log("Login error:", error);
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
    ...(isPlatformWeb && { height: "100vh" }),
  },
  formContainer: {
    width: "40%",
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
