import React, {useState} from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, Switch, KeyboardAvoidingView, Platform,
} from 'react-native';
import {membersApi} from '../../api/members';
import {COLORS, FONTS, SPACING, RADIUS, SHADOWS} from '../../utils/theme';
import MemberPickerModal from '../../components/MemberPickerModal';
import CompoundPickerField from '../../components/CompoundPickerField';
import ProgenitorPickerField from '../../components/ProgenitorPickerField';
import Icon from '../../components/Icon';

const dateOnly = v => (v ? String(v).slice(0, 10) : '');

const GENDERS = ['Male', 'Female'];

function Field({label, children}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function MemberSelector({label, selectedName, onPress, onClear}) {
  return (
    <TouchableOpacity style={styles.memberSelector} onPress={onPress} activeOpacity={0.75}>
      <Text style={[styles.memberSelectorText, !selectedName && styles.placeholder]}>
        {selectedName || `Tap to select ${label}…`}
      </Text>
      {selectedName ? (
        <TouchableOpacity onPress={onClear} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Icon name="close" size={18} color={COLORS.danger} />
        </TouchableOpacity>
      ) : (
        <Icon name="chevron-down" size={18} color={COLORS.textMuted} />
      )}
    </TouchableOpacity>
  );
}

export default function EditMemberScreen({route, navigation}) {
  const {member} = route.params;
  const [loading, setLoading] = useState(false);
  const [picker, setPicker] = useState(null); // 'father' | 'mother' | null
  const [form, setForm] = useState({
    first_name: member.first_name || '',
    last_name: member.last_name || '',
    other_names: member.middle_name || '',
    gender: member.gender || 'Male',
    date_of_birth: dateOnly(member.dob),
    date_of_death: dateOnly(member.date_of_death),
    occupation: member.occupation || '',
    education: member.education || '',
    phone: member.phone || '',
    email: member.email || '',
    address: member.address || '',
    state_of_origin: member.state_of_origin || '',
    lga: member.lga || '',
    compound_id: member.compound_id || '',
    progenitor_id: member.progenitor_id || member.progenitor?.id || '',
    father_id: member.father?.id || member.father_id || '',
    father_name: member.father?.full_name || '',
    mother_id: member.mother?.id || member.mother_id || '',
    mother_name: member.mother?.full_name || '',
    is_deceased: !!member.is_deceased,
    bio: member.bio || '',
  });

  const set = (key, val) => setForm(f => ({...f, [key]: val}));

  const handleMemberSelect = selected => {
    if (picker === 'father') {
      setForm(f => ({...f, father_id: selected.id, father_name: selected.full_name}));
    } else if (picker === 'mother') {
      setForm(f => ({...f, mother_id: selected.id, mother_name: selected.full_name}));
    }
  };

  const handleSave = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      Alert.alert('Required', 'First and last name are required.');
      return;
    }
    setLoading(true);
    try {
      // Send the backend's field names. Empty strings become null (dropped) so
      // clearing a field works and blanks don't trip date/enum validation.
      const raw = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        middle_name: form.other_names.trim(),
        gender: form.gender,
        dob: form.date_of_birth.trim(),
        date_of_death: form.is_deceased ? form.date_of_death.trim() : '',
        occupation: form.occupation.trim(),
        education: form.education.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        state_of_origin: form.state_of_origin.trim(),
        lga: form.lga.trim(),
        bio: form.bio.trim(),
        compound_id: form.compound_id || undefined,
        progenitor_id: form.progenitor_id || undefined,
        father_id: form.father_id || undefined,
        father_name: form.father_name.trim(),
        mother_id: form.mother_id || undefined,
        mother_name: form.mother_name.trim(),
        is_deceased: form.is_deceased,
      };
      const payload = Object.fromEntries(
        Object.entries(raw).filter(([, v]) => v !== '' && v !== undefined),
      );
      await membersApi.update(member.id, payload);
      Alert.alert('Saved', 'Member updated successfully!', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const inp = (key, placeholder, options = {}) => (
    <TextInput
      style={[styles.input, options.multiline && styles.multiline]}
      value={form[key]}
      onChangeText={v => set(key, v)}
      placeholder={placeholder}
      placeholderTextColor={COLORS.textLight}
      keyboardType={options.keyboard || 'default'}
      autoCapitalize={options.capitalize || 'sentences'}
      multiline={options.multiline}
      numberOfLines={options.multiline ? 3 : 1}
    />
  );

  return (
    <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.screen} keyboardShouldPersistTaps="handled">

        <Text style={styles.sectionHead}>Basic Info</Text>
        <Field label="First Name *">{inp('first_name', 'First name', {capitalize: 'words'})}</Field>
        <Field label="Last Name *">{inp('last_name', 'Last name', {capitalize: 'words'})}</Field>
        <Field label="Other Names">{inp('other_names', 'Other names', {capitalize: 'words'})}</Field>

        <Field label="Gender">
          <View style={styles.genderRow}>
            {GENDERS.map(g => (
              <TouchableOpacity
                key={g}
                style={[styles.genderBtn, form.gender === g && styles.genderBtnActive]}
                onPress={() => set('gender', g)}>
                <Text style={[styles.genderText, form.gender === g && styles.genderTextActive]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>

        <Field label="Date of Birth (YYYY-MM-DD)">
          {inp('date_of_birth', '1985-06-15', {keyboard: 'numeric'})}
        </Field>

        <View style={styles.switchRow}>
          <Text style={styles.label}>Deceased?</Text>
          <Switch value={form.is_deceased} onValueChange={v => set('is_deceased', v)} trackColor={{true: COLORS.primary}} />
        </View>

        {form.is_deceased && (
          <Field label="Date of Death (YYYY-MM-DD)">
            {inp('date_of_death', '2010-03-22', {keyboard: 'numeric'})}
          </Field>
        )}

        <Text style={styles.sectionHead}>Contact & Background</Text>
        <Field label="Phone">{inp('phone', '+234 xxx xxx xxxx', {keyboard: 'phone-pad'})}</Field>
        <Field label="Email">{inp('email', 'member@email.com', {keyboard: 'email-address', capitalize: 'none'})}</Field>
        <Field label="Occupation">{inp('occupation', 'Occupation')}</Field>
        <Field label="Education">{inp('education', 'Highest qualification')}</Field>
        <Field label="State of Origin">{inp('state_of_origin', 'e.g. Ogun', {capitalize: 'words'})}</Field>
        <Field label="LGA">{inp('lga', 'Local Government Area', {capitalize: 'words'})}</Field>
        <Field label="Address">{inp('address', 'Home address', {multiline: true})}</Field>
        <Field label="Bio / Notes">{inp('bio', 'Brief biography…', {multiline: true})}</Field>

        <Text style={styles.sectionHead}>Family Links</Text>

        <Field label="Branch Ancestor (Progenitor)">
          <ProgenitorPickerField
            value={form.progenitor_id}
            onChange={id => set('progenitor_id', id)}
          />
        </Field>

        <Field label="Compound / Branch">
          <CompoundPickerField
            value={form.compound_id}
            label="Compound"
            onChange={id => set('compound_id', id)}
          />
        </Field>

        <Field label="Father">
          <MemberSelector
            label="father"
            selectedName={form.father_name}
            onPress={() => setPicker('father')}
            onClear={() => setForm(f => ({...f, father_id: '', father_name: ''}))}
          />
        </Field>

        <Field label="Mother">
          <MemberSelector
            label="mother"
            selectedName={form.mother_name}
            onPress={() => setPicker('mother')}
            onClear={() => setForm(f => ({...f, mother_id: '', mother_name: ''}))}
          />
        </Field>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.btnDisabled]}
          onPress={handleSave}
          disabled={loading}>
          <Text style={styles.submitText}>{loading ? 'Saving…' : 'Save Changes'}</Text>
        </TouchableOpacity>

        <View style={{height: SPACING.xxxl}} />
      </ScrollView>

      <MemberPickerModal
        visible={picker !== null}
        title={picker === 'father' ? 'Select Father' : 'Select Mother'}
        onSelect={handleMemberSelect}
        onClose={() => setPicker(null)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: COLORS.background},
  sectionHead: {
    fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold,
    color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1,
    marginTop: SPACING.xl, marginBottom: SPACING.sm, marginHorizontal: SPACING.base,
  },
  field: {marginHorizontal: SPACING.base, marginBottom: SPACING.sm},
  label: {fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.medium, color: COLORS.text, marginBottom: 4},
  input: {
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md, fontSize: FONTS.sizes.base, color: COLORS.text,
  },
  multiline: {height: 80, textAlignVertical: 'top'},
  genderRow: {flexDirection: 'row', gap: SPACING.sm},
  genderBtn: {
    flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md,
    paddingVertical: SPACING.md, alignItems: 'center', backgroundColor: COLORS.white,
  },
  genderBtnActive: {borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight},
  genderText: {color: COLORS.textMuted, fontWeight: FONTS.weights.medium},
  genderTextActive: {color: COLORS.primary},
  switchRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: SPACING.base, marginBottom: SPACING.sm,
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.base, paddingVertical: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  memberSelector: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.base, paddingVertical: SPACING.md,
  },
  memberSelectorText: {flex: 1, fontSize: FONTS.sizes.base, color: COLORS.text},
  placeholder: {color: COLORS.textLight},
  submitBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
    paddingVertical: SPACING.base, alignItems: 'center',
    marginHorizontal: SPACING.base, marginTop: SPACING.xl,
    ...SHADOWS.brand,
  },
  btnDisabled: {opacity: 0.6},
  submitText: {color: COLORS.white, fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.semibold},
});
