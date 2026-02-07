import { Variants } from "framer-motion";

// Smooth entrance animations with custom easing
export const fadeInUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.4, 
      ease: [0.22, 1, 0.36, 1] // Custom easing for smoothness
    } 
  }
};

export const fadeInDown: Variants = {
  hidden: { 
    opacity: 0, 
    y: -20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.4, 
      ease: [0.22, 1, 0.36, 1]
    } 
  }
};

export const fadeIn: Variants = {
  hidden: { 
    opacity: 0 
  },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.4, 
      ease: [0.22, 1, 0.36, 1]
    } 
  }
};

export const scaleIn: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.9 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.4, 
      ease: [0.22, 1, 0.36, 1]
    } 
  }
};

// Stagger container for lists - optimized for mobile
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: typeof window !== 'undefined' && window.innerWidth < 768 ? 0.02 : 0.08,
      delayChildren: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : 0.05
    }
  }
};

// Slide animations
export const slideInLeft: Variants = {
  hidden: { 
    opacity: 0, 
    x: -50 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.5, 
      ease: [0.22, 1, 0.36, 1]
    } 
  }
};

export const slideInRight: Variants = {
  hidden: { 
    opacity: 0, 
    x: 50 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.5, 
      ease: [0.22, 1, 0.36, 1]
    } 
  }
};

// Modal/Dialog animations
export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

export const modalContent: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
    y: 20
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: { 
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1]
    } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    y: 20,
    transition: { 
      duration: 0.2 
    } 
  }
};

// Hover and interaction animations
export const hoverScale = {
  scale: 1.02,
  transition: { type: "spring", stiffness: 400, damping: 25 }
};

export const tapScale = {
  scale: 0.98,
  transition: { type: "spring", stiffness: 400, damping: 25 }
};

export const hoverLift = {
  y: -4,
  transition: { type: "spring", stiffness: 400, damping: 25 }
};

export const springTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 25
};

export const smoothTransition = {
  duration: 0.3,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
};

// List item animation
export const listItem: Variants = {
  hidden: { 
    opacity: 0, 
    x: -20 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.2
    }
  }
};

// Page transition
export const pageTransition: Variants = {
  initial: { 
    opacity: 0, 
    y: 20 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.4, 
      ease: [0.22, 1, 0.36, 1]
    } 
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { 
      duration: 0.3 
    } 
  }
};

