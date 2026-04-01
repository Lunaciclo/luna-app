import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card } from '../../../components/ui/Card';
import { useCurrentPhase } from '../../../hooks/useCurrentPhase';
import { useSubscription } from '../../../hooks/useSubscription';
import { PHASE_CONTENT } from '../../../constants/content';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Spacing } from '../../../theme/spacing';
import { Radius } from '../../../theme/radius';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

type ArticleCategory =
  | 'saude'
  | 'nutricao'
  | 'exercicios'
  | 'bem-estar'
  | 'fertilidade'
  | 'tpm';

interface Article {
  slug: string;
  title: string;
  readTime: string;
  emoji: string;
  category: ArticleCategory;
  premium: boolean;
  isNew: boolean;
}

const ARTICLES: Article[] = [
  { slug: 'ciclo-menstrual-guia', title: 'Guia completo do ciclo menstrual', readTime: '8 min', emoji: '\u{1F4D6}', category: 'saude', premium: false, isNew: true },
  { slug: 'alimentacao-por-fase', title: 'Alimentação ideal para cada fase', readTime: '6 min', emoji: '\u{1F957}', category: 'nutricao', premium: false, isNew: false },
  { slug: 'exercicios-ciclo', title: 'Exercícios para cada fase do ciclo', readTime: '5 min', emoji: '\u{1F3C3}\u200D\u2640\uFE0F', category: 'exercicios', premium: false, isNew: true },
  { slug: 'tpm-dicas', title: 'TPM: 10 dicas que realmente funcionam', readTime: '7 min', emoji: '\u{1F327}\uFE0F', category: 'tpm', premium: false, isNew: false },
  { slug: 'fertilidade-natural', title: 'Entendendo sua fertilidade natural', readTime: '10 min', emoji: '\u{1F338}', category: 'fertilidade', premium: true, isNew: false },
  { slug: 'sono-ciclo', title: 'Como o ciclo afeta seu sono', readTime: '4 min', emoji: '\u{1F634}', category: 'bem-estar', premium: false, isNew: false },
  { slug: 'yoga-menstrual', title: 'Yoga durante a menstruação', readTime: '6 min', emoji: '\u{1F9D8}\u200D\u2640\uFE0F', category: 'exercicios', premium: true, isNew: true },
  { slug: 'libido-ciclo', title: 'Libido e ciclo menstrual', readTime: '5 min', emoji: '\u{1F525}', category: 'saude', premium: true, isNew: false },
  { slug: 'receitas-fase', title: 'Receitas nutritivas por fase', readTime: '8 min', emoji: '\u{1F372}', category: 'nutricao', premium: false, isNew: true },
  { slug: 'meditacao-tpm', title: 'Meditação para aliviar TPM', readTime: '4 min', emoji: '\u{1F9D8}', category: 'tpm', premium: false, isNew: false },
];

// ---------------------------------------------------------------------------
// Category helpers
// ---------------------------------------------------------------------------

interface CategoryMeta {
  label: string;
  color: string;
}

const CATEGORY_META: Record<ArticleCategory, CategoryMeta> = {
  saude: { label: 'Saúde', color: Colors.rose },
  nutricao: { label: 'Nutrição', color: '#2ECC89' },
  exercicios: { label: 'Exercícios', color: '#FF8A70' },
  'bem-estar': { label: 'Bem-estar', color: '#9B2D6B' },
  fertilidade: { label: 'Fertilidade', color: Colors.coral },
  tpm: { label: 'TPM', color: Colors.plum },
};

type FilterKey = 'todos' | ArticleCategory;

const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'saude', label: 'Saúde' },
  { key: 'nutricao', label: 'Nutrição' },
  { key: 'exercicios', label: 'Exercícios' },
  { key: 'bem-estar', label: 'Bem-estar' },
  { key: 'fertilidade', label: 'Fertilidade' },
  { key: 'tpm', label: 'TPM' },
];

// Map phase to categories that are most relevant
const PHASE_CATEGORIES: Record<string, ArticleCategory[]> = {
  menstrual: ['saude', 'bem-estar', 'nutricao'],
  follicular: ['exercicios', 'nutricao', 'saude'],
  ovulatory: ['fertilidade', 'exercicios', 'saude'],
  luteal: ['tpm', 'bem-estar', 'nutricao'],
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function InsightsScreen() {
  const router = useRouter();
  const { phase, meta, content, gradientColors } = useCurrentPhase();
  const { isPremium } = useSubscription();

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('todos');

  // Phase-contextual recommended articles
  const phaseRecommendations = useMemo(() => {
    const relevant = PHASE_CATEGORIES[phase] ?? [];
    return ARTICLES.filter((a) => relevant.includes(a.category));
  }, [phase]);

  // Filtered articles (category + search combined)
  const filteredArticles = useMemo(() => {
    let list = ARTICLES;

    if (activeFilter !== 'todos') {
      list = list.filter((a) => a.category === activeFilter);
    }

    if (search.trim().length > 0) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          CATEGORY_META[a.category].label.toLowerCase().includes(q),
      );
    }

    return list;
  }, [activeFilter, search]);

  // Featured article = first from filtered list
  const featuredArticle = filteredArticles[0];
  const remainingArticles = filteredArticles.slice(1);

  const phaseColor = meta.color;
  const phaseName = meta.label;

  // ------------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------------

  function handleArticlePress(article: Article) {
    if (article.premium && !isPremium) {
      router.push('/(app)/paywall');
      return;
    }
    router.push(`/(app)/insights/${article.slug}`);
  }

  function handleFilterPress(key: FilterKey) {
    setActiveFilter(key === activeFilter ? 'todos' : key);
  }

  // ------------------------------------------------------------------
  // Render helpers
  // ------------------------------------------------------------------

  function renderCategoryTag(category: ArticleCategory) {
    const catMeta = CATEGORY_META[category];
    return (
      <View style={[styles.categoryPill, { backgroundColor: catMeta.color + '1A' }]}>
        <Text style={[styles.categoryPillText, { color: catMeta.color }]}>
          {catMeta.label}
        </Text>
      </View>
    );
  }

  function renderPremiumTag() {
    return (
      <View style={styles.premiumTag}>
        <Text style={styles.premiumTagText}>{'\u{1F512}'} Luna Plus</Text>
      </View>
    );
  }

  function renderNewBadge() {
    return (
      <View style={styles.newBadge}>
        <Text style={styles.newBadgeText}>Novo</Text>
      </View>
    );
  }

  // ------------------------------------------------------------------
  // JSX
  // ------------------------------------------------------------------

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Header */}
          <Text style={styles.title}>Insights</Text>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>{'\u{1F50D}'}</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar artigos, dicas e mais..."
              placeholderTextColor={Colors.textLight}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
          </View>

          {/* Category filter tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersScroll}
            contentContainerStyle={styles.filtersContent}
          >
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab.key;
              const pillColor =
                tab.key === 'todos'
                  ? Colors.rose
                  : CATEGORY_META[tab.key as ArticleCategory].color;

              return (
                <Pressable
                  key={tab.key}
                  onPress={() => handleFilterPress(tab.key)}
                  style={[
                    styles.filterPill,
                    isActive
                      ? { backgroundColor: pillColor }
                      : { backgroundColor: Colors.white, borderColor: Colors.blush, borderWidth: 1 },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      { color: isActive ? Colors.white : Colors.text },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Featured article banner */}
          {featuredArticle && (
            <Pressable
              onPress={() => handleArticlePress(featuredArticle)}
              style={[styles.featuredCard, { backgroundColor: phaseColor }]}
            >
              {/* Overlay content */}
              <View style={styles.featuredOverlay}>
                {featuredArticle.isNew && (
                  <View style={styles.featuredNewBadge}>
                    <Text style={styles.featuredNewBadgeText}>Novo</Text>
                  </View>
                )}
                {featuredArticle.premium && !isPremium && (
                  <View style={styles.featuredPremiumTag}>
                    <Text style={styles.featuredPremiumText}>{'\u{1F512}'} Luna Plus</Text>
                  </View>
                )}
                <Text style={styles.featuredEmoji}>{featuredArticle.emoji}</Text>
                <Text style={styles.featuredTitle}>{featuredArticle.title}</Text>
                <View style={styles.featuredMeta}>
                  <Text style={styles.featuredReadTime}>
                    {'\u{1F552}'} {featuredArticle.readTime} de leitura
                  </Text>
                </View>
                <View style={styles.featuredCta}>
                  <Text style={styles.featuredCtaText}>Ler agora</Text>
                </View>
              </View>
            </Pressable>
          )}

          {/* Phase-contextual recommendations */}
          <Text style={styles.sectionTitle}>
            Para sua fase {phaseName}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.recommendationsScroll}
            contentContainerStyle={styles.recommendationsContent}
          >
            {phaseRecommendations.map((article) => {
              const catMeta = CATEGORY_META[article.category];
              return (
                <Pressable
                  key={article.slug}
                  onPress={() => handleArticlePress(article)}
                  style={[styles.recommendationCard, { borderColor: phaseColor + '30' }]}
                >
                  <View style={styles.recommendationTop}>
                    <Text style={styles.recommendationEmoji}>{article.emoji}</Text>
                    {article.premium && !isPremium && (
                      <Text style={styles.recommendationLock}>{'\u{1F512}'}</Text>
                    )}
                  </View>
                  <Text style={styles.recommendationTitle} numberOfLines={2}>
                    {article.title}
                  </Text>
                  <View style={styles.recommendationBottom}>
                    <View style={[styles.categoryPillSmall, { backgroundColor: catMeta.color + '1A' }]}>
                      <Text style={[styles.categoryPillSmallText, { color: catMeta.color }]}>
                        {catMeta.label}
                      </Text>
                    </View>
                    <Text style={styles.recommendationReadTime}>{article.readTime}</Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Phase-specific editorial insights */}
          <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>
            {content.editorialTitle}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.insightsContent}
          >
            {content.insights.map((insight, i) => (
              <View
                key={i}
                style={[styles.insightCard, { backgroundColor: phaseColor + '14' }]}
              >
                <Text style={styles.insightIcon}>{insight.icon}</Text>
                <Text style={[styles.insightTag, { color: phaseColor }]}>
                  {insight.tag}
                </Text>
                <Text style={styles.insightTitle}>{insight.title}</Text>
              </View>
            ))}
          </ScrollView>

          {/* All articles list */}
          <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
            Artigos para você
          </Text>

          {remainingArticles.length === 0 && !featuredArticle && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>{'\u{1F50D}'}</Text>
              <Text style={styles.emptyText}>
                Nenhum artigo encontrado
              </Text>
              <Text style={styles.emptySubtext}>
                Tente buscar com outras palavras
              </Text>
            </View>
          )}

          {remainingArticles.map((article) => {
            const catMeta = CATEGORY_META[article.category];
            const isLocked = article.premium && !isPremium;

            return (
              <Pressable
                key={article.slug}
                style={[styles.articleCard, isLocked && styles.articleCardLocked]}
                onPress={() => handleArticlePress(article)}
              >
                {/* Emoji */}
                <View style={styles.articleEmojiContainer}>
                  <Text style={styles.articleEmoji}>{article.emoji}</Text>
                </View>

                {/* Info */}
                <View style={styles.articleInfo}>
                  {/* Top row: category + badges */}
                  <View style={styles.articleTagRow}>
                    {renderCategoryTag(article.category)}
                    {article.isNew && renderNewBadge()}
                    {isLocked && renderPremiumTag()}
                  </View>

                  <Text style={styles.articleTitle} numberOfLines={2}>
                    {article.title}
                  </Text>

                  {/* Bottom row: read time + bookmark */}
                  <View style={styles.articleBottomRow}>
                    <Text style={styles.articleMeta}>
                      {'\u{1F552}'} {article.readTime} de leitura
                    </Text>
                    <Pressable hitSlop={8}>
                      <Text style={styles.bookmarkIcon}>
                        {'\u{1F516}'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            );
          })}

          {/* Bottom spacing */}
          <View style={{ height: Spacing['3xl'] }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  container: {
    padding: Spacing.base,
  },

  // Header
  title: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes['2xl'],
    color: Colors.text,
    marginBottom: Spacing.lg,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.blush,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.base,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.base,
    color: Colors.text,
    paddingVertical: Spacing.md,
  },

  // Filter tabs
  filtersScroll: {
    marginBottom: Spacing.lg,
    marginHorizontal: -Spacing.base,
  },
  filtersContent: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  filterPill: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  filterPillText: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.sm,
  },

  // Featured banner
  featuredCard: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  featuredOverlay: {
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  featuredNewBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    marginBottom: Spacing.xs,
  },
  featuredNewBadgeText: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.xs,
    color: Colors.rose,
  },
  featuredPremiumTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    marginBottom: Spacing.xs,
  },
  featuredPremiumText: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.xs,
    color: Colors.white,
  },
  featuredEmoji: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  featuredTitle: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes.xl,
    color: Colors.white,
    lineHeight: Typography.sizes.xl * Typography.lineHeights.tight,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  featuredReadTime: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.sm,
    color: 'rgba(255,255,255,0.85)',
  },
  featuredCta: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    marginTop: Spacing.md,
  },
  featuredCtaText: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.base,
    color: Colors.text,
  },

  // Section title
  sectionTitle: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.md,
    color: Colors.text,
    marginBottom: Spacing.md,
  },

  // Phase recommendations (horizontal cards)
  recommendationsScroll: {
    marginHorizontal: -Spacing.base,
    marginBottom: Spacing.xl,
  },
  recommendationsContent: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
  },
  recommendationCard: {
    width: 170,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  recommendationTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recommendationEmoji: {
    fontSize: 28,
  },
  recommendationLock: {
    fontSize: 14,
  },
  recommendationTitle: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.sm,
    color: Colors.text,
    lineHeight: Typography.sizes.sm * Typography.lineHeights.normal,
  },
  recommendationBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto' as any,
  },
  recommendationReadTime: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    color: Colors.textLight,
  },

  // Phase editorial insights (horizontal cards)
  insightsContent: {
    gap: Spacing.md,
    paddingBottom: Spacing.md,
  },
  insightCard: {
    width: 160,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  insightIcon: {
    fontSize: 28,
  },
  insightTag: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.xs,
    textTransform: 'uppercase',
  },
  insightTitle: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.sm,
    color: Colors.text,
  },

  // Article cards
  articleCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  articleCardLocked: {
    opacity: 0.85,
  },
  articleEmojiContainer: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.blush,
    justifyContent: 'center',
    alignItems: 'center',
  },
  articleEmoji: {
    fontSize: 28,
  },
  articleInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  articleTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  articleTitle: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.base,
    color: Colors.text,
    lineHeight: Typography.sizes.base * Typography.lineHeights.normal,
  },
  articleBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  articleMeta: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    color: Colors.textLight,
  },
  bookmarkIcon: {
    fontSize: 16,
  },

  // Category pill (used in article cards)
  categoryPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  categoryPillText: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.xs,
  },

  // Category pill small (used in recommendation cards)
  categoryPillSmall: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  categoryPillSmallText: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: 10,
  },

  // "Novo" badge
  newBadge: {
    backgroundColor: Colors.green + '1A',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  newBadgeText: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.xs,
    color: Colors.green,
  },

  // Premium tag
  premiumTag: {
    backgroundColor: Colors.plum + '1A',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  premiumTagText: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.xs,
    color: Colors.plum,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
    gap: Spacing.sm,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyText: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.base,
    color: Colors.text,
  },
  emptySubtext: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.sm,
    color: Colors.textLight,
  },
});
