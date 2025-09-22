// Form validation utilities for company registration

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateRegistrationNumber = (regNumber) => {
  return regNumber && regNumber.trim().length >= 3;
};

export const validateTaxId = (taxId) => {
  // Basic validation - can be customized for different jurisdictions
  return taxId && taxId.trim().length >= 5;
};

export const validateEmissions = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0;
};

export const validateStep1 = (formData) => {
  const errors = {};

  if (!formData.legalEntityName?.trim()) {
    errors.legalEntityName = 'Legal entity name is required';
  }

  if (!validateRegistrationNumber(formData.registrationNumber)) {
    errors.registrationNumber = 'Valid registration number is required';
  }

  if (!formData.jurisdiction?.trim()) {
    errors.jurisdiction = 'Jurisdiction is required';
  }

  if (!formData.contactName?.trim()) {
    errors.contactName = 'Contact name is required';
  }

  if (!formData.contactEmail?.trim()) {
    errors.contactEmail = 'Contact email is required';
  } else if (!validateEmail(formData.contactEmail)) {
    errors.contactEmail = 'Valid email address is required';
  }

  if (formData.contactPhone && !validatePhone(formData.contactPhone)) {
    errors.contactPhone = 'Invalid phone number format';
  }

  if (formData.website && !validateURL(formData.website)) {
    errors.website = 'Invalid website URL';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateStep2 = (formData) => {
  const errors = {};

  if (!validateTaxId(formData.taxId)) {
    errors.taxId = 'Valid tax identification number is required';
  }

  if (!formData.amlCompliance) {
    errors.amlCompliance = 'AML compliance declaration is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateStep3 = (formData) => {
  const errors = {};

  if (!formData.emissionsCalculationMethod) {
    errors.emissionsCalculationMethod = 'Emissions calculation methodology is required';
  }

  if (formData.scope1Emissions && !validateEmissions(formData.scope1Emissions)) {
    errors.scope1Emissions = 'Invalid emissions value';
  }

  if (formData.scope2Emissions && !validateEmissions(formData.scope2Emissions)) {
    errors.scope2Emissions = 'Invalid emissions value';
  }

  if (formData.scope3Emissions && !validateEmissions(formData.scope3Emissions)) {
    errors.scope3Emissions = 'Invalid emissions value';
  }

  if (formData.emissionsVerified && !formData.verificationStatement?.trim()) {
    errors.verificationStatement = 'Verification statement is required when emissions are verified';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateAllSteps = (formData) => {
  const step1 = validateStep1(formData);
  const step2 = validateStep2(formData);
  const step3 = validateStep3(formData);

  return {
    isValid: step1.isValid && step2.isValid && step3.isValid,
    errors: {
      ...step1.errors,
      ...step2.errors,
      ...step3.errors
    }
  };
};