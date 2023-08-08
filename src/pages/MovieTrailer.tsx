import React, {useRef} from 'react';
import {View, StyleSheet, Dimensions, ImageBackground} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import Video from 'react-native-video';

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

const MovieTrailer: React.FC = () => {
  const route = useRoute<RouteProp<StackParamList, 'MovieTrailer'>>();
  const {movie} = route.params;
  const videoRef = useRef<Video | null>(null);

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{uri: movie.videoLink}}
        style={styles.videoPlayer}
        resizeMode={'cover'}
        controls={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ebebeb',
  },
  videoPlayer: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width * (9 / 16),
    backgroundColor: 'black',
  },
});

export default MovieTrailer;
