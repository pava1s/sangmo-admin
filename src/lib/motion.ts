export const fadeInUp = {
    initial: { opacity: 0, y: 12 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: "easeOut" }
    },
    exit: { opacity: 0, y: 12 }
} as const;

export const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
} as const;

export const panelHover = {
    rest: {
        y: 0,
        borderColor: "var(--border-color)",
    },
    hover: {
        y: -1,
        borderColor: "#2FBF71",
        transition: { duration: 0.2, ease: "easeOut" }
    }
} as const;

export const buttonHover = {
    rest: { scale: 1 },
    hover: {
        transition: { duration: 0.2, ease: "easeInOut" }
    },
    tap: {
        scale: 0.99,
        transition: { duration: 0.1 }
    }
} as const;

export const transitionCurve = { duration: 0.6, ease: "easeOut" } as const;
