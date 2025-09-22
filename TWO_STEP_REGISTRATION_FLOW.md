# Two-Step Company Registration Flow

## Overview

The registration system now follows a mandatory two-step process:

1. **Universal Basic Registration** - Required for all companies
2. **Optional Seller Registration** - Only for companies wanting to sell carbon credits

## Flow Description

### Step 1: Basic Company Registration (Mandatory)
- **Entry Point**: Single "Register Company" button in navbar
- **Form**: `CompanyRegistration.jsx` - covers basic KYC/KYB, compliance, and emissions data
- **Focus**: Universal company onboarding (no company type selection)
- **Completion**: Leads to Registration Success screen

### Step 2: Registration Success Screen
- **Component**: `RegistrationSuccess.jsx`
- **Purpose**: Shows registration confirmation and next step options
- **Options**:
  - **Go to Marketplace**: For immediate trading and browsing
  - **Upgrade to Seller**: Always shown as optional upgrade path for all users

### Step 3: Seller Registration (Optional)
- **Trigger**: Only accessible after completing basic registration
- **Form**: `CarbonCreditSellerRegistration.jsx` - comprehensive project developer form
- **Focus**: African context, FPIC, benefit sharing, land tenure, etc.
- **Completion**: Returns to marketplace with full seller capabilities

## Key Features

### Universal Entry Point
- Single registration button removes confusion
- All companies start with the same basic form
- Clear progression path

### Smart Routing
- Success screen always shows seller upgrade option
- Users can skip seller registration and complete it later
- Seamless flow between basic and seller registration

### Data Persistence
- Basic registration data is preserved
- Seller registration builds upon basic company information
- Full company profile available after both steps

## Technical Implementation

### App.jsx Views
- `register` - Basic company registration
- `registration-success` - Post-registration options screen
- `register-seller` - Seller-specific registration
- `marketplace` - Main trading interface

### Component Responsibilities

#### CompanyRegistration.jsx
- Basic company information (no type selection)
- KYC/KYB verification
- Financial compliance
- Emissions data
- **Output**: Company data (seller upgrade always available)

#### RegistrationSuccess.jsx
- Registration confirmation
- Company summary display
- Next step options
- Seller upgrade promotion (always available)

#### CarbonCreditSellerRegistration.jsx
- Project information
- Land rights documentation
- Community engagement (FPIC)
- Benefit sharing agreements
- Credit verification and co-benefits

### State Management
```jsx
const [registrationData, setRegistrationData] = useState(null);
const [currentView, setCurrentView] = useState('marketplace');

// Flow: marketplace → register → registration-success → register-seller → marketplace
```

## User Experience Benefits

1. **Clear Progression**: Users understand they need basic registration first
2. **No Overwhelming Options**: Single entry point reduces decision fatigue
3. **Universal Onboarding**: All users go through the same initial process
4. **Optional Upgrade**: Advanced seller features available as upgrade path
5. **Flexible Flow**: Users can complete seller registration later

## Business Logic

### Registration Completion Logic
```jsx
const handleRegistrationComplete = (successData) => {
  // Seller option is always available as upgrade path
  setRegistrationData({ 
    ...successData, 
    showSellerOption: true // Always true for upgrade flexibility
  });
  setCurrentView('registration-success');
};
```

### Navigation Flow
```
Marketplace
    ↓ (Register Company)
Basic Registration Form
    ↓ (Complete Registration)
Registration Success Screen
    ↓ (Optional: Complete Seller Registration)
Seller Registration Form
    ↓ (Complete Seller Registration)
Back to Marketplace (with full seller capabilities)
```

## Future Enhancements

1. **Profile Management**: Allow users to complete seller registration from profile page
2. **Progressive Disclosure**: Show seller benefits during basic registration
3. **Registration Analytics**: Track conversion rates from basic to seller registration
4. **Guided Tours**: Interactive walkthrough of the registration process
5. **Saved Progress**: Allow users to save partial registrations and continue later