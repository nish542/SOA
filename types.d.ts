declare module 'lucide-react' {
  import { FC, SVGProps } from 'react'
  
  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: string | number
    color?: string
    strokeWidth?: string | number
  }
  
  export const Search: FC<IconProps>
  export const ArrowRightLeft: FC<IconProps>
  export const Loader2: FC<IconProps>
  export const Users: FC<IconProps>
  export const Plane: FC<IconProps>
}

declare module '@/components/ui/*' {
  import { FC, ReactNode } from 'react'
  
  export interface ButtonProps {
    children?: ReactNode
    className?: string
    onClick?: () => void
    type?: 'button' | 'submit' | 'reset'
    variant?: string
    size?: string
    disabled?: boolean
  }
  
  export interface CardProps {
    children?: ReactNode
    className?: string
  }
  
  export interface InputProps {
    id?: string
    type?: string
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    placeholder?: string
    required?: boolean
    min?: string
    max?: string
    className?: string
  }
  
  export interface LabelProps {
    htmlFor?: string
    children?: ReactNode
    className?: string
  }
  
  export interface SelectProps {
    value?: string
    onValueChange?: (value: string) => void
    children?: ReactNode
  }
  
  export interface DialogProps {
    children?: ReactNode
  }
  
  export const Button: FC<ButtonProps>
  export const Card: FC<CardProps>
  export const CardContent: FC<CardProps>
  export const CardDescription: FC<CardProps>
  export const CardHeader: FC<CardProps>
  export const CardTitle: FC<CardProps>
  export const Input: FC<InputProps>
  export const Label: FC<LabelProps>
  export const Select: FC<SelectProps>
  export const SelectContent: FC<SelectProps>
  export const SelectItem: FC<SelectProps>
  export const SelectTrigger: FC<SelectProps>
  export const SelectValue: FC<SelectProps>
  export const Dialog: FC<DialogProps>
  export const DialogContent: FC<DialogProps>
  export const DialogDescription: FC<DialogProps>
  export const DialogHeader: FC<DialogProps>
  export const DialogTitle: FC<DialogProps>
  export const DialogTrigger: FC<DialogProps>
} 