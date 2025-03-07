import { Button } from "@/components/ui/button";

interface SuccessModalProps {
  title: string;
  message: string;
  buttonText: string;
  onButtonClick: () => void;
}

export default function SuccessModal({
  title,
  message,
  buttonText,
  onButtonClick
}: SuccessModalProps) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center px-6 z-50">
      <div className="bg-white w-full rounded-2xl shadow-lg p-6 max-w-md">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-[#f0b73e] flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-2">{title}</h2>
        <p className="text-center text-gray-600 mb-6">
          {message}
        </p>
        
        <Button 
          className="w-full py-6 bg-[#4caf50] hover:bg-[#2a5414] text-white rounded-full font-medium"
          onClick={onButtonClick}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
}
