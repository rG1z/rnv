import React, {useState, useEffect} from 'react';
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
} from 'react-native';
import {NavigationProp, RouteProp, useRoute} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {useNavigation} from '@react-navigation/native';
import firebase from './firebaseConfig';
import axios from 'axios';

const {height, width} = Dimensions.get('window');

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
};

type StackParamList = {
  MovieDetails: {movie: Movie};
  MovieTrailer: {movie: Movie};
};

type MovieDetailsScreenRouteProp = RouteProp<StackParamList, 'MovieDetails'>;

const MovieDetailsScreen: React.FC = ({}) => {
  const route = useRoute<MovieDetailsScreenRouteProp>();
  const {movie}: {movie: Movie} = route.params;
  const [authenticated, setAuthenticated] = useState(false);
  const [inLibrary, setInLibrary] = useState(false);
  const navigation = useNavigation<NavigationProp<any>>();
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);

  const fetchSimilarMovies = async () => {
    try {
      const response = await axios.get<Movie[]>(
        `http://192.168.1.119:3000/movies/genre/${movie.genre}`,
      );
      const filteredMovies = response.data.filter(
        similarMovie => similarMovie._id !== movie._id,
      );
      setSimilarMovies(filteredMovies);
    } catch (error) {
      console.error(error);
    }
  };

  const addToLibrary = async (movie: Movie) => {
    try {
      const user = firebase.auth().currentUser;

      if (user) {
        await firebase
          .firestore()
          .collection('users')
          .doc(user.uid)
          .collection('movies')
          .doc(movie._id)
          .set({
            title: movie.title,
            poster: movie.poster,
            year: movie.year,
            genre: movie.genre,
            description: movie.description,
            videoLink: movie.videoLink,
          });

        setInLibrary(true);
        Alert.alert('Movie added to library!');
      } else {
        Alert.alert('Please login to add movies to your library.');
      }
    } catch (error) {
      Alert.alert('Error adding movie to library:');
    }
  };

  const removeFromLibrary = async (movie: Movie) => {
    try {
      const user = firebase.auth().currentUser;

      if (user) {
        await firebase
          .firestore()
          .collection('users')
          .doc(user.uid)
          .collection('movies')
          .doc(movie._id)
          .delete();

        setInLibrary(false);
        Alert.alert('Movie removed from library!');
      } else {
        Alert.alert('Please login to remove movies from your library.');
      }
    } catch (error) {
      Alert.alert('Error removing movie from library:');
    }
  };

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        setAuthenticated(true);
        checkIfMovieInLibrary(user.uid);
        fetchSimilarMovies();
      } else {
        setAuthenticated(false);
        setInLibrary(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const checkIfMovieInLibrary = async (userId: string) => {
    try {
      const docSnapshot = await firebase
        .firestore()
        .collection('users')
        .doc(userId)
        .collection('movies')
        .doc(movie._id)
        .get();

      setInLibrary(docSnapshot.exists);
    } catch (error) {
      console.log('Error checking movie in library:', error);
    }
  };

  const movieTrailerPress = (movie: Movie) => {
    navigation.navigate('MovieTrailer', {movie});
  };
  const movieDetailsSimilar = (movie: Movie) => {
    navigation.navigate('MovieDetails', {movie});
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        {movie.poster ? (
          <Image source={{uri: movie.poster}} style={styles.poster} />
        ) : (
          <Text>No poster available</Text>
        )}
        <View>
          <TouchableOpacity onPress={() => movieTrailerPress(movie)}>
            <AntDesign
              name="playcircleo"
              size={60}
              color="white"
              style={{position: 'absolute', top: -130, left: -25}}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.movieTitle}>{movie.title}</Text>
        <Text style={styles.movieYearGenre}>
          {movie.year} {movie.genre}
        </Text>
      </View>
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionText}>Description</Text>
        <Text style={styles.descriptionTextReal}>{movie.description}</Text>
      </View>
      <View style={styles.addToBttn}>
        {authenticated ? (
          <Button
            title={inLibrary ? 'Remove from Library' : 'Add To Library'}
            onPress={() =>
              inLibrary ? removeFromLibrary(movie) : addToLibrary(movie)
            }
          />
        ) : null}
      </View>
      <View>
        <Text style={styles.similarMoviesText}>Similar movies</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.similarMoviePosterContainer}>
        {similarMovies.map(similarMovie => (
          <TouchableOpacity
            key={similarMovie._id}
            onPress={() => movieDetailsSimilar(similarMovie)}>
            <Image
              source={{uri: similarMovie.poster}}
              style={styles.similarPoster}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    height: setHeight(35),
    width: setWidth(145),
    alignItems: 'center',
    position: 'relative',
    left: setWidth((100 - 145) / 2),
    top: 0,
    borderBottomRightRadius: 300,
    borderBottomLeftRadius: 300,
    elevation: 8,
  },
  poster: {
    borderBottomRightRadius: 300,
    borderBottomLeftRadius: 300,
    width: setWidth(145),
    height: setHeight(35),
    resizeMode: 'contain',
  },
  similarMoviePosterContainer: {
    paddingTop: 30,
    flex: 1,
    resizeMode: 'cover',
    width: setWidth(145),
    height: setHeight(35),
  },
  similarPoster: {
    width: setWidth(25),
    height: setHeight(25),
  },
  movieTitle: {
    color: 'black',
    fontFamily: 'NunitoSans-ExtraBold',
    fontSize: 20,
    alignItems: 'center',
    paddingTop: 30,
  },
  movieYearGenre: {
    fontSize: 13,
    alignItems: 'center',
    paddingTop: 5,
    color: 'black',
  },
  descriptionContainer: {
    paddingTop: 100,
    paddingLeft: 5,
  },
  descriptionText: {
    fontSize: 18,
    fontFamily: 'NunitoSans-ExtraBold',
    color: 'black',
  },
  descriptionTextReal: {
    fontSize: 15,
    fontFamily: 'NunitoSans-SemiBold',
    color: 'black',
  },
  addToBttn: {
    paddingTop: 15,
    paddingLeft: 5,
    width: 100,
    height: 100,
  },
  similarMoviesText: {
    fontSize: 17,
    fontFamily: 'NunitoSans-ExtraBold',
    color: 'black',
  },
});

export default MovieDetailsScreen;
