import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "next/router";
import axios from "axios";
import { isPlatformWeb } from "@rnv/renative";

type Movie = {
  _id: string;
  title: string;
  poster: string;
  year: string;
  genre: string;
  description: string;
  videoLink: string;
};

const MovieTrailer: React.FC = () => {
  const router = useRouter();
  const { movieId } = router.query;
  const [movie, setMovie] = useState<Movie | null>(null);

  useEffect(() => {
    if (movieId) {
      fetchMovieDetails(movieId as string);
    }
  }, [movieId]);

  const fetchMovieDetails = async (id: string) => {
    try {
      const response = await axios.get<Movie>(
        `http://192.168.1.119:3000/movies/${id}`
      );
      setMovie(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!movie) {
    return <p>Loading...</p>;
  }

  const videoWidth = Dimensions.get("window").width;
  const videoHeight = videoWidth * (12 / 18);

  return (
    <View style={styles.container}>
      <iframe
        src={movie.videoLink}
        width={videoWidth}
        height={videoHeight}
        frameBorder="0"
        allowFullScreen
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ebebeb",
    ...(isPlatformWeb && { height: "100vh" }),
  },
});

export default MovieTrailer;
