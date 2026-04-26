"use client";

export default function EmptyState({ icon: Icon, title, description, children }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="p-4 bg-bg-tertiary rounded-full mb-4">
          <Icon className="w-8 h-8 text-text-tertiary" />
        </div>
      )}
      <h3 className="text-lg font-medium text-text-primary mb-1">{title}</h3>
      {description && (
        <p className="text-text-tertiary text-sm max-w-sm">{description}</p>
      )}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
