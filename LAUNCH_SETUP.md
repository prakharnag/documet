# Documet Launch Setup Guide

This guide explains how to set up and deploy Documet in launch mode (waitlist) vs development mode (full app).

## 🚀 Quick Start

### 1. Environment Configuration

Create a `.env.local` file with the following variables:

```bash
# Launch Mode Configuration
NEXT_PUBLIC_LAUNCH_MODE=true  # Set to 'true' for waitlist mode, 'false' for full app
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database Configuration
NEON_DB_HOST=your_neon_host
NEON_DB_USERNAME=your_username
NEON_DB_PASSWORD=your_password
NEON_DB_DATABASE=your_database
```

### 2. Database Setup

The waitlist table has been added to your schema. Run migrations:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 3. Launch Mode Features

When `NEXT_PUBLIC_LAUNCH_MODE=true`:

- ✅ Landing page shows "Join Waitlist" buttons
- ✅ Waitlist form in hero section
- ✅ Dedicated waitlist section
- ✅ Admin page at `/admin/waitlist`
- ❌ Login/Register pages hidden
- ❌ Dashboard access disabled

When `NEXT_PUBLIC_LAUNCH_MODE=false`:

- ✅ Full app functionality
- ✅ Login/Register pages
- ✅ Dashboard access
- ❌ Waitlist features hidden

## 📁 File Structure

```
src/
├── lib/
│   └── config.ts              # Launch mode configuration
├── components/
│   ├── WaitlistForm.tsx       # Waitlist form component
│   └── LandingPage.tsx        # Updated landing page
├── app/
│   ├── api/waitlist/
│   │   └── route.ts           # Waitlist API endpoint
│   └── admin/waitlist/
│       └── page.tsx           # Admin dashboard
└── db/
    └── schema.ts              # Updated with waitlist table
```

## 🔧 API Endpoints

### POST `/api/waitlist`
Add a new waitlist entry:

```json
{
  "email": "user@example.com",
  "name": "John Doe",  // optional
  "source": "landing_page"  // optional, defaults to "landing_page"
}
```

### GET `/api/waitlist`
Fetch all waitlist entries (for admin use).

## 🎨 Customization

### Waitlist Form
The `WaitlistForm` component supports customization:

```jsx
<WaitlistForm 
  showName={true}                    // Show name field
  buttonText="Join the Waitlist"     // Custom button text
  placeholder="Enter your email"     // Custom placeholder
  className="custom-class"           // Custom styling
/>
```

### Styling
All components use Tailwind CSS and match the modern, glassmorphic design of the landing page.

## 🚀 Deployment

### Development Branch
```bash
git checkout main
# Set NEXT_PUBLIC_LAUNCH_MODE=false
npm run dev
```

### Launch Branch
```bash
git checkout -b launch/landing-page
# Set NEXT_PUBLIC_LAUNCH_MODE=true
npm run build
npm start
```

### Environment Variables for Production
Set these in your hosting platform (Vercel, Netlify, etc.):

```bash
NEXT_PUBLIC_LAUNCH_MODE=true
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEON_DB_HOST=your_production_db_host
NEON_DB_USERNAME=your_production_username
NEON_DB_PASSWORD=your_production_password
NEON_DB_DATABASE=your_production_database
```

## 📊 Admin Access

Visit `/admin/waitlist` to view all waitlist entries. Features:

- View all signups
- See email, name, source, and signup date
- Refresh data
- Total signup count

## 🔄 Switching Modes

### To Launch Mode:
1. Set `NEXT_PUBLIC_LAUNCH_MODE=true`
2. Deploy to production
3. Users see waitlist forms

### To Development Mode:
1. Set `NEXT_PUBLIC_LAUNCH_MODE=false`
2. Deploy to production
3. Users see full app functionality

## 🎯 Next Steps

1. **Create demo video** and replace placeholder in ChromeWindow
2. **Set up email notifications** for waitlist signups
3. **Add analytics** to track conversion rates
4. **Create launch announcement** system
5. **Set up automated emails** for waitlist members

## 🛠️ Troubleshooting

### Common Issues:

1. **Waitlist table not created**: Run `npx drizzle-kit migrate`
2. **Environment variables not working**: Restart development server
3. **API errors**: Check database connection and NeonDB credentials
4. **Styling issues**: Ensure Tailwind CSS is properly configured

### Support:
- Check the database logs for API errors
- Verify environment variables are set correctly
- Test the waitlist API endpoint directly

---

**Ready to launch! 🚀** 