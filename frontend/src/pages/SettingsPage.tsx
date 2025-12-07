import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Input, Select, Button } from '@/components/atoms';
import { posSettingsApi } from '@/services/api/bill';
import { useSettingsStore } from '@/store/settingsStore';
import type { POSSettingsUpdateRequest } from '@/types';
import { INDIAN_STATES } from '@/types/vendor';
import { 
  Save, 
  Settings as SettingsIcon, 
  DollarSign, 
  Users, 
  FileText,
  Calendar,
  Building,
  Shield,
  ChevronRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, setSettings, setLoading } = useSettingsStore();
  const [formData, setFormData] = useState<POSSettingsUpdateRequest>({});
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeSection, setActiveSection] = useState<string>('billing');

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      setFormData({
        enable_bill_round_off: settings.enable_bill_round_off,
        round_off_mode: settings.round_off_mode,
        round_off_decimal_precision: settings.round_off_decimal_precision,
        allow_per_bill_round_off_override: settings.allow_per_bill_round_off_override,
        recent_vendor_days: settings.recent_vendor_days,
        vendor_payment_warning_days: settings.vendor_payment_warning_days,
        default_payment_terms_days: settings.default_payment_terms_days,
        business_registered_state: settings.business_registered_state,
        financial_year_start_date: settings.financial_year_start_date,
        bill_number_prefix: settings.bill_number_prefix,
        bill_number_length: settings.bill_number_length,
        eway_bill_threshold_amount: settings.eway_bill_threshold_amount,
      });
    }
  }, [settings]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await posSettingsApi.get();
      setSettings(data);
      setMessage(null);
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const updated = await posSettingsApi.update(formData);
      setSettings(updated);
      setMessage({ 
        type: 'success', 
        text: 'Settings saved successfully!' 
      });
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error?.response?.data?.error || 'Failed to save settings. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof POSSettingsUpdateRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    if (settings) {
      setFormData({
        enable_bill_round_off: settings.enable_bill_round_off,
        round_off_mode: settings.round_off_mode,
        round_off_decimal_precision: settings.round_off_decimal_precision,
        allow_per_bill_round_off_override: settings.allow_per_bill_round_off_override,
        recent_vendor_days: settings.recent_vendor_days,
        vendor_payment_warning_days: settings.vendor_payment_warning_days,
        default_payment_terms_days: settings.default_payment_terms_days,
        business_registered_state: settings.business_registered_state,
        financial_year_start_date: settings.financial_year_start_date,
        bill_number_prefix: settings.bill_number_prefix,
        bill_number_length: settings.bill_number_length,
        eway_bill_threshold_amount: settings.eway_bill_threshold_amount,
      });
    }
    setMessage(null);
  };

  if (!settings) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <div className="text-gray-600">Loading your settings...</div>
        </div>
      </DashboardLayout>
    );
  }

  const sections = [
    { id: 'billing', label: 'Billing', icon: DollarSign, color: 'blue' },
    { id: 'vendors', label: 'Vendors', icon: Users, color: 'green' },
    { id: 'financial', label: 'Financial', icon: FileText, color: 'purple' },
    { id: 'tax', label: 'Tax & Compliance', icon: Shield, color: 'amber' },
    { id: 'business', label: 'Business', icon: Building, color: 'indigo' },
  ];

  const renderBillingSection = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Bill Rounding</h3>
        <p className="text-sm text-gray-500 mt-1">Configure how bill amounts are calculated and rounded</p>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium text-gray-900">Enable Bill Rounding</h4>
              <p className="text-sm text-gray-500 mt-1">Automatically round final bill amounts</p>
            </div>
            <input
              type="checkbox"
              checked={formData.enable_bill_round_off ?? false}
              onChange={(e) => handleChange('enable_bill_round_off', e.target.checked)}
              className="w-12 h-6 rounded-full"
            />
          </div>

          {formData.enable_bill_round_off && (
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Select
                  label="Rounding Method"
                  value={formData.round_off_mode || ''}
                  onChange={(e) => handleChange('round_off_mode', e.target.value)}
                >
                  <option value="nearest_rupee">Nearest Rupee</option>
                  <option value="round_up">Always Round Up</option>
                  <option value="round_down">Always Round Down</option>
                  <option value="nearest_0.50">Nearest ₹0.50</option>
                </Select>

                <Input
                  type="number"
                  label="Decimal Precision"
                  value={formData.round_off_decimal_precision ?? 2}
                  onChange={(e) => handleChange('round_off_decimal_precision', parseInt(e.target.value))}
                  min={0}
                  max={2}
                  helperText="Number of decimal places (0-2)"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="allow_override"
                    checked={formData.allow_per_bill_round_off_override ?? false}
                    onChange={(e) => handleChange('allow_per_bill_round_off_override', e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <div>
                    <label htmlFor="allow_override" className="font-medium text-gray-900">
                      Allow Per-Bill Override
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      Cashiers can change rounding behavior during billing
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderVendorsSection = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Vendor Management</h3>
        <p className="text-sm text-gray-500 mt-1">Configure vendor behavior and payment settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Recent Vendors</h4>
            </div>
          </div>
          <Input
            type="number"
            value={formData.recent_vendor_days ?? 30}
            onChange={(e) => handleChange('recent_vendor_days', parseInt(e.target.value))}
            min={1}
            className="mt-2"
          />
          <span className="text-xs text-gray-500 ml-2">days</span>
          <p className="text-xs text-gray-500 mt-3">
            Show vendors used in last N days at the top
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Payment Warning</h4>
            </div>
          </div>
          <Input
            type="number"
            value={formData.vendor_payment_warning_days ?? 90}
            onChange={(e) => handleChange('vendor_payment_warning_days', parseInt(e.target.value))}
            min={1}
            className="mt-2"
          />
          <span className="text-xs text-gray-500 ml-2">days</span>
          <p className="text-xs text-gray-500 mt-3">
            Warn if last payment was older than N days
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Default Terms</h4>
            </div>
          </div>
          <Input
            type="number"
            value={formData.default_payment_terms_days ?? 30}
            onChange={(e) => handleChange('default_payment_terms_days', parseInt(e.target.value))}
            min={0}
            className="mt-2"
          />
          <span className="text-xs text-gray-500 ml-2">days</span>
          <p className="text-xs text-gray-500 mt-3">
            Default payment terms for new vendors
          </p>
        </div>
      </div>
    </div>
  );

  const renderFinancialSection = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Financial Year & Billing</h3>
        <p className="text-sm text-gray-500 mt-1">Configure financial year and bill numbering</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-4">Financial Year</h4>
            <Input
              type="text"
              label="Start Date"
              value={formData.financial_year_start_date || ''}
              onChange={(e) => handleChange('financial_year_start_date', e.target.value)}
              placeholder="MM-DD (e.g., 04-01)"
              helperText="Format: MM-DD. Example: 04-01 for April 1st"
            />
            <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
              <p className="font-medium">Example Dates:</p>
              <ul className="mt-1 space-y-1">
                <li>• 04-01 = April 1 (Indian Financial Year)</li>
                <li>• 01-01 = January 1 (Calendar Year)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-4">Bill Number Format</h4>
            <div className="grid grid-cols-1 gap-4">
              <Input
                type="text"
                label="Prefix"
                value={formData.bill_number_prefix || ''}
                onChange={(e) => handleChange('bill_number_prefix', e.target.value)}
                placeholder="e.g., INV, BILL"
                helperText="Optional prefix for bill numbers"
              />
              <Input
                type="number"
                label="Number Length"
                value={formData.bill_number_length ?? 5}
                onChange={(e) => handleChange('bill_number_length', parseInt(e.target.value))}
                min={3}
                max={10}
                helperText={`${formData.bill_number_prefix || 'BILL'}-${String(1).padStart(formData.bill_number_length || 5, '0')}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTaxSection = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Tax & Compliance</h3>
        <p className="text-sm text-gray-500 mt-1">Configure GST and compliance settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Business Location</h4>
              <p className="text-sm text-gray-500">For GST calculation</p>
            </div>
          </div>
          <Select
            value={formData.business_registered_state || ''}
            onChange={(e) => handleChange('business_registered_state', e.target.value)}
            className="mt-2"
          >
            <option value="">Select your business state</option>
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </Select>
          <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
            <p className="font-medium text-blue-800">How this is used:</p>
            <ul className="mt-1 text-blue-700 space-y-1">
              <li>• Intra-state: Same state GST rates</li>
              <li>• Inter-state: Different state GST rates</li>
              <li>• Determines IGST vs CGST+SGST</li>
            </ul>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Shield className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">E-Way Bill</h4>
              <p className="text-sm text-gray-500">Compliance threshold</p>
            </div>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              ₹
            </span>
            <Input
              type="number"
              value={formData.eway_bill_threshold_amount ?? 50000}
              onChange={(e) => handleChange('eway_bill_threshold_amount', parseFloat(e.target.value))}
              min={0}
              step={1000}
              className="pl-8"
              placeholder="50000"
            />
          </div>
          <div className="mt-4 p-3 bg-amber-50 rounded text-sm">
            <p className="font-medium text-amber-800">Requirement:</p>
            <p className="text-amber-700 mt-1">
              E-Way bill is required when bill value is ₹{formData.eway_bill_threshold_amount?.toLocaleString() || '50,000'} or more
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'billing':
        return renderBillingSection();
      case 'vendors':
        return renderVendorsSection();
      case 'financial':
        return renderFinancialSection();
      case 'tax':
        return renderTaxSection();
      case 'business':
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
              <p className="text-sm text-gray-500 mt-1">Manage your business details</p>
            </div>
            <div className="text-center py-12">
              <SettingsIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Business Settings</h4>
              <p className="text-gray-500 max-w-md mx-auto">
                Business name, address, contact details, and other business information can be managed in the main business settings page.
              </p>
              <Button variant="secondary" className="mt-4">
                Go to Business Settings
              </Button>
            </div>
          </div>
        );
      default:
        return renderBillingSection();
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <SettingsIcon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">POS Settings</h1>
                  <p className="text-gray-500 mt-1">
                    Configure billing, vendors, tax, and financial preferences
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={handleReset}
                className="hidden sm:inline-flex"
              >
                Reset Changes
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                isLoading={isSaving}
                className="shadow-sm"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-medium">{message.type === 'success' ? 'Success!' : 'Error'}</h4>
                  <p className="text-sm mt-1">{message.text}</p>
                </div>
              </div>
              <button
                onClick={() => setMessage(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-2">
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`
                        flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium
                        transition-all duration-200
                        ${isActive 
                          ? `bg-${section.color}-50 text-${section.color}-700 border border-${section.color}-200` 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-1.5 rounded ${isActive ? `bg-${section.color}-100` : 'bg-gray-100'}`}>
                          <Icon className={`w-4 h-4 ${isActive ? `text-${section.color}-600` : 'text-gray-500'}`} />
                        </div>
                        <span>{section.label}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isActive ? `text-${section.color}-500` : 'text-gray-400'}`} />
                    </button>
                  );
                })}
              </nav>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Tip:</span> Changes are automatically saved to a draft. Click "Save Changes" to apply them.
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {renderActiveSection()}
              
              {/* Save Bar for Mobile */}
              <div className="lg:hidden mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="secondary"
                    onClick={handleReset}
                    className="flex-1"
                  >
                    Reset Changes
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    isLoading={isSaving}
                    className="flex-1 shadow-sm"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="font-medium text-blue-900 text-sm">💡 Quick Tip</h4>
                <p className="text-blue-700 text-sm mt-1">
                  Use Rounding to eliminate paise and simplify cash transactions.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <h4 className="font-medium text-green-900 text-sm">📋 Reminder</h4>
                <p className="text-green-700 text-sm mt-1">
                  Update financial year start date before starting new financial year.
                </p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                <h4 className="font-medium text-amber-900 text-sm">⚠️ Important</h4>
                <p className="text-amber-700 text-sm mt-1">
                  Ensure correct business state for accurate GST calculations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};