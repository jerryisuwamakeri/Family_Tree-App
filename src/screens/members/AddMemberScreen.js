import React, {useState} from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, Switch, KeyboardAvoidingView, Platform,
} from 'react-native';
import {membersApi} from '../../api/members';
import {COLORS, FONTS, SPACING, RADIUS} from '../../utils/theme';
import MemberPickerModal from '../../components/MemberPickerModal';
import CompoundPickerField from '../../components/CompoundPickerField';

const GENDERS = ['Male', 'Female'];

function Field({label, children}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function TextF({value, onChange, placeholder, keyboard, multiline, capitalize}) {
  return (
    <TextInput
      style={[styles.input, multiline && styles.multiline]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={COLORS.textLight}
      keyboardType={keyboard || 'default'}
      autoCapitalize={capitalize || 'sentences'}
      multiline={multiline}
      numberOfLines={multiline ? 3 : 1}
    />
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
          <Text style={styles.clearBtn}>✕</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.chevron}>▾</Text>
      )}
    </TouchableOpacity>
  );
}

export default function AddMemberScreen({navigation}) {
  const [loading, setLoading] = useState(false);
  const [picker, setPicker] = useState(null); // 'father' | 'mother' | null
  const [form, setForm] = useState({
    first_name: '', last_name: '', other_names: '',
    gender: 'Male', date_of_birth: '', date_of_death: '',
    occupation: '', education: '', phone: '', email: '',
    address: '', state_of_origin: '', lga: '',
    compound_id: '',
    father_id: '', father_name: '',
    mother_id: '', mother_name: '',
    is_deceased: false,
    bio: '',
  });

  const set = (key, val) => setForm(f => ({...f, [key]: val}));

  const handleMemberSelect = member => {
    if (picker === 'father') {
      setForm(f => ({...f, father_id: member.id, father_name: member.full_name}));
    } else if (picker === 'mother') {
      setForm(f => ({...f, mother_id: member.id, mother_name: member.full_name}));
    }
  };

  const handleSubmit = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      Alert.alert('Required', 'First and last name are required.');
      return;
    }
    setLoading(true);
    try {
      const payload = {...form};
      delete payload.father_name;
      delete payload.mother_name;
      await membersApi.create(payload);
      Alert.alert('Success', 'Member added successfully!', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.screen} keyboardShouldPersistTaps="handled">

        <Text style={styles.sectionHead}>Basic Info</Text>
        <Field label="First Name *">
          <TextF value={form.first_name} onChange={v => set('first_name', v)} placeholder="First name" capitalize="words" />
        </Field>
        <Field label="Last Name *">
          <TextF value={form.last_name} onChange={v => set('last_name', v)} placeholder="Last name" capitalize="words" />
        </Field>
        <Field label="Other Names">
          <TextF value={form.other_names} onChange={v => set('other_names', v)} placeholder="Middle / other names" capitalize="words" />
        </Field>

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
          <TextF value={form.date_of_birth} onChange={v => set('date_of_birth', v)} placeholder="1985-06-15" keyboard="numeric" />
        </Field>

        <View style={styles.switchRow}>
          <Text style={styles.label}>Deceased?</Text>
          <Switch value={form.is_deceased} onValueChange={v => set('is_deceased', v)} trackColor={{true: COLORS.primary}} />
        </View>

        {form.is_deceased && (
          <Field label="Date of Death (YYYY-MM-DD)">
            <TextF value={form.date_of_death} onChange={v => set('date_of_death', v)} placeholder="2010-03-22" keyboard="numeric" />
          </Field>
        )}

        <Text style={styles.sectionHead}>Contact & Background</Text>
        <Field label="Phone">
          <TextF value={form.phone} onChange={v => set('phone', v)} placeholder="+234 xxx xxx xxxx" keyboard="phone-pad" />
        </Field>
        <Field label="Email">
          <TextF value={form.email} onChange={v => set('email', v)} placeholder="member@email.com" keyboard="email-address" capitalize="none" />
        </Field>
        <Field label="Occupation">
          <TextF value={form.occupation} onChange={v => set('occupation', v)} placeholder="Occupation" />
        </Field>
        <Field label="Education">
          <TextF value={form.education} onChange={v => set('education', v)} placeholder="Highest qualification" />
        </Field>
        <Field label="State of Origin">
          <TextF value={form.state_of_origin} onChange={v => set('state_of_origin', v)} placeholder="e.g. Ogun" capitalize="words" />
        </Field>
        <Field label="LGA">
          <TextF value={form.lga} onChange={v => set('lga', v)} placeholder="Local Government Area" capitalize="words" />
        </Field>
        <Field label="Address">
          <TextF value={form.address} onChange={v => set('address', v)} placeholder="Home address" multiline />
        </Field>

        <Text style={styles.sectionHead}>Family Links</Text>

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

        <Field label="Bio / Notes">
          <TextF value={form.bio} onChange={v => set('bio', v)} placeholder="Brief biography or notes…" multiline />
        </Field>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={loading}>
          <Text style={styles.submitText}>{loading ? 'Saving…' : 'Add Member'}</Text>
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
  chevron: {fontSize: 16, color: COLORS.textMuted},
  clearBtn: {fontSize: 14, color: COLORS.danger, fontWeight: FONTS.weights.bold},
  submitBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.md,
    paddingVertical: SPACING.base, alignItems: 'center',
    marginHorizontal: SPACING.base, marginTop: SPACING.xl,
  },
  btnDisabled: {opacity: 0.6},
  submitText: {color: COLORS.white, fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.semibold},
});
