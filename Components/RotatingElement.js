import React, { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

const RotatingElement = (duration = 17000) => {
    const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start the infinite rotation animation
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1, // Complete one full rotation
        duration, // Rotation duration
        useNativeDriver: true, // Optimize with native driver
      })
    ).start();
  }, [rotation, duration]);

  // Interpolate the animated value to degrees
  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return rotateInterpolate;
};


export default RotatingElement;
