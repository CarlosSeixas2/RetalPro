import { toast } from "sonner";
import { TOAST_MESSAGES } from "../constants";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function useToast() {
  const showToast = (
    type: ToastType,
    message: string,
    options: ToastOptions = {}
  ) => {
    const { description, duration, action } = options;

    switch (type) {
      case "success":
        toast.success(message, {
          description,
          duration,
          action,
        });
        break;
      case "error":
        toast.error(message, {
          description,
          duration,
          action,
        });
        break;
      case "warning":
        toast.warning(message, {
          description,
          duration,
          action,
        });
        break;
      case "info":
        toast.info(message, {
          description,
          duration,
          action,
        });
        break;
    }
  };

  const showSuccess = (message: string, options?: ToastOptions) => {
    showToast("success", message, options);
  };

  const showError = (message: string, options?: ToastOptions) => {
    showToast("error", message, options);
  };

  const showWarning = (message: string, options?: ToastOptions) => {
    showToast("warning", message, options);
  };

  const showInfo = (message: string, options?: ToastOptions) => {
    showToast("info", message, options);
  };

  // Métodos pré-definidos para operações comuns
  const showGenericError = () => {
    showError(TOAST_MESSAGES.ERROR.GENERIC);
  };

  const showNetworkError = () => {
    showError(TOAST_MESSAGES.ERROR.NETWORK);
  };

  const showUnauthorizedError = () => {
    showError(TOAST_MESSAGES.ERROR.UNAUTHORIZED);
  };

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showGenericError,
    showNetworkError,
    showUnauthorizedError,
  };
} 