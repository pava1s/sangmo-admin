import type { SVGProps } from "react";

// Replaced SVG with User Uploaded PNG (Mark/Favicon for square slots)
export function TravonexLogo(props: React.ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/mark.png"
            alt="Wanderlynx Mark"
            {...props}
            style={{ objectFit: 'contain', width: props.width || '1em', height: props.height || '1em', ...props.style }}
        />
    )
}
