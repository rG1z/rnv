import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ImageBackground,
} from "react-native";
import axios from "axios";
import {
  NavigationContainer,
  useNavigation,
  NavigationProp,
} from "@react-navigation/native";
import "@react-native-firebase/firestore";

type Movie = {
  _id: string;
  title: string;
  poster: string;
  year: string;
  genre: string;
};

const MovieApp = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const navigation = useNavigation<NavigationProp<any>>();
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [genres, setGenres] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await axios.get<Movie[]>(
        "http://192.168.1.119:3000/movies"
      );
      setMovies(response.data);

      const movieGenres = response.data.map((movie: Movie) => movie.genre);
      const uniqueGenres: string[] = [...new Set(movieGenres)];
      setGenres(uniqueGenres);
    } catch (error) {
      console.error(error);
    }
  };

  const handleMoviePress = (movie: Movie) => {
    navigation.navigate("MovieDetails", { movie, genre: movie.genre });
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
      <View style={styles.genreContainer}>
        <TextInput
          ref={searchInputRef}
          style={styles.searchBar}
          placeholder="Search movie by title"
          placeholderTextColor={"white"}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => {
            searchInputRef.current?.setNativeProps({
              style: { borderColor: "yellow" },
            });
          }}
          onBlur={() => {
            searchInputRef.current?.setNativeProps({
              style: { borderColor: "#ccc" },
            });
          }}
        />
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          <View style={styles.genreButtonContainer}>
            <TouchableOpacity
              style={[
                styles.genreButton,
                !selectedGenre && styles.genreButtonSelected,
              ]}
              onPress={() => setSelectedGenre(null)}
            >
              <Text style={styles.genreButtonText}>All Genres</Text>
            </TouchableOpacity>
            {genres.map((genre) => (
              <TouchableOpacity
                key={genre}
                style={[
                  styles.genreButton,
                  genre === selectedGenre && styles.genreButtonSelected,
                ]}
                onPress={() => setSelectedGenre(genre)}
              >
                <Text style={styles.genreButtonText}>{genre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
      <ScrollView>
        <View style={styles.movieContainer}>
          {movies
            .filter(
              (movie) =>
                (!selectedGenre || movie.genre === selectedGenre) &&
                (searchQuery === "" ||
                  movie.title.toLowerCase().includes(searchQuery.toLowerCase()))
            )
            .map((movie, index) => (
              <TouchableOpacity
                key={movie._id}
                style={styles.movieCard}
                onPress={() => handleMoviePress(movie)}
              >
                <Image
                  source={{ uri: movie.poster }}
                  style={styles.moviePoster}
                />
                <View style={styles.movieInfo}>
                  <Text style={styles.movieTitle}>{movie.title}</Text>
                  <Text style={styles.movieYear}>{movie.year}</Text>
                  <Text style={styles.movieGenre}>{movie.genre}</Text>
                </View>
              </TouchableOpacity>
            ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  genreContainer: {
    marginBottom: 10,
  },
  movieContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingTop: 10,
  },
  movieCard: {
    width: "48%",
    marginBottom: 20,
    alignItems: "center",
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
  genreButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  genreButton: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#ffdead",
    borderRadius: 5,
    marginHorizontal: 5,
  },
  genreButtonSelected: {
    backgroundColor: "#20b2aa",
  },
  genreButtonText: {
    color: "grey",
    fontWeight: "bold",
  },
  searchBar: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    color: "white",
  },
});

export default MovieApp;
