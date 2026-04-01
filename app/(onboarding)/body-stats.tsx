import React, { useRef, useEffect, useCallback, useState } from 'react';
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
const PADDING_ITEMS = Math.floor(VISIBLE_ITEMS / 2);

// Height range: 140-200 cm
const MIN_HEIGHT = 140;
const MAX_HEIGHT = 200;
const DEFAULT_HEIGHT = 165;
const HEIGHTS = Array.from(
  { length: MAX_HEIGHT - MIN_HEIGHT + 1 },
  (_, i) => MIN_HEIGHT + i,
);

// Weight range: 40-150 kg
const MIN_WEIGHT = 40;
const MAX_WEIGHT = 150;
const DEFAULT_WEIGHT = 60;
const WEIGHTS = Array.from(
  { length: MAX_WEIGHT - MIN_WEIGHT + 1 },
  (_, i) => MIN_WEIGHT + i,
);

function buildPaddedData(values: number[], prefix: string) {
  return [
    ...Array.from({ length: PADDING_ITEMS }, (_, i) => ({
      key: `${prefix}-pad-top-${i}`,
      value: null as number | null,
    })),
    ...values.map((v) => ({ key: `${prefix}-${v}`, value: v as number | null })),
    ...Array.from({ length: PADDING_ITEMS }, (_, i) => ({
      key: `${prefix}-pad-bottom-${i}`,
      value: null as number | null,
    })),
  ];
}

const PADDED_HEIGHTS = buildPaddedData(HEIGHTS, 'h');
const PADDED_WEIGHTS = buildPaddedData(WEIGHTS, 'w');

type PaddedItem = { key: string; value: number | null };

interface ScrollWheelProps {
  data: PaddedItem[];
  values: number[];
  minValue: number;
  defaultValue: number;
  selectedValue: number;
  onValueChange: (value: number) => void;
  unitLabel: string;
}

function ScrollWheel({
  data,
  values,
  minValue,
  defaultValue,
  selectedValue,
  onValueChange,
  unitLabel,
}: ScrollWheelProps) {
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const index = selectedValue - minValue;
    if (index >= 0 && index < values.length) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: index * ITEM_HEIGHT,
          animated: false,
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, values.length - 1));
      const value = values[clampedIndex];
      onValueChange(value);
    },
    [onValueChange, values],
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
    ({ item }: { item: PaddedItem }) => {
      if (item.value === null) {
        return <View style={styles.item} />;
      }

      const isSelected = item.value === selectedValue;
      const distance = Math.abs(item.value - selectedValue);

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
                fontSize: isSelected ? Typography.sizes.xl : Typography.sizes.md,
              },
            ]}
          >
            {item.value}
          </Text>
        </View>
      );
    },
    [selectedValue],
  );

  const keyExtractor = useCallback((item: PaddedItem) => item.key, []);

  return (
    <View style={styles.wheelColumn}>
      <View style={styles.wheelWrapper}>
        {/* Selection indicator */}
        <View style={styles.selectionIndicator} pointerEvents="none" />

        <FlatList
          ref={flatListRef}
          data={data}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          style={styles.flatList}
          bounces={false}
        />
      </View>

      <Text style={styles.unitLabel}>{unitLabel}</Text>
    </View>
  );
}

export default function BodyStatsScreen() {
  const router = useRouter();
  const { heightCm, weightKg, setHeightCm, setWeightKg } = useOnboardingStore();

  const [selectedHeight, setSelectedHeight] = useState(heightCm ?? DEFAULT_HEIGHT);
  const [selectedWeight, setSelectedWeight] = useState(weightKg ?? DEFAULT_WEIGHT);

  const handleHeightChange = useCallback(
    (value: number) => {
      setSelectedHeight(value);
      setHeightCm(value);
    },
    [setHeightCm],
  );

  const handleWeightChange = useCallback(
    (value: number) => {
      setSelectedWeight(value);
      setWeightKg(value);
    },
    [setWeightKg],
  );

  return (
    <OnboardingLayout
      step={16}
      title="Seus dados fisicos"
      subtitle="Opcional -- ajuda a personalizar insights de saude."
      onNext={() => {
        setHeightCm(selectedHeight);
        setWeightKg(selectedWeight);
        router.push('/(onboarding)/loading');
      }}
      showSkip
      onSkip={() => router.push('/(onboarding)/loading')}
    >
      <View style={styles.wheelsContainer}>
        <ScrollWheel
          data={PADDED_HEIGHTS}
          values={HEIGHTS}
          minValue={MIN_HEIGHT}
          defaultValue={DEFAULT_HEIGHT}
          selectedValue={selectedHeight}
          onValueChange={handleHeightChange}
          unitLabel="cm"
        />

        <View style={styles.wheelDivider} />

        <ScrollWheel
          data={PADDED_WEIGHTS}
          values={WEIGHTS}
          minValue={MIN_WEIGHT}
          defaultValue={DEFAULT_WEIGHT}
          selectedValue={selectedWeight}
          onValueChange={handleWeightChange}
          unitLabel="kg"
        />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  wheelsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing['2xl'],
  },
  wheelColumn: {
    alignItems: 'center',
  },
  wheelWrapper: {
    height: WHEEL_HEIGHT,
    width: 100,
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
  wheelDivider: {
    width: 1,
    height: WHEEL_HEIGHT * 0.6,
    backgroundColor: Colors.blush,
  },
});
