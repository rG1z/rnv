import React, { useState, useEffect } from "react";
import { Button, Alert, View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import auth from "@react-native-firebase/auth";
import MyComponent from "../pages/Login";
import MovieApp from "../pages/HomePage";
import MovieDetailsScreen from "../pages/MovieDetails";
import MovieTrailer from "../pages/MovieTrailer";
import MyListScreen from "../pages/MyList";

const Stack = createNativeStackNavigator();

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [buttonText, setButtonText] = useState("Logout");

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (user) {
        setAuthenticated(true);
        setButtonText("Logout");
      } else {
        setAuthenticated(false);
        setButtonText("Login");
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleLogout = (navigation: { navigate: (arg0: string) => void }) => {
    if (authenticated) {
      auth()
        .signOut()
        .then(() => {
          setAuthenticated(false);
        })
        .catch((error) => {
          console.log("Sign out failed:", error);
        });
    } else {
      navigation.navigate("Login");
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={MyComponent}
          options={{
            title: "Login",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="MyList"
          component={MyListScreen}
          options={{ title: "My Library" }}
        />
        <Stack.Screen
          name="HomePage"
          component={MovieApp}
          options={({ navigation }) => ({
            title: "",
            headerTitleAlign: "center",
            headerRight: () => (
              <View
                style={{
                  flexDirection: "row",
                  marginRight: 10,
                }}
              >
                {authenticated && (
                  <Button
                    onPress={() => navigation.navigate("MyList")}
                    title="My List"
                    color="rgba(111, 202, 186, 1)"
                  />
                )}
                <View style={{ width: 15 }} />
                <Button
                  onPress={() => handleLogout(navigation)}
                  title={buttonText}
                  color="rgba(111, 202, 186, 1)"
                />
              </View>
            ),
          })}
        />

        <Stack.Screen
          name="MovieDetails"
          component={MovieDetailsScreen}
          options={{
            title: "Movie Details",
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="MovieTrailer"
          component={MovieTrailer}
          options={{ title: "Trailer", headerTitleAlign: "center" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
