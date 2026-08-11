import { useId } from 'react';
import { AlertCircle } from 'lucide-react';
import styles from './Field.module.css';

/**
 * Shared wrapper: label, control, and hint/error messaging.
 *
 * useId() generates a collision-free id so the <label> can be linked to the
 * control with htmlFor. Without that link, clicking the label does not focus
 * the input and screen readers announce the field as unlabelled.
 */
const FieldShell = ({ id, label, error, hint, required, children }) => (
  <div className={styles.field}>
    {label && (
      <label className={styles.label} htmlFor={id}>
        {label}
        {required && <span className={styles.required} aria-hidden="true">*</span>}
      </label>
    )}

    {children}

    {/* An error replaces the hint rather than stacking below it — showing both
      * at once competes for attention at the moment the user is least able to
      * absorb two messages. */}
    {error ? (
      <span className={styles.error} id={`${id}-error`} role="alert">
        <AlertCircle size={13} aria-hidden="true" />
        {error}
      </span>
    ) : (
      hint && <span className={styles.hint} id={`${id}-hint`}>{hint}</span>
    )}
  </div>
);

/** Builds the shared a11y props that tie a control to its messages. */
const controlProps = (id, error, hint) => ({
  id,
  'aria-invalid': error ? true : undefined,
  'aria-describedby': error ? `${id}-error` : hint ? `${id}-hint` : undefined,
});

export const Input = ({
  label, error, hint, required, icon, className = '', id: providedId, ...rest
}) => {
  const generatedId = useId();
  const id = providedId || generatedId;

  const input = (
    <input
      className={[styles.control, error && styles.invalid, className]
        .filter(Boolean)
        .join(' ')}
      {...controlProps(id, error, hint)}
      {...rest}
    />
  );

  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required}>
      {icon ? (
        <span className={styles.withIcon}>
          <span className={styles.icon}>{icon}</span>
          {input}
        </span>
      ) : (
        input
      )}
    </FieldShell>
  );
};

export const Textarea = ({
  label, error, hint, required, className = '', id: providedId, ...rest
}) => {
  const generatedId = useId();
  const id = providedId || generatedId;

  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required}>
      <textarea
        className={[styles.control, styles.textarea, error && styles.invalid, className]
          .filter(Boolean)
          .join(' ')}
        {...controlProps(id, error, hint)}
        {...rest}
      />
    </FieldShell>
  );
};

export const Select = ({
  label, error, hint, required, options = [], placeholder,
  className = '', id: providedId, children, ...rest
}) => {
  const generatedId = useId();
  const id = providedId || generatedId;

  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required}>
      <select
        className={[styles.control, styles.select, error && styles.invalid, className]
          .filter(Boolean)
          .join(' ')}
        {...controlProps(id, error, hint)}
        {...rest}
      >
        {/* Disabled placeholder: visible when nothing is chosen, but cannot be
          * re-selected once the user picks a real value. */}
        {placeholder && <option value="" disabled>{placeholder}</option>}

        {children ||
          options.map((option) => {
            const value = typeof option === 'string' ? option : option.value;
            const text = typeof option === 'string' ? option : option.label;
            return <option key={value} value={value}>{text}</option>;
          })}
      </select>
    </FieldShell>
  );
};
