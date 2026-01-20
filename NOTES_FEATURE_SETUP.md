# 📝 Add Notes Feature - Setup Guide

## Database Setup Required

Before the notes feature will work, you need to add the `notes` column to your database.

### Step 1: Run SQL in Supabase

1. Go to **Supabase** → **SQL Editor**
2. Copy and paste this SQL:

```sql
ALTER TABLE contact_entries 
ADD COLUMN IF NOT EXISTS notes TEXT;
```

3. Click **"Run"**

### Step 2: Verify

Run this to verify the column was added:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'contact_entries';
```

You should see `notes` with type `text` in the results.

---

## ✅ Features Added

### **Notes Column**
- Editable textarea for each contact entry
- Saves notes to database
- Persists across sessions

### **Save Button** 💾
- Green save button next to textarea
- Click to save notes
- Shows success/error message

### **Database Integration**
- Notes stored in `contact_entries` table
- Updates in real-time
- Accessible from admin dashboard

---

## 🎯 How to Use

1. **View Contact Enquiries** - Click "View" on dashboard or bell icon
2. **Add Notes** - Type in the textarea for any entry
3. **Save** - Click the 💾 button
4. **Success** - You'll see "Notes saved successfully!" message

---

## 📊 Table Structure

The Contact Enquiries table now has:
- Name
- Email  
- Phone
- Message
- Date
- **Notes** (new!)
- Actions (Call 📞 / Email ✉️)

---

**Run the SQL script above and the notes feature will work!** 🚀
