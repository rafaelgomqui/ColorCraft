import React from 'react';

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'destructive';
  }
>(({ className = '', variant = 'default', ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={`relative w-full rounded-lg border p-4 ${
      variant === 'destructive'
        ? 'border-red-500/50 text-red-700 bg-red-50 dark:border-red-500 [&>svg]:text-red-500 dark:text-red-500 dark:bg-red-950/50'
        : 'border-border bg-background text-foreground'
    } ${className}`}
    {...props}
  />
));
Alert.displayName = 'Alert';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`text-sm [&_p]:leading-relaxed ${className}`}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertDescription };