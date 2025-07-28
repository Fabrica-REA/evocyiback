@echo off
setlocal

rem Install dependencies
npm install express express-validator helmet express-rate-limit dotenv cors mysql2

rem Run the development server
npm run dev

endlocal
