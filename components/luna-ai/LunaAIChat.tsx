import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
} from 'react-native';
import { sendMessageToLuna } from '../../lib/claude';
import { useUserStore } from '../../store/useUserStore';
import { useCycleStore } from '../../store/useCycleStore';
import { ChatBubble } from './ChatBubble';
import { TypingIndicator } from './TypingIndicator';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export function LunaAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { profile } = useUserStore();
  const { currentPhase, dayOfCycle, todayLog } = useCycleStore();

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await sendMessageToLuna(
        userMessage.content,
        messages.map((m) => ({ role: m.role, content: m.content })),
        {
          name: profile?.name ?? 'Usuária',
          currentPhase,
          dayOfCycle,
          recentSymptoms: todayLog?.symptoms ?? [],
          goal: profile?.goal ?? 'track_cycle',
        }
      );

      const lunaMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setMessages((prev) => [...prev, lunaMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, não consegui processar sua mensagem. Tente novamente.',
        timestamp: new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, messages, profile, currentPhase, dayOfCycle, todayLog]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatBubble
            message={item.content}
            isUser={item.role === 'user'}
            timestamp={item.timestamp}
          />
        )}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌙</Text>
            <Text style={styles.emptyTitle}>Olá! Eu sou a Luna</Text>
            <Text style={styles.emptySubtitle}>
              Sua assistente pessoal de saúde feminina. Me pergunte qualquer coisa sobre seu ciclo!
            </Text>
          </View>
        }
        ListFooterComponent={isTyping ? <TypingIndicator /> : null}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Pergunte à Luna..."
          placeholderTextColor={Colors.textLight}
          multiline
          maxLength={500}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <Pressable
          onPress={sendMessage}
          disabled={!input.trim() || isTyping}
          style={[styles.sendButton, (!input.trim() || isTyping) && styles.sendDisabled]}
        >
          <Text style={styles.sendIcon}>↑</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  messagesList: {
    paddingVertical: Spacing.base,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['3xl'],
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: Spacing.base,
  },
  emptyTitle: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes.xl,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.base,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: Typography.sizes.base * Typography.lineHeights.relaxed,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.blush,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.base,
    color: Colors.text,
    backgroundColor: Colors.cream,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    backgroundColor: Colors.blush,
  },
  sendIcon: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: 'bold',
  },
});
