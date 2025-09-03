import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'

interface FormField {
  name: string
  label: string
  type: 'text' | 'number' | 'email' | 'password' | 'select' | 'textarea' | 'radio' | 'checkbox' | 'slider'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  options?: Array<{ value: string; label: string }>
  validation?: {
    min?: number
    max?: number
    pattern?: RegExp
    message?: string
  }
  help?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  rows?: number
  step?: number
  defaultValue?: any
}

interface Props {
  fields: FormField[]
  onSubmit: (values: Record<string, any>) => void | Promise<void>
  isDarkMode: boolean
  title?: string
  subtitle?: string
  submitText?: string
  loading?: boolean
  layout?: 'vertical' | 'horizontal' | 'inline'
  size?: 'small' | 'middle' | 'large'
  initialValues?: Record<string, any>
  onChange?: (values: Record<string, any>) => void
}

const FormContainer = styled(motion.form)<{ isDarkMode: boolean; layout: string }>`
  background: ${props =>
    props.isDarkMode
      ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)'
      : 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.95) 100%)'};
  border: 1px solid ${props =>
    props.isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(15, 23, 42, 0.08)'};
  border-radius: 16px;
  padding: 32px;
  backdrop-filter: blur(24px);
  box-shadow: ${props =>
    props.isDarkMode
      ? '0 8px 32px rgba(0, 0, 0, 0.2)'
      : '0 8px 32px rgba(15, 23, 42, 0.08)'};

  ${props => props.layout === 'inline' && `
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: end;
  `}
`

const FormHeader = styled.div`
  margin-bottom: 32px;
  text-align: center;
`

const FormTitle = styled.h2<{ isDarkMode: boolean }>`
  font-size: 24px;
  font-weight: 600;
  color: ${props => props.isDarkMode ? '#f8fafc' : '#0f172a'};
  margin: 0 0 8px 0;
`

const FormSubtitle = styled.p<{ isDarkMode: boolean }>`
  font-size: 16px;
  color: ${props => props.isDarkMode ? '#94a3b8' : '#64748b'};
  margin: 0;
  line-height: 1.5;
`

const FormGrid = styled.div<{ layout: string }>`
  display: grid;
  gap: 24px;
  
  ${props => props.layout === 'horizontal' && `
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  `}
`

const FormItem = styled.div<{ layout: string; size: string }>`
  display: flex;
  flex-direction: ${props => props.layout === 'horizontal' ? 'row' : 'column'};
  gap: ${props => props.layout === 'horizontal' ? '16px' : '8px'};
  align-items: ${props => props.layout === 'horizontal' ? 'center' : 'stretch'};

  ${props => props.layout === 'inline' && `
    flex: 1;
    min-width: 200px;
  `}
`

const Label = styled.label<{ isDarkMode: boolean; required: boolean; layout: string }>`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.isDarkMode ? '#e2e8f0' : '#374151'};
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  
  ${props => props.layout === 'horizontal' && `
    min-width: 120px;
    margin-bottom: 0;
  `}

  ${props => props.required && `
    &::after {
      content: '*';
      color: #ef4444;
      margin-left: 2px;
    }
  `}
`

const InputWrapper = styled.div<{ isDarkMode: boolean; hasError: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  
  ${props => props.hasError && `
    .input-field {
      border-color: #ef4444 !important;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
    }
  `}
`

const InputField = styled.input<{ isDarkMode: boolean; size: string; hasPrefix: boolean; hasSuffix: boolean }>`
  width: 100%;
  padding: ${props => {
    switch (props.size) {
      case 'small': return '8px 12px'
      case 'large': return '16px 20px'
      default: return '12px 16px'
    }
  }};
  padding-left: ${props => props.hasPrefix ? '40px' : undefined};
  padding-right: ${props => props.hasSuffix ? '40px' : undefined};
  border: 1px solid ${props =>
    props.isDarkMode ? 'rgba(148, 163, 184, 0.2)' : 'rgba(15, 23, 42, 0.15)'};
  border-radius: 8px;
  background: ${props =>
    props.isDarkMode
      ? 'rgba(15, 23, 42, 0.5)'
      : 'rgba(255, 255, 255, 0.8)'};
  color: ${props => props.isDarkMode ? '#f8fafc' : '#0f172a'};
  font-size: 14px;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: ${props =>
      props.isDarkMode ? 'rgba(15, 23, 42, 0.3)' : 'rgba(248, 250, 252, 0.8)'};
  }

  &::placeholder {
    color: ${props => props.isDarkMode ? '#64748b' : '#94a3b8'};
  }
`

const TextArea = styled.textarea<{ isDarkMode: boolean; size: string }>`
  width: 100%;
  padding: ${props => {
    switch (props.size) {
      case 'small': return '8px 12px'
      case 'large': return '16px 20px'
      default: return '12px 16px'
    }
  }};
  border: 1px solid ${props =>
    props.isDarkMode ? 'rgba(148, 163, 184, 0.2)' : 'rgba(15, 23, 42, 0.15)'};
  border-radius: 8px;
  background: ${props =>
    props.isDarkMode
      ? 'rgba(15, 23, 42, 0.5)'
      : 'rgba(255, 255, 255, 0.8)'};
  color: ${props => props.isDarkMode ? '#f8fafc' : '#0f172a'};
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: ${props => props.isDarkMode ? '#64748b' : '#94a3b8'};
  }
`

const Select = styled.select<{ isDarkMode: boolean; size: string }>`
  width: 100%;
  padding: ${props => {
    switch (props.size) {
      case 'small': return '8px 12px'
      case 'large': return '16px 20px'
      default: return '12px 16px'
    }
  }};
  border: 1px solid ${props =>
    props.isDarkMode ? 'rgba(148, 163, 184, 0.2)' : 'rgba(15, 23, 42, 0.15)'};
  border-radius: 8px;
  background: ${props =>
    props.isDarkMode
      ? 'rgba(15, 23, 42, 0.5)'
      : 'rgba(255, 255, 255, 0.8)'};
  color: ${props => props.isDarkMode ? '#f8fafc' : '#0f172a'};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`

const RadioGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
`

const RadioItem = styled.label<{ isDarkMode: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: ${props => props.isDarkMode ? '#e2e8f0' : '#374151'};

  input[type="radio"] {
    accent-color: #3b82f6;
  }
`

const CheckboxItem = styled.label<{ isDarkMode: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: ${props => props.isDarkMode ? '#e2e8f0' : '#374151'};

  input[type="checkbox"] {
    accent-color: #3b82f6;
  }
`

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`

const Slider = styled.input<{ isDarkMode: boolean }>`
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: ${props =>
    props.isDarkMode ? 'rgba(148, 163, 184, 0.2)' : 'rgba(15, 23, 42, 0.1)'};
  outline: none;
  -webkit-appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`

const SliderValue = styled.span<{ isDarkMode: boolean }>`
  min-width: 40px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.isDarkMode ? '#e2e8f0' : '#374151'};
`

const InputPrefix = styled.div<{ isDarkMode: boolean }>`
  position: absolute;
  left: 12px;
  color: ${props => props.isDarkMode ? '#94a3b8' : '#64748b'};
  font-size: 14px;
  pointer-events: none;
`

const InputSuffix = styled.div<{ isDarkMode: boolean }>`
  position: absolute;
  right: 12px;
  color: ${props => props.isDarkMode ? '#94a3b8' : '#64748b'};
  font-size: 14px;
  pointer-events: none;
`

const ErrorMessage = styled(motion.div)<{ isDarkMode: boolean }>`
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
`

const HelpText = styled.div<{ isDarkMode: boolean }>`
  color: ${props => props.isDarkMode ? '#94a3b8' : '#64748b'};
  font-size: 12px;
  margin-top: 4px;
`

const SubmitButton = styled(motion.button)<{ isDarkMode: boolean; size: string; loading: boolean }>`
  padding: ${props => {
    switch (props.size) {
      case 'small': return '8px 16px'
      case 'large': return '16px 32px'
      default: return '12px 24px'
    }
  }};
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: ${props => props.loading ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
  opacity: ${props => props.loading ? 0.7 : 1};

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const EnterpriseForm: React.FC<Props> = ({
  fields,
  onSubmit,
  isDarkMode,
  title,
  subtitle,
  submitText = 'Submit',
  loading = false,
  layout = 'vertical',
  size = 'middle',
  initialValues = {},
  onChange
}) => {
  const [values, setValues] = useState<Record<string, any>>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateField = useCallback((field: FormField, value: any): string => {
    if (field.required && (!value || value === '')) {
      return `${field.label} is required`
    }

    if (field.validation) {
      const { min, max, pattern, message } = field.validation

      if (field.type === 'number' || field.type === 'slider') {
        const numValue = Number(value)
        if (min !== undefined && numValue < min) {
          return message || `${field.label} must be at least ${min}`
        }
        if (max !== undefined && numValue > max) {
          return message || `${field.label} must be at most ${max}`
        }
      }

      if (pattern && !pattern.test(String(value))) {
        return message || `${field.label} format is invalid`
      }
    }

    return ''
  }, [])

  const handleChange = useCallback((fieldName: string, value: any) => {
    const newValues = { ...values, [fieldName]: value }
    setValues(newValues)

    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }))
    }

    onChange?.(newValues)
  }, [values, errors, onChange])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    const newErrors: Record<string, string> = {}
    fields.forEach(field => {
      const error = validateField(field, values[field.name])
      if (error) {
        newErrors[field.name] = error
      }
    })

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      await onSubmit(values)
    }
  }

  const renderField = (field: FormField) => {
    const value = values[field.name] || field.defaultValue || ''

    const commonProps = {
      className: 'input-field',
      disabled: field.disabled || loading,
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const newValue = field.type === 'number' || field.type === 'slider'
          ? Number(e.target.value)
          : field.type === 'checkbox'
            ? (e.target as HTMLInputElement).checked
            : e.target.value
        handleChange(field.name, newValue)
      }
    }

    switch (field.type) {
      case 'textarea':
        return (
          <TextArea
            {...commonProps}
            isDarkMode={isDarkMode}
            size={size}
            placeholder={field.placeholder}
            rows={field.rows || 4}
          />
        )

      case 'select':
        return (
          <Select {...commonProps} isDarkMode={isDarkMode} size={size}>
            <option value="">Select {field.label}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        )

      case 'radio':
        return (
          <RadioGroup>
            {field.options?.map(option => (
              <RadioItem key={option.value} isDarkMode={isDarkMode}>
                <input
                  type="radio"
                  name={field.name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => handleChange(field.name, option.value)}
                  disabled={field.disabled || loading}
                />
                {option.label}
              </RadioItem>
            ))}
          </RadioGroup>
        )

      case 'checkbox':
        return (
          <CheckboxItem isDarkMode={isDarkMode}>
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              disabled={field.disabled || loading}
            />
            {field.label}
          </CheckboxItem>
        )

      case 'slider':
        return (
          <SliderContainer>
            <Slider
              type="range"
              isDarkMode={isDarkMode}
              min={field.validation?.min || 0}
              max={field.validation?.max || 100}
              step={field.step || 1}
              value={value}
              onChange={(e) => handleChange(field.name, Number(e.target.value))}
              disabled={field.disabled || loading}
            />
            <SliderValue isDarkMode={isDarkMode}>{value}</SliderValue>
          </SliderContainer>
        )

      default:
        return (
          <InputField
            {...commonProps}
            type={field.type}
            isDarkMode={isDarkMode}
            size={size}
            placeholder={field.placeholder}
            step={field.step}
            hasPrefix={!!field.prefix}
            hasSuffix={!!field.suffix}
          />
        )
    }
  }

  return (
    <FormContainer
      isDarkMode={isDarkMode}
      layout={layout}
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {(title || subtitle) && (
        <FormHeader>
          {title && <FormTitle isDarkMode={isDarkMode}>{title}</FormTitle>}
          {subtitle && <FormSubtitle isDarkMode={isDarkMode}>{subtitle}</FormSubtitle>}
        </FormHeader>
      )}

      <FormGrid layout={layout}>
        {fields.map(field => (
          <FormItem key={field.name} layout={layout} size={size}>
            {field.type !== 'checkbox' && (
              <Label
                isDarkMode={isDarkMode}
                required={field.required || false}
                layout={layout}
                htmlFor={field.name}
              >
                {field.label}
              </Label>
            )}

            <div style={{ flex: 1 }}>
              <InputWrapper isDarkMode={isDarkMode} hasError={!!errors[field.name]}>
                {field.prefix && <InputPrefix isDarkMode={isDarkMode}>{field.prefix}</InputPrefix>}
                {renderField(field)}
                {field.suffix && <InputSuffix isDarkMode={isDarkMode}>{field.suffix}</InputSuffix>}
              </InputWrapper>

              <AnimatePresence>
                {errors[field.name] && (
                  <ErrorMessage
                    isDarkMode={isDarkMode}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    ⚠️ {errors[field.name]}
                  </ErrorMessage>
                )}
              </AnimatePresence>

              {field.help && !errors[field.name] && (
                <HelpText isDarkMode={isDarkMode}>{field.help}</HelpText>
              )}
            </div>
          </FormItem>
        ))}
      </FormGrid>

      <SubmitButton
        type="submit"
        isDarkMode={isDarkMode}
        size={size}
        loading={loading}
        disabled={loading}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
      >
        {loading && (
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderTop: '2px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        )}
        {submitText}
      </SubmitButton>
    </FormContainer>
  )
}