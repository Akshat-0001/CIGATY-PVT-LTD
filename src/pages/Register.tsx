import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Building2,
  Phone,
  MapPin,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  X,
  Briefcase,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Input from '../components/forms/Input';
import Button from '../components/forms/Button';
import { authHelpers, dbHelpers, storageHelpers } from '../lib/supabase';
import { supabase } from '@/integrations/supabase/client';

type RegistrationStep = 1 | 2 | 3;

interface DocumentFile extends File {
  preview?: string;
  docType?: 'photo_id' | 'company_registration_doc' | 'proof_of_address' | 'vat_certificate';
}

const Register = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<RegistrationStep>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // User is already logged in, redirect to dashboard
        navigate('/live-offers', { replace: true });
      }
    };
    checkSession();
  }, [navigate]);

  // Step 1: Account Details
  const [accountData, setAccountData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    position: '',
    email: '',
    primaryPhone: '',
    secondaryPhone: '',
    preferredContact: 'Primary Phone',
    password: '',
    confirmPassword: '',
  });

  // Step 2: Company Details
  const [companyData, setCompanyData] = useState({
    companyName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    zipCode: '',
    country: '',
    registrationNumber: '',
    vatNumber: '',
    directorName: '',
  });

  // Step 3: Documents
  const [documents, setDocuments] = useState<{
    photoId: DocumentFile | null;
    companyReg: DocumentFile | null;
    proofOfAddress: DocumentFile | null;
    vatCert: DocumentFile | null;
  }>({
    photoId: null,
    companyReg: null,
    proofOfAddress: null,
    vatCert: null,
  });

  const countries = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
    'France', 'Spain', 'Italy', 'Netherlands', 'Belgium', 'Switzerland',
    'Austria', 'Ireland', 'Portugal', 'Denmark', 'Sweden', 'Norway',
    'Finland', 'Poland', 'Czech Republic', 'Hungary', 'Greece', 'Other'
  ];

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAccountData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileSelect = (docType: 'photoId' | 'companyReg' | 'proofOfAddress' | 'vatCert', file: File) => {
    const fileWithPreview = Object.assign(file, {
      preview: URL.createObjectURL(file)
    }) as DocumentFile;
    
    setDocuments(prev => ({ ...prev, [docType]: fileWithPreview }));
  };

  const removeDocument = (docType: 'photoId' | 'companyReg' | 'proofOfAddress' | 'vatCert') => {
    if (documents[docType]?.preview) {
      URL.revokeObjectURL(documents[docType]!.preview!);
    }
    setDocuments(prev => ({ ...prev, [docType]: null }));
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!accountData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!accountData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!accountData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!accountData.primaryPhone.trim()) newErrors.primaryPhone = 'Primary phone is required';
    if (!accountData.password) {
      newErrors.password = 'Password is required';
    } else if (accountData.password.length < 12) {
      newErrors.password = 'Password must be at least 12 characters';
    }
    if (accountData.password !== accountData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!companyData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!companyData.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
    if (!companyData.city.trim()) newErrors.city = 'City is required';
    if (!companyData.country) newErrors.country = 'Country is required';
    if (!companyData.registrationNumber.trim()) newErrors.registrationNumber = 'Registration number is required';
    if (!companyData.directorName.trim()) newErrors.directorName = 'Director name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};

    if (!documents.photoId) newErrors.photoId = 'Photo ID is required';
    if (!documents.companyReg) newErrors.companyReg = 'Company registration document is required';
    if (!documents.proofOfAddress) newErrors.proofOfAddress = 'Proof of address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    setGeneralError('');
    
    if (currentStep === 1 && validateStep1()) {
      toast.success('Step 1 completed!');
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      toast.success('Step 2 completed!');
      setCurrentStep(3);
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as RegistrationStep);
      setErrors({});
      setGeneralError('');
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) {
      return;
    }

    setIsSubmitting(true);
    setGeneralError('');

    const waitForSession = async (maxMs = 5000) => {
      const start = Date.now();
      while (Date.now() - start < maxMs) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) return true;
        await new Promise(res => setTimeout(res, 300));
      }
      return false;
    };

    try {
      // Step 1: Sign up user
      const { data: authData, error: authError } = await authHelpers.signUp(
        accountData.email,
        accountData.password
      );

      if (authError) {
        // Handle specific Supabase auth errors
        if (authError.includes('already registered') || authError.includes('already been registered')) {
          setGeneralError('This email is already registered. Please use a different email or try logging in.');
        } else {
          setGeneralError(authError);
        }
        setIsSubmitting(false);
        return;
      }

      if (!authData?.user) {
        setGeneralError('Failed to create user account');
        setIsSubmitting(false);
        return;
      }

      const userId = authData.user.id;

      // Ensure a session is established before DB writes (avoids 401/RLS)
      const hasSession = await waitForSession();
      if (!hasSession) {
        toast.success('Account created! Please verify your email to continue.');
        navigate('/application-received');
        setIsSubmitting(false);
        return;
      }

      // Step 2: Upsert profile with full data
      console.log('🔵 Step 2: Upserting profile for user:', userId);
      const upsertRes = await dbHelpers.upsertProfile(userId, {
        first_name: accountData.firstName,
        middle_name: accountData.middleName || undefined,
        last_name: accountData.lastName,
        position: accountData.position || undefined,
        primary_phone: accountData.primaryPhone,
        secondary_phone: accountData.secondaryPhone || undefined,
        preferred_contact: accountData.preferredContact,
        email: accountData.email,
        country: companyData.country,
        address: `${companyData.addressLine1}${companyData.addressLine2 ? ', '+companyData.addressLine2 : ''}, ${companyData.city}${companyData.zipCode ? ' '+companyData.zipCode : ''}`,
      });
      if (upsertRes.error) {
        console.error('❌ Profile upsert failed:', upsertRes.error);
        toast.error(`Profile Error: ${upsertRes.error}`);
        setGeneralError(`Profile Error: ${upsertRes.error}`);
        setIsSubmitting(false);
        return;
      }
      console.log('✅ Profile upserted successfully');
      toast.success('Profile created successfully!');

      // Step 3: Insert company and link to profile
      console.log('🔵 Step 3: Inserting company for user:', userId);
      const companyInsert = await dbHelpers.insertCompany(userId, {
        company_name: companyData.companyName,
        address_line1: companyData.addressLine1,
        address_line2: companyData.addressLine2 || undefined,
        city: companyData.city,
        zip_code: companyData.zipCode || undefined,
        country: companyData.country,
        registration_number: companyData.registrationNumber,
        vat_number: companyData.vatNumber || undefined,
        director_name: companyData.directorName,
      });
      if (companyInsert.error) {
        console.error('❌ Company insert failed:', companyInsert.error);
        toast.error(`Company Error: ${companyInsert.error}`);
        setGeneralError(`Company Error: ${companyInsert.error}`);
        setIsSubmitting(false);
        return;
      }
      const companyId = companyInsert.data?.id as string;
      console.log('✅ Company inserted successfully', companyId);
      toast.success('Company information saved!');

      // Step 4: Upload documents and record in kyc_documents
      console.log('🔵 Step 4: Uploading documents...');
      const uploadPromises: Promise<any>[] = [];
      const legacyDocs: { vat_certificate?: string; document1?: string; document2?: string; document3?: string } = {};

      const uploadAndRecord = async (file: File, type: 'photo_id'|'company_registration_doc'|'proof_of_address'|'vat_certificate') => {
        const { data, error } = await storageHelpers.uploadDocument(userId, file, type);
        if (error || !data) throw new Error(error || 'Upload failed');
        const ins = await dbHelpers.insertDocument({
          user_id: userId,
          company_id: companyId || null,
          type,
          file_url: data.path,
          file_name: data.fileName,
          mime_type: file.type,
        });
        if (ins.error) throw new Error(ins.error);
        if (type === 'vat_certificate') legacyDocs.vat_certificate = data.path;
        if (type === 'photo_id') legacyDocs.document1 = data.path;
        if (type === 'company_registration_doc') legacyDocs.document2 = data.path;
        if (type === 'proof_of_address') legacyDocs.document3 = data.path;
      };

      if (documents.photoId) uploadPromises.push(uploadAndRecord(documents.photoId, 'photo_id'));
      if (documents.companyReg) uploadPromises.push(uploadAndRecord(documents.companyReg, 'company_registration_doc'));
      if (documents.proofOfAddress) uploadPromises.push(uploadAndRecord(documents.proofOfAddress, 'proof_of_address'));
      if (documents.vatCert) uploadPromises.push(uploadAndRecord(documents.vatCert, 'vat_certificate'));

      const uploadToast = toast.loading('Uploading documents...');
      await Promise.all(uploadPromises);
      toast.success('All documents uploaded successfully!', { id: uploadToast });

      // Step 5: Back-compat update on profiles for legacy columns
      await (supabase as any)
        .from('profiles')
        .update({
          company_name: companyData.companyName,
          gst_number: companyData.vatNumber || null,
          vat_certificate: legacyDocs.vat_certificate ?? null,
          document1: legacyDocs.document1 ?? null,
          document2: legacyDocs.document2 ?? null,
          document3: legacyDocs.document3 ?? null,
        })
        .eq('id', userId);

      // Success - navigate to application received
      console.log('✅ Registration complete! Redirecting...');
      toast.success('🎉 Registration complete! Redirecting...', { duration: 2000 });
      setTimeout(() => {
        navigate('/application-received');
      }, 1000);
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      toast.error(error.message || 'An error occurred during registration');
      setGeneralError(error.message || 'An error occurred during registration');
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Account Details' },
    { number: 2, title: 'Company Details' },
    { number: 3, title: 'Document Upload' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center space-x-3 mb-6">
            <img 
              src="/logo.png" 
              alt="CIGATY Logo" 
              className="w-16 h-16 object-contain"
            />
            <div>
              <h2 className="text-3xl font-bold text-primary">CIGATY</h2>
              <p className="text-xs text-muted-foreground">India's First B2B Liquor Exchange</p>
            </div>
          </Link>
          
          <h1 className="text-3xl font-bold text-foreground">Create Your Account</h1>
          <p className="mt-2 text-muted-foreground">
            Join the world's leading B2B drinks marketplace
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                      currentStep >= step.number 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle size={24} />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span className={`text-xs mt-2 ${
                    currentStep >= step.number ? 'text-primary font-medium' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div 
                    className={`w-16 h-0.5 mx-2 ${
                      currentStep > step.number ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-card rounded-lg p-6 border">
          {generalError && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-destructive mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">{generalError}</p>
            </div>
          )}

          {/* Step 1: Account Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <Input
                    label="First Name"
                    name="firstName"
                    value={accountData.firstName}
                    onChange={handleAccountChange}
                    error={errors.firstName}
                    placeholder="John"
                    icon={<User size={20} />}
                    required
                  />
                  <Input
                    label="Middle Name"
                    name="middleName"
                    value={accountData.middleName}
                    onChange={handleAccountChange}
                    placeholder="Michael"
                    icon={<User size={20} />}
                  />
                  <Input
                    label="Last Name"
                    name="lastName"
                    value={accountData.lastName}
                    onChange={handleAccountChange}
                    error={errors.lastName}
                    placeholder="Doe"
                    icon={<User size={20} />}
                    required
                  />
                </div>

                <Input
                  label="Position"
                  name="position"
                  value={accountData.position}
                  onChange={handleAccountChange}
                  placeholder="CEO, Sales Director, etc."
                  icon={<Briefcase size={20} />}
                />

                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={accountData.email}
                  onChange={handleAccountChange}
                  error={errors.email}
                  placeholder="john@company.com"
                  icon={<Mail size={20} />}
                  required
                />

                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="Primary Phone"
                    name="primaryPhone"
                    type="tel"
                    value={accountData.primaryPhone}
                    onChange={handleAccountChange}
                    error={errors.primaryPhone}
                    placeholder="+1 (234) 567-890"
                    icon={<Phone size={20} />}
                    required
                  />
                  <Input
                    label="Secondary Phone"
                    name="secondaryPhone"
                    type="tel"
                    value={accountData.secondaryPhone}
                    onChange={handleAccountChange}
                    placeholder="+1 (234) 567-891"
                    icon={<Phone size={20} />}
                  />
                </div>

                <div>
                  <label className="block text-foreground font-medium mb-2">
                    Preferred Contact Method <span className="text-destructive">*</span>
                  </label>
                  <select
                    name="preferredContact"
                    value={accountData.preferredContact}
                    onChange={handleAccountChange}
                    className="w-full px-4 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="Primary Phone">Primary Phone</option>
                    <option value="Email">Email</option>
                  </select>
                </div>

                <div className="relative">
                  <Input
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={accountData.password}
                    onChange={handleAccountChange}
                    error={errors.password}
                    placeholder="••••••••••••"
                    icon={<Lock size={20} />}
                    helperText="Minimum 12 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-11 text-gray-400 hover:text-gold transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={accountData.confirmPassword}
                  onChange={handleAccountChange}
                  error={errors.confirmPassword}
                  placeholder="••••••••••••"
                  icon={<Lock size={20} />}
                  required
                />
              </div>
            )}

            {/* Step 2: Company Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <Input
                  label="Company Name"
                  name="companyName"
                  value={companyData.companyName}
                  onChange={handleCompanyChange}
                  error={errors.companyName}
                  placeholder="Your Company Ltd."
                  icon={<Building2 size={20} />}
                  required
                />

                <Input
                  label="Address Line 1"
                  name="addressLine1"
                  value={companyData.addressLine1}
                  onChange={handleCompanyChange}
                  error={errors.addressLine1}
                  placeholder="123 Business Street"
                  icon={<MapPin size={20} />}
                  required
                />

                <Input
                  label="Address Line 2"
                  name="addressLine2"
                  value={companyData.addressLine2}
                  onChange={handleCompanyChange}
                  placeholder="Suite 100"
                  icon={<MapPin size={20} />}
                />

                <div className="grid md:grid-cols-3 gap-6">
                  <Input
                    label="City"
                    name="city"
                    value={companyData.city}
                    onChange={handleCompanyChange}
                    error={errors.city}
                    placeholder="New York"
                    icon={<MapPin size={20} />}
                    required
                  />
                  <Input
                    label="ZIP / Postal Code"
                    name="zipCode"
                    value={companyData.zipCode}
                    onChange={handleCompanyChange}
                    placeholder="10001"
                    icon={<MapPin size={20} />}
                  />
                  <div>
                    <label className="block text-foreground font-medium mb-2">
                      Country <span className="text-destructive">*</span>
                    </label>
                    <select
                      name="country"
                      value={companyData.country}
                      onChange={handleCompanyChange}
                      className="w-full px-4 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="">Select Country</option>
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                    {errors.country && (
                      <p className="text-destructive text-sm mt-1">{errors.country}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="Company Registration Number"
                    name="registrationNumber"
                    value={companyData.registrationNumber}
                    onChange={handleCompanyChange}
                    error={errors.registrationNumber}
                    placeholder="12345678"
                    icon={<FileText size={20} />}
                    required
                  />
                  <Input
                    label="VAT Number (Optional)"
                    name="vatNumber"
                    value={companyData.vatNumber}
                    onChange={handleCompanyChange}
                    placeholder="GB123456789"
                    icon={<FileText size={20} />}
                  />
                </div>

                <Input
                  label="Director Name"
                  name="directorName"
                  value={companyData.directorName}
                  onChange={handleCompanyChange}
                  error={errors.directorName}
                  placeholder="Full name of company director"
                  icon={<User size={20} />}
                  required
                  helperText="Enter the primary director's name"
                />
              </div>
            )}

            {/* Step 3: Document Upload */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Upload Required Documents</h3>
                  <p className="text-muted-foreground mb-6">
                    Please upload clear copies of the following documents. Supported formats: PDF, PNG, JPG (Max 10MB per file)
                  </p>

                  {/* Photo ID */}
                  <DocumentUploadField
                    label="Photo ID (Passport, Driver's License, or National ID)"
                    required
                    file={documents.photoId}
                    error={errors.photoId}
                    onSelect={(file) => handleFileSelect('photoId', file)}
                    onRemove={() => removeDocument('photoId')}
                  />

                  {/* Company Registration */}
                  <DocumentUploadField
                    label="Company Registration Document"
                    required
                    file={documents.companyReg}
                    error={errors.companyReg}
                    onSelect={(file) => handleFileSelect('companyReg', file)}
                    onRemove={() => removeDocument('companyReg')}
                  />

                  {/* Proof of Address */}
                  <DocumentUploadField
                    label="Proof of Address (Utility Bill, Bank Statement)"
                    required
                    file={documents.proofOfAddress}
                    error={errors.proofOfAddress}
                    onSelect={(file) => handleFileSelect('proofOfAddress', file)}
                    onRemove={() => removeDocument('proofOfAddress')}
                  />

                  {/* VAT Certificate (Optional) */}
                  <DocumentUploadField
                    label="VAT Certificate (Optional)"
                    required={false}
                    file={documents.vatCert}
                    onSelect={(file) => handleFileSelect('vatCert', file)}
                    onRemove={() => removeDocument('vatCert')}
                  />
                </div>
              </div>
            )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                Back
              </Button>
            )}
            
            <div className={currentStep === 1 ? 'ml-auto' : ''}>
              {currentStep < 3 ? (
                <Button
                  variant="secondary"
                  onClick={handleNext}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                >
                  {isSubmitting ? 'Creating Account...' : 'Submit Application'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Login Link */}
        <p className="text-center text-muted-foreground">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-primary hover:text-primary/80 font-semibold transition-colors"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

// Document Upload Field Component
interface DocumentUploadFieldProps {
  label: string;
  required: boolean;
  file: DocumentFile | null;
  error?: string;
  onSelect: (file: File) => void;
  onRemove: () => void;
}

const DocumentUploadField = ({ label, required, file, error, onSelect, onRemove }: DocumentUploadFieldProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    maxSize: 10 * 1024 * 1024,
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onSelect(acceptedFiles[0]);
      }
    },
  });

  return (
    <div className="mb-6">
      <label className="block text-foreground font-medium mb-2">
        {label} {required && <span className="text-destructive">*</span>}
      </label>

      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'bg-primary/10 border-primary'
              : error
              ? 'border-destructive bg-destructive/10'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-8 h-8 mx-auto mb-2 text-primary" />
          {isDragActive ? (
            <p className="text-foreground">Drop the file here...</p>
          ) : (
            <>
              <p className="text-foreground text-sm mb-1">Drag & drop or click to select</p>
              <p className="text-xs text-muted-foreground">PDF, PNG, JPG up to 10MB</p>
            </>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-primary" />
            <div>
              <p className="text-foreground font-medium text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {error && (
        <p className="text-destructive text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default Register;
