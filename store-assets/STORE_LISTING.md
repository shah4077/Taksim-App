# Google Play store listing — Taksim

Copy-paste source for the Play Console listing. Play keeps a separate listing per
language, so add **English (United States)** as the default and **Arabic** as an
additional language, then paste the matching block into each.

Character limits are enforced by Play: title 30, short description 80, full
description 4000.

---

## English (United States)

### App name
```
Taksim — Split Bills Fairly
```

### Short description
```
Split gathering and trip costs fairly. Works offline, in English and Arabic.
```

### Full description
```
Taksim makes splitting shared costs simple, fair, and fast — whether you are hosting a family gathering or travelling with friends.

Two modes, built for how people actually share money.

FAMILY GATHERING
Planning a gathering where several families contribute? Add each family, record what they contributed and how many members attended, and Taksim works out a fair share per family. No more awkward mental arithmetic at the end of the night.

TRIPS WITH FRIENDS
Add your trip, add the people on it, then log expenses as they happen — who paid, how much, and who it covers. Taksim keeps a running balance for everyone and shows the simplest set of payments needed to settle up.

WHY TAKSIM

• Works completely offline. Every calculation runs on your phone, so it works on a plane, in the desert, or anywhere with no signal.

• No account needed. Tap "Continue as Guest" and start splitting immediately. Create an account only if you want one.

• Genuinely private. Your gatherings, expenses, and the names you enter never leave your device. We have no servers holding your data, we run no analytics, and we show no ads.

• Fully bilingual. Complete English and Arabic support, including proper right-to-left layout in Arabic. Switch language any time in Settings.

• Share results instantly. Send a clean summary of who owes what straight to WhatsApp or email.

• Currency flexible. Choose SAR, USD, AED, QAR, KWD, or EUR.

• Free, with no ads and nothing to unlock.

Taksim is designed for the way gatherings really work in the Gulf and beyond — where families contribute to a shared event, or friends cover different costs across a trip, and everyone just wants a fair answer without an argument.

Split bills, fairly and simply.
```

---

## Arabic (العربية)

### App name
```
تقسيم — قسّم الفواتير بإنصاف
```

### Short description
```
قسّم تكاليف المناسبات والرحلات بإنصاف. يعمل دون إنترنت، بالعربية والإنجليزية.
```

### Full description
```
يجعل "تقسيم" اقتسام التكاليف المشتركة بسيطاً وعادلاً وسريعاً — سواء كنت تستضيف مناسبة عائلية أو تسافر مع الأصدقاء.

وضعان اثنان، مصمّمان لطريقة مشاركة الناس للمصاريف فعلياً.

المناسبات العائلية
هل تخطط لمناسبة تساهم فيها عدة عائلات؟ أضف كل عائلة، وسجّل مساهمتها وعدد أفرادها الحاضرين، ويحسب "تقسيم" الحصة العادلة لكل عائلة. لا مزيد من الحسابات الذهنية المحرجة في نهاية الأمسية.

الرحلات مع الأصدقاء
أضف رحلتك، ثم أضف المشاركين فيها، وسجّل المصاريف أولاً بأول — من دفع، وكم، ولمن. يحتفظ "تقسيم" برصيد محدّث لكل شخص، ويعرض أبسط مجموعة من التحويلات اللازمة لتسوية الحسابات.

لماذا "تقسيم"؟

• يعمل دون إنترنت تماماً. تجري كل العمليات الحسابية على هاتفك، فيعمل التطبيق على متن الطائرة، أو في البر، أو في أي مكان بلا تغطية.

• لا حاجة لحساب. اضغط "المتابعة كضيف" وابدأ فوراً. أنشئ حساباً فقط إذا أردت ذلك.

• خصوصية حقيقية. مناسباتك ومصاريفك والأسماء التي تدخلها لا تغادر جهازك أبداً. لا نملك خوادم تحتفظ ببياناتك، ولا نستخدم أي تحليلات، ولا نعرض أي إعلانات.

• ثنائي اللغة بالكامل. دعم كامل للعربية والإنجليزية، بما في ذلك التخطيط من اليمين إلى اليسار في العربية. غيّر اللغة في أي وقت من الإعدادات.

• شارك النتائج فوراً. أرسل ملخصاً واضحاً لمن يدين بماذا مباشرة عبر واتساب أو البريد الإلكتروني.

• مرونة في العملة. اختر الريال السعودي أو الدولار أو الدرهم أو الريال القطري أو الدينار الكويتي أو اليورو.

• مجاني، بلا إعلانات ولا مزايا مدفوعة.

صُمّم "تقسيم" ليناسب الطريقة التي تجري بها المناسبات فعلياً في الخليج وخارجه — حيث تساهم العائلات في مناسبة مشتركة، أو يتحمّل الأصدقاء تكاليف مختلفة خلال رحلة، ويريد الجميع نتيجة عادلة دون خلاف.

قسّم الفواتير بإنصاف وبساطة.
```

---

## Graphic assets

| Asset | Requirement | Status |
|---|---|---|
| App icon | 512×512 PNG | ✅ `play-icon-512.png` |
| Feature graphic | 1024×500 PNG/JPG | ✅ `feature-graphic-1024x500.png` |
| Phone screenshots | 2–8, PNG/JPEG, 320–3840 px, 16:9 or 9:16 | ⬜ **capture from the app** |
| Tablet screenshots | Optional | ⬜ skip for now |

### Screenshots still to capture

Take these on a real phone (Expo Go is fine — the UI is identical), then crop out
any status-bar clutter. Suggested set, in this order:

1. **Welcome screen** — brand, first impression
2. **Home** — the two modes side by side
3. **Family gathering results** — the fair-share breakdown, the core value
4. **Trip expenses list** — a populated trip
5. **Friends balances** — who owes whom
6. **Settings in Arabic** — proves the bilingual claim

Populate realistic sample data first — empty states make a listing look
unfinished. Use plausible names and amounts rather than "test 1", "aaa".

---

## Other Play Console fields

- **Privacy policy URL:** `https://shah4077.github.io/Taksim-App/privacy.html`
- **Category:** Finance
- **Contact email:** `shahsyed4077@gmail.com`
- **Content rating:** complete the questionnaire — Taksim has no objectionable
  content, no ads, and no user-generated content shared between users, so it
  should rate "Everyone".
- **Data safety:** declare email address collected (account management), encrypted
  in transit, deletable on request. Declare **no** financial info collected — the
  expense figures never leave the device. This must match the privacy policy.
