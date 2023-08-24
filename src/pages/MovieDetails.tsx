import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Button,
  TouchableOpacity,
  Alert,
  ScrollView,
  ImageBackground,
} from "react-native";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import firebaseApp from "./firebaseConfig";
import axios from "axios";
import { useRouter } from "next/router";
import { isPlatformWeb } from "@rnv/renative";

const { height, width } = Dimensions.get("window");

const setHeight = (h: number) => (height / 100) * h;
const setWidth = (w: number) => (width / 100) * w;

type Movie = {
  _id: string;
  title: string;
  poster: string;
  year: string;
  genre: string;
  description: string;
  videoLink: string;
  imdbRating: string;
};

type StackParamList = {
  MovieDetails: { movieId: string };
};

const MovieDetailsScreen: React.FC = ({}) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [inLibrary, setInLibrary] = useState(false);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const router = useRouter();
  const movie = router.query.movie as unknown as Movie;
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore();
  const { movieId = "" } = router.query;
  const [movieDetails, setMovieDetails] = useState<Movie | null>(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await axios.get<Movie>(
          `http://192.168.1.119:3000/movies/${movieId}`
        );
        const movieDetails = response.data;

        setMovieDetails(movieDetails);
      } catch (error) {
        console.error(error);
      }
    };

    if (movieId) {
      fetchMovieDetails();
    }
  }, [movieId]);

  useEffect(() => {
    if (movieDetails) {
      fetchSimilarMovies();
    }
  }, [movieDetails]);

  const fetchSimilarMovies = async () => {
    try {
      if (movieDetails && movieDetails.genre) {
        // Check if movieDetails and genre are not null
        const response = await axios.get<Movie[]>(
          `http://192.168.1.119:3000/movies/genre/${movieDetails.genre}`
        );
        const filteredMovies = response.data.filter(
          (similarMovie) => similarMovie._id !== movieDetails._id
        );
        setSimilarMovies(filteredMovies);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const addToLibrary = async (movie: Movie) => {
    try {
      const user = auth.currentUser;

      if (user && movieDetails) {
        console.log("Adding to library:", movieDetails);
        const userDocRef = doc(firestore, "users", user.uid);
        const movieDocRef = doc(userDocRef, "movies", movieDetails._id);

        const movieSnapshot = await getDoc(movieDocRef);
        if (!movieSnapshot.exists()) {
          await setDoc(movieDocRef, {
            title: movieDetails.title,
            poster: movieDetails.poster,
            year: movieDetails.year,
            genre: movieDetails.genre,
            description: movieDetails.description,
            videoLink: movieDetails.videoLink,
          });

          setInLibrary(true);
          localStorage.setItem(movieDetails._id, "true");
          Alert.alert("Movie added to library!");
        } else {
          Alert.alert("Movie is already in your library.");
        }
      } else {
        Alert.alert("Please login to add movies to your library.");
      }
    } catch (error) {
      Alert.alert("Error adding movie to library:");
    }
  };

  const removeFromLibrary = async (movie: Movie) => {
    try {
      const user = auth.currentUser;

      if (user && movieDetails) {
        const userDocRef = doc(firestore, "users", user.uid);
        const movieDocRef = doc(userDocRef, "movies", movieDetails._id);

        // Check if the movie exists in the library
        const movieSnapshot = await getDoc(movieDocRef);
        if (movieSnapshot.exists()) {
          // Movie exists in library, remove it
          await deleteDoc(movieDocRef);

          setInLibrary(false);
          localStorage.removeItem(movieDetails._id);
          Alert.alert("Movie removed from library!");
        } else {
          Alert.alert("Movie is not in your library.");
        }
      } else {
        Alert.alert("Please login to remove movies from your library.");
      }
    } catch (error) {
      Alert.alert("Error removing movie from library:");
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setAuthenticated(true);
        checkIfMovieInLibrary(user.uid);
        fetchSimilarMovies();
      } else {
        setAuthenticated(false);
        setInLibrary(false);
        fetchSimilarMovies();
      }
    });
    const stringMovieId = Array.isArray(movieId) ? movieId[0] : movieId;

    if (localStorage.getItem(stringMovieId) === "true") {
      setInLibrary(true);
    }

    return () => {
      unsubscribe();
    };
  }, []);

  const checkIfMovieInLibrary = async (userId: string) => {
    try {
      if (movieDetails) {
        const userDocRef = doc(firestore, "users", userId);
        const movieDocRef = doc(userDocRef, "movies", movieDetails._id);

        const movieSnapshot = await getDoc(movieDocRef);
        setInLibrary(movieSnapshot.exists());
      }
    } catch (error) {
      console.log("Error checking movie in library:", error);
      setInLibrary(false);
    }
  };
  const movieTrailerPress = () => {
    console.log("Movie trailer button pressed");
    if (movieDetails && movieDetails._id) {
      console.log("Navigating to movie trailer with ID:", movieDetails._id);
      router.push({
        pathname: "/MovieTrailer",
        query: { movieId: movieDetails._id },
      });
    } else {
      console.error("Invalid movie object:", movieDetails);
    }
  };
  const movieDetailsSimilar = (similarMovie: Movie) => {
    router.push({
      pathname: "/MovieDetails",
      query: { movieId: similarMovie._id },
    });
  };

  return (
    <ScrollView>
      <ImageBackground
        source={require("../../platformAssets/runtime/img.png")}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
        }}
      ></ImageBackground>
      <View style={styles.allMoviesButton}>
        <Button
          title="All Movies"
          onPress={() => {
            router.push("/HomePage");
          }}
          color="rgba(111, 202, 186, 1)"
        />
      </View>
      <View style={styles.container}>
        <View style={styles.posterDescrpContainer}>
          {movieDetails?.poster ? (
            <Image
              source={{ uri: movieDetails?.poster }}
              style={styles.poster}
            />
          ) : (
            <Text>No poster available</Text>
          )}
          <Text style={styles.movieTitle}>{movieDetails?.title}</Text>
          <Text style={styles.movieYearGenre}>
            {movieDetails?.year} {movieDetails?.genre}
          </Text>
          <Text style={styles.movieImdb}>
            IMDB Rating: {movieDetails?.imdbRating}
          </Text>
        </View>
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>Description</Text>
          <Text style={styles.descriptionTextReal}>
            {movieDetails?.description}
          </Text>
        </View>
        <View style={styles.addToBttn}>
          {authenticated ? (
            <Button
              title={inLibrary ? "Remove from Library" : "Add To Library"}
              onPress={() =>
                inLibrary ? removeFromLibrary(movie) : addToLibrary(movie)
              }
            />
          ) : null}
          <Button
            title="Watch Movie Trailer"
            onPress={() => movieTrailerPress()}
          ></Button>
        </View>
        <View>
          <Text style={styles.similarMoviesText}>Similar movies</Text>
        </View>
        <ScrollView horizontal style={styles.similarMoviePosterContainer}>
          {similarMovies?.map((similarMovie) => (
            <TouchableOpacity
              key={similarMovie._id}
              onPress={() => movieDetailsSimilar(similarMovie)}
            >
              <Image
                source={{ uri: similarMovie?.poster }}
                style={styles.similarPoster}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    ...(isPlatformWeb && { height: "100vh" }),
  },
  poster: {
    width: setWidth(145),
    height: setHeight(35),
    resizeMode: "contain",
    alignItems: "center",
  },
  similarMoviePosterContainer: {
    paddingTop: 30,
    flexDirection: "row", // Added this line
    width: "100%",
    height: setHeight(35),
  },
  posterDescrpContainer: {
    alignItems: "center",
    paddingTop: 5,
  },
  similarPoster: {
    width: setWidth(10),
    height: setHeight(22),
  },
  movieTitle: {
    color: "white",
    fontFamily: "NunitoSans-ExtraBold",
    fontSize: 25,
    alignItems: "center",
    paddingTop: 30,
  },
  movieYearGenre: {
    fontSize: 13,
    alignItems: "center",
    paddingTop: 5,
    color: "white",
  },
  movieImdb: {
    fontSize: 13,
    alignItems: "center",
    paddingTop: 5,
    color: "white",
  },
  descriptionContainer: {
    paddingTop: 55,
    paddingLeft: 5,
  },
  descriptionText: {
    fontSize: 23,
    fontFamily: "NunitoSans-ExtraBold",
    color: "white",
    margin: 15,
  },
  descriptionTextReal: {
    fontSize: 25,
    fontFamily: "NunitoSans-SemiBold",
    color: "white",
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "white",
    borderStyle: "solid",
  },
  addToBttn: {
    paddingHorizontal: 5,
    paddingVertical: 15,
    width: "100%",
    flexDirection: "row",
    paddingTop: 10,
    alignSelf: "center",
    margin: 10,
  },
  similarMoviesText: {
    fontSize: 20,
    fontFamily: "NunitoSans-ExtraBold",
    color: "white",
    paddingTop: 1,
    alignSelf: "center",
  },
  allMoviesButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 1,
  },
});

export default MovieDetailsScreen;
