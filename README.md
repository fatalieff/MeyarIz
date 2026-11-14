# MathRank

MathRank Azərbaycan dilində hazırlanmış müəllim idarəetməsi və şagird performansı platformasıdır. Tətbiq fərdi riyaziyyat müəlliminə qrupları, şagirdləri, dərs cədvəlini, sınaqları, nəticələri və reytinqləri bir paneldən idarə etməyə imkan verir. Müəllim və şagird üçün ayrı interfeys və səlahiyyət modeli mövcuddur.

Bu sənəd həm developer, həm də layihəni davam etdirəcək AI agent üçün əsas kontekst mənbəyidir. Kodda dəyişiklik etməzdən əvvəl bu README-ni və repozitoriyanın kökündəki `AGENTS.md` faylını oxuyun.

## Cari vəziyyət

- Frontend və backend: Next.js 16 App Router, React 19, TypeScript
- UI: Tailwind CSS 4, Lucide ikonları, Recharts
- Auth və verilənlər bazası: Supabase Auth + PostgreSQL + RLS
- Hosted Supabase layihəsi qoşulub və əsas sxem deploy olunub
- Müəllim və şagird rolları işləyir
- Şagird dəvəti üçün `invite-student`, tam hesab silinməsi üçün `delete-student` Edge Function-ları mövcuddur
- Son yoxlama: typecheck, lint, 15 test və production build uğurla keçib
- Əsas dil: Azərbaycan dili
- Saat qurşağı: `Asia/Baku`

## Texnologiyalar

| Sahə | Texnologiya |
| --- | --- |
| Framework | Next.js `16.4.6` App Router |
| UI | React `19.3`, Tailwind CSS 4 |
| Dil | TypeScript 5 |
| Auth/DB | Supabase, `@supabase/ssr`, `@supabase/supabase-js` |
| Validasiya | Zod |
| Qrafiklər | Recharts |
| Test | Vitest |
| Paket meneceri | npm |

## Hazır funksiyalar

- Müəllim və şagird rolları üçün Supabase Auth
- Server-side rol yoxlaması və qorunan route-lar
- Qrup yaratma və arxivləşdirmə
- Şagird yaratma, qrupa qoşma və qrup dəyişmə tarixçəsi
- Şagird üçün birbaşa e-poçt və şifrə ilə Supabase Auth hesabı yaratma (e-poçt göndərişi tələb olunmur)
- Şagirdi əlaqəli məlumatları və Supabase Auth hesabı ilə birlikdə silmə
- Bir əməliyyatda həftənin bir neçə gününü seçmə imkanı olan dərs cədvəli və vaxt toqquşması yoxlaması
- Sınaq yaratma və nəticələri toplu daxil etmə
- `correct_answers / total_questions × 100` bal hesablaması
- Qrup və ümumi reytinq
- Təhlükəsiz leaderboard məlumat modeli
- Performans qrafikləri və inkişaf göstəriciləri
- Nailiyyətlər: mükəmməl nəticə və sabit performans
- Valideyn əlaqələri, telefon və WhatsApp keçidləri
- Bir dəfə göstərilən ad günü qarşılama ekranı

## Repo xəritəsi

```text
src/
  app/
    (auth)/                   # Login və şifrə bərpası səhifələri
    (teacher)/dashboard/      # Müəllim paneli
    (student)/student/        # Şagird paneli
    actions/                  # Auth və müəllim Server Action-ları
    api/students/[id]/invite/ # Dəvəti yenidən çağırmaq üçün API route
    auth/callback/            # Supabase auth callback
  components/                 # Formalar, layout, UI və qrafiklər
  lib/
    auth/                      # Sessiya və rol yoxlamaları
    calculations/              # Reytinq, cədvəl və bal hesablamaları
    queries/                   # Müəllim və şagird query-ləri
    supabase/                  # Browser/server Supabase client-ləri
    validations/               # Zod sxemləri
  proxy.ts                     # Supabase sessiyasını yeniləyən proxy
supabase/
  functions/
    invite-student/           # Təhlükəsiz Auth dəvəti Edge Function
    delete-student/           # Şagird məlumatı və Auth hesabının tam silinməsi
  migrations/                 # Hosted DB sxeminin migrasiyaları
  seed.sql                     # Yalnız lokal inkişaf məlumatları
tests/                         # Hesablama vahid testləri
```

## Əsas route-lar

### Auth

- `/login` — e-poçt və şifrə ilə giriş
- `/forgot-password` — şifrə bərpa məktubu
- `/reset-password` — yeni şifrə təyin etmə
- `/auth/callback` — Supabase auth kodunu sessiyaya çevirir

### Müəllim

- `/dashboard` — ümumi panel
- `/dashboard/students` — şagird siyahısı və yeni şagird formu
- `/dashboard/students/[id]` — şagird profili və performansı
- `/dashboard/groups` — qruplar
- `/dashboard/schedule` — dərs cədvəli
- `/dashboard/exams` — sınaqlar
- `/dashboard/rankings` — reytinq
- `/dashboard/analytics` — analitika
- `/dashboard/settings` — müəllim parametrləri

### Şagird

- `/student/dashboard`
- `/student/results`
- `/student/leaderboard`
- `/student/achievements`
- `/student/schedule`
- `/student/profile`

## Auth və rol modeli

`auth.users`-a yeni istifadəçi əlavə ediləndə `private.handle_new_user()` trigger-i avtomatik `public.profiles` sətri yaradır.

- `teacher`: öz `teacher_workspaces` sətrinin sahibidir və yalnız həmin workspace daxilində məlumat idarə edir.
- `student`: `students.auth_user_id` vasitəsilə profilinə bağlanır və yalnız öz məlumatlarını oxuyur.

Rol səlahiyyət üçün `profiles.role` və təhlükəsiz server yoxlamaları ilə müəyyən olunur. İstifadəçinin dəyişə bildiyi `user_metadata` authorization üçün istifadə edilməməlidir.

Əsas sessiya faylları:

- `src/lib/supabase/server.ts`
- `src/lib/supabase/browser.ts`
- `src/lib/auth/session.ts`
- `src/proxy.ts`

## Şagird yaratma və hesab axını

Müəllim `/dashboard/students?new=1` səhifəsində şagirdin adını, qrupunu, e-poçtunu və ilkin şifrəsini daxil edir. E-poçt göndərişi (SMTP) tələb olunmur:

1. `createStudent` Server Action məlumatı Zod ilə yoxlayır (`fullName`, `groupId`, `email`, `password >= 6`).
2. Şagird müəllimin workspace-ində `public.students` cədvəlinə yazılır.
3. `public.group_memberships` sətri yaradılır.
4. Server Action istifadəçinin sessiyası ilə `invite-student` Edge Function-ı çağırır (`studentId` və `password` göndərilir).
5. Edge Function JWT-ni və çağıranın həmin workspace-in müəllimi olduğunu yoxlayır.
6. `admin.auth.admin.createUser` ilə şagird üçün `email_confirm: true` ilə Auth istifadəçisi dərhal yaradılır (heç bir təsdiq e-poçtu göndərilmir).
7. Auth trigger-i avtomatik `student` rolunda profil yaradır.
8. Auth UUID `students.auth_user_id` sahəsinə bağlanır.
9. Müəllim şifrəni şagirdə birbaşa verir və şagird `/login` səhifəsindən dərhal daxil olur. Şifrə verilmədikdə fallback olaraq `inviteUserByEmail` ilə dəvət göndərilir.

Təhlükəsizlik qərarı: service-role/secret açarı Next.js tətbiqinə və brauzerə verilmir. O yalnız Supabase Edge Function runtime-ında `SUPABASE_SERVICE_ROLE_KEY` kimi mövcuddur.

Edge Function:

```text
supabase/functions/invite-student/index.ts
```

Hosted funksiyanın adı `invite-student`-dır və JWT yoxlaması aktivdir. Funksiya idempotentdir: şagird artıq Auth hesabına bağlıdırsa yeni dəvət yaratmır.

## Şagird və Auth hesabının silinməsi

Şagird profilindəki `Şagirdi sil` düyməsi və şagird siyahısındakı zibil qutusu əməliyyatı geri qaytarılmayan silmə üçün browser təsdiqi göstərir. Təsdiqdən sonra `deleteStudent` Server Action `delete-student` Edge Function-ı çağırır.

Edge Function müəllim sessiyasını və workspace sahibliyini yenidən yoxlayır. Yalnız bundan sonra service-role üçün açıq olan `public.delete_student_account` database funksiyası bir transaction daxilində aşağıdakıları silir:

- sınaq nəticələri;
- qrup üzvlükləri;
- cascade ilə valideyn əlaqələri, nailiyyətlər və leaderboard sətri;
- `public.students` sətri;
- əlaqəli `auth.users` istifadəçisi, identity və sessiyalar.

Auth istifadəçisi və `profiles` sətri silindiyi üçün həmin hesab yenidən giriş edə və platformadakı qorunan route-lara daxil ola bilməz. Funksiya `anon` və `authenticated` rollarına bağlıdır; yalnız Edge Function-ın service-role client-i onu çağıra bilər.

### E-poçt çatdırılması

Production-da istənilən şagird ünvanına məktub göndərmək üçün Supabase Dashboard-da custom SMTP qurulmalıdır:

```text
Authentication → Emails → SMTP Settings
```

Resend, SendGrid, AWS SES və ya etibarlı SMTP provayderi istifadə edilə bilər. Default Supabase SMTP production çatdırılması üçün kifayət deyil və məhdud ünvanlara məktub göndərə bilər.

Dəvət plain-text şifrə göndərmir. Təhlükəsiz birdəfəlik link göndərir və istifadəçi öz şifrəsini təyin edir. Rəqəmli OTP tələb olunarsa, Supabase email template `{{ .Token }}` dəyişəni ilə konfiqurasiya edilməli və login UI-də `verifyOtp` axını əlavə olunmalıdır.

### Production redirect

Edge Function lokal inkişaf üçün `http://localhost:3000` fallback-ından istifadə edir. Production deploy-da Edge Function secret kimi `APP_URL=https://real-domain.example` verilməlidir. Dəvət yönləndirməsi `/auth/callback?next=/reset-password` ünvanına gedir.

## Verilənlər modeli

| Cədvəl | Məqsəd |
| --- | --- |
| `profiles` | Auth istifadəçisi, rol və ad |
| `teacher_workspaces` | Müəllimin məlumat sərhədi |
| `teacher_settings` | Müəllim parametrləri |
| `groups` | Tədris qrupları |
| `group_schedules` | Həftəlik dərs saatları |
| `students` | Şagird profili və Auth bağlantısı |
| `group_memberships` | Aktiv və tarixi qrup üzvlükləri |
| `parent_contacts` | Valideyn/qəyyum əlaqələri |
| `examination_templates` | Sınaq şablonları |
| `examinations` | Sınaqlar |
| `exam_results` | Şagird nəticələri və normallaşdırılmış bal |
| `achievements` | Nailiyyət kataloqu |
| `student_achievements` | Qazanılmış nailiyyətlər |
| `safe_leaderboard` | Təhlükəsiz reytinq məlumatı |

Vacib database qaydaları:

- Bir şagirdin eyni anda yalnız bir aktiv qrup üzvlüyü ola bilər.
- Eyni workspace-də eyni e-poçtla ikinci şagird yaradıla bilməz.
- `normalized_score` tətbiqdən yox, database trigger-indən hesablanır.
- `correct_answers` sınağın sual sayından çox ola bilməz.
- Bütün public cədvəllərdə RLS aktivdir.
- Müəllim yalnız öz workspace məlumatına çıxır.
- Şagird yalnız öz profilinə bağlı məlumatı oxuyur.

## Migrasiyalar

Migrasiyaları ardıcıllıqla tətbiq edin:

```text
supabase/migrations/202611130001_initial_schema.sql
supabase/migrations/20261113114230_secure_leaderboard.sql
supabase/migrations/20261113114351_rls_policy_hardening.sql
supabase/migrations/20261113121111_delete_student_account.sql
supabase/migrations/20261114153428_fix_exam_rls_recursion.sql
```

İkinci migrasiya leaderboard-u materiallaşdırılmış, RLS-qorunan modelə keçirir. Üçüncü migrasiya explicit `TO authenticated` və əlavə authorization sərtləşdirmələri tətbiq edir. Son migrasiya `examinations` və `exam_results` policy-ləri arasındakı rekursiyanı RLS-dən yan keçən, amma çağıranın kimliyini daxilində yoxlayan `private` helper funksiyaları ilə aradan qaldırır.

## Lokal quraşdırma

Tələblər: Node.js 22+, npm, Supabase layihəsi və migration/deploy işi üçün Supabase CLI.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
npm run dev
```

Tətbiq: `http://localhost:3000`

## Environment dəyişənləri

Next.js `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Qaydalar:

- `.env.local` commit edilməməlidir.
- Secret və service-role açarına `NEXT_PUBLIC_` prefiksi vermək qadağandır.
- Next.js tətbiqinin `SUPABASE_SERVICE_ROLE_KEY` dəyişəninə ehtiyacı yoxdur.
- `SUPABASE_SERVICE_ROLE_KEY` Supabase tərəfindən Edge Function runtime-ına avtomatik verilir.
- Production `APP_URL` Edge Function secret-i kimi konfiqurasiya olunur; Next.js env dəyişəni deyil.

## Supabase quraşdırması

```bash
npx supabase login
npx supabase link --project-ref PROJECT_REF
npx supabase db push
npx supabase functions deploy invite-student --project-ref PROJECT_REF
npx supabase functions deploy delete-student --project-ref PROJECT_REF
```

Supabase Auth URL Configuration:

```text
Site URL: http://localhost:3000
Redirect URL: http://localhost:3000/auth/callback
Şifrə bərpası PKCE axını ilə http://localhost:3000/auth/callback?next=/reset-password ünvanından keçir. Supabase Redirect URLs siyahısında http://localhost:3000/auth/callback saxlanılmalıdır.
```

Production domeninin ekvivalent URL-lərini də allow-list-ə əlavə edin.

## İlk müəllim hesabı

İctimai müəllim qeydiyyatı yoxdur. Müəllim hesabı Supabase Auth admin tərəfindən yaradılmalı, sonra profil və workspace hazırlanmalıdır.

```sql
update public.profiles
set role = 'teacher', full_name = 'Müəllimin adı'
where id = 'AUTH_USER_UUID';

insert into public.teacher_workspaces (owner_id, name)
values ('AUTH_USER_UUID', 'MathRank');

insert into public.teacher_settings (workspace_id)
select id
from public.teacher_workspaces
where owner_id = 'AUTH_USER_UUID';
```

Real istifadəçi e-poçtları və test şifrələri repozitoriyaya yazılmamalıdır.

## Yoxlama komandaları

Hər əhəmiyyətli dəyişiklikdən sonra:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Hazırda testlər scoring, ranking və schedule hesablamalarını əhatə edir. Auth/Edge Function davranışı hosted Supabase mühitində ayrıca integration test ilə yoxlanmalıdır.

## Kod qaydaları

- Server Action-ları public endpoint kimi qəbul edin: auth, authorization və input validation olmalıdır.
- Müəllim workspace ID-sini client-dən etibarlı məlumat kimi qəbul etməyin; sessiyadan tapın.
- `service_role` açarını frontend və Next.js public env-ə çıxarmayın.
- Authorization üçün `raw_user_meta_data` istifadə etməyin.
- Yeni public cədvəldə RLS və ownership policy olmadan işi tamamlanmış saymayın.
- DB sxem dəyişikliyini yeni migration faylı ilə saxlayın; əvvəlki migration-ları yenidən yazmayın.
- Azərbaycan dilindəki UI mətnlərini və `Asia/Baku` davranışını qoruyun.
- Real məlumatı `seed.sql`-a və ya testlərə yazmayın.

## Məlum məhdudiyyətlər və növbəti işlər

- Custom SMTP ayrıca provider məlumatları ilə konfiqurasiya edilməlidir.
- Production domeni məlum olduqda Edge Function `APP_URL` secret-i yenilənməlidir.
- API route mövcuddur, lakin UI-də “Dəvəti yenidən göndər” düyməsi əlavə edilə bilər.
- Dəvətin qəbul vəziyyəti üçün ayrıca `invited/active` status modeli əlavə edilə bilər.
- Auth və Edge Function integration testləri artırılmalıdır.
- Supabase Security Advisor leaked-password protection funksiyasının aktiv olmadığını bildirir; production-dan əvvəl aktivləşdirmək tövsiyə olunur.

## AI agent üçün sürətli başlanğıc

1. `README.md` və `AGENTS.md` oxu.
2. `git status --short` ilə istifadəçinin mövcud dəyişikliklərini gör və onları silmə.
3. Tapşırığa uyğun route, Server Action, query və RLS policy-ni birlikdə yoxla.
4. Supabase dəyişikliklərində cari rəsmi dokumentasiyanı yoxla.
5. Schema dəyişikliyini yeni migration kimi saxla.
6. Secret məlumatı koda, log-a və README-yə yazma.
7. `typecheck`, `lint`, `test`, `build` icra et.
8. Auth/RLS dəyişibsə Supabase advisor-ları və real səlahiyyət sərhədlərini yoxla.

## Faydalı istinadlar

- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Auth email templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)

