import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View, FlatList, TextInput, TouchableOpacity, Text,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import {messagesApi} from '../../api/messages';
import {useAuth} from '../../context/AuthContext';
import MessageItem from '../../components/MessageItem';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import {COLORS, FONTS, SPACING, RADIUS, SHADOWS} from '../../utils/theme';
import {getInitials} from '../../utils/helpers';
import Icon from '../../components/Icon';

// Backend has no "list my conversation threads" endpoint -- a direct
// message thread only exists once you specify who with (recipient_id).
// So this screen always starts at "pick someone" and only shows a
// message thread once a recipient is selected.
function RecipientPicker({onSelect}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const data = await messagesApi.memberSearch(query.trim());
      setResults(Array.isArray(data) ? data : []);
    } catch {}
    setSearching(false);
  };

  return (
    <View style={styles.pickerScreen}>
      <Text style={styles.pickerTitle}>Message someone</Text>
      <Text style={styles.pickerSub}>Search for a family member to start a conversation</Text>
      <View style={styles.searchRow}>
        <TextInput
          style={[styles.input, {flex: 1}]}
          value={query}
          onChangeText={setQuery}
          placeholder="Name or email…"
          placeholderTextColor={COLORS.textLight}
          onSubmitEditing={search}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={search} disabled={searching}>
          {searching ? (
            <Text style={styles.searchBtnText}>…</Text>
          ) : (
            <Icon name="search" size={18} color={COLORS.white} />
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={results}
        keyExtractor={r => String(r.id)}
        renderItem={({item: r}) => (
          <TouchableOpacity style={styles.resultRow} onPress={() => onSelect(r)}>
            <View style={styles.resultAvatar}>
              <Text style={styles.resultInitials}>{getInitials(r.name || r.full_name)}</Text>
            </View>
            <Text style={styles.resultName}>{r.name || r.full_name}</Text>
            <Icon name="chevron-forward" size={18} color={COLORS.textLight} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

function ThreadView({recipient, onChangeRecipient}) {
  const {user} = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const data = await messagesApi.getDirectMessages(recipient.id);
      const list = (data?.messages ?? []).map(m => ({
        ...m,
        sender_id: m.sender?.id,
        sender_name: m.sender?.name,
      }));
      setMessages(list);
    } catch {}
  }, [recipient.id]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      await messagesApi.sendDirectMessage(recipient.id, trimmed);
      setText('');
      await load();
      setTimeout(() => listRef.current?.scrollToEnd({animated: true}), 200);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}>
      <View style={styles.threadHeader}>
        <TouchableOpacity onPress={onChangeRecipient} style={styles.backBtn}>
          <Icon name="chevron-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.threadHeaderName} numberOfLines={1}>{recipient.name || recipient.full_name}</Text>
      </View>

      {loading ? (
        <LoadingSpinner fullScreen />
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => String(item.id)}
          renderItem={({item}) => (
            <MessageItem message={item} isOwn={item.sender_id === user?.id} />
          )}
          onContentSizeChange={() => listRef.current?.scrollToEnd()}
          ListEmptyComponent={
            <EmptyState icon="mail-outline" title="No messages yet" subtitle="Say hello to start the conversation." />
          }
          contentContainerStyle={messages.length === 0 ? {flex: 1} : {paddingVertical: SPACING.sm}}
        />
      )}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.msgInput}
          value={text}
          onChangeText={setText}
          placeholder="Write a message…"
          placeholderTextColor={COLORS.textLight}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || sending}>
          <Icon name="send" size={16} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

export default function DirectMessageScreen() {
  const [recipient, setRecipient] = useState(null);

  if (!recipient) {
    return <RecipientPicker onSelect={setRecipient} />;
  }
  return <ThreadView recipient={recipient} onChangeRecipient={() => setRecipient(null)} />;
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: COLORS.background},
  pickerScreen: {flex: 1, backgroundColor: COLORS.background, padding: SPACING.base},
  pickerTitle: {
    fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold, color: COLORS.text,
    marginTop: SPACING.base,
  },
  pickerSub: {fontSize: FONTS.sizes.sm, color: COLORS.textMuted, marginTop: SPACING.xs, marginBottom: SPACING.xl},
  searchRow: {flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.base},
  input: {
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md, fontSize: FONTS.sizes.base, color: COLORS.text,
  },
  searchBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.base, justifyContent: 'center', alignItems: 'center',
  },
  searchBtnText: {fontSize: 18, color: COLORS.white},
  resultRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: SPACING.md, backgroundColor: COLORS.white,
    borderRadius: RADIUS.md, marginBottom: SPACING.xs,
    borderWidth: 1, borderColor: COLORS.border,
  },
  resultAvatar: {
    width: 36, height: 36, borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', marginRight: SPACING.sm,
  },
  resultInitials: {color: COLORS.white, fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold},
  resultName: {flex: 1, fontSize: FONTS.sizes.base, color: COLORS.text},
  threadHeader: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, padding: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: {padding: SPACING.xs, marginRight: SPACING.xs},
  threadHeaderName: {flex: 1, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold, color: COLORS.text},
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.sm,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  msgInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.sizes.base,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40, height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {backgroundColor: COLORS.textLight},
});
