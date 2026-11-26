import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, Vibration, View, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'ihlas_sayac';
const HEDEF = 40;

export default function App() {
  const [sayi, setSayi] = useState(0);
  const [yuklendi, setYuklendi] = useState(false);
  const tur = useRef(0);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => {
        const n = parseInt(v, 10);
        if (!isNaN(n)) setSayi(n);
      })
      .finally(() => setYuklendi(true));
  }, []);

  const kaydet = (n) => AsyncStorage.setItem(KEY, String(n)).catch(() => {});

  const artir = () => {
    if (!yuklendi) return;
    const n = sayi + 1;
    setSayi(n);
    kaydet(n);
    if (n % HEDEF === 0) Vibration.vibrate([0, 300, 100, 300]);
    else Vibration.vibrate(15);
  };

  const sifirla = () => {
    Alert.alert('Sıfırla', 'Sayaç sıfırlansın mı?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sıfırla', style: 'destructive', onPress: () => { setSayi(0); kaydet(0); } },
    ]);
  };

  const tamamlanan = Math.floor(sayi / HEDEF);
  const mevcut = sayi % HEDEF;

  return (
    <View style={s.kap}>
      <StatusBar style="light" />
      <Text style={s.baslik}>İhlâs Sûresi</Text>
      <Text style={s.alt}>Hedef: {HEDEF} · Tamamlanan tur: {tamamlanan}</Text>

      <Pressable onPress={artir} style={({ pressed }) => [s.daire, pressed && s.basili]}>
        <Text style={s.sayi}>{mevcut}</Text>
        <Text style={s.hedef}>/ {HEDEF}</Text>
      </Pressable>

      <Text style={s.toplam}>Toplam: {sayi}</Text>
      <Pressable onPress={sifirla} style={s.btn}>
        <Text style={s.btnYazi}>Sıfırla</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  kap: { flex: 1, backgroundColor: '#0b3d2e', alignItems: 'center', justifyContent: 'center' },
  baslik: { color: '#fff', fontSize: 28, fontWeight: '700' },
  alt: { color: '#a8d5c2', marginTop: 6, marginBottom: 40 },
  daire: {
    width: 260, height: 260, borderRadius: 130, backgroundColor: '#14804f',
    alignItems: 'center', justifyContent: 'center', elevation: 8,
    borderWidth: 6, borderColor: '#2fbf82',
  },
  basili: { backgroundColor: '#0f6a41', transform: [{ scale: 0.97 }] },
  sayi: { color: '#fff', fontSize: 90, fontWeight: '800' },
  hedef: { color: '#cdeede', fontSize: 22 },
  toplam: { color: '#a8d5c2', marginTop: 40, fontSize: 16 },
  btn: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#a8d5c2' },
  btnYazi: { color: '#a8d5c2' },
});
