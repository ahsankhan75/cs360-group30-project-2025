import { toast } from 'react-toastify';

// Default toast configuration
const toastConfig = {
  position: "bottom-right",
  autoClose: 2000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: false,
  draggable: true,
  progress: undefined,
  pauseOnFocusLoss: false,
};

// Custom toast functions with consistent configuration
export const successToast = (message) => toast.success(message, toastConfig);
export const errorToast = (message) => toast.error(message, toastConfig);
export const infoToast = (message) => toast.info(message, toastConfig);
export const warningToast = (message) => toast.warning(message, toastConfig);

export default toastConfig;
