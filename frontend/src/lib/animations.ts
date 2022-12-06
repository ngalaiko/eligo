import { cubicOut } from 'svelte/easing';

export const horizontalSlide = (
    node: HTMLElement,
    { delay = 0, duration = 400, easing = cubicOut, direction = 'left' } = {}
) => {
    const style = getComputedStyle(node);
    const opacity = +style.opacity;
    const width = parseFloat(style.width);
    const paddingRight = parseFloat(style.paddingRight);
    const paddingLeft = parseFloat(style.paddingLeft);
    const marginRight = parseFloat(style.marginRight);
    const marginLeft = parseFloat(style.marginLeft);
    const borderRightWidth = parseFloat(style.borderRightWidth);
    const borderLeftWidth = parseFloat(style.borderLeftWidth);

    return {
        delay,
        duration,
        easing,
        css:
            direction.toLowerCase() === 'left'
                ? (t: number, _u: number) =>
                    `overflow: hidden; opacity: ${Math.min(t * 20, 1) * opacity}; width: ${t * width
                    }px; margin-right: ${t * width}px; margin-left: ${t * marginLeft}px; padding-left: ${t * paddingLeft
                    }px; padding-right: ${t * paddingRight}px; border-left-width: ${t * borderLeftWidth
                    }px; borde-right-width: ${t * borderRightWidth}px;`
                : (t: number, u: number) =>
                    `overflow: hidden; opacity: ${Math.min(t * 20, 1) * opacity}; width: ${t * width
                    }px; margin-left: ${u * width}px; margin-right: ${t * marginRight}px; padding-left: ${t * paddingLeft
                    }px; padding-right: ${t * paddingRight}px; border-left-width: ${t * borderLeftWidth
                    }px; border-right-width: ${t * borderRightWidth}px;`
    };
};
