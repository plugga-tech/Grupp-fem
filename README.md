# Hushållet

En Expo/React Native-app för att organisera hushållssysslor. Användare kan skapa hushåll, bjuda in familjemedlemmar med en kod och hålla koll på sysslor med hjälp av Firebase, React Query och Jotai.

---

## Funktioner

- E-postbaserad inloggning och registrering via Firebase Authentication.
- Hantering av hushåll: skapa, gå med i hushåll med kod, sätt aktivt hushåll och tilldela avatarer.
- Sysslolista med statusindikatorer (vem som gjort vad, hur ofta en syssla ska göras, värde per syssla).
- Adminflöden för att skapa, uppdatera, slutföra och ta bort sysslor.
- Profilsida med byte av visningsnamn, avatar per hushåll och tema (ljus/mörk/auto).

---

### Kodstruktur

app/ # Expo Router-sidor och stackar
\_layout.tsx # Root med Auth-, Theme- och React Query-providers
(tabs)/ # Bottom-tabbar med vyer för sysslor, hushåll, profil m.m.
api/ # Firestore/Firebase-anrop (auth, chores, household, user)
components/ # Återanvändbara UI-komponenter och modal-fönster
hooks/ # Skräddarsydda hooks (React Query setup, hushållsmutationer)
state/ # Contexts för Auth och Theme
utils/avatar.ts # Avataruppsättning och hjälpfunktioner
atoms.ts # Jotai-atomer för användare och aktivt hushåll
firebase-config.ts # Firebase-initiering (Auth/Firestore/Storage)

---

## Teknisk stack

- Expo, Expo Router och React Native.
- TypeScript, React Native Paper för UI-komponenter.
- Firebase (Auth & Firestore) för autentisering och data.
- @tanstack/react-query för caching, sync samt mutationer.
- Jotai för lättviktig global state (t.ex. aktivt hushåll).

---

## Komma igång

### Förutsättningar

- Node.js 18 eller senare samt npm.
- Expo CLI (valfritt men underlättar `expo start`).
- Firebase-projekt om du inte vill använda de incheckade API-nycklarna.

### Installation

```bash
npm install
npx expo start
```

---
