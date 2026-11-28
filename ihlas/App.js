import React, { useEffect, useState } from 'react';
import {
  Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, Vibration, View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ayetleriKapat, ayetleriPlanla } from './bildirim';

const AYET_KEY = 'ayet_bildirim';

const KEY = 'sayaclar_v2';
const ESKI = 'ihlas_sayac';
const yeniId = () => String(Date.now()) + Math.random().toString(36).slice(2, 6);

export default function App() {
  const [liste, setListe] = useState([]);
  const [aktif, setAktif] = useState(null);
  const [yuklendi, setYuklendi] = useState(false);
  const [modal, setModal] = useState(false);
  const [ad, setAd] = useState('');
  const [hedefYazi, setHedefYazi] = useState('40');
  const [ayetAcik, setAyetAcik] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const v = await AsyncStorage.getItem(KEY);
        if (v) {
          const d = JSON.parse(v);
          setListe(d.liste);
          setAktif(d.aktif);
        } else {
          const eski = parseInt(await AsyncStorage.getItem(ESKI), 10);
          const id = yeniId();
          setListe([{ id, ad: 'İhlâs', hedef: 40, sayi: isNaN(eski) ? 0 : eski }]);
          setAktif(id);
        }
      } catch (e) {}
      try {
        const a = await AsyncStorage.getItem(AYET_KEY);
        const acik = a !== 'kapali';
        setAyetAcik(acik);
        if (acik) await ayetleriPlanla();
      } catch (e) {}
      setYuklendi(true);
    })();
  }, []);

  useEffect(() => {
    if (yuklendi) AsyncStorage.setItem(KEY, JSON.stringify({ liste, aktif })).catch(() => {});
  }, [liste, aktif, yuklendi]);

  const sayac = liste.find((x) => x.id === aktif) || liste[0];

  const degistir = (id, f) => setListe((l) => l.map((x) => (x.id === id ? f(x) : x)));

  const artir = () => {
    if (!sayac) return;
    const n = sayac.sayi + 1;
    degistir(sayac.id, (x) => ({ ...x, sayi: n }));
    if (n % sayac.hedef === 0) Vibration.vibrate([0, 300, 100, 300]);
    else Vibration.vibrate(15);
  };

  const sifirla = () =>
    Alert.alert('Sıfırla', `"${sayac.ad}" sıfırlansın mı?`, [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sıfırla', style: 'destructive', onPress: () => degistir(sayac.id, (x) => ({ ...x, sayi: 0 })) },
    ]);

  const sil = () => {
    if (liste.length < 2) return Alert.alert('En az bir sayaç kalmalı');
    Alert.alert('Sil', `"${sayac.ad}" silinsin mi?`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil', style: 'destructive',
        onPress: () => {
          const kalan = liste.filter((x) => x.id !== sayac.id);
          setListe(kalan);
          setAktif(kalan[0].id);
        },
      },
    ]);
  };

  const ayetDegistir = async () => {
    if (ayetAcik) {
      await ayetleriKapat();
      setAyetAcik(false);
      AsyncStorage.setItem(AYET_KEY, 'kapali').catch(() => {});
    } else {
      const ok = await ayetleriPlanla();
      if (!ok) return Alert.alert('Bildirim izni gerekli', 'Telefon ayarlarından bildirimlere izin verin.');
      setAyetAcik(true);
      AsyncStorage.setItem(AYET_KEY, 'acik').catch(() => {});
    }
  };

  const ekle = () => {
    const hedef = parseInt(hedefYazi, 10);
    if (!hedef || hedef < 1) return Alert.alert('Geçerli bir hedef girin');
    const id = yeniId();
    setListe((l) => [...l, { id, ad: ad.trim() || `Sayaç ${l.length + 1}`, hedef, sayi: 0 }]);
    setAktif(id);
    setAd(''); setHedefYazi('40'); setModal(false);
  };

  if (!yuklendi || !sayac) return <View style={s.kap} />;

  return (
    <View style={s.kap}>
      <StatusBar style="light" />
      <View style={s.sekmeKap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
          {liste.map((x) => (
            <Pressable key={x.id} onPress={() => setAktif(x.id)} style={[s.sekme, x.id === sayac.id && s.sekmeAktif]}>
              <Text style={s.sekmeYazi}>{x.ad}</Text>
              <Text style={s.sekmeAlt}>{x.sayi % x.hedef}/{x.hedef}</Text>
            </Pressable>
          ))}
          <Pressable onPress={() => setModal(true)} style={[s.sekme, s.ekleBtn]}>
            <Text style={s.sekmeYazi}>＋ Yeni</Text>
          </Pressable>
        </ScrollView>
      </View>

      <View style={s.orta}>
        <Text style={s.baslik}>{sayac.ad}</Text>
        <Text style={s.alt}>Hedef: {sayac.hedef} · Tamamlanan tur: {Math.floor(sayac.sayi / sayac.hedef)}</Text>

        <Pressable onPress={artir} style={({ pressed }) => [s.daire, pressed && s.basili]}>
          <Text style={s.sayi}>{sayac.sayi % sayac.hedef}</Text>
          <Text style={s.hedef}>/ {sayac.hedef}</Text>
        </Pressable>

        <Text style={s.toplam}>Toplam: {sayac.sayi}</Text>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
          <Pressable onPress={sifirla} style={s.btn}><Text style={s.btnYazi}>Sıfırla</Text></Pressable>
          <Pressable onPress={sil} style={s.btn}><Text style={s.btnYazi}>Sil</Text></Pressable>
        </View>
        <Pressable onPress={ayetDegistir} style={[s.btn, { marginTop: 16 }]}>
          <Text style={s.btnYazi}>Ayet bildirimleri: {ayetAcik ? 'Açık' : 'Kapalı'}</Text>
        </Pressable>
      </View>

      <Modal visible={modal} transparent animationType="fade" onRequestClose={() => setModal(false)}>
        <View style={s.modalArka}>
          <View style={s.modalKutu}>
            <Text style={s.modalBaslik}>Yeni sayaç</Text>
            <TextInput style={s.input} placeholder="Ad (örn. Sübhanallah)" placeholderTextColor="#789" value={ad} onChangeText={setAd} />
            <TextInput style={s.input} placeholder="Hedef" placeholderTextColor="#789" keyboardType="number-pad" value={hedefYazi} onChangeText={setHedefYazi} />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
              <Pressable onPress={() => setModal(false)} style={s.btn}><Text style={s.btnYazi}>Vazgeç</Text></Pressable>
              <Pressable onPress={ekle} style={[s.btn, { backgroundColor: '#14804f' }]}><Text style={[s.btnYazi, { color: '#fff' }]}>Ekle</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  kap: { flex: 1, backgroundColor: '#0b3d2e' },
  sekmeKap: { paddingTop: 48, height: 120 },
  sekme: { backgroundColor: '#0f5a40', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8, alignItems: 'center', justifyContent: 'center' },
  sekmeAktif: { backgroundColor: '#14804f', borderWidth: 2, borderColor: '#2fbf82' },
  ekleBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#a8d5c2' },
  sekmeYazi: { color: '#fff', fontWeight: '600' },
  sekmeAlt: { color: '#a8d5c2', fontSize: 12 },
  orta: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 40 },
  baslik: { color: '#fff', fontSize: 28, fontWeight: '700' },
  alt: { color: '#a8d5c2', marginTop: 6, marginBottom: 32 },
  daire: { width: 260, height: 260, borderRadius: 130, backgroundColor: '#14804f', alignItems: 'center', justifyContent: 'center', elevation: 8, borderWidth: 6, borderColor: '#2fbf82' },
  basili: { backgroundColor: '#0f6a41', transform: [{ scale: 0.97 }] },
  sayi: { color: '#fff', fontSize: 90, fontWeight: '800' },
  hedef: { color: '#cdeede', fontSize: 22 },
  toplam: { color: '#a8d5c2', marginTop: 32, fontSize: 16 },
  btn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#a8d5c2' },
  btnYazi: { color: '#a8d5c2' },
  modalArka: { flex: 1, backgroundColor: '#000a', justifyContent: 'center', padding: 24 },
  modalKutu: { backgroundColor: '#0b3d2e', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#2fbf82' },
  modalBaslik: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 12 },
  input: { backgroundColor: '#0f5a40', color: '#fff', borderRadius: 8, padding: 12, marginBottom: 12 },
});
