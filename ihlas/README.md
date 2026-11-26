# İhlas Sayaç (Android)

Daireye bastıkça sayar (40'ta titreşim, yeni tur). Sayı telefonda saklanır; uygulama kapanıp açılsa da kaldığı yerden devam eder.

## Telefonda deneme
```
npm install
npx expo start
```
Telefona **Expo Go** kurup QR kodu okutun.

## APK üretme
```
npm install -g eas-cli
eas login
eas build -p android --profile apk
```
Çıkan linkten APK'yı indirip telefona kurun.
