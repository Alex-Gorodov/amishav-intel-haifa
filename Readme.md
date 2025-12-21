# 📱 Shift Management App

*A mobile application for managing employee work shifts.*

The app allows users to view their schedule, transfer shifts to other employees, and swap shifts within the same role.

Built with **React Native**, the app focuses on a fast, clear, and user-friendly experience for everyday use.

---

## 🚀 Key Features

### 📆 Shift Calendar
- Monthly calendar view
- Highlighted workdays
- Tap a day to view shift details
- Locale support (e.g. `he-IL`)

### 🔍 Shift Details
- Date and time
- Post / role
- Assigned tasks (*guard tasks*)
- Notes and remarks

### 🔁 Shift Management
- **Give a shift** to another eligible employee
- **Swap shifts** with another employee of the same role
- Only *future and relevant shifts* are shown
- Graceful *empty states* when no actions are available

### 🧑‍🤝‍🧑 Roles & Compatibility
- Each shift is linked to a *post*
- Role compatibility is *strictly enforced*
- Users and shifts are filtered by role

### 🪟 Bottom Sheet / Modal for Shift Management
- *Dynamic modal height*
- Smooth animated transitions between views:
  - `details`
  - `give`
  - `swap`
- State is *automatically reset* when changing month or closing the modal

---

## 🧱 Tech Stack

- **React Native**
- **Expo**
- **Redux**
- **Animated API**
- **TypeScript**
- **Firebase / Firestore**
  *Shift dates are stored as `Timestamp`*
- **Cloudinary**
- **Custom Hooks**

---

## 🧠 Architecture

### Custom Hooks
- `useFileUpload`
  *Uploads pdf files to Cloudinary*
- `useImageUpload`
  *Uploads images to Cloudinary*
- `useRefresh`
  *Refresh the page by swipe down and download all the data from Firestore*
- `useHasReceivedRequests`
  *Receive all requests that user have (shift gives and changes)*
- `useUser`
  *Provides current user data*
- `useShiftRequestModal`
  *Controls modal state and view switching*
- `useShiftRequestActions`
  *Handles shift give / swap logic*
- `useShabbatByWeek`
  *Get and use the data of shabbat in/out hours per week*

### Utilities
- `dateUtils`
- `getCurrentWeekDates`
  *Include the number of small date functions*
- `getHoursString`
- `getIsoLocalDateKey`
  *Timezone-safe ISO date key*
- `getMonthlyHours`
- `getRequestsWithShifts`
  *Return swap and give shift requests from other employees*
- `getRoleByPost`
  *Return role from post*
- `getRoleLabel`
  *Returns a human-readable role label*
- `getShabbatHours`
  *Includes two functions inside. the getShabbatHours return the number of hours and the getShabbatHoursString return it in string format*
- `getShiftDuration`
- `getShiftSalary`
- `getShortFileName`
  *If the file name is too long this function will return it short for better UI like 'really long image name that take too many space' --> 'really l...space'*
- `getWeekKeyForShift`
  *Return the key for using for shabbat hours getting*
- `regenerateShiftId`
  *Changes shift id after shift swap between employees*

---

## 🗂️ Main Screens

### 📅 Home Screen
- User overview
- User menu - documents and actions
- Shift adding (just for testing)

### 📅 Protocols Screen
- The protocols of the workplace
- Learning materials

### 📅 Salary Screen
- Monthly salary overview
- Month navigation
- Shifts descriptions and salary per shift

### 📅 Requests/Availability Screen
- Send requests and availability for the next work week

### 📅 Calendar Screen
- Monthly calendar
- Month navigation
- Week schedule
- Week navigation
- Shift indicators
- Shift details preview

### 🔄 Shift Actions Modal
- View shift details
- Give shift to another employee
- Swap shifts with a compatible employee

---

## 🎨 UX / UI Highlights

- *Minimal interaction steps* for core actions
- Clear UI states:
  - *No date selected*
  - *No shift available*
  - *Shift available*
- Strong visual hierarchy
- RTL support
- Smooth animations
- Floating UI elements

---

## 📌 Notes

This app is designed for *real-world operational use*, prioritizing:
- clarity
- safety of actions
- performance
- predictable behavior
