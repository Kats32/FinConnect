// components/TutorialOverlay.tsx - COMPLETE FIXED VERSION
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
}

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  tutorialKey: string;
  steps: TutorialStep[];
}

export function TutorialOverlay({ isOpen, onClose, steps }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [elementRect, setElementRect] = useState<DOMRect | null>(null);

  const updateHighlightedElement = useCallback(() => {
    if (!isOpen || steps.length === 0) return;

    const step = steps[currentStep];
    if (step.targetElement) {
      setTimeout(() => {
        const element = document.querySelector(step.targetElement!) as HTMLElement;
        if (element) {
          setHighlightedElement(element);
          setElementRect(element.getBoundingClientRect());
          
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'center'
          });
        } else {
          console.warn(`Element not found: ${step.targetElement}`);
          setHighlightedElement(null);
          setElementRect(null);
        }
      }, 100);
    } else {
      setHighlightedElement(null);
      setElementRect(null);
    }
  }, [currentStep, isOpen, steps]);
  
  // Reset to step 0 when re-opened
  useEffect(() => {
    if(isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  useEffect(() => {
    updateHighlightedElement();
  }, [currentStep, updateHighlightedElement]);

  useEffect(() => {
    if (!highlightedElement) return;

    const handleScrollResize = () => {
      if (highlightedElement) {
        setElementRect(highlightedElement.getBoundingClientRect());
      }
    };

    window.addEventListener('scroll', handleScrollResize, true);
    window.addEventListener('resize', handleScrollResize);

    return () => {
      window.removeEventListener('scroll', handleScrollResize, true);
      window.removeEventListener('resize', handleScrollResize);
    };
  }, [highlightedElement]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (!isOpen) return null;

  if (steps.length === 0 || !steps[currentStep]) {
    console.warn("TutorialOverlay: No steps provided or invalid step index.");
    return null; 
  }

  const currentStepData = steps[currentStep];

  let cardStyle: React.CSSProperties = {};
  if (elementRect && currentStepData.position && currentStepData.position !== 'center') {
    const { top, left, width, height } = elementRect;
    const cardWidth = 400; 
    const cardHeight = 300; 
    const offset = 20; 

    switch (currentStepData.position) {
      case 'top':
        cardStyle = {
          position: 'absolute',
          top: Math.max(10, top - cardHeight - offset),
          left: Math.max(10, Math.min(window.innerWidth - cardWidth - 10, left + width / 2 - cardWidth / 2)),
          transform: 'translateX(0)',
        };
        break;
      case 'bottom':
        cardStyle = {
          position: 'absolute',
          top: Math.min(window.innerHeight - cardHeight - 10, top + height + offset),
          left: Math.max(10, Math.min(window.innerWidth - cardWidth - 10, left + width / 2 - cardWidth / 2)),
          transform: 'translateX(0)',
        };
        break;
      case 'left':
        cardStyle = {
          position: 'absolute',
          top: Math.max(10, Math.min(window.innerHeight - cardHeight - 10, top + height / 2 - cardHeight / 2)),
          left: Math.max(10, left - cardWidth - offset),
          transform: 'translateY(0)',
        };
        break;
      case 'right':
        cardStyle = {
          position: 'absolute',
          top: Math.max(10, Math.min(window.innerHeight - cardHeight - 10, top + height / 2 - cardHeight / 2)),
          left: Math.min(window.innerWidth - cardWidth - 10, left + width + offset),
          transform: 'translateY(0)',
        };
        break;
      default:
        cardStyle = {};
    }
  } else {
    cardStyle = {};
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-80"
          onClick={onClose}
        />
        
        {/* Highlight overlay */}
        {elementRect && (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute border-2 border-yellow-400 rounded-lg shadow-2xl pointer-events-none"
            style={{
              top: elementRect.top - 4,
              left: elementRect.left - 4,
              width: elementRect.width + 8,
              height: elementRect.height + 8,
            }}
          >
            <div className="absolute inset-0 bg-yellow-400 bg-opacity-10 rounded-lg" />
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full" />
          </motion.div>
        )}

        {/* Tutorial card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="bg-gray-900 border border-gray-700 rounded-2xl p-6 mx-4 max-w-md w-full shadow-2xl z-50"
          style={cardStyle} 
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex justify-between items-center mb-4 text-sm text-gray-400">
            <span>Feature Guide</span>
            <span>{currentStep + 1} of {steps.length}</span>
          </div>

          <div className="w-full bg-gray-700 rounded-full h-1 mb-6">
            <div
              className="bg-purple-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white mb-3">
              {currentStepData.title}
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {currentStepData.description}
            </p>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft size={16} />
              Previous
            </button>

            <button
              onClick={nextStep}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              {currentStep === steps.length - 1 ? "Finish" : "Next"}
              {currentStep < steps.length - 1 && <ArrowRight size={16} />}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}