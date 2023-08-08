import firebase from "./firebaseConfig";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import "@react-native-firebase/firestore";

type Movie = {
  _id: string;
  title: string;
  poster: string;
  year: string;
  genre: string;
  description: string;
  videoLink: string;
};

const MyListScreen: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const navigation = useNavigation<NavigationProp<any>>();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const user = firebase.auth().currentUser;

        if (user) {
          const snapshot = await firebase
            .firestore()
            .collection("users")
            .doc(user.uid)
            .collection("movies")
            .get();

          const movieList: Movie[] = [];
          snapshot.forEach((doc) => {
            const movieData = doc.data();
            const movie: Movie = {
              _id: doc.id,
              title: movieData.title,
              poster: movieData.poster,
              year: movieData.year,
              genre: movieData.genre,
              description: movieData.description,
              videoLink: movieData.videoLink,
            };
            movieList.push(movie);
          });

          setMovies(movieList);
        }
      } catch (error) {
        console.log("Error fetching movies:", error);
      }
    };

    fetchMovies();
  }, []);
  const handleMoviePress = (movie: Movie) => {
    navigation.navigate("MovieDetails", { movie });
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <ImageBackground
          source={require("../../platformAssets/runtime/img.png")}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
          }}
        ></ImageBackground>
        {movies.map((movie) => (
          <TouchableOpacity
            key={movie._id}
            style={styles.movieCard}
            onPress={() => handleMoviePress(movie)}
          >
            <Image source={{ uri: movie.poster }} style={styles.moviePoster} />
            <View style={styles.movieInfo}>
              <Text style={styles.movieTitle}>{movie.title}</Text>
              <Text style={styles.movieYear}>{movie.year}</Text>
              <Text style={styles.movieGenre}>{movie.genre}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 10,
  },
  movieCard: {
    width: "48%",
    marginBottom: 20,
    alignItems: "center",
    paddingTop: 20,
  },
  moviePoster: {
    width: 180,
    height: 250,
  },
  movieInfo: {
    marginTop: 10,
    alignItems: "center",
  },
  movieTitle: {
    fontSize: 16,
    textAlign: "center",
    fontFamily: "NunitoSans-ExtraBold",
    color: "white",
  },
  movieYear: {
    fontSize: 14,
    textAlign: "center",
    fontFamily: "NunitoSans-Bold",
    color: "white",
  },
  movieGenre: {
    fontSize: 12,
    textAlign: "center",
    fontFamily: "NunitoSans-Bold",
    color: "white",
  },
});

export default MyListScreen;
