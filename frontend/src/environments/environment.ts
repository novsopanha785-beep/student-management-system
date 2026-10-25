// After you deploy the backend (for example on Render), paste its address here.
// Keep the "/api" at the end. This is only used when the site is NOT opened from your own computer.
const HOSTED_API_URL = 'https://sms-backend-iztw.onrender.com/api';

const onLocalComputer = ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const environment = {
  // On your computer the app talks to the local backend; when hosted it uses HOSTED_API_URL.
  apiUrl: onLocalComputer ? 'http://localhost:3000/api' : HOSTED_API_URL,

  // --- School branding ---
  // Your logo file goes in frontend/public/logo/setec.png (a "logo" folder inside "public").
  schoolName: 'SETEC INSTITUTE',
  schoolShortName: 'SE', // letters shown instead of the logo if no logo file is found
  logoUrl: 'logo/setec.png',
};
