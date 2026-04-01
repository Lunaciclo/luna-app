import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const MIN_AGE = 13;
const MAX_AGE = 55;
const DEFAULT_AGE = 25;

const AGES = Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => MIN_AGE + i);

// Padding items so the first and last real items can be centered
const PADDING_ITEMS = Math.floor(VISIBLE_ITEMS / 2);
const PADDED_DATA = [
  ...Array.from({ length: PADDING_ITEMS }, (_, i) => ({ key: `pad-top-${i}`, value: null })),
  ...AGES.map((age) => ({ key: `age-${age}`, value: age })),
  ...Array.from({ length: PADDING_ITEMS }, (_, i) => ({ key: `pad-bottom-${i}`, value: null })),
];

export default function AgeScreen() {
  const router = useRouter();
  const { ageRange, setAgeRange } = useOnboardingStore();
  const flatListRef = useRef<FlatList>(null);
  const selectedAge = ageRange ? parseInt(ageRange, 10) : DEFAULT_AGE;

  useEffect(() => {
    const index = selectedAge - MIN_AGE;
    if (index >= 0 && index < AGES.length) {
      // Small delay to ensure FlatList is mounted
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: index * ITEM_HEIGHT,
          animated: false,
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  // Set default age on mount if not already set
  useEffect(() => {
    if (!ageRange) {
      setAgeRange(String(DEFAULT_AGE));
    }
  }, []);

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, AGES.length - 1));
      const age = AGES[clampedIndex];
      setAgeRange(String(age));
    },
    [setAgeRange],
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: (typeof PADDED_DATA)[number] }) => {
      if (item.value === null) {
        return <View style={styles.item} />;
      }

      const isSelected = item.value === selectedAge;
      const distance = Math.abs(item.value - selectedAge);

      let opacity = 1;
      let scale = 1;
      if (distance === 0) {
        opacity = 1;
        scale = 1;
      } else if (distance === 1) {
        opacity = 0.5;
        scale = 0.85;
      } else {
        opacity = 0.25;
        scale = 0.7;
      }

      return (
        <View style={styles.item}>
          <Text
            style={[
              styles.itemText,
              {
                opacity,
                transform: [{ scale }],
                color: isSelected ? Colors.rose : Colors.textLight,
                fontFamily: isSelected
                  ? Typography.fonts.displayBold
                  : Typography.fonts.body,
                fontSize: isSelected ? Typography.sizes['2xl'] : Typography.sizes.lg,
              },
            ]}
          >
            {item.value}
          </Text>
        </View>
      );
    },
    [selectedAge],
  );

  const keyExtractor = useCallback((item: (typeof PADDED_DATA)[number]) => item.key, []);

  return (
    <OnboardingLayout
      step={15}
      title="Qual a sua idade?"
      subtitle="Idade influencia os padroes do ciclo."
      onNext={() => router.push('/(onboarding)/body-stats')}
      nextDisabled={!ageRange}
    >
      <View style={styles.wheelContainer}>
        <View style={styles.wheelWrapper}>
          {/* Selection indicator */}
          <View style={styles.selectionIndicator} pointerEvents="none" />

          <FlatList
            ref={flatListRef}
            data={PADDED_DATA}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            getItemLayout={getItemLayout}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            style={styles.flatList}
            contentContainerStyle={styles.flatListContent}
            bounces={false}
          />
        </View>

        <Text style={styles.unitLabel}>anos</Text>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  wheelContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelWrapper: {
    height: WHEEL_HEIGHT,
    width: 120,
    overflow: 'hidden',
    position: 'relative',
  },
  selectionIndicator: {
    position: 'absolute',
    top: ITEM_HEIGHT * PADDING_ITEMS,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: Colors.blush,
    borderRadius: 4,
    zIndex: 1,
  },
  flatList: {
    height: WHEEL_HEIGHT,
  },
  flatListContent: {},
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    textAlign: 'center',
  },
  unitLabel: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.base,
    color: Colors.textLight,
    marginTop: Spacing.sm,
  },
});
