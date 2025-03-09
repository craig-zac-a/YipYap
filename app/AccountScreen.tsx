import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, View, Button } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function AccountScreen({ navigation }: any) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Empty for now :(</ThemedText>
      
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  reactLogo: {
    height: 178,
    width: 290,
    marginBottom: 40,
  },
  buttonContainer: {
    gap: 16,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
});
