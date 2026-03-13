'use client';

import { Check } from 'lucide-react';

interface Step {
  id: number;
  label: string;
  description?: string;
}

interface ProgressTrackerProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export default function ProgressTracker({ steps, currentStep, className = '' }: ProgressTrackerProps) {
  return (
    <div className={`w-full ${className}`}>
      {/* Desktop Progress Tracker */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Progress Line Background */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full" />
        {/* Progress Line Fill */}
        <div
          className="absolute top-5 left-0 h-1 bg-gradient-to-r from-[#FF6B35] to-[#FF8F5C] rounded-full transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
        {/* Steps */}
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isPending = currentStep < step.id;

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              {/* Step Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-gradient-to-br from-[#FF6B35] to-[#FF8F5C] text-white ring-4 ring-orange-100'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.id
                )}
              </div>
              {/* Step Label */}
              <span
                className={`mt-3 text-sm font-semibold text-center max-w-[100px] ${
                  isCurrent ? 'text-[#FF6B35]' : isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
              {/* Step Description */}
              {step.description && (
                <span className="text-xs text-gray-500 text-center max-w-[120px] mt-1">
                  {step.description}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Progress Tracker */}
      <div className="md:hidden">
        {/* Progress Bar */}
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#FF6B35] to-[#FF8F5C] rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
        {/* Current Step Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FF8F5C] text-white flex items-center justify-center font-bold text-sm">
              {currentStep}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                {steps.find(s => s.id === currentStep)?.label}
              </p>
              {steps.find(s => s.id === currentStep)?.description && (
                <p className="text-xs text-gray-500">
                  {steps.find(s => s.id === currentStep)?.description}
                </p>
              )}
            </div>
          </div>
          <span className="text-sm text-gray-500 font-medium">
            Step {currentStep} of {steps.length}
          </span>
        </div>
      </div>
    </div>
  );
}
