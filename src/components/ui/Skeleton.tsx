import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius } from '../../theme';

interface Props { width?: number | string; height?: number; style?: ViewStyle; }

export default function Skeleton({ width = '100%', height = 20, style }: Props) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[styles.base, { width: width as any, height, opacity }, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: Colors.card, borderRadius: Radius.sm },
});
