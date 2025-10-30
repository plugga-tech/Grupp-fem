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

    •	app/ – Expo Router-sidor och navigationsstackar
    •	_layout.tsx – Root-layout med Auth-, Theme- och React Query-providers
    •	(tabs)/ – Bottom-tabbar med vyer för sysslor, hushåll, profil m.m.
    •	api/ – Firestore/Firebase-anrop (auth, chores, household, user)
    •	components/ – Återanvändbara UI-komponenter och modal-fönster
    •	hooks/ –  hooks (t.ex. React Query setup, hushållsmutationer)
    •	state/ – Contexts för Auth och Theme
    •	utils/avatar.ts – Avataruppsättning och hjälpfunktioner
    •	atoms.ts – Jotai-atomer för användare och aktivt hushåll
    •	firebase-config.ts – Initiering av Firebase (Auth, Firestore, Storage)

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

# Kravlista 30/40

## Allmänt (4)

- [x] En logga, splashscreen och appikon ska designas och användas.\*
- [x] Applikationen ska byggas med **React Native**, **Expo** och **TypeScript**.\*
- [x] Designen av appen ska utgå ifrån befintliga skisser. Undantag ska diskuteras, godkännas och dokumenteras.\*
- [x] Information ska kommuniceras till och från en server.

---

## Hushåll (7)

- [x] Ett hushåll ska ha ett namn och en genererad (enkel) kod så andra kan gå med i hushållet. Namnet ska gå att ändra.\*
- [x] Alla användare i ett hushåll ska kunna se vilka som tillhör hushållet.
- [ ] En ägare av ett hushåll ska kunna se förfrågningar om att gå med i hushållet.
- [ ] En ägare ska kunna acceptera eller neka förfrågningar.
- [ ] En ägare ska kunna göra andra till ägare.
- [ ] En ägare ska kunna pausa en användare. Pausade användare ska inte tas med i statistiken.
- [ ] Om en användare pausas under en del av en period i statistiken ska graferna normaliseras.

---

## Konto (5)

- [x] En användare ska kunna registrera och logga in sig.\*
- [x] En användare ska kunna skapa ett nytt hushåll.\*
- [x] En användare ska kunna gå med i ett hushåll genom att ange hushållets kod.\*
- [ ] När en användare har valt att gå med i ett hushåll behöver en ägare av hushållet godkänna användaren.
- [x] En användare ska kunna lämna ett hushåll.

---

## Profil (6)

- [x] En användare ska kunna ange sitt namn.\*
- [x] En användare ska kunna välja en avatar (emoji-djur + färg) från en fördefinierad lista.\*
- [x] Valda avatarer ska inte kunna väljas av andra användare i hushållet.\*
- [x] Avataren ska användas i appen för att visa vad användaren har gjort.\*
- [x] En användare ska kunna ställa in appens utseende (mörkt, ljust, auto).
- [x] Om en användare tillhör två eller fler hushåll ska denne kunna byta mellan dem.

---

## Sysslor (6)

- [x] En ägare ska kunna lägga till sysslor att göra i hemmet.\*
- [x] En syssla ska ha ett namn, en beskrivning (text), hur ofta den ska göras (dagar), och en vikt som beskriver hur energikrävande den är.\*
- [ ] En användare ska kunna lägga till en ljudinspelning och en bild för att beskriva sysslan ytterligare.
- [x] En ägare ska kunna redigera en syssla.\*
- [x] En ägare ska kunna ta bort en syssla.
- [ ] När en syssla tas bort ska användaren få en varning om att all statistik gällande sysslan också kommer att tas bort och få valet att arkivera sysslan istället.

---

## Dagsvy (3)

- [x] Alla sysslor ska listas i en dagsvy och ge en översikt kring vad som behöver göras.\*
- [x] Utöver sysslans namn ska även vem/vilka som har gjort sysslan visas, hur många dagar sedan den gjordes samt om den är försenad.\*
- [x] När en användare väljer en syssla ska beskrivningen visas och det ska gå att markera sysslan som gjord.\*

---

## Statistik (6)

- [x] En användare ska kunna se fördelningen av gjorda sysslor mellan användarna i sitt hushåll.\*
- [x] Varje statistikvy ska visa den totala fördelningen (inräknat vikterna för sysslorna) samt fördelning av varje enskild syssla.\*
- [x] Det ska finnas en statistikvy över **nuvarande vecka**.\*
- [x] Det ska finnas en statistikvy över **förra veckan**.
- [x] Det ska finnas en statistikvy över **förra månaden**.
