# Ödənişlərin idarə edilməsi

Modul canlı **Math Rank** Supabase layihəsinə 23 noyabr 2026 tarixində migration-larla tətbiq edilib. Sistem payment gateway deyil; yalnız müəllimin real həyatda aldığı pulun maliyyə qeydini saxlayır.

## Canlı mühitdə görülən işlər

- `payment_management`, `harden_payment_management`, `fix_billing_intervals`, `skip_unpriced_invoices` və `billing_corrections` migration-ları tətbiq edilib.
- `configure-teacher-billing` Edge Function v1 deploy edilib və JWT tələb edir.
- `generate-daily-billing-invoices` Cron işi hər gün `20:15 UTC`-də, yəni `00:15 Asia/Baku` vaxtında işləyir.
- Mövcud workspace-lər `CALENDAR_MONTH` modeli ilə backfill edilib. Mövcud şagirdlər üçün billing term yaradılıb, lakin tarixi invoice uydurulmayıb.

## Deploy-dan əvvəl vacib addımlar

1. Mövcud qrupların standart qiymətini Qruplar bölməsindən daxil edin. Qiyməti `0` olan qrup üçün Cron invoice yaratmır.
2. Frontend tətbiqini adi deploy prosesinizlə yayımlayın.
3. Supabase Auth bölməsində **Leaked Password Protection** seçimini aktivləşdirmək tövsiyə olunur.
4. Yeni müəllim yaratma axını `configure-teacher-billing` funksiyasını çağırır; funksiyanın `ACTIVE` olduğunu Functions panelində yoxlayın.

## Maliyyə təhlükəsizliyi

- Məbləğlər `bigint` qəpiklə saxlanılır; JavaScript floating-point ledger hesablamasında istifadə edilmir.
- `invoices`, `payments`, `payment_allocations`, `billing_adjustments` və audit jurnallarına birbaşa client write icazəsi yoxdur.
- Mutasiyalar workspace sahibini `auth.uid()` ilə yoxlayan atomik RPC-lərdən keçir.
- Ödəniş silinmir: ləğv zamanı `voided_at`, səbəb və aktor saxlanılır, invoice statusu yenidən hesablanır.
- Invoice məbləği snapshot-dır; qiymət/endirim dəyişiklikləri yalnız gələcək dövrlərə tətbiq edilir.
- Avans ayrıca elektron balans deyil; ödənişin invoice-lara ayrılmamış hissəsidir və yeni invoice yarananda ən köhnə borcdan başlayaraq tətbiq olunur.
