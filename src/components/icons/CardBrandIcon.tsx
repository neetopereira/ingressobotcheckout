import { CardBrand } from '@/lib/cardUtils';

interface CardBrandIconProps {
  brand: CardBrand;
  className?: string;
}

export function CardBrandIcon({ brand, className = "w-10 h-6" }: CardBrandIconProps) {
  switch (brand) {
    case 'visa':
      return (
        <svg className={className} viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="32" rx="4" fill="#1A1F71"/>
          <path d="M19.5 21H17L18.8 11H21.3L19.5 21ZM15.3 11L12.9 18L12.6 16.7L11.6 12.1C11.6 12.1 11.5 11 10.1 11H6.1L6 11.2C6 11.2 7.6 11.5 9.4 12.6L11.6 21H14.2L18 11H15.3ZM36 21L34 11H31.9C31 11 30.7 11.7 30.7 11.7L26.9 21H29.5L30 19.5H33.2L33.5 21H36ZM30.8 17.5L32.2 13.5L33 17.5H30.8ZM27 13.5L27.3 11.8C27.3 11.8 26 11.3 24.6 11.3C23.1 11.3 19.7 12 19.7 15C19.7 17.8 23.7 17.8 23.7 19.2C23.7 20.6 20.1 20.2 18.9 19.3L18.6 21.1C18.6 21.1 19.9 21.7 21.9 21.7C23.9 21.7 27 20.6 27 17.9C27 15.1 23 14.8 23 13.7C23 12.6 25.7 12.8 27 13.5Z" fill="white"/>
        </svg>
      );
    case 'mastercard':
      return (
        <svg className={className} viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="32" rx="4" fill="#000"/>
          <circle cx="18" cy="16" r="8" fill="#EB001B"/>
          <circle cx="30" cy="16" r="8" fill="#F79E1B"/>
          <path d="M24 10.5C25.8 12 27 14.3 27 16.9C27 19.5 25.8 21.8 24 23.3C22.2 21.8 21 19.5 21 16.9C21 14.3 22.2 12 24 10.5Z" fill="#FF5F00"/>
        </svg>
      );
    case 'elo':
      return (
        <svg className={className} viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="32" rx="4" fill="#000"/>
          <path d="M12 16C12 18.8 13.5 21.2 15.7 22.4L17.5 19.3C16.4 18.6 15.7 17.4 15.7 16C15.7 14.6 16.4 13.4 17.5 12.7L15.7 9.6C13.5 10.8 12 13.2 12 16Z" fill="#FFCB05"/>
          <path d="M24 10C22.6 10 21.3 10.4 20.2 11L22 14.1C22.6 13.7 23.3 13.5 24 13.5C26.5 13.5 28.5 15.5 28.5 18C28.5 18.7 28.3 19.4 28 20L31 21.8C31.6 20.7 32 19.4 32 18C32 13.6 28.4 10 24 10Z" fill="#00A3DF"/>
          <path d="M24 22.5C23.3 22.5 22.6 22.3 22 21.9L20.2 25C21.3 25.6 22.6 26 24 26C28.4 26 32 22.4 32 18C32 17.3 31.9 16.6 31.7 16L28.7 17.8C28.9 18.2 29 18.6 29 19C29 20.9 26.9 22.5 24 22.5Z" fill="#EE4023"/>
        </svg>
      );
    case 'amex':
      return (
        <svg className={className} viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="32" rx="4" fill="#006FCF"/>
          <path d="M8 21H11.5L12.3 19.2H14.1L14.9 21H22V19.5L22.7 21H26.5L27.2 19.5V21H40V11H27.2L26.6 12.4L26 11H22V12.3L21.4 11H17.5L14 18.5V11H9.5L8 21ZM17.8 13.2L15 20H16.8L17.4 18.5H20.1L20.7 20H22.5L19.8 13.2H17.8ZM18.8 15L19.6 17H18L18.8 15ZM35 20H36.8V14.5L39 20H40.5V13.2H38.7V18.5L36.6 13.2H35V20ZM29 20H33.5V18.5H30.8V17.3H33.4V15.8H30.8V14.7H33.5V13.2H29V20ZM23 20H24.8V17.3H27.2V15.8H24.8V14.7H27.5V13.2H23V20Z" fill="white"/>
        </svg>
      );
    case 'hipercard':
      return (
        <svg className={className} viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="32" rx="4" fill="#B5121B"/>
          <circle cx="24" cy="16" r="8" fill="white"/>
          <circle cx="24" cy="16" r="5" fill="#B5121B"/>
        </svg>
      );
    case 'diners':
      return (
        <svg className={className} viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="32" rx="4" fill="#0079BE"/>
          <circle cx="24" cy="16" r="9" fill="white"/>
          <path d="M19 16C19 13.2 20.5 10.8 22.8 9.5V22.5C20.5 21.2 19 18.8 19 16ZM25.2 9.5V22.5C27.5 21.2 29 18.8 29 16C29 13.2 27.5 10.8 25.2 9.5Z" fill="#0079BE"/>
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="32" rx="4" fill="#374151"/>
          <rect x="8" y="10" width="32" height="4" rx="1" fill="#6B7280"/>
          <rect x="8" y="18" width="20" height="4" rx="1" fill="#6B7280"/>
        </svg>
      );
  }
}
