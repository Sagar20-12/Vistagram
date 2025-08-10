import { useEffect, useState } from 'react';
import { LogOut, Sparkles } from 'lucide-react';

interface LogoutAnimationProps {
  isVisible: boolean;
  onAnimationComplete: () => void;
  userName?: string;
}

export default function LogoutAnimation({ 
  isVisible, 
  onAnimationComplete, 
  userName 
}: LogoutAnimationProps) {
  const [animationPhase, setAnimationPhase] = useState<'entering' | 'visible' | 'exiting'>('entering');

  useEffect(() => {
    if (isVisible) {
      setAnimationPhase('entering');
      
      // Start the animation sequence
      const timer1 = setTimeout(() => setAnimationPhase('visible'), 100);
      const timer2 = setTimeout(() => setAnimationPhase('exiting'), 2000);
      const timer3 = setTimeout(() => {
        onAnimationComplete();
        setAnimationPhase('entering');
      }, 2500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isVisible, onAnimationComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`
        relative bg-white rounded-2xl p-8 shadow-2xl transform transition-all duration-500 ease-out
        ${animationPhase === 'entering' ? 'scale-0 opacity-0' : ''}
        ${animationPhase === 'visible' ? 'scale-100 opacity-100' : ''}
        ${animationPhase === 'exiting' ? 'scale-95 opacity-0' : ''}
      `}>
        {/* Logout Icon */}
        <div className="flex justify-center mb-4">
          <div className={`
            relative transition-all duration-700 ease-out
            ${animationPhase === 'visible' ? 'scale-100' : 'scale-0'}
          `}>
            <LogOut className="w-16 h-16 text-blue-500 animate-bounce-in" />
            {/* Sparkles around the logout icon */}
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-blue-400 animate-sparkle" />
            <Sparkles className="absolute -bottom-2 -left-2 w-5 h-5 text-indigo-400 animate-sparkle" style={{ animationDelay: '0.5s' }} />
            <Sparkles className="absolute top-1/2 -right-4 w-4 h-4 text-purple-400 animate-sparkle" style={{ animationDelay: '1s' }} />
          </div>
        </div>

        {/* Logout Message */}
        <div className="text-center space-y-2">
          <h3 className={`
            text-xl font-bold text-gray-900 transition-all duration-700 delay-200
            ${animationPhase === 'visible' ? 'translate-y-0 opacity-100 animate-slide-up' : 'translate-y-4 opacity-0'}
          `}>
            See you soon! 👋
          </h3>
          {userName && (
            <p className={`
              text-gray-600 transition-all duration-700 delay-300
              ${animationPhase === 'visible' ? 'translate-y-0 opacity-100 animate-slide-up' : 'translate-y-4 opacity-0'}
            `}>
              Goodbye, {userName}!
            </p>
          )}
          <p className={`
            text-sm text-gray-500 transition-all duration-700 delay-400
            ${animationPhase === 'visible' ? 'translate-y-0 opacity-100 animate-slide-up' : 'translate-y-4 opacity-0'}
          `}>
            You've been successfully signed out
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 w-full bg-gray-200 rounded-full h-1 overflow-hidden">
          <div className={`
            h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-2000 ease-linear
            ${animationPhase === 'visible' ? 'w-full animate-progress-fill' : 'w-0'}
          `} />
        </div>
      </div>
    </div>
  );
}
