import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      welcome: 'Welcome',
      dashboard: 'Dashboard',
      profile: 'Profile',
      notifications: 'Notifications',
      settings: 'Settings',
      logout: 'Logout',
      login: 'Login',
      register: 'Register',
      language: 'Language',
      live_chat: 'Live Chat',
      support_tickets: 'Support Tickets',
      faq: 'FAQ',
      compliance: 'Compliance',
      new_payment: 'New Payment',
      back_to_dashboard: 'Back to Dashboard',
      save_changes: 'Save Changes',
      cancel: 'Cancel',
      confirm: 'Confirm',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      download: 'Download',
      upload: 'Upload',
      verify: 'Verify',
      submit: 'Submit',
      close: 'Close',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Information',
      // Add more keys as needed
    },
  },
  es: {
    translation: {
      welcome: 'Bienvenido',
      dashboard: 'Tablero',
      profile: 'Perfil',
      notifications: 'Notificaciones',
      settings: 'Configuraciones',
      logout: 'Cerrar sesión',
      login: 'Iniciar sesión',
      register: 'Registrarse',
      language: 'Idioma',
      live_chat: 'Chat en vivo',
      support_tickets: 'Tickets de soporte',
      faq: 'Preguntas frecuentes',
      compliance: 'Cumplimiento',
      new_payment: 'Nuevo Pago',
      back_to_dashboard: 'Volver al tablero',
      save_changes: 'Guardar cambios',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      delete: 'Eliminar',
      edit: 'Editar',
      view: 'Ver',
      download: 'Descargar',
      upload: 'Subir',
      verify: 'Verificar',
      submit: 'Enviar',
      close: 'Cerrar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      warning: 'Advertencia',
      info: 'Información',
      // Add more keys as needed
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n; 