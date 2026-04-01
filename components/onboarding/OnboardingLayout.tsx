import { useRouter } from "expo-router";
import React, { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../theme/colors";
import { Spacing } from "../../theme/spacing";
import { Typography } from "../../theme/typography";
import { Button } from "../ui/Button";

interface OnboardingLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  step?: number;
  totalSteps?: number;
  onNext?: () => void;
  nextLabel?: string;
  showBack?: boolean;
  showSkip?: boolean;
  onSkip?: () => void;
  nextDisabled?: boolean;
}

export function OnboardingLayout({
  children,
  title,
  subtitle,
  step,
  totalSteps = 30,
  onNext,
  nextLabel = "Continuar",
  showBack = true,
  showSkip = false,
  onSkip,
  nextDisabled = false,
}: OnboardingLayoutProps) {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          {showBack && (
            <Pressable
              onPress={() => router.back()}
              style={styles.backButton}
              accessibilityLabel="Voltar"
            >
              <Text style={styles.backText}>{"←"}</Text>
            </Pressable>
          )}
          {step != null && (
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(step / totalSteps) * 100}%` },
                  ]}
                />
              </View>
            </View>
          )}
          {showSkip && (
            <Pressable onPress={onSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Pular</Text>
            </Pressable>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          {children}
        </View>

        {/* Footer */}
        {onNext && (
          <View style={styles.footer}>
            <Button
              title={nextLabel}
              onPress={onNext}
              variant="pill"
              fullWidth
              disabled={nextDisabled}
            />
          </View>
        )}
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
    paddingHorizontal: Spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    fontSize: 24,
    color: Colors.text,
  },
  progressContainer: {
    flex: 1,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.blush,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.rose,
    borderRadius: 2,
  },
  skipButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  skipText: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.sm,
    color: Colors.textLight,
  },
  content: {
    flex: 1,
    paddingTop: Spacing.xl,
  },
  title: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes["2xl"],
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.base,
    color: Colors.textLight,
    lineHeight: Typography.sizes.base * Typography.lineHeights.relaxed,
    marginBottom: Spacing.xl,
  },
  footer: {
    paddingVertical: Spacing.xl,
  },
});
