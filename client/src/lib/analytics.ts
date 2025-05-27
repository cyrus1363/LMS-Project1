// Google Analytics implementation for EduEase
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Initialize Google Analytics
export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!measurementId) {
    console.warn('Google Analytics not configured - Missing VITE_GA_MEASUREMENT_ID');
    return;
  }

  // Add Google Analytics script to the head
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // Initialize gtag
  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}', {
      page_title: 'EduEase Learning Platform',
      custom_map: {
        'custom_parameter_1': 'user_role',
        'custom_parameter_2': 'subscription_plan'
      }
    });
  `;
  document.head.appendChild(script2);

  console.log('Google Analytics initialized for EduEase');
};

// Track page views - useful for single-page applications
export const trackPageView = (url: string, title?: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId) return;
  
  window.gtag('config', measurementId, {
    page_path: url,
    page_title: title || document.title
  });
};

// Track custom events for EduEase platform
export const trackEvent = (
  action: string, 
  category?: string, 
  label?: string, 
  value?: number,
  customParams?: Record<string, any>
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
    ...customParams
  });
};

// EduEase specific tracking functions
export const trackLearningEvent = (eventType: string, details: {
  classId?: number;
  contentId?: number;
  progress?: number;
  timeSpent?: number;
  aiFeature?: string;
}) => {
  trackEvent(eventType, 'learning', undefined, details.progress, {
    class_id: details.classId,
    content_id: details.contentId,
    time_spent: details.timeSpent,
    ai_feature: details.aiFeature
  });
};

export const trackSubscriptionEvent = (eventType: string, planName?: string, price?: number) => {
  trackEvent(eventType, 'subscription', planName, price);
};

export const trackAIInteraction = (featureType: string, userId?: string, language?: string) => {
  trackEvent('ai_interaction', 'artificial_intelligence', featureType, undefined, {
    user_language: language,
    feature_type: featureType
  });
};