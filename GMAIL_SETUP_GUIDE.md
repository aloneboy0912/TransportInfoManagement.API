# 📧 Gmail Email Configuration Guide

## 🚀 Switching to Gmail for Email Sending

This guide will help you configure Gmail (Google) to send emails from your Excell-On Services application.

---

## ⚠️ Important: Gmail App Password Required

**You CANNOT use your regular Gmail password!**

Gmail requires an **App Password** for SMTP authentication. This is a special 16-character password generated specifically for applications.

---

## 🔑 Step 1: Enable 2-Step Verification

**App Passwords require 2-Step Verification to be enabled.**

1. **Go to Google Account Settings**:
   - Visit: https://myaccount.google.com/
   - Or go to: https://myaccount.google.com/security

2. **Enable 2-Step Verification**:
   - Click **"2-Step Verification"**
   - Follow the setup process
   - You'll need your phone for verification

3. **Complete Setup**:
   - Verify your phone number
   - Test the 2-step verification
   - **This is required before you can create App Passwords**

---

## 🔐 Step 2: Generate Gmail App Password

1. **Go to App Passwords Page**:
   - Visit: https://myaccount.google.com/apppasswords
   - Or: Google Account → Security → 2-Step Verification → App Passwords

2. **Select App and Device**:
   - **Select app**: Choose "Mail"
   - **Select device**: Choose "Other (Custom name)"
   - Enter name: "Excell-On Services" or "Transport Info Management"
   - Click **"Generate"**

3. **Copy the App Password**:
   - Google will show a **16-character password**
   - It looks like: `abcd efgh ijkl mnop`
   - **Copy it immediately** (remove spaces: `abcdefghijklmnop`)
   - You won't be able to see it again!

---

## ⚙️ Step 3: Configure appsettings.json

Update your `appsettings.json` file:

```json
{
  "EmailSettings": {
    "SmtpServer": "smtp.gmail.com",
    "Port": 587,
    "SenderEmail": "your-email@gmail.com",
    "SenderName": "Excell-On Consulting Services",
    "Username": "your-email@gmail.com",
    "Password": "abcdefghijklmnop",
    "Security": "TLS"
  }
}
```

### Important Notes:
- **SmtpServer**: `smtp.gmail.com`
- **Port**: `587` (TLS) or `465` (SSL)
- **SenderEmail**: Your Gmail address (e.g., `yourname@gmail.com`)
- **Username**: Same as SenderEmail (your Gmail address)
- **Password**: Your 16-character App Password (no spaces)
- **Security**: `"TLS"` for port 587, `"SSL"` for port 465

---

## 📋 Gmail SMTP Settings Summary

| Setting | Value |
|---------|-------|
| SMTP Server | `smtp.gmail.com` |
| Port | `587` (TLS) or `465` (SSL) |
| Username | Your Gmail address |
| Password | Gmail App Password (16 characters) |
| Security | `TLS` (port 587) or `SSL` (port 465) |
| Sender Email | Your Gmail address |

---

## ✅ Step 4: Test Your Configuration

1. **Update appsettings.json** with your Gmail credentials

2. **Restart Backend Server**:
   ```bash
   dotnet run
   ```

3. **Test Email**:
   - Go to: `http://localhost:3000/test-email`
   - Or use: `.\test-email.ps1`
   - Send a test email

4. **Check Your Inbox**:
   - Email should arrive in your Gmail inbox
   - Check spam folder if not found

---

## 🔒 Security Best Practices

1. **Never Share App Password**:
   - Keep it secret
   - Don't commit to Git
   - Use environment variables for production

2. **Use Environment Variables** (Recommended):
   ```bash
   # Windows PowerShell
   $env:EmailSettings__Password="your-app-password"
   
   # Linux/Mac
   export EmailSettings__Password="your-app-password"
   ```

3. **Revoke Old App Passwords**:
   - If compromised, revoke and create new one
   - Go to: https://myaccount.google.com/apppasswords

---

## 🚨 Troubleshooting

### Error: "Authentication failed"
- ✅ Make sure you're using **App Password**, not regular password
- ✅ Check that 2-Step Verification is enabled
- ✅ Verify App Password is correct (no spaces)
- ✅ Check Username matches your Gmail address exactly

### Error: "Less secure app access"
- ✅ Gmail no longer supports "Less secure apps"
- ✅ **You MUST use App Password** (not regular password)
- ✅ App Passwords work with 2-Step Verification enabled

### Error: "Connection timeout"
- ✅ Check firewall settings
- ✅ Verify port 587 is not blocked
- ✅ Try port 465 with SSL instead

### Emails going to spam
- ✅ Send from your own Gmail account (verified)
- ✅ Use proper email formatting
- ✅ Don't send too many emails at once (Gmail has limits)

---

## 📊 Gmail Sending Limits

**Free Gmail Accounts:**
- **Daily limit**: 500 emails per day
- **Per recipient**: 100 emails per day
- **Rate limit**: ~100 emails per hour

**Google Workspace (Paid):**
- **Daily limit**: 2,000 emails per day
- **Higher limits** available

---

## 🔄 Switching from SendGrid to Gmail

1. **Update appsettings.json**:
   - Change SMTP server to `smtp.gmail.com`
   - Update port to `587`
   - Change Username to your Gmail address
   - Change Password to Gmail App Password
   - Update SenderEmail to your Gmail address

2. **Restart Backend**:
   ```bash
   dotnet run
   ```

3. **Test**:
   - Send test email
   - Verify it arrives

---

## 💡 Advantages of Gmail

✅ **Free** (up to 500 emails/day)  
✅ **No sandbox mode** (can send to any email)  
✅ **Reliable delivery**  
✅ **Easy to set up**  
✅ **Familiar interface**  

---

## 📚 Additional Resources

- **Google Account**: https://myaccount.google.com/
- **App Passwords**: https://myaccount.google.com/apppasswords
- **2-Step Verification**: https://myaccount.google.com/security
- **Gmail SMTP Settings**: https://support.google.com/mail/answer/7126229

---

## ✅ Configuration Checklist

- [ ] Enabled 2-Step Verification on Google Account
- [ ] Generated Gmail App Password
- [ ] Updated `appsettings.json` with Gmail settings
- [ ] Updated `SenderEmail` to your Gmail address
- [ ] Updated `Username` to your Gmail address
- [ ] Updated `Password` to App Password (16 characters)
- [ ] Restarted backend server
- [ ] Tested email sending
- [ ] Received test email successfully

---

## 🎯 Quick Setup Summary

1. **Enable 2-Step Verification** → https://myaccount.google.com/security
2. **Generate App Password** → https://myaccount.google.com/apppasswords
3. **Update appsettings.json** → Use Gmail SMTP settings
4. **Test** → Send test email

---

**Your Gmail configuration is ready!** 🎉

Once you've set up the App Password and updated `appsettings.json`, restart your backend and test!

