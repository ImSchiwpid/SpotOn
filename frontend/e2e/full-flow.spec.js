const { test, expect } = require('@playwright/test');

const buildUser = (role) => ({
  _id: `${role}-id`,
  id: `${role}-id`,
  name: role === 'admin' ? 'Platform Admin' : role === 'parking_owner' ? 'Owner User' : 'Customer User',
  email: `${role}@spoton.test`,
  phone: '9999999999',
  role
});

const setupMockEnvironment = async (page) => {
  const state = {
    parkingSpots: [
      {
        _id: 'spot-1',
        title: 'Central Plaza',
        address: '123 Main Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pricePerHour: 80,
        availableSlots: 5,
        totalSlots: 10,
        parkingType: 'covered',
        hasCCTV: true,
        hasEVCharging: true,
        location: { type: 'Point', coordinates: [77.5946, 12.9716] },
        vehicleTypes: ['car'],
        amenities: ['CCTV', 'Covered']
      },
      {
        _id: 'spot-2',
        title: 'East Side Open Lot',
        address: '22 Ring Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pricePerHour: 40,
        availableSlots: 7,
        totalSlots: 12,
        parkingType: 'open',
        hasCCTV: false,
        hasEVCharging: false,
        location: { type: 'Point', coordinates: [77.61, 12.98] },
        vehicleTypes: ['car', 'bike'],
        amenities: ['Open']
      }
    ],
    bookings: [],
    notifications: [
      {
        _id: 'notif-1',
        title: 'Welcome',
        message: 'Welcome to SPOT-ON',
        read: false,
        createdAt: new Date().toISOString()
      }
    ],
    pendingSpots: [
      { _id: 'pending-spot-1', title: 'New Tower Parking', city: 'Bengaluru' }
    ],
    users: [
      { _id: 'u-1', name: 'A User', email: 'a@x.com', role: 'customer', isActive: true, ownerVerificationStatus: 'not_applicable' },
      { _id: 'u-2', name: 'Owner Pending', email: 'owner@x.com', role: 'parking_owner', isActive: true, ownerVerificationStatus: 'pending' }
    ],
    transactions: [
      {
        _id: 'tx-1',
        type: 'earning',
        description: 'Booking earning',
        status: 'completed',
        amount: 340,
        user: { name: 'Owner User', email: 'parking_owner@spoton.test' },
        createdAt: new Date().toISOString()
      }
    ],
    withdrawals: [
      {
        _id: 'wd-1',
        status: 'pending',
        amount: 1200,
        owner: { name: 'Owner User' }
      }
    ]
  };

  await page.addInitScript(() => {
    const listeners = {};
    const socket = {
      id: 'fake-socket-id',
      on(event, cb) {
        listeners[event] = listeners[event] || [];
        listeners[event].push(cb);
      },
      off(event, cb) {
        if (!listeners[event]) return;
        listeners[event] = listeners[event].filter((fn) => fn !== cb);
      },
      emit(event, payload) {
        (listeners[event] || []).forEach((cb) => cb(payload));
      },
      close() {}
    };

    window.__SPOTON_E2E_SOCKET__ = socket;
    window.__emitSocket = (event, payload) => socket.emit(event, payload);
  });

  await page.route('**://checkout.razorpay.com/v1/checkout.js', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: `
        window.Razorpay = function(options) {
          this.options = options;
          this.events = {};
          this.on = (event, cb) => { this.events[event] = cb; };
          this.open = () => {
            Promise.resolve().then(() => {
              options.handler({
                razorpay_payment_id: 'pay_test_1',
                razorpay_order_id: options.order_id,
                razorpay_signature: 'sig_test_1'
              });
            });
          };
        };
      `
    });
  });

  await page.route('**://nominatim.openstreetmap.org/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ lat: '12.9716', lon: '77.5946' }])
    });
  });

  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const method = request.method();
    const url = new URL(request.url());
    const path = url.pathname.replace(/^\/api/, '');
    const authHeader = request.headers()['authorization'] || '';
    const token = authHeader.replace('Bearer ', '');

    const userForToken =
      token === 'token-admin'
        ? buildUser('admin')
        : token === 'token-owner'
          ? buildUser('parking_owner')
          : buildUser('customer');

    const bodyText = request.postData() || '';
    let body = {};
    try {
      body = bodyText ? JSON.parse(bodyText) : {};
    } catch (error) {
      body = {};
    }

    const respond = async (payload, status = 200) => {
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(payload)
      });
    };

    if (path === '/auth/login' && method === 'POST') {
      const role = body.role || 'customer';
      const tokenMap = {
        admin: 'token-admin',
        parking_owner: 'token-owner',
        customer: 'token-customer'
      };
      await respond({
        success: true,
        token: tokenMap[role] || 'token-customer',
        user: buildUser(role)
      });
      return;
    }

    if (path === '/auth/me' && method === 'GET') {
      await respond({ success: true, data: userForToken });
      return;
    }

    if (path === '/notifications' && method === 'GET') {
      const unreadCount = state.notifications.filter((item) => !item.read).length;
      await respond({ success: true, unreadCount, data: state.notifications });
      return;
    }

    if (/^\/notifications\/[^/]+\/read$/.test(path) && method === 'PUT') {
      const id = path.split('/')[2];
      state.notifications = state.notifications.map((n) => (n._id === id ? { ...n, read: true } : n));
      await respond({ success: true });
      return;
    }

    if (path === '/notifications/read-all' && method === 'PUT') {
      state.notifications = state.notifications.map((n) => ({ ...n, read: true }));
      await respond({ success: true });
      return;
    }

    if (path === '/cars' && method === 'GET') {
      await respond({
        success: true,
        data: [{ _id: 'car-1', name: 'Honda City', numberPlate: 'KA01AA1234', type: 'car', isDefault: true }]
      });
      return;
    }

    if (path === '/parking/cities' && method === 'GET') {
      await respond({ success: true, data: ['Bengaluru'] });
      return;
    }

    if (path === '/parking' && method === 'GET') {
      await respond({ success: true, data: state.parkingSpots });
      return;
    }

    if (path === '/parking' && method === 'POST') {
      await respond({ success: true, data: { _id: 'spot-new', title: 'Published Spot' } }, 201);
      return;
    }

    if (path === '/parking/my/spots' && method === 'GET') {
      await respond({ success: true, data: state.parkingSpots });
      return;
    }

    if (path === '/bookings/my' && method === 'GET') {
      await respond({ success: true, data: state.bookings });
      return;
    }

    if (path === '/bookings/payments/history' && method === 'GET') {
      await respond({ success: true, data: [] });
      return;
    }

    if (path === '/bookings' && method === 'POST') {
      const booking = {
        _id: 'booking-1',
        bookingCode: 'SPOT12345',
        totalAmount: 160,
        parkingSpot: state.parkingSpots[0]
      };
      state.bookings.unshift(booking);
      await respond(
        {
          success: true,
          data: {
            booking,
            order: {
              id: 'order_test_1',
              amount: 16000,
              currency: 'INR',
              key: 'rzp_test_key'
            }
          }
        },
        201
      );
      return;
    }

    if (path === '/bookings/verify-payment' && method === 'POST') {
      state.parkingSpots[0] = {
        ...state.parkingSpots[0],
        availableSlots: Math.max(0, state.parkingSpots[0].availableSlots - 1)
      };
      state.notifications.unshift({
        _id: `notif-email-${Date.now()}`,
        title: 'Booking Confirmation Email Sent',
        message: 'Payment verified and confirmation email dispatched.',
        read: false,
        createdAt: new Date().toISOString()
      });
      await respond({ success: true, message: 'Payment verified and booking confirmed' });
      return;
    }

    if (path === '/owner/dashboard' && method === 'GET') {
      await respond({
        success: true,
        data: {
          totalSpots: 2,
          totalBookings: 11,
          totalEarnings: 4200,
          monthlyRevenue: [{ _id: { year: 2026, month: 2 }, revenue: 4200 }],
          occupancyRate: 63.4
        }
      });
      return;
    }

    if (path === '/admin/dashboard' && method === 'GET') {
      await respond({
        success: true,
        data: {
          overview: {
            totalUsers: 34,
            totalParkingSpots: 9,
            totalBookings: 120,
            totalRevenue: 55000
          },
          bookingsByStatus: [
            { _id: 'confirmed', count: 95 },
            { _id: 'cancelled', count: 15 }
          ],
          revenueByMonth: [{ _id: { year: 2026, month: 2 }, revenue: 55000, count: 95 }],
          topCities: [{ _id: 'Bengaluru', bookings: 55, revenue: 30000 }],
          peakHours: [{ _id: 10, bookings: 14 }]
        }
      });
      return;
    }

    if (path === '/admin/settings' && method === 'GET') {
      await respond({ success: true, data: { commissionPercent: 15 } });
      return;
    }

    if (path === '/admin/settings/commission' && method === 'PUT') {
      await respond({ success: true, data: { commissionPercent: body.commissionPercent || 15 } });
      return;
    }

    if (path === '/admin/pending' && method === 'GET') {
      await respond({ success: true, data: state.pendingSpots });
      return;
    }

    if (/^\/admin\/parking\/[^/]+\/approve$/.test(path) && method === 'PUT') {
      const id = path.split('/')[3];
      state.pendingSpots = state.pendingSpots.filter((spot) => spot._id !== id);
      await respond({ success: true });
      return;
    }

    if (path === '/admin/users' && method === 'GET') {
      await respond({ success: true, data: state.users });
      return;
    }

    if (/^\/admin\/users\/[^/]+\/suspend$/.test(path) && method === 'PUT') {
      const id = path.split('/')[3];
      state.users = state.users.map((user) =>
        user._id === id ? { ...user, isActive: !Boolean(body.suspend) } : user
      );
      await respond({ success: true });
      return;
    }

    if (/^\/admin\/users\/[^/]+\/verify-owner$/.test(path) && method === 'PUT') {
      const id = path.split('/')[3];
      state.users = state.users.map((user) =>
        user._id === id ? { ...user, ownerVerificationStatus: 'verified' } : user
      );
      await respond({ success: true });
      return;
    }

    if (/^\/admin\/users\/[^/]+$/.test(path) && method === 'DELETE') {
      const id = path.split('/')[3];
      state.users = state.users.filter((user) => user._id !== id);
      await respond({ success: true });
      return;
    }

    if (path === '/admin/transactions' && method === 'GET') {
      await respond({ success: true, data: state.transactions });
      return;
    }

    if (path === '/admin/withdrawals' && method === 'GET') {
      await respond({ success: true, data: state.withdrawals });
      return;
    }

    if (/^\/admin\/withdrawals\/[^/]+$/.test(path) && method === 'PUT') {
      const id = path.split('/')[3];
      state.withdrawals = state.withdrawals.map((w) => (w._id === id ? { ...w, status: body.status } : w));
      await respond({ success: true });
      return;
    }

    if (path === '/admin/complaints' && method === 'GET') {
      await respond({ success: true, data: [] });
      return;
    }

    await respond({ success: true, data: [] });
  });
};

const login = async (page, { email, password, role }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Login As').selectOption(role);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
};

test('customer flow: auth + search/map + booking/payment + email + socket updates', async ({ page }) => {
  await setupMockEnvironment(page);

  await login(page, {
    email: 'customer@spoton.test',
    password: 'password123',
    role: 'customer'
  });

  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto('/explore');
  await expect(page.getByRole('heading', { name: 'Explore Parking' })).toBeVisible();
  await expect(page.locator('.leaflet-container')).toBeVisible();

  await page.getByPlaceholder('Search by title, address, or city...').fill('central');
  await expect(page.getByText('Central Plaza').first()).toBeVisible();

  await page.evaluate(() => window.__emitSocket('slotUpdated', { parkingId: 'spot-1', availableSlots: 3 }));
  await expect(page.getByText('Slots: 3/10')).toBeVisible();

  await page.evaluate(() => window.__emitSocket('bookingConfirmed', { parkingId: 'spot-1', availableSlots: 2 }));
  await expect(page.getByText('Slots: 2/10')).toBeVisible();

  const dtInputs = page.locator('input[type="datetime-local"]');
  await dtInputs.nth(2).fill('2026-02-20T10:00');
  await dtInputs.nth(3).fill('2026-02-20T12:00');
  await page.getByRole('button', { name: 'Book & Pay' }).click();
  await expect(page.getByText('Booking confirmed and payment verified')).toBeVisible();

  await page.goto('/notifications');
  await expect(page.getByText('Booking Confirmation Email Sent')).toBeVisible();
});

test('owner flow: auth + add spot', async ({ page }) => {
  await setupMockEnvironment(page);

  await login(page, {
    email: 'parking_owner@spoton.test',
    password: 'password123',
    role: 'parking_owner'
  });

  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto('/add-parking');

  await page.getByPlaceholder('Downtown Plaza - Spot A12').fill('Owner Test Spot');
  await page.getByPlaceholder('123 Main Street').fill('34 Residency Road');
  await page.locator('input[name="city"]').fill('Bengaluru');
  await page.locator('input[name="state"]').fill('Karnataka');
  await page.locator('input[name="pricePerHour"]').fill('60');
  await page.locator('input[name="totalSlots"]').fill('8');

  await page.getByRole('button', { name: 'Publish Spot' }).click();
  await expect(page.getByText('Parking spot published successfully')).toBeVisible();
  await expect(page).toHaveURL(/\/dashboard$/);
});

test('admin flow: role gating + pending + users delete + transactions', async ({ page }) => {
  await setupMockEnvironment(page);

  await login(page, {
    email: 'customer@spoton.test',
    password: 'password123',
    role: 'customer'
  });
  await page.goto('/admin/users');
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.evaluate(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  });
  await page.reload();

  await login(page, {
    email: 'admin@spoton.test',
    password: 'admin123',
    role: 'admin'
  });

  await page.goto('/admin/pending');
  await expect(page.getByText('Admin Pending Queue')).toBeVisible();
  await page.getByRole('button', { name: 'Approve' }).first().click();
  await expect(page.getByText('No pending parking approvals.')).toBeVisible();

  await page.goto('/admin/users');
  page.on('dialog', (dialog) => dialog.accept());
  await expect(page.getByText('A User (customer)')).toBeVisible();
  await page.getByRole('button', { name: 'Delete' }).first().click();
  await expect(page.getByText('A User (customer)')).not.toBeVisible();

  await page.goto('/admin/transactions');
  await expect(page.getByRole('heading', { name: 'Admin Transactions' })).toBeVisible();
  await expect(page.getByText('Booking earning')).toBeVisible();
});
