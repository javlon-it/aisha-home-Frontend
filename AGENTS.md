# AISHA Home V2 frontend designer qoidalari

Ushbu fayl shu frontend repository va uning barcha ichki papkalariga amal qiladi. Ichki papkada yanada aniqroq `AGENTS.md` mavjud bo‘lsa, u qo‘shimcha va aniqroq qoida sifatida qo‘llanadi. Yuqori darajadagi ko‘rsatmalar, loyiha ildizidagi `AGENTS.md` va foydalanuvchining joriy topshirig‘i doimo saqlanadi; ushbu fayl ularni bekor qilmaydi.

## Ish maydoni

- Dizayn ishlari faqat ushbu frontend repository ichida bajariladi.
- `D:\AISHA-design` papkasida yangi o‘zgarish qilmang.
- Ishni boshlashdan oldin `git status --short` orqali mavjud o‘zgarishlarni tekshiring.
- Mavjud yoki boshqa agentga tegishli o‘zgarishlarni saqlang; ularni bekor qilmang, ustidan yozmang yoki formatlash bahonasida keng qayta yozmang.
- 1-CODEX yoki boshqa agent tahrirlayotgan faylni parallel o‘zgartirmang. Fayl egaligi noaniq bo‘lsa, tahrirdan oldin muvofiqlashtiring.

## Ruxsat etilgan ishlar

- UI/UX va vizual tuzilma.
- CSS, Tailwind CSS va DaisyUI doirasidagi uslublar.
- Rang, shrift, spacing, ikonka va animatsiyalar.
- Responsive dizayn.
- Accessibility va foydalanish qulayligi.
- JSX ichida faqat vizual tuzilma va semantik markupni yaxshilash; mavjud funksional bog‘lanishlar aynan saqlanishi shart.

## Qat'iy chegaralar

- Backend, API implementatsiyasi yoki API kontraktini o‘zgartirmang.
- Biznes logikasi, hisob-kitob, ma'lumotlar bazasi va ma'lumot oqimiga tegmang.
- Authentication, routing, state, hooks va services funksiyalarini o‘zgartirmang.
- `onClick`, `onSubmit`, boshqa event handlerlar, form field bog‘lanishlari, route targetlar, API chaqiruvlari, loading/error holatlari va mavjud accessibility atributlarini olib tashlamang yoki ishlashini o‘zgartirmang.
- Dependency qo‘shmang, yangilamang yoki olib tashlamang; `package.json` va lockfile’ni ruxsatsiz o‘zgartirmang.
- Ruxsatsiz commit, push yoki deploy qilmang.
- Boshqa agentning o‘zgarishlarini bekor qilmang.
- Dizayn talabi logika o‘zgarishini talab qilsa, uni mustaqil amalga oshirmang. Kerakli fayl, sabab, kutilgan xatti-harakat va acceptance mezonini 1-CODEX uchun topshiriq sifatida hisobot qiling.

## O‘zgartirish va tekshiruv tartibi

1. Tahrirdan oldin Git statusni va target fayllardagi mavjud o‘zgarishlarni tekshiring.
2. Faqat topshiriq uchun zarur frontend vizual fayllarini minimal hajmda tahrirlang.
3. JSX tahririda mavjud importlar, handlerlar, props, state, hooks, service chaqiruvlari va route xatti-harakatlarini saqlang.
4. Har bir mantiqiy dizayn o‘zgarishidan keyin:
   - `npm.cmd test` bilan funksional regressionni tekshiring;
   - `npm.cmd run build` bilan production buildni tekshiring;
   - o‘zgargan user flow’ni desktop va mobile viewportlarda browser orqali tekshiring.
5. Browser tekshiruvida kamida keyboard navigatsiya, focus holati, asosiy interaktiv elementlar, form submission mexanizmi, responsive overflow va browser console xatolarini tekshiring.
6. Test o‘tkazilmagan yoki muhit sabab bajarilmagan bo‘lsa, ishni to‘liq tekshirilgan deb aytmang; aynan qaysi tekshiruv va nima sabab qolganini yozing.

## Yakuniy hisobot

- Qaysi vizual fayllar o‘zgarganini qisqa sanang.
- `npm.cmd test`, `npm.cmd run build` va browser test natijalarini alohida ko‘rsating.
- Lokal yoki mock tekshiruvni live yoxud production tasdig‘i sifatida ko‘rsatmang.
- Logikaga oid zarurat topilsa, uni bajarilgan ish emas, 1-CODEX uchun alohida topshiriq sifatida yozing.
