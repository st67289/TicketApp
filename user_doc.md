# 📖 Uživatelská dokumentace TicketApp

Vítejte v oficiální příručce k aplikaci **TicketApp**. Aplikace slouží k nákupu vstupenek na kulturní akce a poskytuje rozhraní pro běžné uživatele i administrátory.

## 🧭 Obsah

1. [Registrace a Přihlášení](#1-registrace-a-přihlášení)
2. [Správa účtu (Můj profil)](#2-správa-účtu-můj-profil)
3. [Nákup vstupenek](#3-nákup-vstupenek)
4. [Moje objednávky a vstupenky](#4-moje-objednávky-a-vstupenky)
5. [Administrátorská sekce](#5-administrátorská-sekce)
6. [Řešení potíží (FAQ)](#6-řešení-potíží-faq)

---

## 1. Registrace a Přihlášení

Pro nákup vstupenek je vyžadován uživatelský účet. Prohlížení akcí je přístupné i bez přihlášení.

### 🆕 Registrace

1. V horním menu klikněte na **Registrovat**.
2. Vyplňte **Jméno**, **Příjmení**, **E-mail** a **Heslo**.
3. Klikněte na tlačítko **Vytvořit účet**.

### 🔐 Přihlášení

Do aplikace se můžete přihlásit dvěma způsoby:

* **E-mail a heslo:** Použijte údaje zadané při registraci.
* **Google:** Kliknutím na tlačítko „Přihlásit přes Google“ (vyžaduje Google účet).

### 🔑 Zapomenuté heslo

Pokud neznáte své heslo, nelze ho změnit v profilu, musíte využít proces obnovy:

1. Na přihlašovací obrazovce klikněte na **„Zapomněli jste heslo?“**.
2. Zadejte svůj e-mail.
3. Zkontrolujte e-mailovou schránku – obdržíte **ověřovací kód**.
4. Vraťte se do aplikace, zadejte kód a nastavte si nové heslo.

---

## 2. Správa účtu (Můj profil)

Po přihlášení klikněte na své jméno vpravo nahoře a zvolte **Můj Profil**.

### Co zde můžete dělat:

* ✏️ **Upravit osobní údaje:** Můžete změnit své **Jméno** a **Příjmení**.
* E-mail změnit nelze (slouží jako unikátní identifikátor).
* *Upozornění: Změna hesla se v této sekci neprovádí (viz kapitola Zapomenuté heslo).*

---

## 3. Nákup vstupenek

### Výběr akce

Na domovské stránce (Dashboard) vidíte seznam nadcházejících akcí.

* **Filtrování:** Pomocí lišty nahoře můžete hledat podle názvu akce, data nebo města.

### Detail akce a Typy vstupenek

Po rozkliknutí akce uvidíte ceny a dostupné typy lístků:

#### A. Vstupenky na Stání

* Zadáte pouze **počet kusů**.
* Systém hlídá celkovou kapacitu prostoru. Pokud je vyprodáno, nelze přidat do košíku.

#### 🪑 Interaktivní výběr sedadla

U akcí se sezením se zobrazí mapa sálu:

* ⬜ **Prázdný čtvereček:** Místo je volné. Kliknutím jej vyberete.
* 🟦 **Modrá (Tyrkysová):** Vámi vybrané místo.
* ⬛ **Tmavě šedá:** Místo je již obsazené.

> **Tip:** Pokud na sedadlo kliknete a systém nahlásí chybu, znamená to, že vás v téže vteřině předběhl jiný uživatel.

### Košík a Platba

1. Vstupenky se ukládají do **Košíku**.
2. Zkontrolujte položky a celkovou cenu.
3. Klikněte na **Dokončit a zaplatit**.
4. Objednávka se vytvoří a vstupenky jsou vaše.

---

## 4. Moje objednávky a vstupenky

Všechny zakoupené lístky najdete v sekci **Moje Objednávky**.

### Funkce historie:

* **Seznam objednávek:** Datum nákupu, status a celková cena.
* **Vyhledávání:** Podle názvu akce nebo čísla objednávky.

    * *Vyhledávání funguje pouze nad již načtenými položkami.*
* **Stažení vstupenky:** PDF soubor s **QR kódem**.

---

## 5. Administrátorská sekce

*Viditelné pouze pro uživatele s rolí `ADMINISTRATOR`.*

### 📊 Statistiky

* Výběr konkrétní akce.
* Graf prodeje pro **Sezení** a **Stání**.

### 🏟️ Správa Míst (Venues)

* Vytváření sálů.
* Editor řad a sedadel (max. 25 míst na řadu).

### 📅 Správa Akcí

* Přiřazení sálu.
* Nastavení data a ceny.

### 👥 Správa Uživatelů

* Blokace / Odblokování účtů.

---

## 6. Řešení potíží (FAQ)

**Q: Vidím zelené místo, ale nejde vybrat?**
**A:** Místo právě vybral jiný uživatel. Obnovte stránku.

**Q: Nedorazil mi e-mail se vstupenkou.**
**A:** Zkontrolujte spam nebo stáhněte PDF v sekci **Moje Objednávky**.
