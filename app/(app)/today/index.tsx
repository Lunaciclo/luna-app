import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';

export default function TodayScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>🌙 Luna</Text>
        <Text style={styles.subtitle}>Bem-vinda ao app!</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: 32,
    color: Colors.text,
  },
  subtitle: {
    fontFamily: Typography.fonts.body,
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 8,
  },
});