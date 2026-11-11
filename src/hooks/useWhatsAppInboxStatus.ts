import useOrderAlertStore from '../store/order_alert_store';

/** Shared status from the app-wide WhatsApp inbox poll. */
export default function useWhatsAppInboxStatus() {
  return useOrderAlertStore(state => state.whatsappInbox);
}
