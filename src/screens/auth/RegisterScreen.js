import React, {useState, useEffect} from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {useAuth} from '../../context/AuthContext';
import {metaApi} from '../../api/meta';
import {COLORS, FONTS, SPACING, RADIUS, SHADOWS} from '../../utils/theme';
import Icon from '../../components/Icon';

export default function RegisterScreen() {
  const {register} = useAuth();
  const [compounds, setCompounds] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    compound_id: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    metaApi.compounds().then(setCompounds).catch(() => {});
  }, []);

  const set = (key, val) => setForm(f => ({...f, [key]: val}));

  const handleRegister = async () => {
    const {name, email, password, password_confirmation} = form;
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }
    if (password !== password_confirmation) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await register(form);
    } catch (e) {
      Alert.alert('Registration failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Create your account</Text>
        <Text style={styles.sub}>Join the Maliki Family network</Text>

        {[
          {label: 'Full Name *', key: 'name', placeholder: 'John Doe'},
          {label: 'Email Address *', key: 'email', placeholder: 'you@example.com', keyboard: 'email-address'},
          {label: 'Phone Number', key: 'phone', placeholder: '+234 xxx xxx xxxx', keyboard: 'phone-pad'},
        ].map(({label, key, placeholder, keyboard}) => (
          <View key={key}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={styles.input}
              value={form[key]}
              onChangeText={v => set(key, v)}
              placeholder={placeholder}
              placeholderTextColor={COLORS.textLight}
              keyboardType={keyboard || 'default'}
              autoCapitalize={key === 'email' ? 'none' : 'words'}
              autoCorrect={false}
            />
          </View>
        ))}

        <Text style={styles.label}>Compound / Branch</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={form.compound_id}
            onValueChange={v => set('compound_id', v)}
            style={styles.picker}>
            <Picker.Item label="Select compound…" value="" />
            {compounds.map(c => (
              <Picker.Item key={c.id} label={c.name} value={c.id} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Password *</Text>
        <View style={styles.passRow}>
          <TextInput
            style={[styles.input, styles.passInput]}
            value={form.password}
            onChangeText={v => set('password', v)}
            placeholder="Min. 8 characters"
            placeholderTextColor={COLORS.textLight}
            secureTextEntry={!showPass}
          />
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(v => !v)}>
            <Icon name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Confirm Password *</Text>
        <TextInput
          style={styles.input}
          value={form.password_confirmation}
          onChangeText={v => set('password_confirmation', v)}
          placeholder="Repeat password"
          placeholderTextColor={COLORS.textLight}
          secureTextEntry={!showPass}
        />

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.8}>
          <Text style={styles.btnText}>{loading ? 'Creating account…' : 'Create Account'}</Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Your account will be reviewed and approved by a family admin before you can access all features.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1, backgroundColor: COLORS.background},
  scroll: {flexGrow: 1, padding: SPACING.base},
  heading: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.text,
    marginTop: SPACING.base,
  },
  sub: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    fontSize: FONTS.sizes.base,
    color: COLORS.text,
    backgroundColor: COLORS.surfaceAlt,
    marginBottom: SPACING.base,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceAlt,
    marginBottom: SPACING.base,
    overflow: 'hidden',
  },
  picker: {color: COLORS.text},
  passRow: {position: 'relative'},
  passInput: {paddingRight: 48},
  eyeBtn: {position: 'absolute', right: SPACING.base, top: 14},
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.base,
    alignItems: 'center',
    marginTop: SPACING.md,
    ...SHADOWS.brand,
  },
  btnDisabled: {opacity: 0.6},
  btnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  note: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.base,
    lineHeight: 18,
  },
});
