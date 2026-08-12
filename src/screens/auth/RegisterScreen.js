import React, {useState} from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert, Image,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import {useAuth} from '../../context/AuthContext';
import {authApi} from '../../api/auth';
import {metaApi} from '../../api/meta';
import {COLORS, FONTS, SPACING, RADIUS, SHADOWS} from '../../utils/theme';
import Icon from '../../components/Icon';
import ProgenitorPickerField from '../../components/ProgenitorPickerField';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function RegisterScreen({navigation}) {
  const {register} = useAuth();

  // Step 1: NIN verification -- required before the rest of the form unlocks.
  const [nin, setNin] = useState('');
  const [ninVerifying, setNinVerifying] = useState(false);
  const [verifiedToken, setVerifiedToken] = useState(null);
  const [verifiedIdentity, setVerifiedIdentity] = useState(null);
  const [compounds, setCompounds] = useState([]);

  React.useEffect(() => {
    metaApi.compounds().then(setCompounds).catch(() => {});
  }, []);

  // Step 2: rest of the registration form (locked until NIN is verified).
  const [form, setForm] = useState({
    father_name: '',
    mother_name: '',
    email: '',
    phone: '',
    location: '',
    education: '',
    occupation: '',
    compound: '',
    progenitor_id: '',
    spouses: '',
    offspring: '',
    password: '',
    password_confirmation: '',
  });
  const [photo, setPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (key, val) => setForm(f => ({...f, [key]: val}));

  const handleNinChange = text => {
    const digits = text.replace(/\D/g, '').slice(0, 11);
    setNin(digits);
    // Editing the NIN after verifying invalidates the token -- force re-verify.
    if (verifiedToken) {
      setVerifiedToken(null);
      setVerifiedIdentity(null);
    }
  };

  const handleVerifyNin = async () => {
    if (nin.length !== 11) {
      Alert.alert('Invalid NIN', 'Enter your 11-digit National Identification Number.');
      return;
    }
    setNinVerifying(true);
    try {
      const data = await authApi.verifyNin(nin);
      setVerifiedToken(data.verification_token);
      setVerifiedIdentity(data);
      if (data.phone && !form.phone) {
        set('phone', data.phone);
      }
    } catch (e) {
      Alert.alert('NIN verification failed', e.message);
    } finally {
      setNinVerifying(false);
    }
  };

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled) return;
    const asset = result.assets?.[0];
    if (asset) setPhoto(asset);
  };

  const handleRegister = async () => {
    if (!verifiedToken) {
      Alert.alert('Verify your NIN', 'Please verify your NIN before continuing.');
      return;
    }
    const required = ['father_name', 'mother_name', 'email', 'phone', 'location', 'education', 'occupation'];
    for (const key of required) {
      if (!form[key].trim()) {
        Alert.alert('Missing fields', 'Please fill in all required fields.');
        return;
      }
    }
    if (!PASSWORD_REGEX.test(form.password)) {
      Alert.alert('Weak password', 'Password must be at least 8 characters and include uppercase, lowercase, and a number.');
      return;
    }
    if (form.password !== form.password_confirmation) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('nin', nin);
      formData.append('nin_verification_token', verifiedToken);
      Object.entries(form).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });
      if (photo) {
        formData.append('photo', {
          uri: photo.uri,
          type: photo.mimeType || 'image/jpeg',
          name: photo.fileName || 'photo.jpg',
        });
      }

      const data = await register(formData);
      Alert.alert(
        'Account created',
        data.message || 'Your account is pending admin approval.',
        [{text: 'OK', onPress: () => navigation.navigate('Login')}],
      );
    } catch (e) {
      Alert.alert('Registration failed', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Create your account</Text>
        <Text style={styles.sub}>Join the Maliki Family network</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Step 1: Verify your NIN</Text>
          <Text style={styles.label}>National Identification Number *</Text>
          <TextInput
            style={[styles.input, verifiedToken && styles.inputVerified]}
            value={nin}
            onChangeText={handleNinChange}
            placeholder="11-digit NIN"
            placeholderTextColor={COLORS.textLight}
            keyboardType="number-pad"
            maxLength={11}
            editable={!ninVerifying}
          />
          <TouchableOpacity
            style={[styles.verifyBtn, (ninVerifying || nin.length !== 11) && styles.btnDisabled]}
            onPress={handleVerifyNin}
            disabled={ninVerifying || nin.length !== 11}
            activeOpacity={0.8}>
            {verifiedToken && !ninVerifying ? (
              <Icon name="checkmark-circle" size={16} color={COLORS.white} />
            ) : null}
            <Text style={styles.verifyBtnText}>
              {ninVerifying ? 'Verifying…' : verifiedToken ? 'Verified' : 'Verify NIN'}
            </Text>
          </TouchableOpacity>

          {verifiedIdentity ? (
            <View style={styles.verifiedBox}>
              <Icon name="checkmark-circle" size={18} color={COLORS.success} />
              <Text style={styles.verifiedText}>
                {[verifiedIdentity.first_name, verifiedIdentity.middle_name, verifiedIdentity.last_name]
                  .filter(Boolean).join(' ')} · DOB {verifiedIdentity.dob}
              </Text>
            </View>
          ) : null}
        </View>

        {verifiedToken ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Step 2: Your details</Text>

            {[
              {label: "Father's Name *", key: 'father_name', placeholder: 'Full name'},
              {label: "Mother's Name *", key: 'mother_name', placeholder: 'Full name'},
              {label: 'Email Address *', key: 'email', placeholder: 'you@example.com', keyboard: 'email-address'},
              {label: 'Phone Number *', key: 'phone', placeholder: '+234 xxx xxx xxxx', keyboard: 'phone-pad'},
              {label: 'Current Location (base) *', key: 'location', placeholder: 'City, State — not the family house'},
              {label: 'Education *', key: 'education', placeholder: 'Highest qualification'},
              {label: 'Occupation *', key: 'occupation', placeholder: 'Your occupation'},
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
                selectedValue={form.compound}
                onValueChange={v => set('compound', v)}
                style={styles.picker}>
                <Picker.Item label="Select compound…" value="" />
                {compounds.map(c => (
                  <Picker.Item key={c.id} label={c.name} value={c.name} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Branch Ancestor (optional)</Text>
            <ProgenitorPickerField
              value={form.progenitor_id}
              onChange={v => set('progenitor_id', v)}
              usePublic
            />

            {[
              {label: 'Spouse(s) (optional)', key: 'spouses', placeholder: 'Names, comma separated'},
              {label: 'Children (optional)', key: 'offspring', placeholder: 'Names, comma separated'},
            ].map(({label, key, placeholder}) => (
              <View key={key}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                  style={styles.input}
                  value={form[key]}
                  onChangeText={v => set(key, v)}
                  placeholder={placeholder}
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
            ))}

            <Text style={styles.label}>Photo (optional)</Text>
            <TouchableOpacity style={styles.photoBtn} onPress={handlePickPhoto} activeOpacity={0.8}>
              {photo ? (
                <Image source={{uri: photo.uri}} style={styles.photoPreview} />
              ) : (
                <>
                  <Icon name="camera-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.photoBtnText}>Add photo</Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.label}>Password *</Text>
            <TextInput
              style={styles.input}
              value={form.password}
              onChangeText={v => set('password', v)}
              placeholder="Min. 8 chars, upper + lower + number"
              placeholderTextColor={COLORS.textLight}
              secureTextEntry
            />

            <Text style={styles.label}>Confirm Password *</Text>
            <TextInput
              style={styles.input}
              value={form.password_confirmation}
              onChangeText={v => set('password_confirmation', v)}
              placeholder="Repeat password"
              placeholderTextColor={COLORS.textLight}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.btn, submitting && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={submitting}
              activeOpacity={0.8}>
              <Text style={styles.btnText}>{submitting ? 'Creating account…' : 'Create Account'}</Text>
            </TouchableOpacity>

            <Text style={styles.note}>
              Your account will be reviewed and approved by a family admin before you can access all features.
            </Text>
          </View>
        ) : null}
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
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.base,
    ...SHADOWS.sm,
  },
  cardTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
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
  inputVerified: {borderColor: COLORS.success},
  verifyBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  verifyBtnText: {color: COLORS.white, fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold},
  verifiedBox: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: SPACING.md, gap: SPACING.xs,
  },
  verifiedText: {flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.textMuted},
  pickerWrapper: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceAlt,
    marginBottom: SPACING.base,
    overflow: 'hidden',
  },
  picker: {color: COLORS.text},
  photoBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed',
    borderRadius: RADIUS.md, paddingVertical: SPACING.md,
    marginBottom: SPACING.base, backgroundColor: COLORS.surfaceAlt,
  },
  photoBtnText: {marginLeft: SPACING.xs, color: COLORS.primary, fontWeight: FONTS.weights.semibold},
  photoPreview: {width: 64, height: 64, borderRadius: RADIUS.md},
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
