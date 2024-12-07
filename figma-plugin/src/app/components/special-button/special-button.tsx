import { Button, ButtonProps, createPolymorphicComponent } from '@mantine/core';
import styles from './special-button.module.css';
import { forwardRef, useEffect, useRef } from 'react';
import gsap from 'gsap';

const SpecialButton = createPolymorphicComponent<'button', ButtonProps>(
  forwardRef<HTMLButtonElement, ButtonProps>(({ children, ...others }, ref) => {
    const gradientStrokeRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = () => {
      gsap.to(gradientStrokeRef.current, {
        '--gradient-stroke-animation-progress': 1,
      });
    };

    const handleMouseLeave = () => {
      gsap.to(gradientStrokeRef.current, {
        '--gradient-stroke-animation-progress': 0,
      });
    };
    return (
      <Button
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        radius={999}
        styles={{
          root: {
            fontWeight:400,
          },
        }}
        component="button"
        variant="transparent"
        className={`${others.className} ${styles.control}`}
        {...others}
        ref={ref}
      >
        <div className={styles.gradientStroke} ref={gradientStrokeRef}></div>
        {children}
      </Button>
    );
  })
);

export default SpecialButton;
