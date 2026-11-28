import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AYETLER } from './ayetler';

const SAATLER = [9, 13, 17, 21]; // günde 4 ayet
const GUN = 14; // önümüzdeki 14 gün için planla (uygulama her açılışta yeniler)

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

export async function ayetleriKapat() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function ayetleriPlanla() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('ayetler', {
      name: 'Ayetler',
      importance: Notifications.AndroidImportance.HIGH,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }
  let izin = await Notifications.getPermissionsAsync();
  if (!izin.granted) izin = await Notifications.requestPermissionsAsync();
  if (!izin.granted) return false;

  await Notifications.cancelAllScheduledNotificationsAsync();
  const simdi = new Date();
  // Sıra kaldığı yerden devam eder (internet gerekmez, liste uygulamanın içinde)
  let i = parseInt(await AsyncStorage.getItem('ayet_sira'), 10) || 0;
  for (let g = 0; g < GUN; g++) {
    for (const saat of SAATLER) {
      const t = new Date(simdi.getFullYear(), simdi.getMonth(), simdi.getDate() + g, saat, 0, 0);
      if (t <= simdi) continue;
      const a = AYETLER[i++ % AYETLER.length];
      await Notifications.scheduleNotificationAsync({
        content: { title: a.k, body: a.m },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: t, channelId: 'ayetler' },
      });
    }
  }
  await AsyncStorage.setItem('ayet_sira', String(i % AYETLER.length));
  return true;
}
