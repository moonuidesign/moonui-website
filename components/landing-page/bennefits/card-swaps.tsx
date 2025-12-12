/* eslint-disable react-hooks/refs */
import gsap from 'gsap';
import {
  Children,
  cloneElement,
  isValidElement,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { Slot } from '.';

export const CardSwap = ({
  width = 800,
  height = 500,
  verticalDistance = 40,
  delay = 5000,
  children,
}: {
  width?: number;
  height?: number;
  verticalDistance?: number;
  delay?: number;
  children: ReactNode;
}) => {
  const childArr = useMemo(
    () => Children.toArray(children) as ReactElement[],
    [children],
  );

  // Map untuk menyimpan referensi DOM setiap kartu
  const elementsRef = useRef<Map<number, HTMLDivElement>>(new Map());

  // Urutan kartu saat ini
  const order = useRef<number[]>(
    Array.from({ length: childArr.length }, (_, i) => i),
  );

  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const intervalRef = useRef<any>(null);
  const isHovered = useRef(false);

  // --- Handlers (Dibungkus useCallback agar stabil) ---

  const handleMouseEnter = useCallback(() => {
    isHovered.current = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isHovered.current = false;
  }, []);

  // Logika posisi kartu (Slot)
  const makeSlot = useCallback(
    (i: number, total: number): Slot => {
      let backgroundColor = '';

      if (i > 0) {
        const startVal = 211;
        const val = Math.max(150, startVal - (i - 1) * 15);
        backgroundColor = `rgb(${val}, ${val}, ${val})`;
      } else {
        backgroundColor = '#FFFFFF';
      }

      return {
        x: 0,
        y: -i * verticalDistance,
        z: -i * 50,
        scale: 1 - i * 0.05,
        zIndex: total - i,
        opacity: i === 0 ? 1 : 1 - i * 0.15,
        backgroundColor: i === 0 ? '#FFFFFF' : backgroundColor,
      };
    },
    [verticalDistance],
  );

  // Menempatkan elemen secara instan (tanpa animasi)
  const placeNow = useCallback((el: HTMLElement, slot: Slot) => {
    gsap.set(el, {
      x: slot.x,
      y: slot.y,
      z: slot.z,
      scale: slot.scale,
      opacity: slot.opacity,
      zIndex: slot.zIndex,
      backgroundColor: slot.backgroundColor,
      transformOrigin: 'center top',
    });
  }, []);

  // Animasi perpindahan posisi
  const animateToSlots = useCallback(
    (
      currentOrder: number[],
      duration: number = 0.5,
      ease: string = 'power3.out',
    ) => {
      currentOrder.forEach((originalIndex, slotIndex) => {
        const el = elementsRef.current.get(originalIndex);
        if (!el) return;
        const slot = makeSlot(slotIndex, childArr.length);
        gsap.to(el, { ...slot, duration, ease, overwrite: true });
      });
    },
    [childArr.length, makeSlot],
  );

  // Logika Swap (Ganti giliran kartu)
  const swap = useCallback(() => {
    if (isHovered.current) return;
    if (order.current.length < 2) return;

    const [front, ...rest] = order.current;
    const elFront = elementsRef.current.get(front);
    if (!elFront) return;

    const tl = gsap.timeline();
    tlRef.current = tl;

    // Animasi kartu depan keluar
    tl.to(elFront, {
      y: '+=150',
      opacity: 0,
      scale: 0.9,
      duration: 0.4,
      ease: 'power2.in',
      zIndex: 0,
    });
    tl.addLabel('moveForward', '-=0.1');

    // Geser kartu lainnya ke depan
    rest.forEach((idx, i) => {
      const el = elementsRef.current.get(idx);
      if (el) {
        const slot = makeSlot(i, childArr.length);
        tl.set(el, { zIndex: slot.zIndex }, 'moveForward');
        tl.to(
          el,
          { ...slot, duration: 0.6, ease: 'elastic.out(1, 0.8)' },
          'moveForward',
        );
      }
    });

    const backSlot = makeSlot(childArr.length - 1, childArr.length);

    // Kembalikan kartu depan ke posisi paling belakang
    tl.set(elFront, {
      zIndex: backSlot.zIndex,
    });

    tl.to(elFront, {
      ...backSlot,
      opacity: backSlot.opacity,
      duration: 0.5,
      ease: 'power2.out',
    });

    tl.call(() => {
      order.current = [...rest, front];
    });
  }, [childArr.length, makeSlot]);

  // Handler saat kartu diklik
  const handleCardClick = useCallback(
    (clickedOriginalIndex: number) => {
      const currentPosition = order.current.indexOf(clickedOriginalIndex);
      if (currentPosition === 0) return;

      if (tlRef.current) tlRef.current.kill();
      if (intervalRef.current) clearInterval(intervalRef.current);

      const newOrder = [...order.current];
      const [item] = newOrder.splice(currentPosition, 1);
      newOrder.unshift(item);

      order.current = newOrder;
      animateToSlots(newOrder, 0.6, 'power3.inOut');

      intervalRef.current = setInterval(swap, delay);
    },
    [animateToSlots, delay, swap],
  );

  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(swap, delay);
  }, [delay, swap]);

  // --- Effects ---

  useEffect(() => {
    childArr.forEach((_, i) => {
      const el = elementsRef.current.get(i);
      if (el) placeNow(el, makeSlot(i, childArr.length));
    });

    startInterval();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (tlRef.current) tlRef.current.kill();
    };
  }, [childArr, makeSlot, placeNow, startInterval]);

  return (
    <div
      className="relative flex items-center justify-center perspective-[1200px]"
      style={{ width, height }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {childArr.map((child, i) =>
        isValidElement(child)
          ? cloneElement(
              child as ReactElement,
              {
                key: i,
                // ESLint sering salah mendeteksi fungsi ini sebagai render access.
                // Padahal ini adalah callback ref yang dijalankan saat commit phase (aman).

                ref: (el: HTMLDivElement | null) => {
                  if (el) elementsRef.current.set(i, el);
                  else elementsRef.current.delete(i);
                },
                onClick: () => handleCardClick(i),
              } as React.HTMLAttributes<HTMLDivElement>,
            )
          : null,
      )}
    </div>
  );
};
