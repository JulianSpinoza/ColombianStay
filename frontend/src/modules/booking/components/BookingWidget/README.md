# BookingWidget & Reservation System Documentation

## Overview
Complete end-to-end booking system for property reservations with Airbnb-style UI, live price calculations, and confirmation flow.

## Components

### 1. **BookingWidget.jsx** 
Location: `src/modules/listings/components/BookingWidget/BookingWidget.jsx`

Sticky floating booking card with real-time price calculation and reservation logic.

#### Props
```javascript
{
  propertyId: string | number          // Property ID
  pricePerNight: number                 // Price in COP
  rating?: number                       // Property rating (default 4.9)
  reviews?: number                      // Number of reviews (default 128)
  onReservationSuccess?: function       // Callback after successful booking
}
```

#### Features
- ✅ Date pickers (Check-in/Check-out)
- ✅ Guest selector (1-6 guests)
- ✅ Live price breakdown
  - Nightly rate × nights
  - Cleaning fee: $50,000 COP (fixed)
  - Service fee: 10% of subtotal
  - Total: Subtotal + Cleaning + Service
- ✅ Form validation
  - Check-in date required
  - Check-out date must be after check-in
  - Minimum 1 night stay
- ✅ Loading states (spinner during submission)
- ✅ Success states (animated success message)
- ✅ Error handling (user-friendly messages)
- ✅ Responsive design (sticky positioning on desktop)

#### State Management
```javascript
// Form inputs
const [checkInDate, setCheckInDate] = useState("");
const [checkOutDate, setCheckOutDate] = useState("");
const [guests, setGuests] = useState("1");

// UI states
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState("");
const [success, setSuccess] = useState(false);
```

#### Price Calculation
```javascript
const calculatePricing = () => {
  const nights = calculateNights(); // Days between check-out and check-in
  const subtotal = pricePerNight * nights;
  const serviceFee = Math.round(subtotal * 0.1); // 10%
  const total = subtotal + CLEANING_FEE + serviceFee;
  return { nights, subtotal, cleaningFee: 50000, serviceFee, total };
};
```

#### Reservation Data Sent to API
```javascript
{
  property_id: string,
  start_date: "YYYY-MM-DD",
  end_date: "YYYY-MM-DD",
  guests: number,
  total_price: number,
  subtotal: number,
  cleaning_fee: number,
  service_fee: number,
  nights: number
}
```

#### Usage Example
```jsx
import BookingWidget from "./modules/listings/components/BookingWidget/BookingWidget.jsx";

<BookingWidget
  propertyId={property.id}
  pricePerNight={250000}
  rating={4.9}
  reviews={128}
  onReservationSuccess={(reservation) => {
    console.log("Booking confirmed:", reservation);
  }}
/>
```

---

### 2. **ReservationConfirmation.jsx**
Location: `src/modules/listings/pages/ReservationConfirmation/ReservationConfirmation.jsx`

Post-booking confirmation page with detailed reservation summary and next steps.

#### Features
- 📋 Reservation summary card with:
  - Unique Reservation ID
  - Check-in/Check-out dates
  - Number of nights
  - Guest count
  - Payment status
- 📅 Formatted dates (Spanish locale)
- 💳 Price breakdown display
- ✅ "What happens next" timeline (3 steps)
- 🔗 Navigation buttons:
  - "Continue Exploring" → Home
  - "View My Reservations" → Profile
- ⚠️ Cancellation policy info
- 💬 Support contact info

#### Passed Data (via location.state)
```javascript
location.state = {
  reservation: {
    property_id: string,
    start_date: "YYYY-MM-DD",
    end_date: "YYYY-MM-DD",
    guests: number,
    total_price: number,
    subtotal: number,
    cleaning_fee: number,
    service_fee: number,
    nights: number
  },
  propertyId: string
}
```

#### Usage
Automatically reached after BookingWidget submission on `/reservation-confirmation`

---

## Complete Booking Flow

```
1. User views property
   ↓
2. User fills BookingWidget
   - Selects check-in date
   - Selects check-out date
   - Selects number of guests
   - Reviews price breakdown
   ↓
3. User clicks "Reserve" button
   - Form validation
   - Loading state (spinner)
   - POST request to backend
   ↓
4. Success/Error handling
   - Show success message for 2 seconds
   - Show error toast if failed
   - Redirect to /reservation-confirmation on success
   ↓
5. ReservationConfirmation page
   - Display all reservation details
   - Show next steps timeline
   - Provide navigation options
```

---

## Integration with PropertyDetailsPage

The BookingWidget is fully integrated in the right sidebar of PropertyDetailsPage:

```jsx
// In PropertyDetailsPage.jsx
import BookingWidget from "../../components/BookingWidget/BookingWidget.jsx";

<div className="lg:col-span-1">
  <BookingWidget
    propertyId={property.id}
    pricePerNight={property.price}
    rating={property.rating}
    reviews={property.reviews}
    onReservationSuccess={(reservation) => {
      console.log("Reservation successful:", reservation);
    }}
  />
</div>
```

---

## Routing Setup (App.jsx)

Two new routes added:

```jsx
{/* Property Details Page */}
<Route
  path="/listings/:id"
  element={
    <PrivateRoute>
      <PropertyDetailsPage />
    </PrivateRoute>
  }
/>

{/* Reservation Confirmation */}
<Route
  path="/reservation-confirmation"
  element={
    <PrivateRoute>
      <ReservationConfirmation />
    </PrivateRoute>
  }
/>
```

Both routes are protected with `PrivateRoute` (authentication required).

---

## Backend Integration (Next Steps)

### 1. Create Booking Model
```python
# bookings_service/models.py
from django.db import models

class Booking(models.Model):
    property = models.ForeignKey('listings_service.Listing', on_delete=models.CASCADE)
    user = models.ForeignKey('users_service.CustomUser', on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    guests = models.IntegerField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('confirmed', 'Confirmed'),
            ('completed', 'Completed'),
            ('cancelled', 'Cancelled'),
        ],
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user} - {self.property} ({self.start_date})"
```

### 2. Create Booking API Endpoint
```python
# bookings_service/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Booking
from .serializers import BookingSerializer

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def create_booking(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

### 3. Update Frontend httpClient
```javascript
// services/api/httpClient.js
// Add interceptor to include auth token in requests
// Ensure all POST requests include Authorization header
```

### 4. Connect BookingWidget to API
```javascript
// In BookingWidget.jsx handleReservation()
const response = await httpClient.post('/api/bookings/', reservationData);
```

---

## Styling Notes

### Tailwind Classes Used
- `lg:sticky lg:top-20` - Sticky positioning on desktop
- `rounded-xl shadow-xl` - Rounded card with shadow
- `bg-gradient-to-r from-indigo-600 to-purple-600` - Indigo-purple gradient
- `disabled:opacity-50` - Disabled state styling
- `animate-spin` - Loading spinner animation
- `space-y-4` - Vertical spacing utilities

### Color Palette
- Primary: Indigo-600 → Purple-600 (gradient)
- Success: Green-50, Green-200, Green-700
- Error: Red-50, Red-200, Red-700
- Neutral: Gray-50 to Gray-900

---

## Error Handling

BookingWidget catches and displays:
- ❌ Missing check-in date
- ❌ Missing check-out date
- ❌ Invalid date range (check-out before check-in)
- ❌ Minimum stay requirement (1 night minimum)
- ❌ Network/API errors

All errors are displayed in a red toast above the widget and cleared when user makes corrections.

---

## Testing Checklist

- [ ] Date validation works (can't select past dates)
- [ ] Check-out date picker defaults to tomorrow
- [ ] Price calculation updates in real-time
- [ ] All date combinations calculate nights correctly
- [ ] "Reserve" button disabled until both dates selected
- [ ] Loading spinner shows during submission
- [ ] Success message appears for 2 seconds
- [ ] Redirect to confirmation page works
- [ ] Confirmation page displays all reservation data
- [ ] Navigation buttons work (Home, Profile)
- [ ] Mobile responsive (booking widget stacks on mobile)

---

## Security Notes

⚠️ Currently using simulated API calls with `setTimeout`. Before going to production:

1. ✅ Add JWT authentication token to requests
2. ✅ Validate dates on backend
3. ✅ Implement payment processing (Stripe, PayU, etc.)
4. ✅ Add booking status tracking
5. ✅ Implement email notifications
6. ✅ Add cancellation policy enforcement
7. ✅ Implement availability checking (prevent double bookings)

---

## File Structure

```
frontend/src/
├── modules/listings/
│   ├── components/
│   │   └── BookingWidget/
│   │       └── BookingWidget.jsx          ← Booking form component
│   └── pages/
│       ├── PropertyDetailsPage/
│       │   └── PropertyDetailsPage.jsx    ← Uses BookingWidget
│       └── ReservationConfirmation/
│           └── ReservationConfirmation.jsx ← Confirmation page
└── App.jsx                                 ← Routes configured
```

---

## Component Props Summary

| Component | Props | Type | Required | Default |
|-----------|-------|------|----------|---------|
| BookingWidget | propertyId | string/number | ✅ | - |
| | pricePerNight | number | ✅ | - |
| | rating | number | ❌ | 4.9 |
| | reviews | number | ❌ | 128 |
| | onReservationSuccess | function | ❌ | undefined |

---

## Future Enhancements

1. 🗓️ Calendar availability view (show blocked dates)
2. 💳 Stripe/PayU payment integration
3. 📧 Email confirmation to guest and host
4. 🔔 Push notifications for booking updates
5. 📱 Mobile app version
6. 🌍 Multi-currency support
7. ♿ Accessibility improvements (WCAG 2.1)
8. 📊 Analytics and reporting
