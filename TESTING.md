# 🧪 SPOT-ON Testing Guide

Complete guide for testing all features of the SPOT-ON parking platform.

## 📋 Pre-Testing Setup

### 1. Start Backend Server
```bash
cd backend
npm install
cp .env.example .env
# Configure .env with your credentials
npm run dev
```

Backend should be running on `http://localhost:5000`

### 2. Start Frontend Server
```bash
cd frontend
npm install
npm start
```

Frontend should be running on `http://localhost:3000`

### 3. Verify Services
- ✅ MongoDB Atlas connected
- ✅ Razorpay keys configured (test mode)
- ✅ SendGrid API key configured
- ✅ Cloudinary configured
- ✅ Socket.io connection established

## 🔐 Authentication Testing

### Test 1: User Registration
1. Navigate to `/register`
2. Fill form:
   ```
   Name: Test User
   Email: test@example.com
   Password: test123456
   Phone: 1234567890
   ```
3. Click "Register"
4. **Expected**: Redirect to dashboard, token stored, success toast

### Test 2: User Login
1. Navigate to `/login`
2. Fill form:
   ```
   Email: test@example.com
   Password: test123456
   ```
3. Click "Login"
4. **Expected**: Redirect to dashboard, user authenticated

### Test 3: Google OAuth (Optional)
1. Click "Continue with Google"
2. Select Google account
3. **Expected**: Redirect back, auto-login, user created/logged in

### Test 4: Logout
1. Click "Logout" button
2. **Expected**: Redirect to home, token cleared

### Test 5: Protected Routes
1. Try accessing `/dashboard` without login
2. **Expected**: Redirect to `/login`

## 🚗 Parking Spot Management

### Test 6: Add Parking Spot
1. Login as user
2. Navigate to "Add Parking"
3. Fill form:
   ```
   Title: Downtown Parking
   Description: Secure parking near metro
   Address: 123 Main Street
   City: New York
   State: NY
   ZIP: 10001
   Coordinates: [40.7589, -73.9851]
   Price: 50
   Total Slots: 10
   Amenities: CCTV, 24/7 Access
   Vehicle Types: Car, Bike
   ```
4. Upload 2-3 images
5. Click "Add Parking Spot"
6. **Expected**: Success message, parking spot created, owner notified via email

### Test 7: Search Parking Spots
1. Navigate to Map page
2. Select city dropdown: "New York"
3. **Expected**: Map shows markers, dynamic bounds adjustment

### Test 8: View Parking Details
1. Click on a marker
2. **Expected**: Detail panel opens with full info, images, pricing

### Test 9: Update Parking Spot
1. Go to "My Parkings"
2. Click "Edit" on a spot
3. Change price to 60
4. Update images
5. Click "Update"
6. **Expected**: Changes saved, success message

### Test 10: Delete Parking Spot
1. Click "Delete" on a spot
2. Confirm deletion
3. **Expected**: Spot removed, images deleted from Cloudinary

## 🎫 Booking Flow Testing

### Test 11: Create Booking
1. Search and select parking spot
2. Click "Book Now"
3. Fill booking form:
   ```
   Start Date: Tomorrow 9:00 AM
   End Date: Tomorrow 5:00 PM
   Hours: 8
   Select Car: (if added)
   ```
4. Click "Proceed to Payment"
5. **Expected**: Razorpay modal opens, order created

### Test 12: Complete Payment
1. In Razorpay modal, use test card:
   ```
   Card: 4111 1111 1111 1111
   CVV: 123
   Expiry: 12/25
   Name: Test User
   ```
2. Click "Pay"
3. **Expected**: 
   - Payment success
   - Booking status: Confirmed
   - Email sent to user
   - Available slots decreased
   - Owner wallet credited
   - Socket.io event emitted
   - Real-time update on map

### Test 13: View Bookings
1. Navigate to "My Bookings"
2. **Expected**: All bookings listed with status

### Test 14: Cancel Booking
1. Click "Cancel" on a booking
2. Provide reason
3. Confirm
4. **Expected**:
   - Status changed to cancelled
   - Slots restored
   - Cancellation email sent

## 🚙 Car Management

### Test 15: Add Car
1. Navigate to "My Cars"
2. Click "Add Car"
3. Fill form:
   ```
   Name: Honda Civic
   Number Plate: ABC1234
   Type: Car
   Color: Blue
   ```
4. Click "Add"
5. **Expected**: Car added, available in booking form

### Test 16: Set Default Car
1. Click "Set Default" on a car
2. **Expected**: Car marked as default

### Test 17: Delete Car
1. Click "Delete" on a car
2. Confirm
3. **Expected**: Car removed

## 💰 Wallet Testing

### Test 18: Check Wallet Balance
1. Login as parking owner
2. View wallet balance
3. **Expected**: Shows current balance

### Test 19: Wallet Credit (Auto)
1. Complete a booking on your parking spot
2. Check wallet
3. **Expected**: Balance increased by booking amount

### Test 20: Transaction History
1. View transaction history
2. **Expected**: All credits/debits listed with details

## 🔔 Real-time Updates

### Test 21: Socket Connection
1. Open browser console
2. **Expected**: "Socket connected: [socket-id]" message

### Test 22: Live Slot Updates
1. Open map in two browser windows
2. Complete booking in window 1
3. **Expected**: Window 2 updates immediately without refresh

### Test 23: Marker Color Update
1. Book last available slot
2. **Expected**: Marker color changes to red/unavailable

## 📧 Email Notifications

### Test 24: Booking Confirmation Email
1. Complete a booking
2. Check email inbox
3. **Expected**: 
   - Email received
   - Contains booking details
   - Google Maps link works

### Test 25: Cancellation Email
1. Cancel a booking
2. Check email
3. **Expected**: Cancellation confirmation received

### Test 26: Parking Approval Email
1. Add new parking spot
2. Check owner email
3. **Expected**: Approval/success email received

## 👑 Admin Dashboard

### Test 27: Admin Login
1. Login with admin credentials:
   ```
   Email: admin@spoton.com
   Password: admin123
   ```
2. **Expected**: Access to admin dashboard

### Test 28: View Dashboard Stats
1. Navigate to admin dashboard
2. **Expected**: 
   - Total users count
   - Total bookings
   - Total revenue
   - Charts display
   - Recent bookings

### Test 29: User Management
1. View all users
2. Update user role
3. Delete a user
4. **Expected**: Changes applied successfully

### Test 30: Approve Parking Spot
1. View pending approvals
2. Click "Approve"
3. **Expected**: Spot becomes visible to all users

### Test 31: View Transactions
1. Navigate to transactions
2. **Expected**: All wallet transactions listed

## 🗺️ Map Features

### Test 32: Dynamic Markers
1. Search for city
2. **Expected**: Markers appear dynamically

### Test 33: Map Controls
1. Test zoom in/out
2. Test pan
3. Test marker click
4. **Expected**: All controls work smoothly

### Test 34: Geolocation Filter
1. Enable location
2. Use "Near Me" feature
3. **Expected**: Shows nearby parking spots

### Test 35: Multiple Cities
1. Switch between cities
2. **Expected**: Markers update, bounds adjust

## 🔒 Security Testing

### Test 36: JWT Expiration
1. Login
2. Wait for token expiration
3. Try API call
4. **Expected**: Auto-logout, redirect to login

### Test 37: Role Protection
1. Login as regular user
2. Try accessing `/admin`
3. **Expected**: Access denied, redirect

### Test 38: Input Validation
1. Submit forms with invalid data
2. **Expected**: Validation errors shown

### Test 39: Rate Limiting
1. Make 6 rapid login attempts
2. **Expected**: Rate limit error after 5 attempts

### Test 40: XSS Prevention
1. Try injecting script in form fields
2. **Expected**: Script sanitized/escaped

## 📱 Responsive Testing

### Test 41: Mobile View
1. Open on mobile or resize browser to 375px
2. Navigate through all pages
3. **Expected**: Layout adapts properly

### Test 42: Tablet View
1. Resize to 768px
2. **Expected**: Responsive design maintained

### Test 43: Touch Interactions
1. Test on touch device
2. **Expected**: All buttons/links work

## ⚡ Performance Testing

### Test 44: Page Load Time
1. Use browser DevTools
2. Check Network tab
3. **Expected**: Initial load < 3 seconds

### Test 45: API Response Time
1. Monitor API calls
2. **Expected**: Most responses < 500ms

### Test 46: Image Loading
1. Upload large images
2. **Expected**: Cloudinary optimization applied

## 🐛 Error Handling

### Test 47: Network Error
1. Disconnect internet
2. Try booking
3. **Expected**: User-friendly error message

### Test 48: Payment Failure
1. Use invalid card
2. **Expected**: Payment failed message, booking not created

### Test 49: Server Error
1. Stop backend
2. Try API call
3. **Expected**: Graceful error handling

### Test 50: 404 Routes
1. Navigate to `/invalid-route`
2. **Expected**: 404 page or redirect

## ✅ Checklist

After completing all tests, verify:

- [ ] All authentication flows work
- [ ] CRUD operations functional
- [ ] Payment gateway integrated
- [ ] Emails sending correctly
- [ ] Real-time updates working
- [ ] Map displays correctly
- [ ] Admin features accessible
- [ ] Wallet system operational
- [ ] Mobile responsive
- [ ] Security measures in place
- [ ] Error handling working
- [ ] Performance acceptable

## 🚨 Common Issues & Solutions

### Issue 1: Payment Fails
**Solution**: 
- Verify Razorpay keys
- Check signature generation
- Use correct test card

### Issue 2: Emails Not Sending
**Solution**:
- Verify SendGrid API key
- Check sender email verification
- Review spam folder

### Issue 3: Images Not Uploading
**Solution**:
- Check Cloudinary credentials
- Verify file size limit
- Check network connection

### Issue 4: Socket Not Connecting
**Solution**:
- Check SOCKET_URL in frontend
- Verify backend is running
- Check CORS settings

### Issue 5: Map Not Loading
**Solution**:
- Verify Leaflet CSS import
- Check coordinates format
- Review browser console

## 📊 Testing Metrics

### Coverage Goals
- Unit Tests: 80%+
- Integration Tests: 70%+
- E2E Tests: Key flows covered

### Performance Targets
- Page Load: < 3s
- API Response: < 500ms
- Time to Interactive: < 4s

## 🔄 Regression Testing

After each update:
1. Run all 50 tests
2. Check for new bugs
3. Verify existing features
4. Update tests as needed

---

**Testing Complete! 🎉**

Report any bugs or issues found during testing.
