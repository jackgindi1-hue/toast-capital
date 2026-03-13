'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, ChevronDown, Phone, Mail, Building2, Coffee, Store, Utensils, ArrowRight, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

function formatPhoneNumber(value: string): string {
  const phoneNumber = value.replace(/\D/g, '');
  if (phoneNumber.length === 0) return '';
  if (phoneNumber.length <= 3) return `(${phoneNumber}`;
  if (phoneNumber.length <= 6) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
}

const testimonials = [
  {
    image: "https://ext.same-assets.com/2820641348/3369406675.jpeg",
    quote: "Being able to automatically repay daily as a fixed percentage of daily card transactions is beautiful.",
    name: "Don King",
    title: "Owner | Fat City Brew & BBQ"
  }
];

const businessTypes = [
  { id: 'full-service', label: 'Full Service Restaurant', icon: Utensils, description: 'Table service' },
  { id: 'quick-service', label: 'Quick Service', icon: Coffee, description: 'Counter service' },
  { id: 'bar-nightclub', label: 'Bar / Nightclub', icon: Store, description: 'Bars, pubs' },
  { id: 'other', label: 'Other Business', icon: Building2, description: 'Other' }
];

export default function Home() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedBusinessType, setSelectedBusinessType] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', businessName: '', monthlyRevenue: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
    setStep(1);
    setSelectedBusinessType(null);
    setFormData({ firstName: '', lastName: '', email: '', phone: '', businessName: '', monthlyRevenue: '' });
    setFormErrors({});
    setTouched({});
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'firstName': return !value.trim() ? 'First name is required' : '';
      case 'lastName': return !value.trim() ? 'Last name is required' : '';
      case 'email': return !value.trim() ? 'Email is required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email' : '';
      case 'phone': return !value.trim() ? 'Phone is required' : value.replace(/\D/g, '').length < 10 ? 'Invalid phone' : '';
      case 'businessName': return !value.trim() ? 'Business name is required' : '';
      default: return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newValue = name === 'phone' ? formatPhoneNumber(value) : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
    if (touched[name]) {
      setFormErrors(prev => ({ ...prev, [name]: validateField(name, newValue) }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setFormErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const validateAllFields = (): boolean => {
    const errors: Record<string, string> = {};
    ['firstName', 'lastName', 'email', 'phone', 'businessName'].forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData]);
      if (error) errors[field] = error;
    });
    setFormErrors(errors);
    setTouched({ firstName: true, lastName: true, email: true, phone: true, businessName: true });
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAllFields()) return;
    setIsSubmitting(true);
    const submitData = { ...formData, businessType: selectedBusinessType };
    sessionStorage.setItem('demoFormData', JSON.stringify(submitData));
    try {
      await fetch('/api/submit-demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });
    } catch (error) {
      console.error('Error:', error);
    }
    setTimeout(() => {
      setShowModal(false);
      router.push('/upload');
    }, 500);
  };

  const faqs = [
    { question: "How do you determine eligibility?", answer: "Based on card processing volume, time in business, and bankruptcy status." },
    { question: "Does applying affect my credit score?", answer: "No, we perform a soft credit check." },
    { question: "How do I repay?", answer: "A fixed percentage of daily card transactions is automatically applied." },
    { question: "How much does it cost?", answer: "One simple fixed fee - no compounding interest or late fees." },
    { question: "How can I use the funds?", answer: "Any business purpose including payroll, inventory, or expansion." }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-[#FF6B35] to-[#FF8F5C] px-6 py-5">
            <DialogTitle className="text-white text-xl font-bold">
              {step === 1 ? 'Get Your Free Quote' : 'Tell Us About Yourself'}
            </DialogTitle>
            <div className="flex items-center gap-2 mt-3">
              <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-white' : 'bg-white/40'}`} />
              <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-white' : 'bg-white/40'}`} />
            </div>
            <p className="text-white/80 text-sm mt-2">Step {step} of 2</p>
          </div>
          <div className="p-6">
            {step === 1 ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">How would you describe your business?</h3>
                <div className="grid grid-cols-2 gap-3">
                  {businessTypes.map((type) => {
                    const IconComponent = type.icon;
                    const isSelected = selectedBusinessType === type.id;
                    return (
                      <button key={type.id} type="button" onClick={() => setSelectedBusinessType(type.id)}
                        className={`flex flex-col items-center p-5 rounded-xl border-2 ${isSelected ? 'border-[#FF6B35] bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${isSelected ? 'bg-[#FF6B35] text-white' : 'bg-gray-100 text-gray-600'}`}>
                          <IconComponent className="w-7 h-7" />
                        </div>
                        <span className={`font-semibold text-sm ${isSelected ? 'text-[#FF6B35]' : 'text-gray-900'}`}>{type.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#FF6B35] mt-2" />}
                      </button>
                    );
                  })}
                </div>
                <button type="button" onClick={() => selectedBusinessType && setStep(2)} disabled={!selectedBusinessType}
                  className={`w-full mt-6 py-3.5 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 ${selectedBusinessType ? 'bg-[#1E3A8A] text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                  Continue <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <button type="button" onClick={() => setStep(1)} className="flex items-center gap-1 text-gray-500 mb-4">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {['firstName', 'lastName'].map(field => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{field === 'firstName' ? 'First Name' : 'Last Name'} *</label>
                        <input type="text" name={field} value={formData[field as keyof typeof formData]} onChange={handleInputChange} onBlur={handleBlur}
                          className={`w-full px-4 py-3 border rounded-lg ${formErrors[field] && touched[field] ? 'border-red-500' : 'border-gray-300'}`} />
                        {formErrors[field] && touched[field] && <p className="mt-1 text-sm text-red-600">{formErrors[field]}</p>}
                      </div>
                    ))}
                  </div>
                  {['email', 'phone', 'businessName'].map(field => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {field === 'email' ? 'Email' : field === 'phone' ? 'Phone' : 'Business Name'} *
                      </label>
                      <input type={field === 'email' ? 'email' : 'text'} name={field} value={formData[field as keyof typeof formData]}
                        onChange={handleInputChange} onBlur={handleBlur}
                        className={`w-full px-4 py-3 border rounded-lg ${formErrors[field] && touched[field] ? 'border-red-500' : 'border-gray-300'}`} />
                      {formErrors[field] && touched[field] && <p className="mt-1 text-sm text-red-600">{formErrors[field]}</p>}
                    </div>
                  ))}
                </div>
                <button type="submit" disabled={isSubmitting}
                  className="w-full mt-6 py-3.5 px-6 rounded-lg font-semibold bg-green-500 hover:bg-green-600 text-white disabled:opacity-50">
                  {isSubmitting ? 'Submitting...' : 'Get My Quote'}
                </button>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="bg-white border-b py-3 px-4 md:py-5 md:px-6 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image src="/toast-capital-logo.svg" alt="Toast Capital" width={200} height={60} className="object-contain w-[120px] md:w-[200px]" />
          </Link>
          <div className="flex items-center gap-4">
            <a href="tel:305-515-7319" className="hidden md:flex items-center gap-2">
              <Phone className="w-6 h-6 text-[#FF8C42]" />
              <span className="text-lg font-bold">305-515-7319</span>
            </a>
            <button onClick={handleOpenModal} className="bg-[#FF6B35] hover:bg-[#FF8F5C] text-white font-semibold py-2 px-4 md:py-3 md:px-6 rounded-full transition-all">
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Get <span className="text-[#FF6B35]">$2K - $2M</span> in Business Funding
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Fast approval with flexible daily or weekly repayments. No credit score requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={handleOpenModal} className="bg-[#FF6B35] hover:bg-[#FF8F5C] text-white font-bold py-4 px-8 rounded-full text-lg transition-all transform hover:scale-105">
                Get Your Free Quote
              </button>
              <a href="tel:305-515-7319" className="flex items-center justify-center gap-2 bg-white border-2 border-[#FF6B35] text-[#FF6B35] font-bold py-4 px-8 rounded-full text-lg hover:bg-orange-50 transition-all">
                <Phone className="w-5 h-5" /> Call Now
              </a>
            </div>
            <div className="mt-8 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">No Credit Check</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Same Day Approval</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <Image src="https://ext.same-assets.com/2820641348/2216095451.png" alt="Business Funding" width={600} height={400} className="rounded-2xl shadow-2xl" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Why Choose Toast Capital?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Fast Funding", desc: "Get approved in as little as 24 hours with funds deposited quickly.", icon: "⚡" },
              { title: "Flexible Payments", desc: "Daily or weekly payments that work with your cash flow.", icon: "📊" },
              { title: "No Credit Requirements", desc: "We focus on your business performance, not your credit score.", icon: "✓" }
            ].map((feature, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left">
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <div className="px-6 pb-6 text-gray-600">{faq.answer}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-4 bg-[#FF6B35]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Grow Your Business?</h2>
          <p className="text-xl text-white/90 mb-8">Get pre-approved in minutes with no impact to your credit score.</p>
          <button onClick={handleOpenModal} className="bg-white text-[#FF6B35] font-bold py-4 px-10 rounded-full text-lg hover:bg-gray-100 transition-all transform hover:scale-105">
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div>
            <Image src="/toast-capital-logo.svg" alt="Toast Capital" width={180} height={60} className="mb-4 brightness-0 invert" />
            <p className="text-gray-400">Your trusted partner for business funding solutions.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <p className="text-gray-400">Phone: (305) 515-7319</p>
            <p className="text-gray-400">Email: info@toastcapital.com</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Address</h4>
            <p className="text-gray-400">333 Summer Street<br />Boston, MA 02210</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-gray-500">
          <p>&copy; 2025 Toast Capital. All rights reserved.</p>
        </div>
      </footer>

      {/* Mobile Phone Footer */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-green-500 shadow-lg">
        <a href="tel:305-515-7319" className="flex items-center justify-center gap-3 py-4">
          <Phone className="w-6 h-6 text-black" />
          <span className="text-lg font-bold text-black">305-515-7319</span>
        </a>
      </div>
    </div>
  );
}
