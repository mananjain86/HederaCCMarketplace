# Carbon Credit Seller Registration Form

## Overview

This form is specifically designed for companies selling or listing carbon credits, particularly project developers working in the African context. It ensures that projects are equitable, sustainable, and legally sound within African legal and customary frameworks.

## Features

### Multi-Step Registration Process
1. **Project Information** - Basic project details and registry information
2. **Land Rights & Community Engagement** - Land tenure, FPIC, and benefit sharing
3. **Documentation & Credit Details** - Project integrity, verification, and co-benefits

### African Context Considerations
- **Dual Legal Framework**: Supports both customary and formal land law compliance
- **Community Engagement**: Emphasizes Free, Prior, and Informed Consent (FPIC)
- **Benefit Sharing**: Mandatory revenue sharing agreements with local communities
- **Cultural Sensitivity**: Recognizes traditional governance structures

### Key Validation Requirements

#### Step 1: Project Information
- Project name and type (reforestation, cookstoves, renewable energy, etc.)
- Location with GPS coordinates
- Registry URL for verification

#### Step 2: Land Rights & Community Engagement
- Land rights documentation
- FPIC evidence
- Benefit sharing agreement with percentage allocation
- Community representative details

#### Step 3: Documentation & Credit Details
- Accredited registry verification (Verra, Gold Standard, etc.)
- Host country authorization for international trading
- Paris Agreement Article 6 compliance
- Credit vintage and serial numbers
- SDG contributions and co-benefits verification

## Technical Implementation

### Components Used
- `CarbonCreditSellerRegistration.jsx` - Main registration form
- `CompanyRegistration.jsx` - Updated to conditionally render seller form
- Form validation and error handling
- Responsive design with Tailwind CSS

### Form Integration
The form is integrated into the existing company registration flow. When a user selects "Carbon Credit Seller (Project Developer)" as their company type, they are automatically redirected to the specialized seller registration form.

## Form Fields

### Project Information
- Project Name*
- Project ID
- Project Type* (dropdown with African-relevant options)
- Project Country* (with African country suggestions)
- Project Region/Province
- GPS Coordinates
- Registry URL*

### Land Tenure & Rights
- Proof of Land Rights* (textarea)
- Water Rights Documentation
- Customary Law Compliance (checkbox)
- Formal Law Compliance (checkbox)

### Community Engagement
- FPIC Evidence* (textarea)
- Community Representatives
- Benefit Sharing Agreement* (textarea)
- Revenue Share Percentage*
- Additional Community Benefits

### Project Documentation
- Accredited Registry*
- Registry Standard
- Host Country Authorization (checkbox)
- Paris Agreement Compliance (checkbox)

### Credit Details
- Credit Vintage Year*
- Verification Date
- Verification Body
- Serial Numbers*
- SDG Contributions (multi-select)
- Employment Impact
- Biodiversity Impact
- Health Impact
- Third-party Verification Evidence

## Usage

1. Navigate to Company Registration
2. Select "Carbon Credit Seller (Project Developer)" as company type
3. Complete the three-step registration process
4. Submit for review and blockchain registration

## Validation

The form includes comprehensive validation to ensure:
- All required fields are completed
- Proper documentation is provided
- Community engagement requirements are met
- Registry and verification standards are satisfied

## Future Enhancements

- Integration with actual blockchain registration
- Document upload functionality
- Real-time registry verification
- Automated FPIC compliance checking
- Integration with verification bodies' APIs