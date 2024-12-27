import React, { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorAlertProps {
  message: string;
  onClose: () => void;
  duration?: number; // Duration in milliseconds before auto-dismiss
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ 
  message, 
  onClose, 
  duration = 5000, // 5 seconds default
  position = 'top-right'
}) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  // Position classes mapping
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  return (
    <Alert 
      variant="destructive" 
      role="alert"
      aria-live="assertive"
      className={cn(
        "fixed w-96 z-50",
        positionClasses[position],
        "animate-in fade-in slide-in-from-top-2 duration-300",
        "shadow-lg",
        "hover:shadow-xl transition-shadow",
        "motion-reduce:animate-none" // Respect reduced motion preferences
      )}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1 flex-grow">
          <AlertTitle className="font-semibold tracking-tight">
            Error
          </AlertTitle>
          <AlertDescription className="text-sm leading-relaxed">
            {message}
          </AlertDescription>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-6 w-6 -mt-1 hover:bg-destructive-foreground/10 transition-colors"
          onClick={onClose}
          aria-label="Dismiss error"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      {duration && (
        <div 
          className="absolute bottom-0 left-0 h-1 bg-destructive-foreground/20"
          style={{
            width: '100%',
            animation: `shrink ${duration}ms linear`
          }}
        />
      )}
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </Alert>
  );
};

export default ErrorAlert;