import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '../../../components/ui/Button';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Spacing } from '../../../theme/spacing';

export default function ArticleScreen() {
  const { slug } = useLocalSearchParams();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView>
        <View style={styles.container}>
          <Button title="← Voltar" onPress={() => router.back()} variant="ghost" />
          <Text style={styles.title}>Artigo</Text>
          <Text style={styles.body}>
            Conteúdo do artigo "{slug}" será carregado aqui.
            {'\n\n'}
            Este é um placeholder para o conteúdo editorial que será criado pela equipe de conteúdo da Luna.
            {'\n\n'}
            Os artigos serão personalizados com base na fase atual do ciclo da usuária e seus objetivos.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  container: {
    padding: Spacing.base,
  },
  title: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes['2xl'],
    color: Colors.text,
    marginVertical: Spacing.lg,
  },
  body: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.base,
    color: Colors.text,
    lineHeight: Typography.sizes.base * Typography.lineHeights.relaxed,
  },
});
