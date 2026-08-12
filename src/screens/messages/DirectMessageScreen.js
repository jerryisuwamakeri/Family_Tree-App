import React, {useState, useEffect, useRef} from 'react';
import {
  View, FlatList, TextInput, TouchableOpacity, Text,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, Modal,
  ScrollView,
} from 'react-native';
import {messagesApi} from '../../api/messages';
import {useAuth} from '../../context/AuthContext';
import MessageItem from '../../components/MessageItem';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import {COLORS, FONTS, SPACING, RADIUS, SHADOWS} from '../../utils/theme';
import {getInitials} from '../../utils/helpers';
import Icon from '../../components/Icon';

function NewMessageModal({visible, onClose, onSend}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [body, setBody] = useState('');
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

  const handleSend = () => {
    if (!selected || !body.trim()) return;
    onSend({member_id: selected.id, body: body.trim()});
    setQuery(''); setResults([]); setSelected(null); setBody('');
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Icon name="close" size={18} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.modalTitle}>New Direct Message</Text>
      </View>
      <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Search recipient</Text>
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

        {results.map(r => (
          <TouchableOpacity
            key={r.id}
            style={[styles.resultRow, selected?.id === r.id && styles.resultRowActive]}
            onPress={() => setSelected(r)}>
            <View style={styles.resultAvatar}>
              <Text style={styles.resultInitials}>{getInitials(r.name || r.full_name)}</Text>
            </View>
            <Text style={styles.resultName}>{r.name || r.full_name}</Text>
            {selected?.id === r.id && <Icon name="checkmark-circle" size={20} color={COLORS.primary} />}
          </TouchableOpacity>
        ))}

        <Text style={[styles.label, {marginTop: SPACING.base}]}>Message</Text>
        <TextInput
          style={[styles.input, styles.bodyInput]}
          value={body}
          onChangeText={setBody}
          placeholder="Type your message…"
          placeholderTextColor={COLORS.textLight}
          multiline
        />

        <TouchableOpacity
          style={[styles.sendBtn, (!selected || !body.trim()) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!selected || !body.trim()}>
          <Text style={styles.sendBtnText}>Send Message</Text>
        </TouchableOpacity>
      </ScrollView>
    </Modal>
  );
}

export default function DirectMessageScreen() {
  const {user} = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const listRef = useRef(null);

  const load = async () => {
    try {
      const data = await messagesApi.getDirectMessages();
      setMessages(Array.isArray(data) ? data : data?.data ?? []);
    } catch {}
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async payload => {
    try {
      await messagesApi.sendDirectMessage(payload);
      setShowNew(false);
      await load();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={styles.screen}>
      <TouchableOpacity
        style={styles.newBtn}
        onPress={() => setShowNew(true)}>
        <Icon name="add" size={18} color={COLORS.white} />
        <Text style={styles.newBtnText}>New Message</Text>
      </TouchableOpacity>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => String(item.id)}
        renderItem={({item}) => (
          <MessageItem
            message={item}
            isOwn={item.sender_user_id === user?.id}
          />
        )}
        ListEmptyComponent={
          <EmptyState icon="mail-outline" title="No direct messages" subtitle="Start a conversation with a family member." />
        }
        contentContainerStyle={messages.length === 0 ? {flex: 1} : {paddingVertical: SPACING.sm}}
      />

      <NewMessageModal visible={showNew} onClose={() => setShowNew(false)} onSend={handleSend} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: COLORS.background},
  newBtn: {
    backgroundColor: COLORS.primary,
    margin: SPACING.base,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    ...SHADOWS.brand,
  },
  newBtnText: {color: COLORS.white, fontWeight: FONTS.weights.semibold, fontSize: FONTS.sizes.sm},
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: SPACING.base,
    paddingTop: SPACING.xl,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: RADIUS.full,
    backgroundColor: COLORS.overlayOnBrandLight,
    justifyContent: 'center', alignItems: 'center', marginRight: SPACING.sm,
  },
  modalTitle: {flex: 1, color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold},
  modalBody: {flex: 1, padding: SPACING.base},
  label: {fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.medium, color: COLORS.text, marginBottom: SPACING.xs},
  searchRow: {flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.base},
  input: {
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md, fontSize: FONTS.sizes.base, color: COLORS.text,
  },
  bodyInput: {height: 120, textAlignVertical: 'top', marginBottom: SPACING.base},
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
  resultRowActive: {borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight},
  resultAvatar: {
    width: 32, height: 32, borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', marginRight: SPACING.sm,
  },
  resultInitials: {color: COLORS.white, fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold},
  resultName: {flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.text},
  sendBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
    paddingVertical: SPACING.base, alignItems: 'center',
    ...SHADOWS.brand,
  },
  sendBtnDisabled: {opacity: 0.5},
  sendBtnText: {color: COLORS.white, fontWeight: FONTS.weights.semibold, fontSize: FONTS.sizes.base},
});
