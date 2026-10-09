import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  children?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  children,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 max-w-lg mx-auto">
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-violet-400 mb-5 shadow-inner">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-neutral-100 tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-sm text-neutral-400 leading-relaxed mb-6">
        {description}
      </p>

      {children && <div className="w-full mb-6">{children}</div>}

      {(actionText || secondaryActionText) && (
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {actionText && onAction && (
            <Button
              variant="primary"
              size="md"
              onClick={onAction}
              className="w-full sm:w-auto"
            >
              {actionText}
            </Button>
          )}
          {secondaryActionText && onSecondaryAction && (
            <Button
              variant="outline"
              size="md"
              onClick={onSecondaryAction}
              className="w-full sm:w-auto"
            >
              {secondaryActionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
